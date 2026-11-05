import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  staticFile,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { scenes } from "./scenes";
import type { Scene } from "./scenes";
import { theme } from "./theme";
import { Hook, Problem, Solution } from "./scenes/Part1";
import { Architecture, FridgeNode, Security } from "./scenes/Part2";
import { AiScene, Team, Web } from "./scenes/Part3";

const registry: Record<string, React.FC<{ scene: Scene }>> = {
  hook: Hook,
  problem: Problem,
  solution: Solution,
  architecture: Architecture,
  node: FridgeNode,
  security: Security,
  web: Web,
  ai: AiScene,
  team: Team,
};

const frames = (scene: Scene): number =>
  Math.round(scene.durationSec * theme.fps);

const totalFrames = scenes.reduce((sum, scene) => sum + frames(scene), 0);

const Main: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0E1719" }}>
    <TransitionSeries>
      {scenes.flatMap((scene, i) => {
        const Comp = registry[scene.id];
        const last = i === scenes.length - 1;
        const sequence = (
          <TransitionSeries.Sequence
            key={scene.id}
            durationInFrames={
              frames(scene) + (last ? 0 : theme.transitionFrames)
            }
          >
            <Comp scene={scene} />
            {theme.voice.enabled ? (
              <Sequence from={theme.voice.delayFrames} layout="none">
                <Audio
                  src={staticFile(`vo/${scene.id}.mp3`)}
                  volume={theme.voice.volume}
                />
              </Sequence>
            ) : null}
          </TransitionSeries.Sequence>
        );
        return last
          ? [sequence]
          : [
              sequence,
              <TransitionSeries.Transition
                key={`${scene.id}-transition`}
                presentation={slide({ direction: "from-right" })}
                timing={springTiming({
                  config: { damping: 200 },
                  durationInFrames: theme.transitionFrames,
                })}
              />,
            ];
      })}
    </TransitionSeries>
    {theme.audio.enabled ? (
      <Audio src={staticFile(theme.audio.src)} volume={theme.audio.volume} />
    ) : null}
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ColdChainPitch"
    component={Main}
    durationInFrames={totalFrames}
    fps={theme.fps}
    width={theme.width}
    height={theme.height}
  />
);
