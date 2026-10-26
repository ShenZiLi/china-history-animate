import { SCENES, GROUND, INTRO, clamp, mix, smooth } from "../beat/timeline.js";
import { poseAt } from "../rig/walker.js";

export const SONG = SCENES.find((s) => s.id === "northern-song");
export const CAVE = SCENES[0];
export const RENEWAL = SCENES.at(-1);
export const STONE_X = poseAt(SONG.start + 3).legs[0].foot.x;
export const FOOTPRINT_TIME = RENEWAL.start + 7;
export const FOOTPRINT_X = poseAt(FOOTPRINT_TIME).legs[0].foot.x;
export const REFINED = ["paleolithic", "northern-song", "renewal"];
export function terrainAt(x) {
  return GROUND - 18 * (1 - smooth((Math.abs(x - STONE_X) - 28) / 18));
}
export function caveHeadTilt(t) {
  const local = t - CAVE.start;
  return (
    0.23 * smooth((local - 2.25) / 0.4) * (1 - smooth((local - 3.25) / 0.4))
  );
}
export function performanceAt(t) {
  const pose = poseAt(t, terrainAt);
  return { ...pose, headTilt: caveHeadTilt(t) };
}
export function viewAt(t) {
  let scale = 1;
  if (t >= SONG.start - 1.4 && t < SONG.start)
    scale = mix(1, 0.22, smooth((t - SONG.start + 1.4) / 1.4));
  else if (t >= SONG.start && t < SONG.end)
    scale = mix(0.22, 0.44, smooth((t - SONG.start) / SONG.duration));
  else if (t >= SONG.end && t < SONG.end + 1.4)
    scale = mix(0.44, 1, smooth((t - SONG.end) / 1.4));
  if (t >= RENEWAL.start - 1.2 && t < RENEWAL.start)
    scale = mix(1, 0.72, smooth((t - RENEWAL.start + 1.2) / 1.2));
  else if (t >= RENEWAL.start && t < RENEWAL.end)
    scale = mix(0.72, 1, smooth((t - RENEWAL.end + 2) / 2));
  const rootX = (t - INTRO) * 200;
  return {
    scale,
    rootX,
    camera: rootX - 740,
    project: (x) => 740 + (x - rootX) * scale,
  };
}
export function isolationAt(t, scene) {
  if (!REFINED.includes(scene.id)) return 0;
  const local = t - scene.start;
  return (
    smooth((local - 0.16) / 0.34) *
    (1 - smooth((local - scene.duration + 0.5) / 0.34))
  );
}
export function memoryState(t) {
  const local = t - RENEWAL.start;
  return ["ochre", "pottery", "ink", "brick", "stars"].map((kind, i) => ({
    kind,
    x: RENEWAL.worldStart + 780 + i * 90,
    alpha:
      smooth((local - 4 - i * 0.38) / 0.3) * (1 - smooth((local - 7.2) / 0.7)),
  }));
}
