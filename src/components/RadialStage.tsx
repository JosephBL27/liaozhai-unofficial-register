import gsap from "gsap";
import { ChevronLeft, ChevronRight, MousePointer2 } from "lucide-react";
import {
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Figure, Motif, Register, Tale } from "../types";
import { glossaryById, institutionById } from "../data";
import { ZoomControl } from "./ZoomControl";
import {
  annularSectorPath,
  buildRadialSegments,
  labelArcPath,
  polarPoint,
  snapRotation,
  type RadialSegment as RadialSegmentModel,
} from "../lib/radial";

type RadialLabelProps = {
  id: string;
  path: string;
  selected?: boolean;
  children: ReactNode;
};

export function RadialLabel({ id, path, selected = false, children }: RadialLabelProps) {
  return (
    <>
      <path className="radial-label-path" id={id} d={path} />
      <text
        className="radial-segment-label"
        style={selected ? { fill: "var(--paper-50)", fontWeight: 650 } : undefined}
      >
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{children}</textPath>
      </text>
    </>
  );
}

export function RadialPointer() {
  return (
    <g className="correction-pointer" aria-hidden="true" transform="translate(647 330)">
      <path d="M0 0 29-14v28Z" />
      <circle cx="35" cy="0" r="4" />
      <path d="M39 0h23" />
    </g>
  );
}

type RegisterSegment = RadialSegmentModel<Register["id"], "register">;
type TaleSegment = RadialSegmentModel<Tale["id"], "tale">;

type RegisterSegmentVisualProps = {
  segment: RegisterSegment;
  index: number;
  rotation: number;
  read: boolean;
  emphasized: boolean;
};

function RegisterSegmentVisual({
  segment,
  index,
  rotation,
  read,
  emphasized,
}: RegisterSegmentVisualProps) {
  const pathId = useId().replace(/:/g, "");
  const labelPath = labelArcPath(330, 330, 286, segment.start, segment.end, {
    padding: 2.4,
    rotation,
  });
  const selected = segment.selected === true;
  const faceStyle = selected
      ? {
          fill: "var(--cinnabar-700)",
          stroke: emphasized ? "var(--focus-ring)" : "var(--paper-100)",
          strokeWidth: emphasized ? 1.8 : 1.4,
          filter: emphasized ? "brightness(1.08)" : undefined,
        }
    : emphasized
      ? { fill: "var(--celadon-wash-strong)", filter: "brightness(1.14)", stroke: "var(--paper-50)", strokeWidth: 1.8 }
      : undefined;

  return (
    <g
      className={`radial-segment-visual${selected ? " is-active" : ""}${read ? " is-read" : ""}`}
      data-segment-category={segment.category}
      data-segment-id={segment.id}
    >
      <path
        className="radial-segment-face"
        d={annularSectorPath(330, 330, 254, 318, segment.start + 0.45, segment.end - 0.45)}
        style={faceStyle}
      />
      <RadialLabel id={pathId} path={labelPath} selected={selected}>
        {String(index + 1).padStart(2, "0")} · {segment.label}
      </RadialLabel>
      {read && (
        <circle
          className="radial-read-dot"
          {...polarPoint(330, 330, 307, (segment.start + segment.end) / 2)}
          r="3.2"
        />
      )}
    </g>
  );
}

type SegmentInteractionProps<Id extends string, Category extends string> = {
  segment: RadialSegmentModel<Id, Category>;
  className: string;
  ariaLabel: string;
  tabIndex: number;
  innerRadius: number;
  outerRadius: number;
  onSelect: (id: Id) => void;
  onEmphasis: (id: Id | null) => void;
};

function SegmentInteraction<Id extends string, Category extends string>({
  segment,
  className,
  ariaLabel,
  tabIndex,
  innerRadius,
  outerRadius,
  onSelect,
  onEmphasis,
}: SegmentInteractionProps<Id, Category>) {
  const select = () => onSelect(segment.id);

  return (
    <g
      className={className}
      data-segment-category={segment.category}
      data-segment-id={segment.id}
      role="button"
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-current={segment.selected ? "step" : undefined}
      onClick={select}
      onPointerEnter={() => onEmphasis(segment.id)}
      onPointerLeave={() => onEmphasis(null)}
      onFocus={() => onEmphasis(segment.id)}
      onBlur={() => onEmphasis(null)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      }}
    >
      <title>{ariaLabel}</title>
      <path
        className="radial-hit-target"
        d={annularSectorPath(330, 330, innerRadius, outerRadius, segment.start, segment.end)}
        style={{ fill: "transparent", stroke: "transparent", pointerEvents: "all" }}
      />
    </g>
  );
}

type RegisterVisualRingProps = {
  segments: readonly RegisterSegment[];
  rotation: number;
  readIds: readonly string[];
  emphasizedId: Register["id"] | null;
};

function RegisterVisualRing({
  segments,
  rotation,
  readIds,
  emphasizedId,
}: RegisterVisualRingProps) {
  return (
    <RadialRing segments={segments}>
      {(segment, index) => (
        <RegisterSegmentVisual
          segment={segment}
          index={index}
          rotation={rotation}
          read={readIds.includes(segment.id)}
          emphasized={emphasizedId === segment.id}
        />
      )}
    </RadialRing>
  );
}

type RegisterInteractionRingProps = {
  segments: readonly RegisterSegment[];
  readIds: readonly string[];
  onSelect: (id: Register["id"]) => void;
  onEmphasis: (id: Register["id"] | null) => void;
};

function RegisterInteractionRing({
  segments,
  readIds,
  onSelect,
  onEmphasis,
}: RegisterInteractionRingProps) {
  return (
    <RadialRing segments={segments}>
      {(segment, index) => {
        const read = readIds.includes(segment.id);
        const label = `Register ${index + 1}: ${segment.label}${read ? ", completed" : ""}`;
        return (
          <SegmentInteraction
            segment={segment}
            className={`radial-segment${segment.selected ? " is-active" : ""}${read ? " is-read" : ""}`}
            ariaLabel={label}
            tabIndex={segment.selected ? 0 : -1}
            innerRadius={244}
            outerRadius={327}
            onSelect={onSelect}
            onEmphasis={onEmphasis}
          />
        );
      }}
    </RadialRing>
  );
}

export type RadialSegmentProps<
  Id extends string = string,
  Category extends string = string,
> = {
  segment: RadialSegmentModel<Id, Category>;
  index: number;
  children: (segment: RadialSegmentModel<Id, Category>, index: number) => ReactNode;
};

/** Domain-free segment boundary shared by every selectable radial ring. */
export function RadialSegment<Id extends string, Category extends string>({
  segment,
  index,
  children,
}: RadialSegmentProps<Id, Category>) {
  return children(segment, index);
}

export type RadialRingProps<
  Id extends string = string,
  Category extends string = string,
> = {
  segments: readonly RadialSegmentModel<Id, Category>[];
  children: (segment: RadialSegmentModel<Id, Category>, index: number) => ReactNode;
};

/**
 * Generic data-driven ring. Its only model is the shared
 * id/label/start/end/category/selected segment contract.
 */
export function RadialRing<Id extends string, Category extends string>({
  segments,
  children,
}: RadialRingProps<Id, Category>) {
  return segments.map((segment, index) => (
    <RadialSegment key={segment.id} segment={segment} index={index}>
      {children}
    </RadialSegment>
  ));
}

type TaleVisualRingProps = {
  segments: readonly TaleSegment[];
  emphasizedId: Tale["id"] | null;
};

function TaleVisualRing({ segments, emphasizedId }: TaleVisualRingProps) {
  return (
    <>
      <circle cx="330" cy="330" r="247" className="inner-register-rule" />
      <RadialRing segments={segments}>
        {(segment, index) => {
          const point = polarPoint(330, 330, 213, (segment.start + segment.end) / 2);
          return (
            <g
              className={`tale-sector${segment.selected ? " is-active" : ""}`}
              data-segment-category={segment.category}
              data-segment-id={segment.id}
            >
              <path
                d={annularSectorPath(330, 330, 188, 238, segment.start + 1, segment.end - 1)}
                style={emphasizedId === segment.id
                  ? {
                      fill: "var(--celadon-wash)",
                      stroke: segment.selected ? "var(--focus-ring)" : "var(--paper-50)",
                      strokeWidth: 1.8,
                    }
                  : undefined}
              />
              <text
                {...point}
                textAnchor="middle"
                transform={`rotate(${(segment.start + segment.end) / 2} ${point.x} ${point.y})`}
              >
                RECORD {index + 1}
              </text>
            </g>
          );
        }}
      </RadialRing>
    </>
  );
}

type TaleInteractionRingProps = {
  segments: readonly TaleSegment[];
  onSelect: (id: Tale["id"]) => void;
  onEmphasis: (id: Tale["id"] | null) => void;
};

function TaleInteractionRing({ segments, onSelect, onEmphasis }: TaleInteractionRingProps) {
  return (
    <RadialRing segments={segments}>
      {(segment, index) => (
        <SegmentInteraction
          segment={segment}
          className={`tale-sector-interaction${segment.selected ? " is-active" : ""}`}
          ariaLabel={`Tale ${index + 1}: ${segment.label}`}
          tabIndex={0}
          innerRadius={184}
          outerRadius={242}
          onSelect={onSelect}
          onEmphasis={onEmphasis}
        />
      )}
    </RadialRing>
  );
}

type FigureSegment = RadialSegmentModel<Figure["id"], "figure">;

type FigurePosition = {
  segment: FigureSegment;
  role: string;
  point: ReturnType<typeof polarPoint>;
};

type FigureRingVisualProps = {
  positions: readonly FigurePosition[];
};

function FigureRingVisual({ positions }: FigureRingVisualProps) {
  return (
    <g className="figure-ring figure-ring-visual" style={{ pointerEvents: "none" }}>
      <circle cx="330" cy="330" r="174" className="figure-ring-line" />
      {positions.map(({ segment, point }, index) => (
        <g
          key={segment.id}
          className="figure-medallion"
          transform={`translate(${point.x} ${point.y})`}
        >
          <circle r="24" />
          <path d={index % 2 === 0 ? "M-10 8c2-13 18-13 20 0v9h-20Z M-7-6c0-9 14-9 14 0 0 8-14 8-14 0Z" : "M-13 16c2-14 24-14 26 0Z M-8-5c1-9 15-9 16 0 0 9-16 9-16 0Z"} />
          <text y="36" textAnchor="middle">{segment.label}</text>
        </g>
      ))}
    </g>
  );
}

type FigureRingInteractionProps = {
  positions: readonly FigurePosition[];
  onSelect: (figureId: string) => void;
};

function FigureRingInteraction({ positions, onSelect }: FigureRingInteractionProps) {
  return (
    <g className="figure-ring figure-ring-interactions" aria-label="Figures in the selected record">
      {positions.map(({ segment, role, point }) => {
        const label = `Open figure ${segment.label}: ${role}`;
        return (
          <g
            key={segment.id}
            className="figure-medallion-interaction"
            role="button"
            tabIndex={0}
            aria-label={label}
            transform={`translate(${point.x} ${point.y})`}
            onClick={() => onSelect(segment.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(segment.id);
              }
            }}
          >
            <title>{label}</title>
            <circle r="31" style={{ fill: "transparent", stroke: "transparent", pointerEvents: "all" }} />
          </g>
        );
      })}
    </g>
  );
}

type EvidenceMark = {
  kind: "form" | "institution" | "motif" | "locus" | "term";
  category: string;
  value: string;
};

function compactMarkLabel(value: string): string {
  return value.length <= 15 ? value : `${value.slice(0, 14).trimEnd()}…`;
}

function EvidenceGlyph({ kind }: Pick<EvidenceMark, "kind">) {
  const paths: Record<EvidenceMark["kind"], string> = {
    form: "M-9 7c7-2 11-8 10-16 7 5 9 12 5 18M-7 6c-3-6-3-11 0-16",
    institution: "M-11 8V-5h22V8M-14-5 0-13 14-5M-5 8V0h10v8",
    motif: "M-12 3c2-7 8-8 12-4 4-5 12-2 12 4-1 6-8 8-13 4-4 5-11 2-11-4",
    locus: "m-13 7 7-11 5 7 6-10 8 14M-14 9h28",
    term: "M-9-11h18V11H-9ZM-13-5h26M-13 5h26",
  };
  return <path className="evidence-mark-glyph" d={paths[kind]} />;
}

function EvidenceRingVisual({ marks }: { marks: readonly EvidenceMark[] }) {
  return (
    <g className="evidence-ring" aria-hidden="true">
      <path className="evidence-ring-line" d={labelArcPath(330, 330, 154, 112, 248, { keepUpright: false })} />
      {marks.map((mark, index) => {
        const point = polarPoint(330, 330, 154, 118 + index * (124 / Math.max(1, marks.length - 1)));
        return (
          <g key={mark.kind} className={`evidence-mark evidence-mark--${mark.kind}`} transform={`translate(${point.x} ${point.y})`}>
            <circle r="18" />
            <EvidenceGlyph kind={mark.kind} />
            <text y="29" textAnchor="middle" className="evidence-mark-category">{mark.category}</text>
            <text y="40" textAnchor="middle" className="evidence-mark-value">{compactMarkLabel(mark.value)}</text>
          </g>
        );
      })}
    </g>
  );
}

export type FigureRingProps = {
  segments: readonly FigureSegment[];
  roles: ReadonlyMap<Figure["id"], string>;
  layer: "visual" | "interaction";
  onSelect: (figureId: string) => void;
};

/** Figure-ring adapter over the same shared segment contract as every radial ring. */
export function FigureRing({ segments, roles, layer, onSelect }: FigureRingProps) {
  const positions = useMemo(
    () => segments.map((segment) => ({
      segment,
      role: roles.get(segment.id) ?? "Figure in the selected record",
      point: polarPoint(
        330,
        330,
        154,
        (segment.start + segment.end) / 2,
      ),
    })),
    [roles, segments],
  );

  return layer === "visual"
    ? <FigureRingVisual positions={positions} />
    : <FigureRingInteraction positions={positions} onSelect={onSelect} />;
}

type CenterTooltipProps = {
  register: Register;
  tale: Tale;
  motifLabels: string[];
};

export function CenterTooltip({ register, tale, motifLabels }: CenterTooltipProps) {
  return (
    <g className="center-tooltip" aria-hidden="true">
      <circle cx="330" cy="330" r="116" />
      <text x="330" y="278" textAnchor="middle" className="center-kicker">ACTIVE CORRECTION</text>
      <text x="330" y="337" textAnchor="middle" className="center-number">{String(register.index).padStart(2, "0")}</text>
      <text x="330" y="366" textAnchor="middle" className="center-title">{tale.title}</text>
      <text x="330" y="390" textAnchor="middle" className="center-mark">{register.mark} · {motifLabels.length} motif marks</text>
    </g>
  );
}

export function LegendPanel() {
  return (
    <div className="radial-legend" aria-label="Register legend">
      <span><i data-tone="route" /> editorial register</span>
      <span><i data-tone="read" /> completed</span>
      <span><i data-tone="active" /> active correction</span>
    </div>
  );
}

type RadialStageProps = {
  registers: readonly Register[];
  activeRegister: Register;
  activeTale: Tale;
  activeFigures: Figure[];
  activeMotifs: Motif[];
  readRegisterIds: string[];
  onSelectRegister: (registerId: Register["id"]) => void;
  onSelectTale: (taleId: Tale["id"]) => void;
  onSelectFigure: (figureId: string) => void;
  onStep: (direction: -1 | 1) => void;
  zoomValue?: number;
  onZoomChange?: (zoom: number) => void;
};

function humanizeSegmentId(id: string): string {
  return id
    .split("-")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function RadialStage({
  registers,
  activeRegister,
  activeTale,
  activeFigures,
  activeMotifs,
  readRegisterIds,
  onSelectRegister,
  onSelectTale,
  onSelectFigure,
  onStep,
  zoomValue,
  onZoomChange,
}: RadialStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const visualWheelRef = useRef<SVGGElement>(null);
  const interactionWheelRef = useRef<SVGGElement>(null);
  const wheelCooldown = useRef(0);
  const dragRef = useRef<{ pointerId: number; x: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localZoom, setLocalZoom] = useState(1);
  const zoom = zoomValue ?? localZoom;
  const setZoom = onZoomChange ?? setLocalZoom;
  const [emphasizedRegisterId, setEmphasizedRegisterId] = useState<Register["id"] | null>(null);
  const [emphasizedTaleId, setEmphasizedTaleId] = useState<Tale["id"] | null>(null);
  const selectedIndex = registers.findIndex((register) => register.id === activeRegister.id);
  const rotation = snapRotation(selectedIndex, registers.length, 90);
  const registerSegments = useMemo(
    () => buildRadialSegments(
      registers.map((register) => ({
        id: register.id,
        label: register.title,
        category: "register" as const,
        selected: register.id === activeRegister.id,
      })),
    ),
    [activeRegister.id, registers],
  );
  const taleSegments = useMemo(
    () => buildRadialSegments(
      activeRegister.taleIds.map((taleId) => ({
        id: taleId,
        label: taleId === activeTale.id ? activeTale.title : humanizeSegmentId(taleId),
        category: "tale" as const,
        selected: taleId === activeTale.id,
      })),
    ),
    [activeRegister.taleIds, activeTale.id, activeTale.title],
  );
  const figureSegments = useMemo<readonly FigureSegment[]>(() => {
    const visibleFigures = activeFigures.slice(0, 4);
    return visibleFigures.map((figure, index) => {
      const angle = -62 + index * (124 / Math.max(1, visibleFigures.length - 1));
      return {
        id: figure.id,
        label: figure.name,
        start: angle - 1,
        end: angle + 1,
        category: "figure",
        selected: false,
      };
    });
  }, [activeFigures]);
  const figureRoles = useMemo(
    () => new Map(activeFigures.map((figure) => [figure.id, figure.role] as const)),
    [activeFigures],
  );
  const evidenceMarks = useMemo<readonly EvidenceMark[]>(() => {
    const institution = activeTale.institutions[0]
      ? institutionById.get(activeTale.institutions[0])?.name
      : undefined;
    const term = activeTale.terms[0]
      ? glossaryById.get(activeTale.terms[0])?.label
      : undefined;
    return [
      { kind: "form", category: "Strange form", value: activeTale.form },
      { kind: "institution", category: "Pressure", value: institution ?? "Household order" },
      { kind: "motif", category: "Motif", value: activeMotifs[0]?.label ?? "Unstable form" },
      { kind: "locus", category: "Locus", value: activeTale.locus.label },
      { kind: "term", category: "Term", value: term ?? "Record term" },
    ];
  }, [activeMotifs, activeTale]);

  useEffect(() => {
    const wheelTargets = [visualWheelRef.current, interactionWheelRef.current]
      .filter((target): target is SVGGElement => target !== null);
    if (wheelTargets.length === 0) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    gsap.to(wheelTargets, {
      rotation: `${rotation}_short`,
      svgOrigin: "330 330",
      duration: media.matches ? 0 : 0.72,
      ease: "power3.inOut",
      overwrite: true,
    });
  }, [rotation]);

  useEffect(() => {
    const path = stageRef.current?.querySelector<SVGPathElement>(".radial-segment-visual.is-active .radial-segment-face");
    if (!path) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const length = path.getTotalLength();
    gsap.fromTo(
      path,
      { strokeDasharray: length, strokeDashoffset: reduced ? 0 : length },
      { strokeDashoffset: 0, duration: reduced ? 0 : 0.52, ease: "power2.out", clearProps: "strokeDasharray,strokeDashoffset" },
    );
  }, [activeRegister.id]);

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX) || Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    const now = performance.now();
    if (now < wheelCooldown.current) return;
    wheelCooldown.current = now + 380;
    onStep(event.deltaY > 0 ? 1 : -1);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const focusedSegment = (event.target as Element).closest<SVGGElement>(".radial-segment");
    if (!focusedSegment || !event.currentTarget.contains(focusedSegment)) return;

    const activeIndex = registers.findIndex((register) => register.id === activeRegister.id);
    const focusRegister = (next: Register) => {
      window.requestAnimationFrame(() => {
        const targets = stageRef.current?.querySelectorAll<SVGGElement>(".radial-segment");
        const nextTarget = Array.from(targets ?? []).find((target) => target.dataset.segmentId === next.id);
        nextTarget?.focus();
      });
    };

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = registers[(activeIndex - 1 + registers.length) % registers.length];
      onStep(-1);
      focusRegister(next);
    }
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = registers[(activeIndex + 1) % registers.length];
      onStep(1);
      focusRegister(next);
    }
    if (event.key === "Home") {
      event.preventDefault();
      onSelectRegister(registers[0].id);
      focusRegister(registers[0]);
    }
    if (event.key === "End") {
      event.preventDefault();
      const next = registers.at(-1)!;
      onSelectRegister(next.id);
      focusRegister(next);
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("button, select, input, [role='button']")) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.x;
    if (Math.abs(distance) > 22) onStep(distance > 0 ? -1 : 1);
    dragRef.current = null;
    setDragging(false);
  }

  return (
    <section className="radial-stage-region" aria-labelledby="radial-stage-title">
      <h1 className="sr-only" id="radial-stage-title">Fifteen-register Liaozhai reading instrument</h1>

      <div
        ref={stageRef}
        className={`radial-stage${dragging ? " is-dragging" : ""}`}
        role="group"
        aria-labelledby="radial-stage-title"
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <svg viewBox="0 0 720 680" role="group" aria-labelledby="radial-svg-title radial-svg-desc">
          <title id="radial-svg-title">Fifteen-register Liaozhai reading wheel</title>
          <desc id="radial-svg-desc">A radial editorial index. The active register aligns with the red correction pointer on the right.</desc>
          <defs>
            <filter id="paperNoise" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="31" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
              <feBlend in="SourceGraphic" in2="mono" mode="soft-light" />
            </filter>
            <radialGradient id="wheelWell" cx="48%" cy="42%" r="65%">
              <stop offset="0" stopColor="var(--wheel-well-inner)" />
              <stop offset="1" stopColor="var(--wheel-well-outer)" />
            </radialGradient>
          </defs>

          <g
            className="radial-ornament radial-static-ornament"
            data-radial-layer="ornament"
            aria-hidden="true"
          >
            <circle cx="330" cy="330" r="326" />
            <circle cx="330" cy="330" r="240" />
            <path d="M50 469c86-56 151-62 210-36 38 17 74 21 111 8 69-24 130-13 214 50" />
            <path d="M101 507c48-44 91-55 131-41 31 11 50 31 75 34 42 5 71-47 123-53 43-5 89 23 136 71" />
          </g>

          <g className="radial-zoom-layer" transform={`translate(330 330) scale(${zoom}) translate(-330 -330)`}>
            <g
              className="radial-visual-layer"
              data-radial-layer="visual"
              aria-hidden="true"
              style={{ pointerEvents: "none" }}
            >
              <g ref={visualWheelRef} className="radial-wheel radial-wheel-visual">
                <RegisterVisualRing
                  segments={registerSegments}
                  rotation={rotation}
                  readIds={readRegisterIds}
                  emphasizedId={emphasizedRegisterId}
                />
                <TaleVisualRing segments={taleSegments} emphasizedId={emphasizedTaleId} />
              </g>

              <g className="active-register-overlay">
                <FigureRing segments={figureSegments} roles={figureRoles} layer="visual" onSelect={onSelectFigure} />
                <EvidenceRingVisual marks={evidenceMarks} />
                <CenterTooltip
                  register={activeRegister}
                  tale={activeTale}
                  motifLabels={activeMotifs.map((motif) => motif.label)}
                />
              </g>
            </g>

            <g
              className="radial-interaction-layer"
              data-radial-layer="interaction"
              role="group"
              aria-label="Radial wheel controls"
            >
              <g ref={interactionWheelRef} className="radial-wheel radial-wheel-interaction">
                <RegisterInteractionRing
                  segments={registerSegments}
                  readIds={readRegisterIds}
                  onSelect={onSelectRegister}
                  onEmphasis={setEmphasizedRegisterId}
                />
                <TaleInteractionRing
                  segments={taleSegments}
                  onSelect={onSelectTale}
                  onEmphasis={setEmphasizedTaleId}
                />
              </g>

              <g className="active-register-overlay">
                <FigureRing segments={figureSegments} roles={figureRoles} layer="interaction" onSelect={onSelectFigure} />
              </g>
            </g>
          </g>

          <RadialPointer />
        </svg>

        <nav className="radial-semantic-index" aria-label="Semantic radial navigation">
          <span>Semantic radial index</span>
          <label>
            <span>Register</span>
            <select
              aria-label="Register"
              value={activeRegister.id}
              onChange={(event) => onSelectRegister(event.currentTarget.value as Register["id"])}
            >
              {registers.map((register) => (
                <option key={register.id} value={register.id}>
                  Register {register.index}: {register.title}
                </option>
              ))}
            </select>
          </label>

          <div role="group" aria-label={`Tales in Register ${activeRegister.index}: ${activeRegister.title}`}>
            <span>Tales in the active register</span>
            {taleSegments.map((segment, index) => (
              <button
                key={segment.id}
                type="button"
                aria-current={segment.selected ? "page" : undefined}
                onClick={() => onSelectTale(segment.id)}
              >
                Tale {index + 1}: {segment.label}
              </button>
            ))}
          </div>

          <div role="group" aria-label={`Figures in ${activeTale.title}`}>
            <span>Figures in the active tale</span>
            {figureSegments.map((segment) => (
              <button key={segment.id} type="button" onClick={() => onSelectFigure(segment.id)}>
                {segment.label}: {figureRoles.get(segment.id)}
              </button>
            ))}
          </div>
        </nav>

        <div className="radial-control-hint"><MousePointer2 aria-hidden="true" /> Drag · scroll · arrow keys</div>
        <ZoomControl value={zoom} onChange={setZoom} />
        <div className="radial-step-controls" aria-label="Step through registers">
          <button type="button" onClick={() => onStep(-1)} aria-label="Previous register"><ChevronLeft aria-hidden="true" /></button>
          <output aria-live="polite">{String(activeRegister.index).padStart(2, "0")} / {registers.length}</output>
          <button type="button" onClick={() => onStep(1)} aria-label="Next register"><ChevronRight aria-hidden="true" /></button>
        </div>
      </div>

      <LegendPanel />
    </section>
  );
}
