import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { Member } from "../team";
import { theme } from "../theme";
import { usePal, useRamp } from "./Shell";

const sans = theme.fonts.sans;

export const series = (len: number, f: (u: number) => number): number[] =>
  Array.from({ length: len }, (_, i) => f(i / (len - 1)));

export const Tag: React.FC<{
  text: string;
  color: string;
  style?: React.CSSProperties;
}> = ({ text, color, style }) => (
  <div
    style={{
      display: "inline-block",
      ...theme.label,
      fontSize: theme.type.small,
      padding: "6px 16px",
      border: `2px solid ${color}`,
      borderRadius: 6,
      color,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {text}
  </div>
);

export const Card: React.FC<{
  title: string;
  sub?: string;
  color?: string;
  border?: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ title, sub, color, border, delay = 0, style }) => {
  const pal = usePal();
  const p = useRamp(delay, 28);
  return (
    <div
      style={{
        background: pal.surface,
        border: `2px solid ${border ?? pal.line}`,
        borderRadius: 18,
        padding: 20,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 28}px)`,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: theme.type.card,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: color ?? pal.text,
        }}
      >
        {title}
      </div>
      {sub ? (
        <div
          style={{
            fontSize: theme.type.small,
            fontWeight: 500,
            lineHeight: 1.3,
            marginTop: 8,
            color: pal.muted,
            whiteSpace: "pre-line",
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

export const Meter: React.FC<{
  value: number;
  width: number;
  label: string;
  color: string;
}> = ({ value, width, label, color }) => {
  const pal = usePal();
  const n = 24;
  const v = Math.min(1, Math.max(0, value));
  const on = Math.round(v * n);
  const seg = (width - (n - 1) * 6) / n;
  return (
    <div style={{ width }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          marginBottom: 14,
        }}
      >
        <span>{label}</span>
        <span style={{ ...theme.num, color }}>{`${Math.round(v * 100)}%`}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: n }, (_, i) => (
          <div
            key={i}
            style={{
              width: seg,
              height: 44,
              boxSizing: "border-box",
              borderRadius: 4,
              background: i < on ? color : pal.tint,
              border: `2px solid ${i < on ? color : pal.line}`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const traceGeom = (
  width: number,
  height: number,
  n: number,
  min: number,
  max: number,
) => {
  const l = 24;
  const r = 24;
  const t = 28;
  const b = 24;
  return {
    x: (i: number) => l + (i / (n - 1)) * (width - l - r),
    y: (v: number) => t + (height - t - b) * (1 - (v - min) / (max - min)),
  };
};

export const Trace: React.FC<{
  id: string;
  width: number;
  height: number;
  data: number[];
  progress: number;
  min?: number;
  max?: number;
  limit?: number;
  low?: number;
  forecastFrom?: number;
  learned?: [number, number];
}> = ({
  id,
  width,
  height,
  data,
  progress,
  min = 0,
  max = 12,
  limit = 8,
  low = 2,
  forecastFrom,
  learned,
}) => {
  const pal = usePal();
  const n = data.length;
  const seg = n - 1;
  const g = traceGeom(width, height, n, min, max);
  const hasF = forecastFrom !== undefined && forecastFrom < seg;
  const fi = hasF ? (forecastFrom as number) : seg;
  const pos = Math.min(1, Math.max(0, progress)) * seg;
  const path = (a: number, b: number) =>
    data
      .slice(a, b + 1)
      .map(
        (v, k) =>
          `${k === 0 ? "M" : "L"}${g.x(a + k).toFixed(1)} ${g.y(v).toFixed(1)}`,
      )
      .join(" ");
  const i0 = Math.min(seg - 1, Math.floor(pos));
  const hv = data[i0] + (data[i0 + 1] - data[i0]) * (pos - i0);
  const hx = g.x(pos);
  const hy = g.y(hv);
  const tone = hv > limit ? pal.bad : pal.accent;
  const histP = Math.min(1, pos / fi);
  const spread = 1.3;
  const conePts = hasF
    ? [
        ...data
          .slice(fi)
          .map(
            (v, k) =>
              `${g.x(fi + k).toFixed(1)},${g.y(v + (spread * k) / (seg - fi)).toFixed(1)}`,
          ),
        ...data
          .slice(fi)
          .map(
            (v, k) =>
              `${g.x(fi + k).toFixed(1)},${g.y(v - (spread * k) / (seg - fi)).toFixed(1)}`,
          )
          .reverse(),
      ].join(" ")
    : "";
  const histD = path(0, fi);
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <clipPath id={`${id}-hot`}>
        <rect x={0} y={0} width={width} height={g.y(limit)} />
      </clipPath>
      <clipPath id={`${id}-fc`}>
        <rect x={0} y={0} width={Math.max(0, hx)} height={height} />
      </clipPath>
      <rect
        x={g.x(0)}
        y={g.y(max)}
        width={g.x(seg) - g.x(0)}
        height={g.y(limit) - g.y(max)}
        fill={pal.bad}
        opacity={0.07}
      />
      <rect
        x={g.x(0)}
        y={g.y(limit)}
        width={g.x(seg) - g.x(0)}
        height={g.y(low) - g.y(limit)}
        fill={pal.ok}
        opacity={0.1}
      />
      {learned ? (
        <rect
          x={g.x(0)}
          y={g.y(learned[1])}
          width={g.x(fi) - g.x(0)}
          height={g.y(learned[0]) - g.y(learned[1])}
          fill={pal.accent}
          opacity={0.14}
        />
      ) : null}
      <line
        x1={g.x(0)}
        x2={g.x(seg)}
        y1={g.y(limit)}
        y2={g.y(limit)}
        stroke={pal.warn}
        strokeWidth={3}
        strokeDasharray="14 10"
      />
      <line
        x1={g.x(0)}
        x2={g.x(seg)}
        y1={g.y(low)}
        y2={g.y(low)}
        stroke={pal.muted}
        strokeWidth={2}
        strokeDasharray="4 8"
      />
      <text
        x={g.x(0) + 8}
        y={g.y(limit) - 12}
        fontFamily={sans}
        fontWeight={600}
        fontSize={24}
        fill={pal.warn}
      >
        {`${limit}°C`}
      </text>
      <text
        x={g.x(0) + 8}
        y={g.y(low) - 12}
        fontFamily={sans}
        fontWeight={600}
        fontSize={24}
        fill={pal.muted}
      >
        {`${low}°C`}
      </text>
      {hasF ? (
        <g clipPath={`url(#${id}-fc)`}>
          <polygon points={conePts} fill={pal.violet} opacity={0.14} />
          <path
            d={path(fi, seg)}
            fill="none"
            stroke={pal.violet}
            strokeWidth={5}
            strokeDasharray="16 12"
          />
        </g>
      ) : null}
      <g opacity={histP > 0 ? 1 : 0}>
        <path
          d={histD}
          fill="none"
          stroke={pal.accent}
          strokeWidth={5}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - histP}
        />
        <path
          d={histD}
          fill="none"
          stroke={pal.bad}
          strokeWidth={5}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - histP}
          clipPath={`url(#${id}-hot)`}
        />
      </g>
      <circle
        cx={hx}
        cy={hy}
        r={11}
        fill={tone}
        stroke={pal.bg}
        strokeWidth={4}
      />
      <text
        x={Math.min(Math.max(hx, 70), width - 70)}
        y={hy - 24}
        textAnchor="middle"
        fontFamily={sans}
        fontWeight={600}
        fontSize={26}
        fill={tone}
        stroke={pal.bg}
        strokeWidth={8}
        paintOrder="stroke"
        opacity={pos > 0.5 ? 1 : 0}
      >
        {`${hv.toFixed(1)}°C`}
      </text>
    </svg>
  );
};

export const vialSlot = (i: number): [number, number] => [
  56 + (i % 4) * 52,
  [210, 350, 490][Math.floor(i / 4)],
];

export const Vial: React.FC<{
  x: number;
  y: number;
  color: string;
  s?: number;
}> = ({ x, y, color, s = 1 }) => {
  const pal = usePal();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={7} y={0} width={20} height={14} rx={4} fill={pal.muted} />
      <rect x={0} y={12} width={34} height={58} rx={9} fill={color} />
      <rect
        x={6}
        y={32}
        width={22}
        height={5}
        rx={2}
        fill={pal.surface}
        opacity={0.8}
      />
    </g>
  );
};

export const Fridge: React.FC<{
  x: number;
  y: number;
  s?: number;
  tone: string;
  vials: string[];
}> = ({ x, y, s = 1, tone, vials }) => {
  const pal = usePal();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        x={10}
        y={10}
        width={280}
        height={580}
        rx={26}
        fill={pal.surface}
        stroke={pal.line}
        strokeWidth={4}
      />
      <rect
        x={40}
        y={40}
        width={220}
        height={84}
        rx={12}
        fill={pal.tint}
        stroke={pal.line}
        strokeWidth={2}
      />
      <circle cx={72} cy={82} r={11} fill={tone} />
      <rect
        x={104}
        y={74}
        width={128}
        height={16}
        rx={8}
        fill={tone}
        opacity={0.35}
      />
      <rect x={36} y={150} width={228} height={416} rx={14} fill={pal.tint} />
      {[282, 422, 562].map((ly) => (
        <line
          key={ly}
          x1={36}
          x2={264}
          y1={ly}
          y2={ly}
          stroke={pal.line}
          strokeWidth={4}
        />
      ))}
      <rect x={268} y={150} width={6} height={110} rx={3} fill={pal.line} />
      <rect x={50} y={590} width={40} height={14} rx={4} fill={pal.line} />
      <rect x={210} y={590} width={40} height={14} rx={4} fill={pal.line} />
      {vials.map((c, i) => {
        const [vx, vy] = vialSlot(i);
        return c ? <Vial key={i} x={vx} y={vy} color={c} /> : null;
      })}
    </g>
  );
};

const along = (pts: [number, number][], t: number): [number, number] => {
  const lens = pts
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let d = t * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const k = lens[i] === 0 ? 0 : Math.min(1, d / lens[i]);
      return [
        pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k,
        pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k,
      ];
    }
    d -= lens[i];
  }
  return pts[0];
};

export const Flow: React.FC<{
  pts: [number, number][];
  color: string;
  draw?: number;
  dashed?: boolean;
  packets?: { period: number; count: number; start: number; end?: number };
}> = ({ pts, color, draw = 1, dashed = false, packets }) => {
  const pal = usePal();
  const frame = useCurrentFrame();
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`)
    .join(" ");
  const live =
    packets !== undefined &&
    frame >= packets.start &&
    frame < (packets.end ?? Infinity);
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={pal.line}
        strokeWidth={3}
        strokeDasharray={dashed ? "6 14" : undefined}
      />
      <g opacity={draw > 0 ? 1 : 0}>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={4}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - draw}
        />
      </g>
      {packets && live
        ? Array.from({ length: packets.count }, (_, k) => {
            const t =
              ((frame - packets.start + (k * packets.period) / packets.count) %
                packets.period) /
              packets.period;
            const [px, py] = along(pts, t);
            return (
              <circle
                key={k}
                cx={px}
                cy={py}
                r={9}
                fill={color}
                opacity={interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0])}
              />
            );
          })
        : null}
    </g>
  );
};

const N = 21;
const corners: [number, number][] = [
  [0, 0],
  [0, N - 7],
  [N - 7, 0],
];

const dark = (r: number, c: number): boolean => {
  for (const [r0, c0] of corners) {
    const lr = r - r0;
    const lc = c - c0;
    if (lr >= 0 && lr < 7 && lc >= 0 && lc < 7) {
      return (
        lr === 0 ||
        lr === 6 ||
        lc === 0 ||
        lc === 6 ||
        (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4)
      );
    }
  }
  return (r * 7 + c * 13 + r * c) % 5 < 2;
};

const cells = Array.from({ length: N * N }, (_, k) => ({
  r: Math.floor(k / N),
  c: k % N,
})).filter(({ r, c }) => dark(r, c));

export const Qr: React.FC<{ size: number }> = ({ size }) => {
  const pal = usePal();
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${N} ${N}`}
      shapeRendering="crispEdges"
    >
      {cells.map(({ r, c }) => (
        <rect
          key={`${r}-${c}`}
          x={c}
          y={r}
          width={1}
          height={1}
          fill={pal.text}
        />
      ))}
    </svg>
  );
};

export const MemberCard: React.FC<{
  member: Member;
  color: string;
  delay: number;
}> = ({ member, color, delay }) => {
  const pal = usePal();
  const p = useRamp(delay, 34);
  const q = useRamp(delay + 10, 26);
  const parts = member.name
    .split(/\s+/)
    .filter((word) => word && !/^\d+$/.test(word));
  const initials = (
    parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : (parts[0] ?? "?").slice(0, 2)
  ).toUpperCase();
  return (
    <div
      style={{ width: 320, display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div
        style={{
          width: 320,
          height: 300,
          overflow: "hidden",
          background: pal.tint,
          clipPath: `inset(${(1 - p) * 100}% 0 0 0 round 10px)`,
        }}
      >
        {member.photo ? (
          <Img
            src={staticFile(member.photo)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              transform: `scale(${1.1 - 0.1 * p})`,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...theme.display,
              fontSize: 96,
              color,
            }}
          >
            {initials}
          </div>
        )}
      </div>
      <div style={{ opacity: q, transform: `translateY(${(1 - q) * 14}px)` }}>
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
          }}
        >
          {member.name}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.25,
            color: pal.muted,
          }}
        >
          {member.role}
        </div>
      </div>
    </div>
  );
};
