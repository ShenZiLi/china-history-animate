import "./style.css";
import {
  mountFilm,
  ready,
  renderAt as draw,
  options,
  wallGeometry,
  renderStudyAt,
} from "./film.js";
import {
  SCENES,
  DURATION,
  INTRO,
  OUTRO,
  beatAt,
  clamp,
  timecode,
  contactEvents,
  outroWalkTime,
} from "../beat/timeline.js";
import { poseAtWalkTime } from "../rig/walker.js";
import { REFINED } from "./choreography.js";
import {
  galleryPerformanceAt,
  galleryViewAt as viewAt,
  plateManifest,
} from "./gallery.js";
const poseAt = (t) => galleryPerformanceAt(t).pose;
import { artManifest } from "../kit/media.js";

const $ = (s) => document.querySelector(s);
const chapters = [
  { id: "intro", name: "序 · 路比名字更早", en: "Intro", start: 0, end: INTRO },
  ...SCENES,
  {
    id: "outro",
    name: "尾声 · 还没走完",
    en: "Next Step",
    start: OUTRO,
    end: DURATION,
  },
];
$("#chapter-list").innerHTML = chapters
  .map(
    (s, i) =>
      `<button data-chapter="${s.id}" data-time="${s.start}" class="chapter"><span class="chapter-number">${i === 0 ? "序" : i === 25 ? "尾" : String(i).padStart(2, "0")}</span><span class="chapter-name">${s.name}${REFINED.includes(s.id) ? `<small>精作${s.speculative ? " · 艺术想象" : ""}</small>` : s.speculative ? "<small>艺术想象</small>" : ""}</span><span class="chapter-time">${timecode(s.start)}</span></button>`,
  )
  .join("");
let time = 0,
  playing = false,
  last = 0,
  rate = 1;
let activeId = "";
function render(t) {
  time = clamp(t, 0, DURATION - 1 / 60);
  draw(time);
  $("#scrubber").value = time;
  $("#clock").textContent = `${timecode(time)} / ${timecode(DURATION)}`;
  const chapter =
    chapters.find((s) => time >= s.start && time < s.end) ?? chapters.at(-1);
  $("#current-title").textContent = chapter.name;
  $("#current-subtitle").textContent = chapter.en;
  if (activeId !== chapter.id) {
    activeId = chapter.id;
    document.querySelectorAll(".chapter").forEach((b) => {
      const active = b.dataset.chapter === activeId;
      b.classList.toggle("active", active);
      if (active) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  }
  const beat = beatAt(time);
  $("#beat-label").textContent = beat
    ? `第 ${beat.bar} 小节 · ${beat.beat} / 4`
    : "1 秒弱起 + 2 小节";
  if (options.rig) {
    const outroTime = outroWalkTime(time);
    if (time >= OUTRO && outroTime === null) {
      $("#diagnostics").textContent = "展墙留影定格 · 当前没有活动步态";
      return;
    }
    const pose = time >= OUTRO ? poseAtWalkTime(outroTime) : poseAt(time);
    $("#diagnostics").textContent =
      `t=${time.toFixed(3)}s · ${pose.legs.map((l) => `${l.side ? "右" : "左"}脚${l.foot.planted ? "支撑" : "摆动"} x=${l.foot.x.toFixed(1)}`).join(" · ")}`;
  }
}
function pause() {
  playing = false;
  $("#play").innerHTML = '播放 <span aria-hidden="true">▶</span>';
  $("#play").setAttribute("aria-label", "播放");
}
function play() {
  if (time >= DURATION - 1 / 60) render(0);
  playing = true;
  last = performance.now();
  $("#play").innerHTML = '暂停 <span aria-hidden="true">Ⅱ</span>';
  $("#play").setAttribute("aria-label", "暂停");
}
function toggle() {
  playing ? pause() : play();
}
function tick(now) {
  if (playing) {
    const next = time + ((now - last) / 1000) * rate;
    if (next >= DURATION) {
      render(DURATION - 1 / 60);
      pause();
    } else render(next);
  }
  last = now;
  requestAnimationFrame(tick);
}
$("#play").addEventListener("click", toggle);
$("#restart").addEventListener("click", () => {
  render(0);
  play();
});
$("#scrubber").addEventListener("input", (e) => {
  render(Number(e.target.value));
  last = performance.now();
});
$("#speed").addEventListener("change", (e) => {
  rate = Number(e.target.value);
});
$("#chapter-list").addEventListener("click", (e) => {
  const button = e.target.closest("[data-time]");
  if (button) {
    render(Number(button.dataset.time));
    last = performance.now();
  }
});
for (const [id, delta] of [
  ["previous-frame", -1 / 60],
  ["next-frame", 1 / 60],
])
  $(`#${id}`).addEventListener("click", () => {
    pause();
    render(time + delta);
  });
$("#fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $(".player").requestFullscreen();
  } catch {
    $("#current-subtitle").textContent = "浏览器暂不支持全屏";
  }
});
$("#rig-overlay").addEventListener("change", (e) => {
  options.rig = e.target.checked;
  render(time);
});
$("#hide-titles").addEventListener("change", (e) => {
  options.titles = !e.target.checked;
  render(time);
});
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input,select,button,textarea,a")) return;
  if (e.code === "Space") {
    e.preventDefault();
    toggle();
  }
  if (["ArrowRight", "ArrowLeft"].includes(e.code)) {
    e.preventDefault();
    render(time + (e.code === "ArrowRight" ? 5 : -5));
    last = performance.now();
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
if (new URLSearchParams(location.search).has("export"))
  document.body.classList.add("export");
await mountFilm("film");
await ready;
render(Number(new URLSearchParams(location.search).get("t") ?? 0));
window.film = {
  renderStudyAt,
  plateManifest,
  artManifest,
  ready: true,
  renderAt(t) {
    pause();
    render(t);
  },
  poseAt,
  viewAt,
  scenes: SCENES,
  duration: DURATION,
  contacts: contactEvents(),
  wallGeometry,
  get time() {
    return time;
  },
  get playing() {
    return playing;
  },
  options,
};
requestAnimationFrame(tick);
