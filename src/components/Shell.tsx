import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { eventLogo, eventName } from "../brand";
import { scenes } from "../scenes";
import type { Scene } from "../scenes";
import { palettes, theme } from "../theme";
import type { Palette } from "../theme";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

type SfxName = keyof typeof theme.sfx.files;

const PalCtx = createContext<Palette>(palettes.paper);

export const usePal = (): Palette => useContext(PalCtx);

export const palFor = (scene: Scene): Palette =>
  theme.dark.includes(scene.id) ? palettes.ink : palettes.paper;

export const ramp = (frame: number, start: number, dur = 24): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    ...clamp,
    easing: theme.ease,
  });

export const useRamp = (start: number, dur = 24): number =>
  ramp(useCurrentFrame(), start, dur);

export const Sfx: React.FC<{ name: SfxName; at: number; gain?: number }> = ({
  name,
  at,
  gain = 1,
}) =>
  theme.sfx.enabled ? (
    <Sequence from={Math.max(0, at)} layout="none">
      <Audio
        src={staticFile(theme.sfx.files[name])}
        volume={theme.sfx.volume * gain}
      />
    </Sequence>
  ) : null;

export const Logo: React.FC<{ size: number }> = ({ size }) => {
  const pal = usePal();
  return eventLogo ? (
    <Img
      src={staticFile(eventLogo)}
      style={{
        height: size,
        maxWidth: size * 5,
        objectFit: "contain",
        filter: pal.bg === palettes.paper.bg ? "invert(1)" : "none",
      }}
    />
  ) : (
    <div
      style={{
        fontFamily: theme.fonts.sans,
        fontSize: Math.max(24, size * 0.6),
        fontWeight: 700,
        letterSpacing: 6,
        lineHeight: 1,
        whiteSpace: "nowrap",
        color: pal.accent,
      }}
    >
      {eventName.toUpperCase()}
    </div>
  );
};

export const Reveal: React.FC<{
  text: string;
  size: number;
  delay?: number;
  stagger?: number;
  align?: "left" | "center";
  color?: string;
  weight?: number;
}> = ({
  text,
  size,
  delay = 0,
  stagger = 4,
  align = "left",
  color,
  weight,
}) => {
  const frame = useCurrentFrame();
  const pal = usePal();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: size * 0.24,
        justifyContent: align === "center" ? "center" : "flex-start",
        ...theme.display,
        fontWeight: weight ?? theme.display.fontWeight,
        fontSize: size,
        lineHeight: 1.12,
        color: color ?? pal.text,
      }}
    >
      {text.split(" ").map((word, i) => {
        const p = ramp(frame, delay + i * stagger, 26);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              paddingBottom: size * 0.16,
              marginBottom: -size * 0.16,
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - p) * 125}%)`,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

const Caption: React.FC<{ text: string; total: number }> = ({
  text,
  total,
}) => {
  const frame = useCurrentFrame();
  const pal = usePal();
  const p = ramp(frame, 14, 22);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: theme.layout.captionH,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: theme.layout.pad,
          right: theme.layout.pad,
          top: 0,
          height: 2,
          background: pal.line,
        }}
      >
        <div
          style={{
            width: `${Math.min(1, frame / total) * 100}%`,
            height: 2,
            background: pal.accent,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 160px",
          fontFamily: theme.fonts.sans,
          fontSize: theme.type.caption,
          fontWeight: 500,
          lineHeight: 1.35,
          letterSpacing: "-0.01em",
          color: pal.text,
          opacity: p,
          transform: `translateY(${(1 - p) * 12}px)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Points: React.FC<{ items: string[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const pal = usePal();
  return (
    <div
      style={{
        width: theme.layout.sideW,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {items.map((b, i) => {
        const p = ramp(frame, 14 + i * 10, 26);
        return (
          <React.Fragment key={b}>
            <div
              style={{
                display: "flex",
                gap: 20,
                padding: "22px 0",
                borderTop: `2px solid ${pal.line}`,
                opacity: p,
                transform: `translateY(${(1 - p) * 18}px)`,
              }}
            >
              <span
                style={{
                  ...theme.num,
                  fontSize: theme.type.small,
                  color: pal.accent,
                  paddingTop: 6,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontSize: theme.type.body,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  letterSpacing: "-0.015em",
                }}
              >
                {b}
              </span>
            </div>
            <Sfx name="pop" at={14 + i * 10} gain={0.3} />
          </React.Fragment>
        );
      })}
      <div style={{ borderTop: `2px solid ${pal.line}` }} />
    </div>
  );
};

export const SceneShell: React.FC<{
  scene: Scene;
  wide?: boolean;
  header?: boolean;
  children: React.ReactNode;
}> = ({ scene, wide = false, header = true, children }) => {
  const frame = useCurrentFrame();
  const { layout } = theme;
  const pal = palFor(scene);
  const total = scene.durationSec * theme.fps;
  const index = scenes.findIndex((s) => s.id === scene.id) + 1;
  const rule = ramp(frame, 4, 40);
  const push = 1 + 0.03 * Math.min(1, frame / total);
  return (
    <PalCtx.Provider value={pal}>
      <AbsoluteFill
        style={{
          background: pal.bg,
          fontFamily: theme.fonts.sans,
          color: pal.text,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 1180 + Math.sin(frame / 120) * 40,
            top: 520 + Math.cos(frame / 150) * 30,
            width: 1100,
            height: 1100,
            borderRadius: "50%",
            background: pal.tint,
          }}
        />
        <svg
          width={theme.width}
          height={theme.height}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            opacity: 0.06,
            pointerEvents: "none",
          }}
        >
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves={2}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
        <div
          style={{
            position: "absolute",
            top: layout.headerTop,
            left: layout.pad,
            right: layout.pad,
            height: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: header ? "space-between" : "flex-end",
          }}
        >
          {header ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 22 }}>
              <span
                style={{
                  ...theme.num,
                  fontSize: theme.type.small,
                  color: pal.accent,
                  marginTop: 16,
                }}
              >
                {String(index).padStart(2, "0")}
              </span>
              <Reveal text={scene.title} size={theme.type.title} delay={2} />
            </div>
          ) : null}
          <Logo size={60} />
        </div>
        {header ? (
          <div
            style={{
              position: "absolute",
              top: 146,
              left: layout.pad,
              width: layout.fullW,
              height: 2,
              background: pal.line,
              transformOrigin: "left",
              transform: `scaleX(${rule})`,
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            top: layout.contentTop,
            left: layout.pad,
            width: layout.fullW,
            height: layout.contentH,
            display: "flex",
            gap: layout.gap,
            transform: `scale(${push})`,
            transformOrigin: "50% 50%",
          }}
        >
          {wide ? null : <Points items={scene.bullets} />}
          <div
            style={{
              position: "relative",
              width: wide ? layout.fullW : layout.stageW,
              height: layout.contentH,
            }}
          >
            {children}
          </div>
        </div>
        <Caption text={scene.caption} total={total} />
        <Sfx name="whoosh" at={0} gain={0.5} />
      </AbsoluteFill>
    </PalCtx.Provider>
  );
};
