import { type KeyboardEvent, type PointerEvent, useRef } from "react";

type PaneResizerProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

export function PaneResizer({ value, min = 32, max = 48, onChange }: PaneResizerProps) {
  const dragRef = useRef<{ pointerId: number; left: number; width: number } | null>(null);

  function clamp(next: number) {
    return Math.min(max, Math.max(min, Math.round(next * 10) / 10));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const composition = event.currentTarget.parentElement;
    if (!composition) return;
    const bounds = composition.getBoundingClientRect();
    dragRef.current = { pointerId: event.pointerId, left: bounds.left, width: bounds.width };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const stageShare = ((event.clientX - drag.left) / drag.width) * 100;
    onChange(clamp(100 - stageShare));
  }

  function stopDragging(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next = value;
    if (event.key === "ArrowLeft") next += 1;
    else if (event.key === "ArrowRight") next -= 1;
    else if (event.key === "Home") next = max;
    else if (event.key === "End") next = min;
    else return;
    event.preventDefault();
    onChange(clamp(next));
  }

  return (
    <div
      className="pane-resizer"
      role="separator"
      aria-label="Resize the reading dossier"
      aria-controls="reading-dossier"
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onKeyDown={onKeyDown}
    >
      <span aria-hidden="true" />
    </div>
  );
}
