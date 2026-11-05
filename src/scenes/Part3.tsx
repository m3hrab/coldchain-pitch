import React from "react";
import { interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { segmentName, tagline, teamName } from "../brand";
import {
  Logo,
  Reveal,
  SceneShell,
  Sfx,
  clamp,
  palFor,
  ramp,
} from "../components/Shell";
import {
  Fridge,
  Flow,
  MemberCard,
  Meter,
  Qr,
  Tag,
  Trace,
  Vial,
  series,
  traceGeom,
  vialSlot,
} from "../components/widgets";
import type { Scene } from "../scenes";
import { members } from "../team";
import { theme } from "../theme";

const tempFns: ((f: number) => number)[] = [
  (f) => 4.4 + Math.sin(f / 25) * 0.3,
  (f) => 3.9 + Math.cos(f / 30) * 0.2,
  (f) =>
    interpolate(f, [500, 620], [6.4, 9.4], clamp) + Math.sin(f / 18) * 0.12,
];
const webBreach = Math.round(500 + (120 * (8 - 6.4)) / (9.4 - 6.4));
const roleCues = [10, 265, 315];
const roles: [string, string][] = [
  ["Admin", "manage · edit · export"],
  ["Nurse", "view · acknowledge"],
  ["Auditor", "read-only · export logs"],
];
const fridgeNames = ["Fridge A", "Fridge B", "Fridge C"];

const spark = (fn: (f: number) => number, frame: number): string =>
  Array.from({ length: 40 }, (_, k) => {
    const t = fn(frame - (39 - k) * 5);
    return `${k === 0 ? "M" : "L"}${(k * 5.2).toFixed(1)} ${(60 - ((t - 2) / 9) * 56).toFixed(1)}`;
  }).join(" ");

export const Web: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pal = palFor(scene);
  const dash = ramp(frame, 4, 30);
  const phoneIn = ramp(frame, 395, 36);
  const w = 1128 - 388 * phoneIn;
  const roleIdx = frame >= roleCues[2] ? 2 : frame >= roleCues[1] ? 1 : 0;
  const roleSince = ramp(frame, roleCues[roleIdx], 16);
  const temps = tempFns.map((fn) => fn(frame));
  const tone = (t: number): string =>
    t > 8 ? pal.bad : t > 7 ? pal.warn : pal.ok;
  const budget = interpolate(
    frame,
    [webBreach, webBreach + 100],
    [0.92, 0.35],
    clamp,
  );
  const bColor = budget > 0.6 ? pal.ok : budget > 0.4 ? pal.warn : pal.bad;
  const scan = ramp(frame, 430, 60);
  const verdictIn = ramp(frame, 490, 16);
  const fl = ramp(frame, webBreach + 6, 20);
  const unsafe = fl > 0.5;
  const verdictColor = unsafe ? pal.bad : pal.ok;
  return (
    <SceneShell scene={scene}>
      <Sfx name="whoosh" at={395} gain={0.4} />
      <Sfx name="chime" at={490} gain={0.6} />
      <Sfx name="alarm" at={webBreach} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 35,
          width: w,
          height: 700,
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: pal.surface,
          border: `2px solid ${pal.line}`,
          borderRadius: 18,
          opacity: dash,
          transform: `translateY(${(1 - dash) * 30}px)`,
        }}
      >
        <div
          style={{
            height: 56,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 22px",
            borderBottom: `2px solid ${pal.line}`,
            background: pal.tint,
          }}
        >
          {[0, 1, 2].map((k) => (
            <div
              key={k}
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: pal.line,
              }}
            />
          ))}
          <span
            style={{
              marginLeft: 16,
              fontSize: theme.type.small,
              fontWeight: 500,
              color: pal.muted,
            }}
          >
            coldchain.app
          </span>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: "24px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: 56,
            }}
          >
            <span
              style={{
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Fridges
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              {roles.map(([name], k) => (
                <span
                  key={name}
                  style={{
                    fontSize: theme.type.small,
                    fontWeight: 600,
                    padding: "4px 14px",
                    borderRadius: 6,
                    color: k === roleIdx ? pal.bg : pal.muted,
                    background: k === roleIdx ? pal.accent : "transparent",
                    border: `2px solid ${k === roleIdx ? pal.accent : pal.line}`,
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
          <div
            style={{
              fontSize: theme.type.small,
              fontWeight: 500,
              color: pal.muted,
              height: 32,
              opacity: roleSince,
            }}
          >
            {roles[roleIdx][1]}
          </div>
          {fridgeNames.map((name, i) => {
            const row = ramp(frame, 20 + i * 10, 24);
            return (
              <div
                key={name}
                style={{
                  height: 104,
                  flexShrink: 0,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "0 24px",
                  borderRadius: 12,
                  background: pal.bg,
                  border: `2px solid ${temps[i] > 8 ? pal.bad : pal.line}`,
                  opacity: row,
                  transform: `translateX(${(1 - row) * 30}px)`,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    background: tone(temps[i]),
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: theme.type.body,
                    fontWeight: 600,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {name}
                </div>
                <svg width={202} height={64} style={{ flexShrink: 0 }}>
                  <path
                    d={spark(tempFns[i], frame)}
                    fill="none"
                    stroke={tone(temps[i])}
                    strokeWidth={4}
                    strokeLinejoin="round"
                  />
                </svg>
                <div
                  style={{
                    width: 110,
                    textAlign: "right",
                    ...theme.num,
                    fontSize: 32,
                    color: tone(temps[i]),
                  }}
                >
                  {`${temps[i].toFixed(1)}°`}
                </div>
              </div>
            );
          })}
          <Meter
            value={budget}
            width={w - 60}
            label="Fridge C budget"
            color={bColor}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 788 + (1 - phoneIn) * 420,
          top: 35,
          width: 340,
          height: 700,
          boxSizing: "border-box",
          border: `8px solid ${pal.text}`,
          borderRadius: 48,
          background: pal.surface,
          opacity: phoneIn,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 22,
        }}
      >
        <div
          style={{
            width: 90,
            height: 10,
            borderRadius: 5,
            background: pal.line,
          }}
        />
        <div
          style={{
            ...theme.label,
            fontSize: 22,
            color: pal.muted,
            marginTop: 30,
          }}
        >
          Batch 4471
        </div>
        <div
          style={{
            position: "relative",
            marginTop: 24,
            padding: 16,
            background: "#FFFFFF",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <Qr size={220} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 16 + scan * 216,
              height: 4,
              background: pal.accent,
              opacity: scan < 1 ? 1 : 0,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 36,
            textAlign: "center",
            opacity: verdictIn,
            transform: `scaleY(${Math.abs(1 - 2 * fl)})`,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: verdictColor,
            }}
          >
            {unsafe ? "DO NOT USE" : "SAFE TO USE"}
          </div>
          <div
            style={{
              fontSize: theme.type.small,
              fontWeight: 500,
              color: pal.muted,
              marginTop: 8,
            }}
          >
            {unsafe ? "Breach logged" : "Chain intact"}
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const aiData = series(100, (u) => 4.4 + u * 5.6 + Math.sin(u * 18) * 0.22);
const aiG = traceGeom(1128, 320, aiData.length, 0, 12);
const aiCross = aiData.findIndex((v, i) => i > 40 && v > 8);
const aiCrossFrame = Math.round(20 + (240 * aiCross) / (aiData.length - 1));
const fridgeX = [102, 486, 870];
const fridgeY = 385;
const fridgeS = 0.48;
const slotOf = (fx: number, i: number): [number, number] => {
  const [lx, ly] = vialSlot(i);
  return [fx + lx * fridgeS, fridgeY + ly * fridgeS];
};
const emptySlots = Array.from({ length: 12 }, () => "");

export const AiScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pal = palFor(scene);
  const progress = interpolate(frame, [20, 260], [0, 1], clamp);
  const tC = interpolate(frame, [0, 300, 520], [6.2, 7.4, 9.3], clamp);
  const moved = frame >= 470;
  const toneC = tC > 8 ? pal.bad : tC > 7 ? pal.warn : pal.ok;
  const legendOut = 1 - ramp(frame, 286, 12);
  const marker = ramp(frame, aiCrossFrame, 10);
  const labels: [string, string, string][] = [
    ["Fridge A", "4.1°C · full", pal.ok],
    [
      "Fridge B",
      moved ? "3.8°C · batch in" : "3.8°C · free",
      moved ? pal.ok : pal.accent,
    ],
    ["Fridge C", `${tC.toFixed(1)}°C · ${moved ? "empty" : "rising"}`, toneC],
  ];
  return (
    <SceneShell scene={scene}>
      <Sfx name="alarm" at={aiCrossFrame} gain={0.5} />
      <Sfx name="tick" at={300} />
      <Sfx name="chime" at={470} />
      <Trace
        id="ai"
        width={1128}
        height={320}
        data={aiData}
        progress={progress}
        forecastFrom={40}
        learned={[3.4, 5.4]}
      />
      <svg
        width={1128}
        height={320}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <line
          x1={aiG.x(aiCross)}
          x2={aiG.x(aiCross)}
          y1={aiG.y(12)}
          y2={aiG.y(0)}
          stroke={pal.violet}
          strokeWidth={3}
          strokeDasharray="8 10"
          opacity={marker}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 336,
          width: 1128,
          display: "flex",
          gap: 36,
          alignItems: "center",
          opacity: legendOut,
          fontSize: theme.type.small,
          fontWeight: 500,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: pal.accent,
            opacity: ramp(frame, 30, 20),
          }}
        >
          <span
            style={{
              width: 36,
              height: 20,
              background: pal.accent,
              opacity: 0.3,
            }}
          />
          learned normal
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: pal.violet,
            opacity: ramp(frame, 130, 20),
          }}
        >
          <span style={{ width: 36, borderTop: `4px dashed ${pal.violet}` }} />
          forecast
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: pal.violet,
            opacity: ramp(frame, aiCrossFrame, 20),
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              background: pal.violet,
            }}
          />
          breach in ~18 min
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 332,
          width: 1128,
          textAlign: "center",
          opacity: ramp(frame, 300, 16) * (moved ? 0 : 1),
        }}
      >
        <Tag text="Relocate batch to Fridge B" color={pal.accent} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 332,
          width: 1128,
          textAlign: "center",
          opacity: ramp(frame, 470, 16),
        }}
      >
        <Tag text="Batch relocated · doses saved" color={pal.ok} />
      </div>
      <svg
        width={1128}
        height={770}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {fridgeX.map((fx, i) => {
          const p = ramp(frame, 20 + i * 12, 30);
          return (
            <g key={fx} opacity={p} transform={`translate(0 ${(1 - p) * 24})`}>
              <Fridge
                x={fx}
                y={fridgeY}
                s={fridgeS}
                tone={i === 2 ? toneC : pal.ok}
                vials={
                  i === 0
                    ? Array.from({ length: 12 }, () => pal.ok)
                    : emptySlots
                }
              />
            </g>
          );
        })}
        <Flow
          pts={[
            [942, 372],
            [942, 346],
            [558, 346],
            [558, 372],
          ]}
          color={pal.accent}
          draw={ramp(frame, 300, 30)}
        />
        {Array.from({ length: 12 }, (_, i) => {
          const t = ramp(frame, 345 + i * 6, 36);
          const [ax, ay] = slotOf(fridgeX[2], i);
          const [bx, by] = slotOf(fridgeX[1], i);
          const color = interpolateColors(
            frame,
            [150, 300, 345 + i * 6, 381 + i * 6],
            [pal.ok, pal.warn, pal.warn, pal.ok],
          );
          return (
            <Vial
              key={i}
              x={ax + (bx - ax) * t}
              y={ay + (by - ay) * t - Math.sin(Math.PI * t) * 70}
              color={color}
              s={fridgeS}
            />
          );
        })}
      </svg>
      {labels.map(([name, sub, color], i) => (
        <div
          key={name}
          style={{
            position: "absolute",
            left: fridgeX[i] + 72 - 170,
            top: 686,
            width: 340,
            textAlign: "center",
            opacity: ramp(frame, 30 + i * 12, 24),
          }}
        >
          <div
            style={{
              fontSize: theme.type.body,
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
            }}
          >
            {name}
          </div>
          <div
            style={{
              ...theme.num,
              fontSize: theme.type.small,
              fontWeight: 500,
              lineHeight: 1.3,
              color,
            }}
          >
            {sub}
          </div>
        </div>
      ))}
    </SceneShell>
  );
};

export const Team: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pal = palFor(scene);
  const words = [52, 82, 114];
  const principles = 1 - ramp(frame, 166, 16);
  const closing = ramp(frame, 346, 24);
  return (
    <SceneShell scene={scene} wide>
      <Sfx name="chime" at={350} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: principles,
          transform: `translateY(${(1 - principles) * -24}px)`,
        }}
      >
        {scene.bullets.map((b, i) => (
          <Reveal
            key={b}
            text={b}
            size={112}
            align="center"
            delay={words[i] ?? 114}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          display: "flex",
          gap: 32,
        }}
      >
        {members.map((m, i) => (
          <MemberCard
            key={i}
            member={m}
            color={theme.memberTones[i % 5]}
            delay={176 + i * 10}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 480,
          width: 1728,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Reveal
          text={tagline}
          size={64}
          align="center"
          delay={352}
          stagger={8}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 640,
          width: 1728,
          height: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 36,
          opacity: closing,
        }}
      >
        <Logo size={70} />
        <div style={{ width: 2, height: 44, background: pal.line }} />
        <div
          style={{ ...theme.display, fontSize: 40 }}
        >{`${teamName} · ${segmentName}`}</div>
      </div>
    </SceneShell>
  );
};
