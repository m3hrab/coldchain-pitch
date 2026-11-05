import React from "react";
import { interpolate, interpolateColors, useCurrentFrame } from "remotion";
import {
  Card,
  Flow,
  Meter,
  Tag,
  Trace,
  series,
  traceGeom,
} from "../components/widgets";
import { SceneShell, Sfx, clamp, palFor, ramp } from "../components/Shell";
import type { Scene } from "../scenes";
import { theme } from "../theme";

const sans = theme.fonts.sans;

const ys = [160, 385, 610];
const consumers: [string, string][] = [
  ["Web app", "roles"],
  ["AI model", "predict"],
  ["QR page", "public"],
];

export const Architecture: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pal = palFor(scene);
  const hmac = ramp(frame, 205, 20);
  return (
    <SceneShell scene={scene}>
      <Sfx name="tick" at={205} />
      <Sfx name="tick" at={300} />
      {[450, 500, 550].map((at) => (
        <Sfx key={at} name="pop" at={at} />
      ))}
      <svg
        width={1128}
        height={770}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {ys.map((y, i) => (
          <Flow
            key={`a${i}`}
            pts={[
              [240, y],
              [273, y],
              [273, 385],
              [306, 385],
            ]}
            color={pal.accent}
            draw={ramp(frame, 90 + i * 8, 30)}
            packets={{ period: 48, count: 2, start: 150 + i * 10 }}
          />
        ))}
        <Flow
          pts={[
            [506, 385],
            [572, 385],
          ]}
          color={pal.ok}
          draw={ramp(frame, 300, 24)}
          packets={{ period: 40, count: 2, start: 330 }}
        />
        {ys.map((y, j) => (
          <Flow
            key={`c${j}`}
            pts={[
              [812, 385],
              [845, 385],
              [845, y],
              [878, y],
            ]}
            color={pal.ok}
            draw={ramp(frame, 450 + j * 50, 30)}
            packets={{ period: 44, count: 2, start: 485 + j * 50 }}
          />
        ))}
      </svg>
      {ys.map((y, i) => (
        <Card
          key={y}
          title="ESP32"
          sub={`Fridge ${i + 1}`}
          delay={20 + i * 12}
          style={{
            position: "absolute",
            left: 0,
            top: y - 75,
            width: 240,
            height: 150,
          }}
        />
      ))}
      <Card
        title="MQTT"
        sub="broker"
        delay={100}
        border={interpolateColors(hmac, [0, 1], [pal.line, pal.accent])}
        style={{
          position: "absolute",
          left: 306,
          top: 310,
          width: 200,
          height: 150,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 406,
          top: 246,
          transform: `translate(-50%, ${(1 - hmac) * 14}px)`,
          opacity: hmac,
        }}
      >
        <Tag text="HMAC OK" color={pal.accent} />
      </div>
      <Card
        title="Backend"
        sub={"store\nscore\nalert"}
        delay={290}
        style={{
          position: "absolute",
          left: 572,
          top: 235,
          width: 240,
          height: 300,
        }}
      />
      {consumers.map(([title, sub], j) => (
        <Card
          key={title}
          title={title}
          sub={sub}
          delay={450 + j * 50}
          style={{
            position: "absolute",
            left: 878,
            top: ys[j] - 75,
            width: 250,
            height: 150,
          }}
        />
      ))}
    </SceneShell>
  );
};

const smooth = (u: number, a: number, b: number): number => {
  const t = Math.min(1, Math.max(0, (u - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const nodeData = series(
  220,
  (u) =>
    4.3 +
    Math.sin(u * 44) * 0.35 +
    Math.exp(-(((u - 0.28) / 0.018) ** 2)) * 4.5 +
    smooth(u, 0.58, 0.67) * (1 - smooth(u, 0.9, 0.97)) * 6.2,
);
const n = nodeData.length;
const cum: number[] = [];
nodeData.forEach((v, i) => cum.push((i ? cum[i - 1] : 0) + Math.max(0, v - 8)));
const budgetAt = (i: number): number => 1 - 0.88 * (cum[i] / cum[n - 1]);
const tF = [40, 300, 320, 345, 400, 600, 660];
const tU = [0, 0.24, 0.26, 0.31, 0.56, 0.95, 1];
const alertIdx = nodeData.findIndex((_, i) => budgetAt(i) < 0.35);
const alertFrame = Math.round(interpolate(alertIdx / (n - 1), tU, tF, clamp));
const doorIdx = Math.round(0.28 * (n - 1));
const doorFrame = Math.round(interpolate(0.28, tU, tF, clamp));
const faultIdx = Math.round(0.62 * (n - 1));
const nodeG = traceGeom(1128, 320, n, 0, 12);
const isFault = (i: number): boolean =>
  i / (n - 1) >= 0.6 && i / (n - 1) <= 0.9;
const isOn = (i: number): boolean =>
  !isFault(i) && Math.cos((i / (n - 1)) * 44) <= 0;

export const FridgeNode: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pal = palFor(scene);
  const progress = interpolate(frame, tF, tU, clamp);
  const pos = progress * (n - 1);
  const shown = Math.floor(pos);
  const temp = nodeData[shown];
  const budget = budgetAt(shown);
  const fault = isFault(shown);
  const on = isOn(shown);
  const tone = temp > 8 ? pal.bad : pal.accent;
  const bColor = budget > 0.6 ? pal.ok : budget > 0.35 ? pal.warn : pal.bad;
  const state = fault ? "fault" : on ? "on" : "off";
  const stateColor = fault ? pal.bad : on ? pal.ok : pal.muted;
  const door = ramp(frame, doorFrame, 20);
  const faultCall = ramp(frame, interpolate(0.62, tU, tF, clamp), 20);
  const callout = (
    key: string,
    i: number,
    v: number,
    dy: number,
    text: string,
    color: string,
    p: number,
  ) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left: nodeG.x(i),
        top: nodeG.y(v) + dy,
        transform: `translate(-50%, ${(1 - p) * 10}px)`,
        opacity: p,
        ...theme.num,
        fontSize: theme.type.small,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
  return (
    <SceneShell scene={scene}>
      <Sfx name="tick" at={doorFrame} gain={0.6} />
      <Sfx name="alarm" at={alertFrame} />
      <Trace
        id="node"
        width={1128}
        height={320}
        data={nodeData}
        progress={progress}
      />
      {callout("door", doorIdx, 8.8, -48, "Door opened", pal.muted, door)}
      {callout(
        "fault",
        faultIdx + 20,
        10.5,
        16,
        "Compressor fault",
        pal.bad,
        faultCall,
      )}
      <svg
        width={1128}
        height={100}
        style={{ position: "absolute", left: 0, top: 340 }}
      >
        <text
          x={24}
          y={30}
          fontFamily={sans}
          fontWeight={600}
          fontSize={22}
          letterSpacing={1.5}
          fill={pal.muted}
        >
          COMPRESSOR
        </text>
        {nodeData.slice(0, shown + 1).map((_, i) => (
          <rect
            key={i}
            x={nodeG.x(i)}
            y={52}
            width={1080 / (n - 1) + 0.6}
            height={36}
            fill={isFault(i) ? pal.bad : isOn(i) ? pal.accent : pal.tint}
          />
        ))}
        <rect
          x={24}
          y={52}
          width={1080}
          height={36}
          fill="none"
          stroke={pal.line}
          strokeWidth={2}
        />
      </svg>
      <div style={{ position: "absolute", left: 0, top: 480 }}>
        <Meter
          value={budget}
          width={640}
          label="Heat-exposure budget"
          color={bColor}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 630,
          opacity: ramp(frame, alertFrame, 12),
        }}
      >
        <Tag text="Alert sent to staff" color={pal.bad} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 720,
          top: 470,
          ...theme.num,
          fontSize: 72,
          letterSpacing: "-0.03em",
          color: tone,
        }}
      >
        {`${temp.toFixed(1)}°C`}
      </div>
      <div
        style={{
          position: "absolute",
          left: 720,
          top: 556,
          fontSize: theme.type.small,
          fontWeight: 500,
          color: pal.muted,
        }}
      >
        fridge temperature
      </div>
      <div style={{ position: "absolute", left: 720, top: 606 }}>
        <Tag text={`Compressor ${state}`} color={stateColor} />
      </div>
    </SceneShell>
  );
};

const h4 = (k: number): string =>
  ((k * 2654435761) >>> 0)
    .toString(16)
    .slice(0, 4)
    .toUpperCase()
    .padStart(4, "0");
const hashes = ["0000", h4(1), h4(2), h4(3), h4(4)];
const forged = h4(99);
const tamperAt = 545;
const slots = Array.from({ length: 16 }, (_, k) => k);

const phaseOf = (f: number): "up" | "down" | "sync" =>
  f < 135 ? "up" : f < 330 ? "down" : f < 450 ? "sync" : "up";

const queuedAt = (f: number): number =>
  f < 135
    ? 0
    : f < 330
      ? Math.min(16, Math.floor((f - 135) / 10))
      : f < 450
        ? Math.min(16, Math.max(0, 16 - Math.floor((f - 340) / 6)))
        : 0;

export const Security: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pal = palFor(scene);
  const phase = phaseOf(frame);
  const queued = queuedAt(frame);
  const phaseColor =
    phase === "up" ? pal.ok : phase === "down" ? pal.bad : pal.warn;
  const status =
    phase === "up"
      ? "Link up"
      : phase === "down"
        ? `Offline · ${queued} queued`
        : "Syncing backlog";
  const linkOut = 1 - ramp(frame, 452, 18);
  const chainIn = ramp(frame, 462, 24);
  const recovered = ramp(frame, 332, 20);
  const verified = Math.max(0, ramp(frame, 528, 16) - ramp(frame, 544, 8));
  const tampered = ramp(frame, 580, 20);
  const edited = ramp(frame, tamperAt, 14);
  const broken = (i: number): boolean =>
    i >= 1 && frame >= tamperAt + (i - 1) * 14;
  return (
    <SceneShell scene={scene}>
      <Sfx name="alarm" at={135} gain={0.6} />
      <Sfx name="tick" at={330} />
      <Sfx name="chime" at={436} gain={0.6} />
      <Sfx name="alarm" at={tamperAt} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: linkOut,
          transform: `translateY(${(1 - linkOut) * -40}px)`,
        }}
      >
        <svg
          width={1128}
          height={770}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <Flow
            pts={[
              [240, 230],
              [888, 230],
            ]}
            color={phaseColor}
            draw={phase === "down" ? 0 : 1}
            dashed={phase === "down"}
            packets={
              phase === "up"
                ? { period: 44, count: 2, start: 0, end: 135 }
                : phase === "sync"
                  ? { period: 16, count: 3, start: 330, end: 450 }
                  : undefined
            }
          />
          {phase === "down" ? (
            <g stroke={pal.bad} strokeWidth={5}>
              <line x1={548} y1={214} x2={580} y2={246} />
              <line x1={580} y1={214} x2={548} y2={246} />
            </g>
          ) : null}
        </svg>
        <Card
          title="ESP32"
          sub="fridge"
          delay={5}
          style={{
            position: "absolute",
            left: 0,
            top: 150,
            width: 240,
            height: 160,
          }}
        />
        <Card
          title="Backend"
          sub="cloud"
          delay={15}
          style={{
            position: "absolute",
            left: 888,
            top: 150,
            width: 240,
            height: 160,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 240,
            top: 150,
            width: 648,
            textAlign: "center",
            ...theme.label,
            fontSize: theme.type.small,
            color: phaseColor,
          }}
        >
          {status}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 350,
            ...theme.label,
            fontSize: 22,
            color: pal.muted,
          }}
        >
          Buffer
        </div>
        {slots.map((k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              left: (k % 8) * 52,
              top: 400 + Math.floor(k / 8) * 52,
              width: 40,
              height: 40,
              boxSizing: "border-box",
              borderRadius: 6,
              background: k < queued ? pal.warn : "transparent",
              border: `2px solid ${k < queued ? pal.warn : pal.line}`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 560,
            width: 1128,
            textAlign: "center",
            ...theme.display,
            fontSize: 48,
            opacity: recovered,
          }}
        >
          {`${16 - queued} of 16 readings recovered`}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: chainIn,
          transform: `translateY(${(1 - chainIn) * 40}px)`,
        }}
      >
        <svg
          width={1128}
          height={770}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          {[0, 1, 2].map((i) => (
            <Flow
              key={i}
              pts={[
                [i * 296 + 240, 305],
                [i * 296 + 296, 305],
              ]}
              color={broken(i + 1) ? pal.bad : pal.accent}
              draw={ramp(frame, 480 + i * 18, 20)}
            />
          ))}
        </svg>
        {[0, 1, 2, 3].map((i) => {
          const bad = broken(i);
          const own = i === 1 && frame >= tamperAt ? forged : hashes[i + 1];
          return (
            <Card
              key={i}
              title={`#${i + 1}`}
              sub={`prev ${hashes[i]}\nhash ${own}`}
              color={bad ? pal.bad : pal.accent}
              border={bad ? pal.bad : pal.line}
              delay={470 + i * 18}
              style={{
                position: "absolute",
                left: i * 296,
                top: 180,
                width: 240,
                height: 250,
              }}
            />
          );
        })}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * 296,
              top: 446,
              width: 240,
              textAlign: "center",
              ...theme.label,
              fontSize: 22,
              color: broken(i) ? pal.bad : pal.ok,
              opacity: ramp(frame, 500 + i * 6, 14),
            }}
          >
            {i === 1 && broken(i) ? "Altered" : broken(i) ? "Broken" : "Valid"}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: 296 + 120 - 200,
            top: 120,
            width: 400,
            textAlign: "center",
            ...theme.num,
            fontSize: theme.type.small,
            color: pal.bad,
            opacity: edited,
          }}
        >
          edit: 4.2 → 1.0°C
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 580,
            width: 1128,
            textAlign: "center",
            ...theme.display,
            fontSize: 52,
            color: pal.ok,
            opacity: verified,
          }}
        >
          Chain verified
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 580,
            width: 1128,
            textAlign: "center",
            ...theme.display,
            fontSize: 52,
            color: pal.bad,
            opacity: tampered,
          }}
        >
          Tamper detected at block #2
        </div>
      </div>
    </SceneShell>
  );
};
