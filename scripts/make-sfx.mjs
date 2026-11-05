import { mkdirSync, writeFileSync } from "node:fs";

const RATE = 44100;
mkdirSync("public/sfx", { recursive: true });

const wav = (name, seconds, fn) => {
  const n = Math.floor(seconds * RATE);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, fn(i / RATE, seconds)));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  writeFileSync(`public/sfx/${name}.wav`, buf);
};

const TAU = Math.PI * 2;

let lp = 0;
wav("whoosh", 0.9, (t, d) => {
  const env = Math.sin(Math.PI * (t / d)) ** 2;
  lp += (0.02 + 0.25 * (t / d)) * (Math.random() * 2 - 1 - lp);
  return lp * env * 2.5;
});

wav("pop", 0.15, (t) => Math.sin(TAU * 380 * t) * Math.exp(-t * 40) * 0.6);

wav("tick", 0.08, (t) => Math.sin(TAU * 1800 * t) * Math.exp(-t * 90) * 0.4);

wav("alarm", 0.6, (t) => {
  const phase = (t % 0.3) / 0.15;
  return phase < 1
    ? Math.sin(TAU * 740 * t) * Math.sqrt(Math.sin(Math.PI * phase)) * 0.35
    : 0;
});

wav("chime", 1.4, (t) => {
  const tone =
    Math.sin(TAU * 660 * t) * 0.5 +
    Math.sin(TAU * 990 * t) * 0.25 +
    Math.sin(TAU * 1320 * t) * 0.12;
  return tone * Math.exp(-t * 3.2) * Math.min(1, t / 0.005) * 0.5;
});
