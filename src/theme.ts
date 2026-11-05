import type { CSSProperties } from "react";
import { Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily: sans } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export type Palette = {
  bg: string;
  surface: string;
  line: string;
  tint: string;
  text: string;
  muted: string;
  accent: string;
  ok: string;
  warn: string;
  bad: string;
  violet: string;
};

const paper: Palette = {
  bg: "#F2EEE4",
  surface: "#FBF9F4",
  line: "#D2CAB8",
  tint: "#E8E2D3",
  text: "#1B2A2C",
  muted: "#5B6867",
  accent: "#0F6E6E",
  ok: "#3C8355",
  warn: "#B27A12",
  bad: "#B3423A",
  violet: "#6D5A93",
};

const ink: Palette = {
  bg: "#0E1719",
  surface: "#162427",
  line: "#2A3F43",
  tint: "#122023",
  text: "#F0EBDF",
  muted: "#94A3A1",
  accent: "#6CCFC4",
  ok: "#73C08F",
  warn: "#E3AC45",
  bad: "#EA6A5E",
  violet: "#B3A1DB",
};

export const palettes = { paper, ink };

export const theme = {
  fps: 30,
  width: 1920,
  height: 1080,
  transitionFrames: 24,
  fonts: { sans },
  display: {
    fontFamily: sans,
    fontWeight: 600,
    letterSpacing: "-0.035em",
  } satisfies CSSProperties,
  num: {
    fontFamily: sans,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.01em",
  } satisfies CSSProperties,
  label: {
    fontFamily: sans,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  } satisfies CSSProperties,
  type: { title: 60, card: 34, body: 30, caption: 32, small: 24 },
  ease: Easing.bezier(0.16, 1, 0.3, 1),
  easeInOut: Easing.bezier(0.65, 0, 0.35, 1),
  dark: ["hook", "problem", "security"],
  memberTones: ["#0F6E6E", "#3C8355", "#B27A12", "#6D5A93", "#B3423A"],
  layout: {
    pad: 96,
    headerTop: 44,
    contentTop: 170,
    contentH: 770,
    captionH: 120,
    sideW: 540,
    gap: 60,
    fullW: 1728,
    stageW: 1128,
  },
  audio: { enabled: false, src: "audio/music.mp3", volume: 0.12 },
  voice: { enabled: true, delayFrames: 15, volume: 1 },
  sfx: {
    enabled: true,
    volume: 0.6,
    files: {
      whoosh: "sfx/whoosh.mp3",
      pop: "sfx/pop.wav",
      tick: "sfx/tick.wav",
      alarm: "sfx/alarm.wav",
      chime: "sfx/chime.wav",
    },
  },
};
