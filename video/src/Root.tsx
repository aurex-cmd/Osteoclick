import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { FPS, totalFrames } from "./script";

export const Root: React.FC = () => (
  <Composition id="Osteoclick" component={Video} width={1080} height={1920} fps={FPS} durationInFrames={totalFrames()} />
);
