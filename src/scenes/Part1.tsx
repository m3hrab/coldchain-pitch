import React from "react";
import {
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import { eventName, projectName, segmentName, teamName } from "../brand";
import {
  Logo,
  Reveal,
  SceneShell,
  Sfx,
  clamp,
  palFor,
  ramp,
} from "../components/Shell";
import { Fridge, Tag, Trace, series } from "../components/widgets";
import type { Scene } from "../scenes";
import { theme } from "../theme";

const gx = (t: number): number => 144 + t * 120;
const traceData = series(
  120,
  (u) => 5 + Math.sin(u * 9) * 1.4 + Math.sin(u * 23) * 0.45,
);
const traceD = traceData
  .map(
    (v, i) =>
      `${i === 0 ? "M" : "L"}${(24 + (i / 119) * 1680).toFixed(1)} ${(78 - (v - 5) * 22).toFixed(1)}`,
  )
  .join(" ");
const breachAt = 126;

export const Hook: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pal = palFor(scene);
  const temp = interpolate(frame, [20, breachAt - 1, 175], [4.2, 8, 9.8], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const tone = temp > 8 ? pal.bad : temp > 7 ? pal.warn : pal.text;
  const flash = interpolate(
    frame,
    [breachAt, breachAt + 6, breachAt + 26],
    [0, 1, 0],
    clamp,
  );
  const gauge = ramp(frame, 6, 30);
  const sub = ramp(frame, 118, 24);
  const out = ramp(frame, 188, 20);
  const card = ramp(frame, 200, 26);
  const rule = ramp(frame, 236, 40);
  const subtitle = ramp(frame, 242, 24);
  const meta = ramp(frame, 256, 24);
  const drawn = ramp(frame, 226, 110);
  return (
    <SceneShell scene={scene} wide header={false}>
      <Sfx name="alarm" at={breachAt} />
      <Sfx name="chime" at={214} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1 - out,
          transform: `translateY(${-out * 24}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 36,
            width: 1728,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Reveal
            text={scene.title}
            size={48}
            align="center"
            delay={8}
            stagger={5}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 150,
            width: 1728,
            textAlign: "center",
            lineHeight: 1,
            color: tone,
            opacity: gauge,
            transform: `scale(${1 + 0.04 * flash})`,
            ...theme.num,
            fontSize: 190,
            letterSpacing: "-0.045em",
          }}
        >
          {temp.toFixed(1)}
          <span
            style={{
              fontSize: 80,
              fontWeight: 500,
              color: pal.muted,
              marginLeft: 10,
              letterSpacing: 0,
            }}
          >
            °C
          </span>
        </div>
        <svg
          width={1728}
          height={770}
          style={{ position: "absolute", left: 0, top: 0, opacity: gauge }}
        >
          <rect
            x={gx(2)}
            y={500}
            width={gx(8) - gx(2)}
            height={20}
            rx={4}
            fill={pal.ok}
            opacity={0.3}
          />
          <rect
            x={gx(8)}
            y={500}
            width={gx(12) - gx(8)}
            height={20}
            rx={4}
            fill={pal.bad}
            opacity={0.12 + 0.28 * flash}
          />
          <line
            x1={gx(0)}
            x2={gx(12)}
            y1={510}
            y2={510}
            stroke={pal.line}
            strokeWidth={2}
          />
          {Array.from({ length: 13 }, (_, t) => (
            <g key={t}>
              <line
                x1={gx(t)}
                x2={gx(t)}
                y1={530}
                y2={t % 2 === 0 ? 548 : 540}
                stroke={pal.muted}
                strokeWidth={2}
              />
              {t % 2 === 0 ? (
                <text
                  x={gx(t)}
                  y={584}
                  textAnchor="middle"
                  fontFamily={theme.fonts.sans}
                  fontWeight={500}
                  fontSize={24}
                  fill={pal.muted}
                >
                  {t}
                </text>
              ) : null}
            </g>
          ))}
          <line
            x1={gx(8)}
            x2={gx(8)}
            y1={470}
            y2={548}
            stroke={pal.warn}
            strokeWidth={3}
          />
          <text
            x={gx(8)}
            y={452}
            textAnchor="middle"
            fontFamily={theme.fonts.sans}
            fontWeight={600}
            fontSize={24}
            fill={pal.warn}
          >
            8°C LIMIT
          </text>
          <polygon
            points={`${gx(temp)},496 ${gx(temp) - 11},474 ${gx(temp) + 11},474`}
            fill={tone}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 640,
            width: 1728,
            textAlign: "center",
            fontSize: 38,
            fontWeight: 500,
            letterSpacing: "-0.015em",
            color: pal.muted,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 14}px)`,
          }}
        >
          Above 8°C, it fails{" "}
          <span style={{ color: pal.bad, fontWeight: 600 }}>silently.</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: card,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 140,
          boxSizing: "border-box",
        }}
      >
        <svg
          width={1728}
          height={150}
          style={{ position: "absolute", left: 0, top: 600 }}
        >
          <rect
            x={0}
            y={12}
            width={1728}
            height={132}
            fill={pal.ok}
            opacity={0.08}
          />
          <line
            x1={0}
            x2={1728}
            y1={12}
            y2={12}
            stroke={pal.warn}
            strokeWidth={2}
            strokeDasharray="12 10"
            opacity={0.6}
          />
          <path
            d={traceD}
            fill="none"
            stroke={pal.accent}
            strokeWidth={4}
            strokeLinejoin="round"
            opacity={0.8}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - drawn}
          />
        </svg>
        <Logo size={84} />
        <div style={{ marginTop: 28 }}>
          <Reveal
            text={projectName}
            size={176}
            align="center"
            delay={212}
            stagger={6}
            weight={700}
          />
        </div>
        <div
          style={{
            width: 480 * rule,
            height: 4,
            background: pal.accent,
            marginTop: 8,
          }}
        />
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: pal.muted,
            marginTop: 28,
            opacity: subtitle,
          }}
        >
          {scene.bullets[0]}
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            gap: 28,
            alignItems: "center",
            fontSize: 28,
            fontWeight: 600,
            opacity: meta,
          }}
        >
          <span>{teamName}</span>
          <span style={{ width: 2, height: 30, background: pal.line }} />
          <span
            style={{ color: pal.muted, fontWeight: 500 }}
          >{`${eventName} · ${segmentName}`}</span>
        </div>
      </div>
    </SceneShell>
  );
};

const problemData = series(
  160,
  (u) => 4.2 + Math.sin(u * 16) * 0.5 + Math.max(0, u - 0.55) * 13,
);
const problemBreachAt = Math.round(
  50 + 330 * (problemData.findIndex((v) => v > 8) / (problemData.length - 1)),
);
const causes = ["Power cut", "Door left open", "Missed manual check"];

export const Problem: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pal = palFor(scene);
  const progress = interpolate(frame, [50, 380], [0, 1], clamp);
  const temp = problemData[Math.floor(progress * (problemData.length - 1))];
  const tone = temp > 8 ? pal.bad : temp > 7 ? pal.warn : pal.ok;
  const vials = Array.from({ length: 12 }, (_, i) =>
    interpolateColors(frame, [345 + i * 5, 361 + i * 5], [pal.ok, pal.bad]),
  );
  const fridgeIn = ramp(frame, 6, 30);
  const spoiled = ramp(frame, 350, 14);
  const unseen = ramp(frame, 250, 60);
  return (
    <SceneShell scene={scene}>
      <Sfx name="alarm" at={problemBreachAt} gain={0.6} />
      <svg
        width={340}
        height={620}
        style={{ position: "absolute", left: 0, top: 10 }}
      >
        <g opacity={fridgeIn} transform={`translate(0 ${(1 - fridgeIn) * 30})`}>
          <Fridge x={20} y={0} tone={tone} vials={vials} />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 640,
          width: 300,
          textAlign: "center",
          ...theme.num,
          fontSize: 52,
          color: tone,
        }}
      >
        {`${temp.toFixed(1)}°C`}
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 708,
          width: 300,
          textAlign: "center",
          opacity: spoiled,
        }}
      >
        <Tag text="Spoiled" color={pal.bad} />
      </div>
      <div style={{ position: "absolute", left: 380, top: 0 }}>
        <Trace
          id="problem"
          width={748}
          height={300}
          data={problemData}
          progress={progress}
        />
      </div>
      {causes.map((c, i) => {
        const p = ramp(frame, 125 + i * 35, 26);
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: 380,
              top: 330 + i * 88,
              width: 748,
              height: 76,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "0 24px",
              background: pal.surface,
              border: `2px solid ${pal.line}`,
              borderRadius: 14,
              opacity: p,
              transform: `translateX(${(1 - p) * 40}px)`,
            }}
          >
            <span
              style={{
                ...theme.num,
                fontSize: theme.type.small,
                color: pal.bad,
              }}
            >{`0${i + 1}`}</span>
            <span
              style={{
                fontSize: theme.type.body,
                fontWeight: 600,
                letterSpacing: "-0.015em",
              }}
            >
              {c}
            </span>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 380,
          top: 626,
          width: 748,
          height: 130,
          opacity: ramp(frame, 250, 20),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 60,
            width: 748,
            height: 4,
            background: pal.line,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 314,
            top: 54,
            width: 434 * unseen,
            height: 16,
            background: pal.bad,
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 305,
            top: 46,
            width: 18,
            height: 32,
            borderRadius: 9,
            background: pal.text,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 739,
            top: 46,
            width: 18,
            height: 32,
            borderRadius: 9,
            background: pal.text,
            opacity: unseen > 0.95 ? 1 : 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 314,
            top: 8,
            fontSize: theme.type.small,
            fontWeight: 600,
            color: pal.bad,
          }}
        >
          unseen for hours
        </div>
        <div
          style={{
            position: "absolute",
            left: 314,
            top: 92,
            transform: "translateX(-50%)",
            fontSize: theme.type.small,
            fontWeight: 500,
            color: pal.muted,
          }}
        >
          breach
        </div>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 92,
            fontSize: theme.type.small,
            fontWeight: 500,
            color: pal.muted,
          }}
        >
          found
        </div>
      </div>
    </SceneShell>
  );
};

const cues = [95, 170, 250, 335];

const paths: string[][] = [
  [
    "M48 74 V24 a12 12 0 0 1 24 0 V74 a22 22 0 1 1 -24 0 Z",
    "M60 40 V90",
    "M88 44 q12 16 0 32",
    "M102 32 q18 28 0 56",
  ],
  [
    "M60 8 L104 24 V58 C104 86 84 104 60 114 C36 104 16 86 16 58 V24 Z",
    "M38 60 L54 76 L84 44",
  ],
  [
    "M34 42 H62 a18 18 0 0 1 0 36 H34 a18 18 0 0 1 0 -36 Z",
    "M58 42 H86 a18 18 0 0 1 0 36 H58 a18 18 0 0 1 0 -36 Z",
  ],
  [
    "M14 106 H110 M14 106 V14",
    "M20 88 C40 84 52 66 70 58",
    "M70 58 C86 50 96 34 108 20",
  ],
];

const shapes = (
  kind: number,
  st: React.SVGProps<SVGPathElement>,
): React.ReactNode[] =>
  paths[kind].map((p, i) => <path key={i} d={p} {...st} />);

const Icon: React.FC<{
  kind: number;
  p: number;
  color: string;
  base: string;
}> = ({ kind, p, color, base }) => {
  const common = {
    fill: "none",
    strokeWidth: 5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    pathLength: 1,
    strokeDasharray: "1 1",
  } as const;
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      {shapes(kind, { ...common, stroke: base, strokeDashoffset: 0 })}
      <g opacity={p > 0.001 ? 1 : 0}>
        {shapes(kind, { ...common, stroke: color, strokeDashoffset: 1 - p })}
      </g>
    </svg>
  );
};

export const Solution: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pal = palFor(scene);
  const markerX = interpolate(
    frame,
    cues,
    cues.map((_, i) => i * 432 + 14),
    {
      ...clamp,
      easing: theme.easeInOut,
    },
  );
  return (
    <SceneShell scene={scene} wide>
      {cues.map((at) => (
        <Sfx key={at} name="tick" at={at} />
      ))}
      {scene.bullets.map((b, i) => {
        const [name, ...rest] = b.split(": ");
        const active = ramp(frame, cues[i], 22);
        const enter = ramp(frame, 10 + i * 10, 30);
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left: i * 432,
              top: 40,
              width: 384,
              opacity: (0.35 + 0.65 * active) * enter,
              transform: `translateY(${(1 - enter) * 30}px)`,
            }}
          >
            <Icon
              kind={i}
              p={ramp(frame, cues[i], 40)}
              color={pal.accent}
              base={pal.line}
            />
            <div
              style={{
                ...theme.display,
                fontSize: 64,
                lineHeight: 1.05,
                marginTop: 24,
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 500,
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
                color: pal.muted,
                marginTop: 14,
              }}
            >
              {rest.join(": ")}
            </div>
          </div>
        );
      })}
      <svg
        width={1728}
        height={60}
        style={{ position: "absolute", left: 0, top: 600 }}
      >
        <line
          x1={14}
          x2={14 + 3 * 432}
          y1={30}
          y2={30}
          stroke={pal.line}
          strokeWidth={3}
        />
        <line
          x1={14}
          x2={markerX}
          y1={30}
          y2={30}
          stroke={pal.accent}
          strokeWidth={4}
        />
        {cues.map((_, i) => (
          <circle
            key={i}
            cx={i * 432 + 14}
            cy={30}
            r={12}
            fill={pal.bg}
            stroke={pal.line}
            strokeWidth={3}
          />
        ))}
        <circle cx={markerX} cy={30} r={14} fill={pal.accent} />
      </svg>
    </SceneShell>
  );
};
