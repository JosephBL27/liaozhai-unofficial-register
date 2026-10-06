import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

export type RegisterRailItem = {
  id: string;
  index: number;
  title: string;
  mark: string;
  taleCount: number;
};

export type RegisterRailProps = {
  items: RegisterRailItem[];
  activeId: string;
  readIds: string[];
  onSelect: (id: string) => void;
  onStep: (direction: -1 | 1) => void;
};

export function BookRail({ items, activeId, readIds, onSelect, onStep }: RegisterRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    railRef.current
      ?.querySelector<HTMLButtonElement>(`[data-register-id="${activeId}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <section className="register-rail" aria-label="Fifteen-register editorial route">
      <button className="rail-step" type="button" onClick={() => onStep(-1)} aria-label="Previous register">
        <ChevronLeft aria-hidden="true" />
      </button>
      <div className="register-rail-scroll" ref={railRef}>
        {items.map((item) => {
          const active = item.id === activeId;
          const read = readIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              data-register-id={item.id}
              className={active ? "register-slip is-active" : "register-slip"}
              aria-current={active ? "step" : undefined}
              aria-label={`Register ${item.index}: ${item.title}${read ? ", read" : ""}`}
              onClick={() => onSelect(item.id)}
            >
              <span className="register-slip-number">{String(item.index).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
              <small>{item.mark} · {item.taleCount} records</small>
              <i aria-hidden="true" data-read={read ? "true" : "false"} />
            </button>
          );
        })}
      </div>
      <button className="rail-step" type="button" onClick={() => onStep(1)} aria-label="Next register">
        <ChevronRight aria-hidden="true" />
      </button>
    </section>
  );
}

export const RegisterRail = BookRail;
