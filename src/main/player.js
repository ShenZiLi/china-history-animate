// 预览与导出共用的播放内核。
// 时间轴是唯一时钟：音频只作为同一条时间轴的从属输出，拖动后重新对齐。

import { renderFrame, setRegistry, W, H } from './film.js';
import { TOTAL, SCENES, sceneAt } from './timeline.js';
import { loadRegistry } from '../scenes/index.js';
import { renderScore, SAMPLE_RATE } from '../../audio/score.js';

const params = new URLSearchParams(location.search);
const EXPORT = params.get('export') === '1';
const START_T = parseFloat(params.get('t') || '0') || 0;
const FPS = parseInt(params.get('fps') || '30', 10);

const state = {
  ready: false,
  playing: false,
  t: START_T,
  fps: FPS,
  ctx: null,
  ac: null,
  buffer: null,
  source: null,
  startedAt: 0,
  offset: 0,
  lastDrawn: -1,
  registry: null,
};

function fmt(t) {
  const s = Math.max(0, t);
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  const cs = Math.floor((s % 1) * 100);
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function nowPlaying(t) {
  if (t < SCENES[0].start) return { cn: '片头', en: 'Intro', years: '路比名字更早' };
  if (t >= SCENES[SCENES.length - 1].end) return { cn: '片尾', en: 'Outro', years: '还没走完' };
  const { scene } = sceneAt(t);
  return scene;
}

function ensureSourceNode() {
  if (!state.ac || !state.buffer) return;
  stopSource();
  const src = state.ac.createBufferSource();
  src.buffer = state.buffer;
  src.connect(state.ac.destination);
  src.start(0, Math.min(state.offset, state.buffer.duration - 0.01));
  state.source = src;
  state.startedAt = state.ac.currentTime - state.offset;
}

function stopSource() {
  if (state.source) {
    try { state.source.stop(); } catch (e) {}
    try { state.source.disconnect(); } catch (e) {}
    state.source = null;
  }
}

function audioTime() {
  if (!state.ac || !state.buffer || !state.source) return null;
  return state.ac.currentTime - state.startedAt;
}

function setPlaying(p) {
  if (!state.ready) return;
  if (p) {
    state.offset = state.t >= TOTAL - 0.05 ? 0 : state.t;
    if (state.t >= TOTAL - 0.05) { state.t = 0; }
    if (state.ac) {
      if (state.ac.state === 'suspended') state.ac.resume();
      ensureSourceNode();
    }
    state.startedAt = (state.ac ? state.ac.currentTime : performance.now() / 1000) - state.offset;
    state.playing = true;
    document.body.classList.add('playing');
  } else {
    state.t = state.ac && state.source ? audioTime() : state.t;
    state.playing = false;
    stopSource();
    document.body.classList.remove('playing');
  }
  updatePlayButton();
}

function seek(t) {
  state.t = Math.min(TOTAL, Math.max(0, t));
  state.offset = state.t;
  if (state.playing) {
    if (state.ac) ensureSourceNode();
    state.startedAt = (state.ac ? state.ac.currentTime : performance.now() / 1000) - state.t;
  }
  draw(true);
  updateUI();
}

function updatePlayButton() {
  const b = document.getElementById('play');
  if (!b) return;
  b.textContent = state.playing ? '❚❚' : '▶';
  b.setAttribute('aria-label', state.playing ? '暂停' : '播放');
}

function updateUI() {
  const t = state.t;
  const bar = document.getElementById('scrub');
  if (bar && document.activeElement !== bar) bar.value = String((t / TOTAL) * 1000);
  const time = document.getElementById('time');
  if (time) time.textContent = `${fmt(t)} / ${fmt(TOTAL)}`;
  const ch = document.getElementById('chapter');
  if (ch) {
    const s = nowPlaying(t);
    ch.innerHTML = `<b>${s.cn}</b><span>${s.en}</span><span class="yr">${s.years}</span>`;
  }
}

function draw(force = false) {
  if (!state.ctx) return;
  if (!force && Math.abs(state.t - state.lastDrawn) < 1e-4) return;
  state.lastDrawn = state.t;
  renderFrame(state.ctx, state.t);
}

function tick() {
  if (state.playing) {
    const at = audioTime();
    state.t = at != null ? at : (performance.now() / 1000 - state.startedAt);
    if (state.t >= TOTAL) {
      state.t = TOTAL;
      state.playing = false;
      stopSource();
      updatePlayButton();
    }
    draw();
    updateUI();
  }
  requestAnimationFrame(tick);
}

async function boot() {
  if (EXPORT) {
    document.body.classList.add('export');
  }
  const p5inst = new window.p5((p) => {
    p.setup = async () => {
      const c = p.createCanvas(W, H);
      c.parent('stage');
      p.pixelDensity(1);
      p.noLoop();
      state.ctx = p.drawingContext;
      state.p5 = p;
      const loading = document.getElementById('loading');
      if (loading) loading.textContent = '加载场景…';
      state.registry = await loadRegistry();
      setRegistry(state.registry);
      state.ready = true;
      if (loading) loading.style.display = 'none';

      draw(true);
      updateUI();
      updatePlayButton();
      tick();

      if (!EXPORT) {
        // 合成配乐（纯 JS，确定性；约数秒，先让加载提示刷出来）
        try {
          const tip = document.getElementById('loading');
          if (tip) { tip.textContent = '合成配乐…'; tip.style.display = 'flex'; }
          await new Promise((r) => setTimeout(r, 40));
          const { left, right, sampleRate } = renderScore({ sampleRate: SAMPLE_RATE });
          const ac = new (window.AudioContext || window.webkitAudioContext)();
          const buf = ac.createBuffer(2, left.length, sampleRate);
          buf.copyToChannel(left, 0);
          buf.copyToChannel(right, 1);
          state.ac = ac; state.buffer = buf;
          if (tip) tip.style.display = 'none';
        } catch (e) {
          console.warn('配乐合成失败，静音播放', e);
        }
      }

      // 导出接口
      window.__READY = true;
      window.__seek = (t) => { state.t = t; state.lastDrawn = -1; draw(true); return true; };
      window.__frame = (i, fps = FPS) => {
        state.t = Math.min(TOTAL - 1 / fps, i / fps);
        state.lastDrawn = -1;
        draw(true);
        return state.ctx.canvas.toDataURL('image/jpeg', 0.9);
      };
      window.__info = () => ({ total: TOTAL, fps: FPS, w: W, h: H, scenes: SCENES });
      window.__audio = () => (state.buffer ? { duration: state.buffer.duration, sampleRate: state.buffer.sampleRate } : null);
      window.__ready = true;
    };
  }, document.getElementById('stage'));
  window.__p5 = p5inst;
}

function bindUI() {
  const play = document.getElementById('play');
  const bar = document.getElementById('scrub');
  if (play) play.addEventListener('click', () => setPlaying(!state.playing));
  if (bar) {
    bar.addEventListener('input', () => {
      const v = parseFloat(bar.value) / 1000;
      seek(v * TOTAL);
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); setPlaying(!state.playing); }
    else if (e.code === 'ArrowRight') seek(state.t + (e.shiftKey ? 5 : 1));
    else if (e.code === 'ArrowLeft') seek(state.t - (e.shiftKey ? 5 : 1));
    else if (e.key === '0') seek(0);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindUI();
  boot().catch((e) => {
    const l = document.getElementById('loading');
    if (l) l.textContent = '启动失败：' + e.message;
    console.error(e);
  });
});
