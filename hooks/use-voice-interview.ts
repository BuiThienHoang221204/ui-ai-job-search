"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveServerMessage, Session } from "@google/genai";
import { apiErrorMessage } from "@/lib/axios";
import { mockInterviewService } from "@/services";
import { createVoiceAudio, micFailureOf, toBase64 } from "@/lib/voice-audio";
import { createVoiceGate, FRAME_SAMPLES, frameDb } from "@/lib/voice-gate";
import {
  closeUtterance,
  endDecision,
  isSubstantial,
} from "@/lib/voice-turns";
import type { MicFailure, VoiceTurnDraft } from "@/types";
import { useToast } from "@/hooks/use-toast";

const KICKOFF =
  "Xin chào, tôi đã sẵn sàng. Mời anh/chị bắt đầu buổi phỏng vấn.";
const PCM_MIME = "audio/pcm;rate=16000";
const SILENCE = new Int16Array(FRAME_SAMPLES);
const CONNECT_TIMEOUT_MS = 15_000;
const LAST_MINUTE_MS = 60_000;

type VoiceStatus = "idle" | "connecting" | "ai" | "listening" | "ending";
type VoiceMode = "auto" | "hold";
type VoiceProblem =
  | { kind: "microphone"; failure: MicFailure; message: string }
  | { kind: "start"; message: string };

interface VoiceHandlers {
  onRun: (runId: string) => void;
  onSaved: () => void;
  onEnded: () => void;
}

interface LiveState {
  audio: ReturnType<typeof createVoiceAudio>;
  gate: ReturnType<typeof createVoiceGate>;
  session: Session | null;
  token: string;
  model: string;
  runId: string;
  handle: string | null;
  generation: number;
  mode: VoiceMode;
  muted: boolean;
  holding: boolean;
  aiText: string;
  pending: VoiceTurnDraft | null;
  answered: number;
  saving: Promise<void>;
  ending: boolean;
  closing: boolean;
  reconnecting: boolean;
  timer?: ReturnType<typeof setTimeout>;
  warning?: ReturnType<typeof setTimeout>;
  offline?: () => void;
}

/** Buổi phỏng vấn bằng giọng nói: xin micro, mở buổi lấy token, nói chuyện thẳng với Gemini Live, lưu từng cặp hỏi - đáp và gọi `onEnded` để lấy lời tổng kết. */
export function useVoiceInterview(jobId: string, handlers: VoiceHandlers) {
  const toast = useToast();
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [problem, setProblem] = useState<VoiceProblem | null>(null);
  const [caption, setCaption] = useState("");
  const [heard, setHeard] = useState("");
  const [mode, setMode] = useState<VoiceMode>("auto");
  const [muted, setMuted] = useState(false);
  const [holding, setHolding] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [lastMinute, setLastMinute] = useState(false);
  const live = useRef<LiveState | null>(null);
  const meter = useRef<HTMLSpanElement | null>(null);
  const latest = useRef(handlers);

  useEffect(() => {
    latest.current = handlers;
  });

  const save = (state: LiveState, turn: VoiceTurnDraft) => {
    if (isSubstantial(turn.answer)) state.answered += 1;
    state.saving = state.saving
      .then(() => mockInterviewService.saveVoiceTurn(state.runId, turn))
      .then(() => latest.current.onSaved())
      .catch((cause: unknown) => {
        toast.danger(
          apiErrorMessage(cause, "Không lưu được một câu trả lời của bạn"),
        );
      });
  };

  const end = async (finish: boolean) => {
    const state = live.current;
    if (!state || state.closing) return;
    state.closing = true;
    clearTimeout(state.timer);
    clearTimeout(state.warning);
    if (state.offline) window.removeEventListener("offline", state.offline);
    state.session?.close();
    state.audio.close();
    if (state.pending?.answer.trim()) save(state, state.pending);
    await state.saving;

    live.current = null;
    setStatus("idle");
    setCaption("");
    setHeard("");
    setHolding(false);
    if (finish) latest.current.onEnded();
  };

  const onMessage = (state: LiveState, message: LiveServerMessage) => {
    const content = message.serverContent;

    const userText = content?.inputTranscription?.text;
    if (userText) {
      if (state.aiText) {
        const closed = closeUtterance(state.pending, state.aiText);
        if (closed.save) save(state, closed.save);
        state.pending = closed.pending;
        state.aiText = "";
      }
      if (state.pending) {
        state.pending.answer += userText;
        setHeard(state.pending.answer);
      }
      if (!state.ending) setStatus("listening");
    }

    const aiText = content?.outputTranscription?.text;
    if (aiText) {
      if (!state.aiText) setHeard("");
      state.aiText += aiText;
      setCaption(state.aiText);
    }

    for (const part of content?.modelTurn?.parts ?? []) {
      if (!part.inlineData?.data) continue;
      state.audio.play(part.inlineData.data);
      if (!state.ending) setStatus("ai");
    }

    if (content?.interrupted) state.audio.interrupt();

    if (content?.turnComplete) {
      if (state.ending) void state.audio.whenIdle().then(() => end(true));
      else setStatus("listening");
    }

    for (const call of message.toolCall?.functionCalls ?? []) {
      const answered =
        state.answered + (isSubstantial(state.pending?.answer ?? "") ? 1 : 0);
      const response = endDecision(call.args?.reason, answered);
      state.session?.sendToolResponse({
        functionResponses: [{ id: call.id, name: call.name, response }],
      });
      if (response.ok) {
        state.ending = true;
        setStatus("ending");
      }
    }

    const handle = message.sessionResumptionUpdate?.newHandle;
    if (handle) state.handle = handle;
    if (message.goAway) void reconnect(state);
  };

  const connect = async (state: LiveState) => {
    const { GoogleGenAI, Modality } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: state.token,
      httpOptions: { apiVersion: "v1alpha" },
    });
    state.generation += 1;
    const generation = state.generation;
    return ai.live.connect({
      model: state.model,
      config: {
        responseModalities: [Modality.AUDIO],
        sessionResumption: state.handle ? { handle: state.handle } : undefined,
      },
      callbacks: {
        onmessage: (message) => {
          if (generation === state.generation) onMessage(state, message);
        },
        onclose: () => {
          if (generation === state.generation) void end(false);
        },
      },
    });
  };

  const reconnect = async (state: LiveState) => {
    if (state.reconnecting || !state.handle) return;
    state.reconnecting = true;
    const previous = state.session;
    try {
      state.session = await connect(state);
      previous?.close();
    } catch {
      void end(false);
    } finally {
      state.reconnecting = false;
    }
  };

  const onFrame = (state: LiveState, frame: Int16Array) => {
    let out = [state.holding ? frame : SILENCE];
    let db = frameDb(frame);
    if (state.mode === "auto") {
      const gated = state.gate(frame, state.audio.speaking());
      out = gated.out;
      db = gated.db;
    }
    meter.current?.style.setProperty(
      "--level",
      String(Math.min(1, Math.max(0, (db + 60) / 40))),
    );

    if (!state.session || state.reconnecting) return;
    for (const piece of out) {
      const data = toBase64(state.muted ? SILENCE : piece);
      state.session.sendRealtimeInput({ audio: { data, mimeType: PCM_MIME } });
    }
  };

  const start = async () => {
    if (live.current) return;
    const state: LiveState = {
      audio: createVoiceAudio(),
      gate: createVoiceGate(),
      session: null,
      token: "",
      model: "",
      runId: "",
      handle: null,
      generation: 0,
      mode,
      muted: false,
      holding: false,
      aiText: "",
      pending: null,
      answered: 0,
      saving: Promise.resolve(),
      ending: false,
      closing: false,
      reconnecting: false,
    };
    live.current = state;
    setProblem(null);
    setMuted(false);
    setLastMinute(false);
    setStatus("connecting");

    try {
      await state.audio.listen((frame) => onFrame(state, frame));
    } catch (cause) {
      state.audio.close();
      live.current = null;
      setStatus("idle");
      setProblem({
        kind: "microphone",
        failure: micFailureOf(cause),
        message: cause instanceof Error ? cause.message : String(cause),
      });
      return;
    }

    try {
      const opened = await mockInterviewService.openVoice(jobId);
      state.token = opened.token;
      state.model = opened.model;
      state.runId = opened.runId;
      latest.current.onRun(opened.runId);
      setExpiresAt(opened.expiresAt);
      const left = new Date(opened.expiresAt).getTime() - Date.now();
      state.timer = setTimeout(() => void end(true), left);
      state.warning = setTimeout(
        () => setLastMinute(true),
        left - LAST_MINUTE_MS,
      );
      const connecting = connect(state);
      void connecting
        .then((session) => {
          if (state.closing) session.close();
        })
        .catch(() => undefined);
      state.session = await Promise.race([
        connecting,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("connect timeout")),
            CONNECT_TIMEOUT_MS,
          ),
        ),
      ]);
    } catch (cause) {
      state.closing = true;
      state.audio.close();
      clearTimeout(state.timer);
      clearTimeout(state.warning);
      live.current = null;
      setStatus("idle");
      setProblem({
        kind: "start",
        message: apiErrorMessage(
          cause,
          "Chưa mở được buổi luyện bằng giọng nói, thử lại sau ít phút hoặc luyện bằng chữ.",
        ),
      });
      return;
    }

    state.offline = () => void end(false);
    window.addEventListener("offline", state.offline);
    state.session.sendRealtimeInput({ text: KICKOFF });
    setStatus("ai");
  };

  const changeMode = (next: VoiceMode) => {
    setMode(next);
    setHolding(false);
    if (!live.current) return;
    live.current.mode = next;
    live.current.holding = false;
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (live.current) live.current.muted = !muted;
  };

  const hold = (down: boolean) => {
    const state = live.current;
    if (!state || state.mode !== "hold" || state.holding === down) return;
    state.holding = down;
    setHolding(down);
    if (down) state.audio.interrupt();
  };

  return {
    status,
    problem,
    caption,
    heard,
    mode,
    muted,
    holding,
    expiresAt,
    lastMinute,
    meter,
    start,
    stop: () => void end(true),
    dismiss: () => setProblem(null),
    changeMode,
    toggleMute,
    hold,
  };
}
