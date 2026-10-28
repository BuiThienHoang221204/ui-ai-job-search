"use client";

import { useState, type DragEvent } from "react";

/** Kéo thả một file vào ô: giữ cờ đang kéo qua và trả các handler gắn thẳng vào thẻ nhận. */
export function useFileDrop(onFile: (file: File) => void) {
  const [over, setOver] = useState(false);

  return {
    over,
    dropProps: {
      onDragOver: (event: DragEvent) => {
        event.preventDefault();
        setOver(true);
      },
      onDragLeave: () => setOver(false),
      onDrop: (event: DragEvent) => {
        event.preventDefault();
        setOver(false);
        const file = event.dataTransfer.files[0];
        if (file) onFile(file);
      },
    },
  };
}
