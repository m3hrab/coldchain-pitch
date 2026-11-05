// src/scenes.ts
export type Scene = {
  id: string;
  durationSec: number;
  title: string;
  bullets: string[];
  caption: string;
};

export const scenes: Scene[] = [
  {
    id: "hook",
    durationSec: 12,
    title: "Every vaccine has a limit.",
    bullets: ["Vaccine & medicine cold-chain monitoring"],
    caption:
      "One silent breach above 8°C can spoil a whole fridge of vaccines.",
  },
  {
    id: "problem",
    durationSec: 18,
    title: "The Problem",
    bullets: [
      "Vaccines must stay between 2 and 8°C",
      "Outages and manual logs hide breaches",
      "Spoiled doses can reach patients",
      "Paper records are easy to edit or lose",
    ],
    caption:
      "Cold-chain failures are usually found too late, if they are found at all.",
  },
  {
    id: "solution",
    durationSec: 15,
    title: "Our Solution",
    bullets: [
      "Sense: ESP32 nodes watch every fridge",
      "Protect: a heat budget tracks real exposure",
      "Prove: signed, hash-chained records",
      "Predict: AI warns before a breach",
    ],
    caption:
      "ColdChain senses, protects, proves and predicts, from fridge to patient.",
  },
  {
    id: "architecture",
    durationSec: 25,
    title: "Architecture",
    bullets: [
      "ESP32 nodes publish over MQTT",
      "Every message is HMAC-signed",
      "Backend stores, scores and alerts",
      "Web app, AI and QR share one source",
    ],
    caption:
      "ESP32 nodes stream signed MQTT messages to a backend that feeds every user.",
  },
  {
    id: "node",
    durationSec: 25,
    title: "Smart Fridge Node",
    bullets: [
      "ESP32 senses each fridge's temperature",
      "Compressor state logged with every reading",
      "Heat budget drains only above 8°C",
      "Short spikes pass, long ones raise alerts",
    ],
    caption:
      "The heat-exposure budget turns temperature into a clear, live safety margin.",
  },
  {
    id: "security",
    durationSec: 20,
    title: "Offline Mode & Security",
    bullets: [
      "Offline buffering keeps every reading",
      "Auto-sync when the link returns",
      "HMAC-secured messages stop spoofing",
      "Hash-chained logs expose tampering",
    ],
    caption:
      "Offline buffering and hash-chained logs keep data complete and tamper-evident.",
  },
  {
    id: "web",
    durationSec: 25,
    title: "Web App & QR Check",
    bullets: [
      "Role-based dashboard for every team",
      "Live fridge status and heat budget",
      "Public QR page shows batch safety",
      "Audit trail available on demand",
    ],
    caption:
      "Role-based dashboards for staff, and a public QR check for anyone.",
  },
  {
    id: "ai",
    durationSec: 20,
    title: "AI Prediction & Relocation",
    bullets: [
      "Model learns each fridge's pattern",
      "Predicts a breach before it happens",
      "Suggests a safer fridge for the batch",
      "Relocation saves doses, not just alerts",
    ],
    caption:
      "AI predicts a breach early and recommends where to relocate the batch.",
  },
  {
    id: "team",
    durationSec: 15,
    title: "Team AlphaMatrix",
    bullets: ["Offline-first", "Tamper-evident", "Predictive"],
    caption:
      "ColdChain by AlphaMatrix. Every dose, protected from fridge to patient.",
  },
];
