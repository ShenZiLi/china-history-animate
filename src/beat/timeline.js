export const BPM = 120;
export const BEAT = 60 / BPM;
export const BAR = 4 * BEAT;
export const INTRO = 5;
export const OUTRO_DURATION = 16;
export const SPEED = 200;
export const GROUND = 780;
export const WIDTH = 1920 / 1.08;
export const HEIGHT = 1000;

const eras = [
  [
    "paleolithic",
    "旧石器时代",
    "Paleolithic",
    "史前",
    3,
    "#6a533a",
    "#f0dbb6",
    "岩洞",
  ],
  [
    "neolithic",
    "新石器时代",
    "Neolithic",
    "约前5000—前3000年",
    3,
    "#e4d0b1",
    "#955a45",
    "陶纹",
  ],
  [
    "shang-zhou",
    "商与西周",
    "Shang & Western Zhou",
    "约前1600—前771年",
    3,
    "#bec8b9",
    "#435f58",
    "青铜纹带",
  ],
  [
    "warring-states",
    "春秋战国",
    "Spring & Autumn / Warring States",
    "前770—前221年",
    3,
    "#e2dcc4",
    "#62644c",
    "竹简",
  ],
  ["qin", "秦", "Qin", "前221—前206年", 3, "#ccc5b7", "#60534c", "城门"],
  ["han", "汉", "Han", "前202—220年", 3, "#414641", "#e5dfcc", "石刻"],
  [
    "wei-jin",
    "魏晋南北朝",
    "Wei, Jin & Northern–Southern Dynasties",
    "220—589年",
    3,
    "#e4e5d7",
    "#626f5d",
    "竹林",
  ],
  ["tang", "隋唐", "Sui & Tang", "581—907年", 3, "#dfd2b3", "#78634b", "坊门"],
  [
    "northern-song",
    "北宋",
    "Northern Song",
    "960—1127年",
    3,
    "#e8e3d4",
    "#475340",
    "山径",
  ],
  [
    "southern-song",
    "南宋",
    "Southern Song",
    "1127—1279年",
    3,
    "#dce1d9",
    "#64756e",
    "桥洞",
  ],
  ["yuan", "元", "Yuan", "1271—1368年", 3, "#e8e1d0", "#6e7166", "卷轴"],
  ["ming", "明", "Ming", "1368—1644年", 3, "#e8dbc3", "#6a6655", "月洞门"],
  [
    "qing",
    "清代前中期",
    "Early–Mid Qing",
    "1644—1840年",
    3,
    "#e5d2b8",
    "#80654d",
    "漏窗",
  ],
  [
    "late-qing",
    "晚清",
    "Late Qing",
    "1840—1911年",
    3,
    "#d5d0c5",
    "#656159",
    "相纸",
  ],
  [
    "republic",
    "民国时期",
    "Republican Era",
    "1912—1949年",
    3,
    "#d2d2c8",
    "#575d59",
    "默片画框",
  ],
  [
    "early-prc",
    "新中国早期",
    "Early PRC",
    "1949—1978年",
    3,
    "#d8d5be",
    "#667060",
    "窗格",
  ],
  [
    "reform",
    "改革开放与世纪之交",
    "Reform & Turn of the Century",
    "1978—2010年",
    3,
    "#d4ded4",
    "#5d776b",
    "橱窗",
  ],
  ["present", "今天", "Present Day", "2026年", 3, "#e5e8dd", "#5b766d", "门框"],
  ["ai", "AI 时代", "Age of AI", "约2035年", 4, "#ece5d2", "#8b7853", "辅助线"],
  [
    "robotics",
    "智械时代",
    "Age of Robotics",
    "约2060年",
    5,
    "#d5d9d6",
    "#626e70",
    "机械拱架",
  ],
  [
    "symbiosis",
    "共生时代",
    "Age of Symbiosis",
    "约2100年",
    5,
    "#d4e1c9",
    "#58765e",
    "叶片廊顶",
  ],
  [
    "space",
    "太空时代",
    "Spacefaring Age",
    "约2200年",
    6,
    "#293c49",
    "#b6cbd2",
    "观测廊",
  ],
  [
    "interstellar",
    "星际时代",
    "Interstellar Age",
    "约2600年",
    6,
    "#303946",
    "#d2c5a8",
    "山院门洞",
  ],
  [
    "renewal",
    "山河新生时代",
    "Age of Renewal",
    "约4000年及以后",
    5,
    "#edf0df",
    "#496344",
    "空白画框",
  ],
];
let cursor = INTRO;
export const SCENES = eras.map(
  ([id, name, en, years, bars, paper, ink, portal], index) => {
    const start = cursor;
    cursor += bars * BAR;
    return Object.freeze({
      id,
      name,
      en,
      years,
      bars,
      paper,
      ink,
      portal,
      index,
      start,
      end: cursor,
      duration: bars * BAR,
      worldStart: (start - INTRO) * SPEED,
      worldEnd: (cursor - INTRO) * SPEED,
      speculative: index >= 18,
    });
  },
);
export const OUTRO = cursor;
export const DURATION = OUTRO + OUTRO_DURATION;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a, b, x) => a + (b - a) * x;
export const smooth = (x) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
export function sceneAt(t) {
  return (
    SCENES.find((s) => t >= s.start && t < s.end) ??
    (t < INTRO ? SCENES[0] : SCENES.at(-1))
  );
}
export function frameCount(fps, from = 0, to = DURATION) {
  return Math.ceil((to - from) * fps - 1e-8);
}
export function frameTime(frame, fps, from = 0) {
  return from + frame / fps;
}
export function timecode(t) {
  const n = Math.floor(Math.max(0, t));
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}
export function beatAt(t) {
  return t < INTRO
    ? null
    : {
        bar: Math.floor((t - INTRO) / BAR) + 1,
        beat: (Math.floor((t - INTRO) / BEAT) % 4) + 1,
      };
}
export function outroWalkTime(t) {
  const elapsed = t - OUTRO - 10;
  if (elapsed < 0) return null;
  return elapsed < 4 ? elapsed : 4 + mix(0, 0.27, smooth((elapsed - 4) / 2));
}
export function contactEvents(from = 4.5, to = DURATION) {
  const events = [];
  for (let t = 4.5; t < OUTRO; t += BEAT)
    if (t >= from && t < to)
      events.push({
        t,
        side: Math.round((t - INTRO) / BEAT) % 2 ? "right" : "left",
        scene: t < INTRO ? "intro" : sceneAt(t).id,
      });
  // The walking figure is deliberately frozen while the archive wall is revealed.
  for (let t = OUTRO + 10; t <= OUTRO + 14; t += BEAT)
    if (t >= from && t < to)
      events.push({
        t,
        side: Math.round((t - OUTRO - 10) / BEAT) % 2 ? "right" : "left",
        scene: "next-step",
      });
  return events;
}
