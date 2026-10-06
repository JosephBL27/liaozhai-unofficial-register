import { LocateFixed, Minus, Plus, RotateCcw } from "lucide-react";
import { useMemo, useRef, useState } from "react";

export type WorldPlaceView = {
  id: string;
  name: string;
  region: string;
  x: number;
  y: number;
  kind: "household" | "institution" | "threshold" | "otherworld" | "journey";
  note: string;
  recordCount: number;
};

type StoryWorldChartProps = {
  places: WorldPlaceView[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

const chartWidth = 1000;
const chartHeight = 700;
const plateInset = 24;
const plateBottom = chartHeight - plateInset;
const kinds: Array<WorldPlaceView["kind"] | "all"> = ["all", "household", "institution", "threshold", "otherworld", "journey"];
const registerTicks = Array.from({ length: 12 }, (_, index) => 82 + index * 76);

function splitPlaceName(name: string) {
  if (name.length <= 23) return [name];
  const words = name.split(" ");
  let breakAt = 1;
  let smallestDifference = Number.POSITIVE_INFINITY;

  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(" ");
    const second = words.slice(index).join(" ");
    const difference = Math.abs(first.length - second.length);
    if (difference < smallestDifference) {
      breakAt = index;
      smallestDifference = difference;
    }
  }

  return [words.slice(0, breakAt).join(" "), words.slice(breakAt).join(" ")];
}

function labelAnchor(x: number): "start" | "middle" | "end" {
  if (x < 145) return "start";
  if (x > 855) return "end";
  return "middle";
}

export function StoryWorldChart({ places, selectedId, onSelect }: StoryWorldChartProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<WorldPlaceView["kind"] | "all">("all");
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    ox: number;
    oy: number;
    scaleX: number;
    scaleY: number;
  } | null>(null);
  const filtered = useMemo(() => filter === "all" ? places : places.filter((place) => place.kind === filter), [filter, places]);
  const selectedPlace = useMemo(() => places.find((place) => place.id === selectedId), [places, selectedId]);
  const tracePoints = filtered.map((place) => `${place.x},${place.y}`).join(" ");

  function adjustZoom(delta: number) {
    setZoom((value) => Math.min(2, Math.max(0.7, Number((value + delta).toFixed(2)))));
  }

  function endDrag(pointerId: number, frame: HTMLDivElement) {
    if (dragRef.current?.pointerId !== pointerId) return;
    dragRef.current = null;
    if (frame.hasPointerCapture(pointerId)) frame.releasePointerCapture(pointerId);
  }

  return (
    <section className="workspace-view world-view" aria-labelledby="world-title">
      <header className="workspace-view-heading">
        <div>
          <h1 id="world-title">A story-world chart, not a historical map</h1>
          <p>Compositional loci show how households, offices, roads, thresholds, and otherworld courts recur across the representative route.</p>
        </div>
        <div className="chart-controls" aria-label="Chart zoom controls">
          <button type="button" onClick={() => adjustZoom(-0.1)} aria-label="Zoom out"><Minus aria-hidden="true" /></button>
          <output aria-label="Chart zoom">{Math.round(zoom * 100)}%</output>
          <button type="button" onClick={() => adjustZoom(0.1)} aria-label="Zoom in"><Plus aria-hidden="true" /></button>
          <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label="Reset chart"><RotateCcw aria-hidden="true" /></button>
        </div>
      </header>

      <div className="world-filter" role="group" aria-label="Filter story-world loci">
        {kinds.map((kind) => (
          <button key={kind} type="button" aria-pressed={filter === kind} onClick={() => setFilter(kind)}>{kind}</button>
        ))}
      </div>

      <div className="world-register-key" aria-label="How to interpret the chart">
        <div><strong>{filtered.length}</strong><span>visible loci</span></div>
        <p><i aria-hidden="true" />The cinnabar thread follows display order only.</p>
        <p>Position and distance are compositional. They do not claim geographic scale, route, or proximity.</p>
      </div>

      <div
        className="world-chart-frame"
        onPointerDown={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          dragRef.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            ox: offset.x,
            oy: offset.y,
            scaleX: chartWidth / bounds.width,
            scaleY: chartHeight / bounds.height,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          setOffset({
            x: drag.ox + (event.clientX - drag.x) * drag.scaleX,
            y: drag.oy + (event.clientY - drag.y) * drag.scaleY,
          });
        }}
        onPointerUp={(event) => endDrag(event.pointerId, event.currentTarget)}
        onPointerCancel={(event) => endDrag(event.pointerId, event.currentTarget)}
      >
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" role="group" aria-labelledby="story-chart-title story-chart-desc">
          <title id="story-chart-title">Editorial story-world chart</title>
          <desc id="story-chart-desc">A pannable chart of representative Liaozhai loci. Position and distance are compositional rather than geographic. Select a labeled mark for its note.</desc>
          <defs>
            <pattern id="ledgerCells" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M56 0H0v56" fill="none" className="chart-ledger-line" />
            </pattern>
          </defs>
          <rect className="world-chart-surface" width={chartWidth} height={chartHeight} fill="url(#ledgerCells)" />
          <g className="world-plate-chrome" aria-hidden="true">
            <rect x={plateInset} y={plateInset} width={chartWidth - plateInset * 2} height={chartHeight - plateInset * 2} />
            <path d={`M${plateInset} 96H${chartWidth - plateInset} M${plateInset} ${plateBottom - 26}H${chartWidth - plateInset}`} />
            {registerTicks.map((x) => <path key={x} d={`M${x} ${plateInset}v12 M${x} ${plateBottom - 12}v12`} />)}
            <text x="48" y="61">EDITORIAL LOCUS REGISTER</text>
            <text x="952" y="61" textAnchor="end">DISPLAY ORDER · NO GEOGRAPHIC SCALE</text>
            <text x="48" y="84">{filtered.length} OF {places.length} REPRESENTATIVE LOCI SHOWN</text>
            <text x="48" y={plateBottom - 8}>POSITION IS COMPOSITIONAL · SELECT A LOCUS TO OPEN ITS WORKING NOTE</text>
            <path className="world-registration-mark" d="M24 48h16M48 24v16M976 48h-16M952 24v16M24 652h16M48 676v-16M976 652h-16M952 676v-16" />
          </g>
          <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
            {filtered.length > 1 && <polyline className="world-route" points={tracePoints} />}
            {filtered.map((place, index) => {
              const selected = place.id === selectedId;
              const lines = splitPlaceName(place.name);
              const anchor = labelAnchor(place.x);
              const countY = lines.length > 1 ? 68 : 53;
              return (
                <g
                  key={place.id}
                  className={`world-place world-place--${place.kind}${selected ? " is-selected" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${place.name}, ${place.kind}, ${place.recordCount} records`}
                  transform={`translate(${place.x} ${place.y})`}
                  onClick={(event) => { event.stopPropagation(); onSelect(place.id); }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(place.id);
                    }
                  }}
                >
                  <path d="M0-18 16-8 14 12 0 21-14 12-16-8Z" />
                  <text className="world-place-index" y="4" textAnchor="middle">{String(index + 1).padStart(2, "0")}</text>
                  <text className="world-place-name" y="38" textAnchor={anchor}>
                    {lines.map((line, lineIndex) => <tspan key={line} x="0" dy={lineIndex === 0 ? 0 : 15}>{line}</tspan>)}
                  </text>
                  <text className="world-place-count" y={countY} textAnchor={anchor}>{place.recordCount} records</text>
                </g>
              );
            })}
          </g>
        </svg>
        <span className="drag-notice"><LocateFixed aria-hidden="true" /> Drag the register · select a locus</span>
      </div>

      {selectedPlace && (
        <aside className="world-inspector" aria-live="polite">
          <span>{selectedPlace.kind}</span>
          <h2>{selectedPlace.name}</h2>
          <p>{selectedPlace.note}</p>
          <small>{selectedPlace.recordCount} representative records · catalog kind: {selectedPlace.region}</small>
        </aside>
      )}
    </section>
  );
}
