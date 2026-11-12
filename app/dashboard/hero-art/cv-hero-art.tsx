"use client";

import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Briefcase, Microphone, Sparkle, Stack } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import { createRibbon, STAGE_W, type Ribbon, type RibbonState } from "./ribbon";
import styles from "./cv-hero-art.module.css";

gsap.registerPlugin(useGSAP);

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const GOOD_SCORE = 70;
const CHECKLIST = ["Nội dung & cấu trúc", "Từ khoá theo tin", "Mức độ phù hợp"];
const CARD_TILT = { x: 5, y: -14, z: -3 };
const MOUSE_TILT = 6;
const FLOAT_AMOUNT = 10;
const FLOAT_TIME = 3.2;
const SHEEN_TIME = 5;
const RIBBON_DRAW_TIME = 1.6;

/** Minh hoạ động ở đầu trang Tổng quan: ruy băng xoắn, thẻ CV đếm điểm, bốn thẻ tính năng; chỉ chạy khi nằm trong màn hình. */
export function CvHeroArt({ score }: { score: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<Ribbon | null>(null);
  const scaleRef = useRef(1);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ringGradId = `cvh-ring-${uid}`;
  const cursorGradId = `cvh-cursor-${uid}`;
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const good = safeScore >= GOOD_SCORE;

  useIsoLayoutEffect(() => {
    const root = rootRef.current!;
    const stage = stageRef.current!;
    const apply = () => {
      const scale = root.clientWidth / STAGE_W;
      scaleRef.current = scale;
      stage.style.setProperty("--s", String(scale));
      ribbonRef.current?.setResolution(scale * (window.devicePixelRatio || 1));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    (_context, contextSafe) => {
      const safe = contextSafe!;
      const root = rootRef.current!;
      const q = gsap.utils.selector(root);
      const one = <T extends Element = HTMLElement>(name: string) => q(`[data-anim="${name}"]`)[0] as unknown as T;

      const cardWrap = one("card-wrap");
      const card = one("card");
      const badge = one("badge");
      const ring = one("ring");
      const pill = one("pill");
      const list = one("list");
      const clickRing = one("click-ring");
      const cursor = one<SVGSVGElement>("cursor");
      const arc = one<SVGCircleElement>("arc");
      const scoreText = one("score").firstChild as Text;
      const rows = q('[data-anim="row"]') as HTMLElement[];
      const ticks = q('[data-anim="tick"]');
      const chips = q('[data-anim="chip"]') as HTMLElement[];

      const ribbon = createRibbon(one<HTMLCanvasElement>("ribbon"), one<HTMLCanvasElement>("ribbon-shadow"));
      ribbonRef.current = ribbon;
      ribbon?.setResolution(scaleRef.current * (window.devicePixelRatio || 1));
      const st: RibbonState = { draw: 0, sheen: -1, sheenA: 0, wobble: 0, time: 0 };

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let visible = false;
      let staticRendered = false;
      const tick = () => {
        if (!visible || !ribbon) return;
        if (reduce) {
          if (staticRendered) return;
          staticRendered = st.draw >= 1;
        }
        st.time = gsap.ticker.time;
        ribbon.render(st);
      };
      gsap.ticker.add(tick);

      const setScore = (value: number) => {
        arc.setAttribute("stroke-dasharray", `${value} ${100 - value}`);
        scoreText.nodeValue = String(Math.round(value));
      };

      gsap.set(cardWrap, { rotationX: CARD_TILT.x, rotationY: CARD_TILT.y, rotationZ: CARD_TILT.z, transformPerspective: 1600 });
      gsap.set(cursor, { transformOrigin: "10% 8%" });

      let intro: gsap.core.Timeline | null = null;
      let idle: gsap.core.Timeline | null = null;

      const setInitial = () => {
        Object.assign(st, { draw: 0, sheen: -1, sheenA: 0, wobble: 0 });
        staticRendered = false;
        gsap.set(cardWrap, { opacity: 0, y: 60, scale: 0.86 });
        gsap.set(card, { y: 0 });
        gsap.set(badge, { opacity: 0, scale: 0.4, rotation: -20, y: 0 });
        gsap.set(ring, { opacity: 0, scale: 0.7 });
        gsap.set(pill, { opacity: 0, scale: 0.6, x: -20 });
        gsap.set(list, { opacity: 0, y: 20 });
        gsap.set(rows, { opacity: 0, x: -14 });
        gsap.set(ticks, { attr: { "stroke-dasharray": "1 1", "stroke-dashoffset": 1 } });
        chips.forEach((chip) => gsap.set(chip, { opacity: 0, x: 120 * Number(chip.dataset.from), y: 0, scale: 0.9 }));
        gsap.set(cursor, { opacity: 0, x: 160, y: 140, scale: 1 });
        gsap.set(clickRing, { opacity: 0, scale: 0.3 });
        setScore(0);
      };

      const clickPulse = (row: HTMLElement, withRing: boolean) => {
        const tl = gsap
          .timeline()
          .to(cursor, { scale: 0.86, duration: 0.1, ease: "power2.in" })
          .to(cursor, { scale: 1, duration: 0.25, ease: "back.out(3)" })
          .to(row, { backgroundColor: "rgba(60,60,234,.06)", duration: 0.15, yoyo: true, repeat: 1 }, 0);
        if (withRing) tl.fromTo(clickRing, { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 1.6, duration: 0.6, ease: "power2.out" }, 0);
        return tl;
      };

      const startIdle = safe(() => {
        idle?.kill();
        st.sheenA = 1;
        const tl = gsap.timeline();
        tl.fromTo(st, { sheen: -0.15 }, { sheen: 1.15, duration: SHEEN_TIME, ease: "none", repeat: -1 }, 0);
        chips.forEach((chip, i) =>
          tl.to(chip, { y: (i % 2 ? 1 : -1) * FLOAT_AMOUNT, duration: FLOAT_TIME * (0.85 + i * 0.1), ease: "sine.inOut", yoyo: true, repeat: -1 }, 0),
        );
        tl.to(card, { y: -8, duration: FLOAT_TIME * 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
        tl.to(badge, { rotation: -3, y: -4, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
        tl.add(
          gsap
            .timeline({ repeat: -1, repeatDelay: 2.2 })
            .to(cursor, { x: -40, y: -64, duration: 1, ease: "power2.inOut" })
            .add(clickPulse(rows[1], false))
            .to(cursor, { x: 0, y: 0, duration: 1, ease: "power2.inOut" }, "+=0.5")
            .add(clickPulse(rows[2], true)),
          1.5,
        );
        if (!visible) tl.pause();
        idle = tl;
      });

      const play = safe(() => {
        setInitial();
        const counter = { v: 0 };
        const tl = gsap.timeline({ onComplete: () => !reduce && startIdle() });
        tl.to(st, { draw: 1, duration: RIBBON_DRAW_TIME, ease: "power2.inOut" }, 0)
          .to(cardWrap, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.4)" }, 0.35)
          .to(badge, { opacity: 1, scale: 1, rotation: -6, duration: 0.7, ease: "back.out(2.2)" }, 0.85)
          .to(ring, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.8)" }, 0.95)
          .to(counter, { v: safeScore, duration: 1.5, ease: "power3.out", onUpdate: () => setScore(counter.v) }, 1.1)
          .to(list, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.5)
          .to(rows, { opacity: 1, x: 0, duration: 0.45, ease: "power2.out", stagger: 0.18 }, 1.65)
          .to(chips, { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: "expo.out", stagger: { each: 0.12, from: "random" } }, 1.7)
          .to(ticks, { attr: { "stroke-dashoffset": 0 }, duration: 0.35, ease: "power2.out", stagger: 0.18 }, 1.85)
          .to(st, { wobble: 1, duration: 2, ease: "sine.inOut" }, 2.2)
          .to(pill, { opacity: 1, scale: 1, x: 0, duration: 0.55, ease: "back.out(2.4)" }, 2.25)
          .to(cursor, { opacity: 1, x: 0, y: 0, duration: 0.9, ease: "power3.out" }, 2.4)
          .add(clickPulse(rows[2], true), 3.25);
        intro = tl;
        if (reduce) tl.progress(1);
      });

      let started = false;
      setInitial();
      const observer = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !started) {
            started = true;
            play();
            return;
          }
          if (visible) {
            intro?.resume();
            idle?.resume();
          } else {
            intro?.pause();
            idle?.pause();
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(root);

      const onMove = safe((event: PointerEvent) => {
        if (reduce || event.pointerType === "touch") return;
        const box = root.getBoundingClientRect();
        const dx = (event.clientX - box.left) / box.width - 0.5;
        const dy = (event.clientY - box.top) / box.height - 0.5;
        gsap.to(cardWrap, {
          rotationY: CARD_TILT.y + dx * MOUSE_TILT * 2,
          rotationX: CARD_TILT.x - dy * MOUSE_TILT * 2,
          duration: 0.8,
          ease: "power3.out",
          overwrite: "auto",
        });
        chips.forEach((chip) =>
          gsap.to(chip, { xPercent: dx * 4 * Number(chip.dataset.depth), duration: 0.9, ease: "power3.out", overwrite: "auto" }),
        );
      });
      const onLeave = safe(() => {
        gsap.to(cardWrap, { rotationY: CARD_TILT.y, rotationX: CARD_TILT.x, duration: 1.2, ease: "power3.out", overwrite: "auto" });
        gsap.to(chips, { xPercent: 0, duration: 1.2, ease: "power3.out", overwrite: "auto" });
      });
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);

      return () => {
        gsap.ticker.remove(tick);
        observer.disconnect();
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
        intro?.kill();
        idle?.kill();
        ribbonRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [safeScore], revertOnUpdate: true },
  );

  return (
    <div
      ref={rootRef}
      className={styles.root}
      role="img"
      aria-label={`Minh hoạ CV ${safeScore}/100 cùng các tính năng tìm việc, luyện phỏng vấn, tối ưu CV và theo dõi ứng tuyển`}
    >
      <div ref={stageRef} className={styles.stage} aria-hidden>
        <canvas data-anim="ribbon-shadow" className={styles.ribbonShadow} />
        <canvas data-anim="ribbon" className={styles.ribbon} />

        <Chip className={styles.c1} depth={1.2} from={-1} icon={<Briefcase weight="bold" />} lines={["Tìm việc", "phù hợp"]} />
        <Chip className={styles.c2} depth={1.6} from={-1} icon={<Microphone weight="bold" />} lines={["Luyện", "phỏng vấn"]} />
        <Chip className={styles.c3} depth={1.3} from={1} icon={<Sparkle weight="bold" />} lines={["Tối ưu CV", "(AI)"]} />
        <Chip className={styles.c4} depth={1.7} from={1} icon={<Stack weight="bold" />} lines={["Theo dõi", "ứng tuyển"]} />

        <div data-anim="card-wrap" className={styles.cardWrap}>
          <div data-anim="card" className={styles.card}>
            <div data-anim="badge" className={styles.badge}>
              CV
            </div>
            <div data-anim="ring" className={styles.ring}>
              <svg viewBox="0 0 220 220">
                <defs>
                  <linearGradient id={ringGradId} x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#0fb84a" />
                    <stop offset="1" stopColor="#12d6b8" />
                  </linearGradient>
                </defs>
                <circle cx="110" cy="110" r="94" className={styles.ringTrack} strokeWidth={20} />
                <circle
                  data-anim="arc"
                  cx="110"
                  cy="110"
                  r="94"
                  fill="none"
                  stroke={`url(#${ringGradId})`}
                  strokeWidth={20}
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${safeScore} ${100 - safeScore}`}
                  transform="rotate(-90 110 110)"
                />
              </svg>
              <div className={styles.score}>
                <b data-anim="score">{safeScore}</b>
                <span>/100</span>
              </div>
            </div>
            <div data-anim="pill" className={cn(styles.pill, !good && styles.pillWarn)}>
              {good ? "Đã tối ưu" : "Cần cải thiện"}
            </div>
            <div data-anim="list" className={styles.list}>
              {CHECKLIST.map((text) => (
                <div data-anim="row" className={styles.row} key={text}>
                  <span className={styles.tick}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
                      <path data-anim="tick" pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div data-anim="click-ring" className={styles.clickRing} />
        <svg data-anim="cursor" viewBox="0 0 100 110" className={styles.cursor}>
          <defs>
            <linearGradient id={cursorGradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#667cff" />
              <stop offset="1" stopColor="#2f2dc1" />
            </linearGradient>
          </defs>
          <path d="M8 6 L90 52 L52 60 L36 98 Z" fill={`url(#${cursorGradId})`} stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function Chip({
  className,
  depth,
  from,
  icon,
  lines,
}: {
  className: string;
  depth: number;
  from: 1 | -1;
  icon: ReactNode;
  lines: [string, string];
}) {
  return (
    <div data-anim="chip" data-depth={depth} data-from={from} className={cn(styles.chip, className)}>
      {icon}
      <div>
        {lines[0]}
        <br />
        {lines[1]}
      </div>
    </div>
  );
}
