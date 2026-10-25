// 全片时间轴：唯一事实来源。
// 120 BPM，4/4，1 小节 = 2 秒；先分配小节，再累加得出时长。
// 所有模块（画面、音乐、字幕、导出帧数、接触表）都从这里取时间。

export const BPM = 120;
export const BEAT = 60 / BPM; // 0.5s
export const BAR = BEAT * 4; // 2s

// 步幅：一拍一步（0.5s），一步 84px → 基础速度 168px/s。
export const STRIDE = 84;

// 24 个版块 + 片头片尾。dur 单位秒，必须与小节数一致。
export const SCENES = [
  { id: 's01', cn: '旧石器时代', en: 'Paleolithic', years: '史前', bars: 3, dur: 6, slug: 'paleolithic', spec: false },
  { id: 's02', cn: '新石器时代', en: 'Neolithic', years: '约公元前5000—前3000年', bars: 3, dur: 6, slug: 'neolithic', spec: false },
  { id: 's03', cn: '商与西周', en: 'Shang & Western Zhou', years: '约公元前1600—前771年', bars: 3, dur: 6, slug: 'shang-zhou', spec: false },
  { id: 's04', cn: '春秋战国', en: 'Spring & Autumn / Warring States', years: '公元前770—前221年', bars: 3, dur: 6, slug: 'warring-states', spec: false },
  { id: 's05', cn: '秦', en: 'Qin', years: '公元前221—前206年', bars: 3, dur: 6, slug: 'qin', spec: false },
  { id: 's06', cn: '汉', en: 'Han', years: '公元前202—公元220年', bars: 3, dur: 6, slug: 'han', spec: false },
  { id: 's07', cn: '魏晋南北朝', en: 'Wei, Jin & Northern–Southern', years: '220—589年', bars: 3, dur: 6, slug: 'wei-jin', spec: false },
  { id: 's08', cn: '隋唐', en: 'Sui & Tang', years: '581—907年', bars: 3, dur: 6, slug: 'tang', spec: false },
  { id: 's09', cn: '北宋', en: 'Northern Song', years: '960—1127年', bars: 3, dur: 6, slug: 'northern-song', spec: false },
  { id: 's10', cn: '南宋', en: 'Southern Song', years: '1127—1279年', bars: 3, dur: 6, slug: 'southern-song', spec: false },
  { id: 's11', cn: '元', en: 'Yuan', years: '1271—1368年', bars: 3, dur: 6, slug: 'yuan', spec: false },
  { id: 's12', cn: '明', en: 'Ming', years: '1368—1644年', bars: 3, dur: 6, slug: 'ming', spec: false },
  { id: 's13', cn: '清代前中期', en: 'Early–Mid Qing', years: '1644—1840年', bars: 3, dur: 6, slug: 'qing', spec: false },
  { id: 's14', cn: '晚清', en: 'Late Qing', years: '1840—1911年', bars: 3, dur: 6, slug: 'late-qing', spec: false },
  { id: 's15', cn: '民国时期', en: 'Republican Era', years: '1912—1949年', bars: 3, dur: 6, slug: 'republic', spec: false },
  { id: 's16', cn: '新中国早期', en: 'Early PRC', years: '1949—1978年', bars: 3, dur: 6, slug: 'early-prc', spec: false },
  { id: 's17', cn: '改革开放与世纪之交', en: 'Reform & Turn of the Century', years: '1978—2010年', bars: 3, dur: 6, slug: 'reform', spec: false },
  { id: 's18', cn: '今天', en: 'Present Day', years: '2026年', bars: 3, dur: 6, slug: 'today', spec: false },
  { id: 's19', cn: 'AI 时代', en: 'Age of AI', years: '约2035年', bars: 4, dur: 8, slug: 'ai', spec: true },
  { id: 's20', cn: '智械时代', en: 'Age of Robotics', years: '约2060年', bars: 5, dur: 10, slug: 'robotics', spec: true },
  { id: 's21', cn: '共生时代', en: 'Age of Symbiosis', years: '约2100年', bars: 5, dur: 10, slug: 'symbiosis', spec: true },
  { id: 's22', cn: '太空时代', en: 'Spacefaring Age', years: '约2200年', bars: 6, dur: 12, slug: 'spacefaring', spec: true },
  { id: 's23', cn: '星际时代', en: 'Interstellar Age', years: '约2600年', bars: 6, dur: 12, slug: 'interstellar', spec: true },
  { id: 's24', cn: '山河新生时代', en: 'Age of Renewal', years: '约4000年及以后', bars: 5, dur: 10, slug: 'renewal', spec: true },
];

export const INTRO_DUR = 5; // 1 秒弱起 + 2 小节
export const OUTRO_DUR = 16; // 8 小节

// 累加起点
let acc = INTRO_DUR;
for (const s of SCENES) {
  s.start = acc;
  acc += s.dur;
  s.end = acc;
}
export const BODY_START = INTRO_DUR;
export const OUTRO_START = acc;
export const OUTRO_END = acc + OUTRO_DUR;
export const TOTAL = OUTRO_END; // 191s

// 轻微的减速点：只影响"走路+地面滚动"的同一条积分，绝不产生滑步。
// [起点, 终点, 速度系数]
const SLOW = [
  [9.6, 10.2, 0.55],   // 北宋：跨小石头前放慢
  [101.4, 101.9, 0.6], // 今天：抬头看导航后放慢
  [119.7, 120.4, 0.5], // AI：偏半步看花
  [137.9, 138.6, 0.55], // 共生：伸手接雨
  [149.2, 149.8, 0.5],  // 太空：跨排水沟
  [161.6, 162.3, 0.5],  // 星际：接叶子
  [171.8, 172.4, 0.5],  // 山河新生：留脚印
];

function smoothstep(x) {
  return x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
}

export function speedAt(t) {
  let m = 1;
  for (const [a, b, v] of SLOW) {
    const ramp = 0.18;
    if (t > a - ramp && t < b + ramp) {
      let w;
      if (t < a) w = smoothstep((t - (a - ramp)) / ramp);
      else if (t > b) w = 1 - smoothstep((t - b) / ramp);
      else w = 1;
      m = Math.min(m, 1 + (v - 1) * w);
    }
  }
  return m;
}

// 预积分：1ms 精度，t=0..TOTAL，phase 单位为"步"（1 步 = 1 拍）。
const DT = 0.001;
const N = Math.ceil(TOTAL / DT) + 2;
const PHASE = new Float64Array(N);
{
  let p = 0;
  for (let i = 1; i < N; i++) {
    const t = (i - 1) * DT;
    p += (2 * speedAt(t)) * DT; // 基础 2 步/秒
    PHASE[i] = p;
  }
}

export function phaseAt(t) {
  if (t <= 0) return 0;
  if (t >= TOTAL) return PHASE[N - 1];
  const f = t / DT;
  const i = Math.floor(f);
  const a = PHASE[i];
  return a + (PHASE[i + 1] - a) * (f - i);
}

export function scrollAt(t) {
  return phaseAt(t) * STRIDE;
}

// 修正：预积分后的总距离应等于整片步数 × 步幅。
export function sceneAt(t) {
  for (let i = 0; i < SCENES.length; i++) {
    if (t < SCENES[i].end) return { scene: SCENES[i], index: i, local: t - SCENES[i].start };
  }
  return { scene: SCENES[SCENES.length - 1], index: SCENES.length - 1, local: SCENES[SCENES.length - 1].dur };
}

export function beatOf(t) {
  return t / BEAT;
}

// 每个版块的出口时刻（= 下一段起点）。最后一个版块的出口是 Outro 起点。
export function exitTimeOf(i) {
  return i < SCENES.length - 1 ? SCENES[i].end : OUTRO_START;
}

// 画框在过框瞬间应落在主角所在屏幕横坐标。
export const WALKER_X = 620;

export function portalWorldX(i) {
  return scrollAt(exitTimeOf(i)) + WALKER_X + 46;
}

// 字幕表
export const SUBTITLES = [
  { t: 1.1, d: 2.0, text: '在这片土地上，我们走了很久。', pos: 'center' },
  { t: 3.0, d: 1.9, text: '久到脚下的路，换过许多名字。', pos: 'center' },
];

export const OUTRO_SUBS = [
  { t: OUTRO_START + 0.4, d: 3.4, text: '走过二十四幅画，还没走完这片土地。' },
  { t: OUTRO_START + 10.0, d: 3.6, text: '下一步，还在脚下。' },
];
