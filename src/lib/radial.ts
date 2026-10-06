/**
 * Pure SVG radial geometry.
 *
 * Angles are expressed in degrees, with 0 at twelve o'clock and positive
 * angles proceeding clockwise. Segment angles intentionally remain unwrapped
 * so that the final segment closes at `startOffset + 360` rather than 0.
 */

export const FULL_TURN = 360;

const HALF_TURN = FULL_TURN / 2;
const EPSILON = 1e-10;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface ViewBox {
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
}

export type ViewBoxInput =
  | ViewBox
  | readonly [minX: number, minY: number, width: number, height: number]
  | string;

export interface SegmentAngle<T> {
  readonly item: T;
  readonly index: number;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly midAngle: number;
  readonly spanAngle: number;
}

/**
 * Semantic description of one selectable radial interval.
 *
 * The contract deliberately carries no SVG or domain object. Consumers can
 * use the same geometry for registers, tales, or any future radial category
 * while keeping the rendered label and selection state explicit.
 */
export interface RadialSegment<
  Id extends string = string,
  Category extends string = string,
> {
  readonly id: Id;
  readonly label: string;
  readonly start: number;
  readonly end: number;
  readonly category: Category;
  readonly selected?: boolean;
}

export type RadialSegmentSource<
  Id extends string = string,
  Category extends string = string,
> = Pick<RadialSegment<Id, Category>, "id" | "label" | "category" | "selected">;

export interface LabelArcOptions {
  /** Degrees trimmed from both ends of the label baseline. */
  readonly padding?: number;
  /** Current wheel rotation, used when deciding whether a label is upside down. */
  readonly rotation?: number;
  /** Reverse lower-half labels so they remain legible. Defaults to true. */
  readonly keepUpright?: boolean;
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

function assertRadius(value: number, name: string): void {
  assertFinite(value, name);
  if (value < 0) {
    throw new RangeError(`${name} cannot be negative.`);
  }
}

function cleanNumber(value: number): string {
  const rounded = Math.abs(value) < EPSILON ? 0 : Number(value.toFixed(8));
  return String(rounded);
}

function pointText(point: Point): string {
  return `${cleanNumber(point.x)} ${cleanNumber(point.y)}`;
}

/** Normalize an angle into the half-open interval [0, 360). */
export function normalizeAngle(angle: number): number {
  assertFinite(angle, "angle");
  const normalized = ((angle % FULL_TURN) + FULL_TURN) % FULL_TURN;
  return Object.is(normalized, -0) || Math.abs(normalized) < EPSILON ? 0 : normalized;
}

/** Parse an SVG viewBox value without consulting the DOM. */
export function parseViewBox(input: ViewBoxInput): ViewBox {
  let values: readonly number[];

  if (typeof input === "string") {
    const tokens = input.trim().split(/[\s,]+/).filter(Boolean);
    if (tokens.length !== 4) {
      throw new TypeError("viewBox must contain exactly four numbers.");
    }
    values = tokens.map(Number);
  } else if ("minX" in input) {
    values = [input.minX, input.minY, input.width, input.height];
  } else {
    if (input.length !== 4) {
      throw new TypeError("viewBox must contain exactly four numbers.");
    }
    values = input;
  }

  const [minX, minY, width, height] = values;
  assertFinite(minX, "viewBox minX");
  assertFinite(minY, "viewBox minY");
  assertFinite(width, "viewBox width");
  assertFinite(height, "viewBox height");

  if (width <= 0 || height <= 0) {
    throw new RangeError("viewBox width and height must be positive.");
  }

  return { minX, minY, width, height };
}

export function viewBoxCenter(viewBox: ViewBoxInput): Point {
  const { minX, minY, width, height } = parseViewBox(viewBox);
  return { x: minX + width / 2, y: minY + height / 2 };
}

/** Convert a radius and angle to a Cartesian point around an explicit center. */
export function polarPoint(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
): Point {
  assertFinite(centerX, "centerX");
  assertFinite(centerY, "centerY");
  assertRadius(radius, "radius");
  assertFinite(angle, "angle");

  const radians = ((angle - 90) * Math.PI) / HALF_TURN;
  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians),
  };
}

/** Convert polar coordinates using the geometric center of an SVG viewBox. */
export function viewBoxPolarPoint(
  viewBox: ViewBoxInput,
  radius: number,
  angle: number,
): Point {
  const center = viewBoxCenter(viewBox);
  return polarPoint(center.x, center.y, radius, angle);
}

function clockwiseSpan(startAngle: number, endAngle: number): number {
  assertFinite(startAngle, "startAngle");
  assertFinite(endAngle, "endAngle");

  const rawSpan = endAngle - startAngle;
  if (Math.abs(rawSpan) < EPSILON) return 0;
  if (Math.abs(rawSpan) >= FULL_TURN - EPSILON) return FULL_TURN;

  return normalizeAngle(rawSpan);
}

function arcPathForSpan(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  span: number,
  sweep: 0 | 1,
): string {
  const start = polarPoint(centerX, centerY, radius, startAngle);
  if (span >= FULL_TURN - EPSILON) {
    const halfwayAngle = startAngle + (sweep === 1 ? HALF_TURN : -HALF_TURN);
    const halfway = polarPoint(centerX, centerY, radius, halfwayAngle);
    return [
      `M ${pointText(start)}`,
      `A ${cleanNumber(radius)} ${cleanNumber(radius)} 0 0 ${sweep} ${pointText(halfway)}`,
      `A ${cleanNumber(radius)} ${cleanNumber(radius)} 0 0 ${sweep} ${pointText(start)}`,
    ].join(" ");
  }

  const endAngle = startAngle + (sweep === 1 ? span : -span);
  const end = polarPoint(centerX, centerY, radius, endAngle);
  const largeArc = span > HALF_TURN ? 1 : 0;
  return `M ${pointText(start)} A ${cleanNumber(radius)} ${cleanNumber(radius)} 0 ${largeArc} ${sweep} ${pointText(end)}`;
}

/**
 * Build a closed clockwise annular sector. When the end angle is numerically
 * below the start angle it is treated as a wrap through 360 degrees.
 */
export function annularSectorPath(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  assertFinite(centerX, "centerX");
  assertFinite(centerY, "centerY");
  assertRadius(innerRadius, "innerRadius");
  assertRadius(outerRadius, "outerRadius");

  if (outerRadius <= innerRadius) {
    throw new RangeError("outerRadius must be greater than innerRadius.");
  }

  const span = clockwiseSpan(startAngle, endAngle);
  if (span === 0) return "";

  const outerStart = polarPoint(centerX, centerY, outerRadius, startAngle);

  if (span >= FULL_TURN - EPSILON) {
    const outerHalf = polarPoint(centerX, centerY, outerRadius, startAngle + HALF_TURN);
    const commands = [
      `M ${pointText(outerStart)}`,
      `A ${cleanNumber(outerRadius)} ${cleanNumber(outerRadius)} 0 0 1 ${pointText(outerHalf)}`,
      `A ${cleanNumber(outerRadius)} ${cleanNumber(outerRadius)} 0 0 1 ${pointText(outerStart)}`,
    ];

    if (innerRadius === 0) {
      commands.push(`L ${cleanNumber(centerX)} ${cleanNumber(centerY)}`, "Z");
      return commands.join(" ");
    }

    const innerStart = polarPoint(centerX, centerY, innerRadius, startAngle);
    const innerHalf = polarPoint(centerX, centerY, innerRadius, startAngle - HALF_TURN);
    commands.push(
      `L ${pointText(innerStart)}`,
      `A ${cleanNumber(innerRadius)} ${cleanNumber(innerRadius)} 0 0 0 ${pointText(innerHalf)}`,
      `A ${cleanNumber(innerRadius)} ${cleanNumber(innerRadius)} 0 0 0 ${pointText(innerStart)}`,
      "Z",
    );
    return commands.join(" ");
  }

  const resolvedEnd = startAngle + span;
  const outerEnd = polarPoint(centerX, centerY, outerRadius, resolvedEnd);
  const innerEnd = polarPoint(centerX, centerY, innerRadius, resolvedEnd);
  const largeArc = span > HALF_TURN ? 1 : 0;
  const commands = [
    `M ${pointText(outerStart)}`,
    `A ${cleanNumber(outerRadius)} ${cleanNumber(outerRadius)} 0 ${largeArc} 1 ${pointText(outerEnd)}`,
  ];

  if (innerRadius === 0) {
    commands.push(`L ${cleanNumber(centerX)} ${cleanNumber(centerY)}`, "Z");
    return commands.join(" ");
  }

  const innerStart = polarPoint(centerX, centerY, innerRadius, startAngle);
  commands.push(
    `L ${pointText(innerEnd)}`,
    `A ${cleanNumber(innerRadius)} ${cleanNumber(innerRadius)} 0 ${largeArc} 0 ${pointText(innerStart)}`,
    "Z",
  );
  return commands.join(" ");
}

/** True when a label's visible midpoint lies in the lower half of the wheel. */
export function isLabelArcFlipped(
  startAngle: number,
  endAngle: number,
  rotation = 0,
): boolean {
  assertFinite(rotation, "rotation");
  const span = clockwiseSpan(startAngle, endAngle);
  const visibleMidpoint = normalizeAngle(startAngle + span / 2 + rotation);
  return visibleMidpoint > 90 && visibleMidpoint < 270;
}

/** Build a curved SVG text baseline, reversing it when needed for legibility. */
export function labelArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  options: LabelArcOptions = {},
): string {
  assertFinite(centerX, "centerX");
  assertFinite(centerY, "centerY");
  assertRadius(radius, "radius");

  const { padding = 0, rotation = 0, keepUpright = true } = options;
  assertRadius(padding, "padding");
  assertFinite(rotation, "rotation");

  const span = clockwiseSpan(startAngle, endAngle);
  const visibleSpan = span - padding * 2;
  if (span === 0 || visibleSpan <= 0) return "";

  const flipped = keepUpright && isLabelArcFlipped(startAngle, endAngle, rotation);
  const baselineStart = flipped
    ? startAngle + span - padding
    : startAngle + padding;

  return arcPathForSpan(
    centerX,
    centerY,
    radius,
    baselineStart,
    visibleSpan,
    flipped ? 0 : 1,
  );
}

/** Evenly partition a full turn around an arbitrary readonly array. */
export function segmentAngles<T>(
  items: readonly T[],
  startOffset = 0,
): SegmentAngle<T>[] {
  assertFinite(startOffset, "startOffset");
  if (items.length === 0) return [];

  const spanAngle = FULL_TURN / items.length;
  return items.map((item, index) => {
    const startAngle = startOffset + index * spanAngle;
    const endAngle = startOffset + (index + 1) * spanAngle;
    return {
      item,
      index,
      startAngle,
      endAngle,
      midAngle: startAngle + spanAngle / 2,
      spanAngle,
    };
  });
}

/**
 * Position semantic segment sources around one full turn.
 *
 * This is the bridge between domain-facing ids/labels and the lower-level SVG
 * geometry returned by `segmentAngles`.
 */
export function buildRadialSegments<Id extends string, Category extends string>(
  items: readonly RadialSegmentSource<Id, Category>[],
  startOffset = 0,
): RadialSegment<Id, Category>[] {
  return segmentAngles(items, startOffset).map(({ item, startAngle, endAngle }) => ({
    id: item.id,
    label: item.label,
    start: startAngle,
    end: endAngle,
    category: item.category,
    ...(item.selected === undefined ? {} : { selected: item.selected }),
  }));
}

/**
 * Return the normalized rotation that aligns a segment midpoint to a fixed
 * pointer angle. Indices may wrap beyond either end of the collection.
 */
export function snapRotation(
  index: number,
  count: number,
  pointerAngle = 0,
): number {
  if (!Number.isInteger(index)) {
    throw new TypeError("index must be an integer.");
  }
  if (!Number.isInteger(count) || count <= 0) {
    throw new RangeError("count must be a positive integer.");
  }
  assertFinite(pointerAngle, "pointerAngle");

  const spanAngle = FULL_TURN / count;
  const midpoint = index * spanAngle + spanAngle / 2;
  return normalizeAngle(pointerAngle - midpoint);
}
