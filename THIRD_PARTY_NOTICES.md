# Third-party notices

The animation, character rig, timing system, scene placeholders, and project-specific tools are independently authored for this project. No source code or media was copied from the reference film repository.

## Runtime

- **p5.js 2.3.4** — LGPL-2.1, copyright the p5.js contributors. Full license: `licenses/p5-LGPL-2.1.txt`. Upstream: <https://github.com/processing/p5.js>. Matching package source: <https://registry.npmjs.org/p5/-/p5-2.3.4.tgz>. The project imports the unmodified package. To replace or modify it, change the dependency in `package.json`, install it, and rebuild with `npm run build`; application source and build instructions are included in this repository.
- Browser system fonts are used for Chinese and Latin text. Font files are not bundled or redistributed; appearance can differ between operating systems.

## Development and export tools

- **Puppeteer 25.16.0** — Apache-2.0. <https://github.com/puppeteer/puppeteer>. Used for deterministic frame capture, not shipped in the browser preview bundle.
- **Vite 7.3.1** — MIT. <https://github.com/vitejs/vite>. Development server and bundler; package license is available in the installed distribution.
- **Prettier 3.9.10** — MIT. <https://github.com/prettier/prettier>. Source formatting tool, not shipped in the preview bundle.
- **Chrome for Testing**, downloaded by Puppeteer — used as an external rendering tool; not committed or included in the built site. Its actual version is recorded by capture and verification outputs.
- **ffmpeg** — externally installed encoder, not redistributed. The development machine reports 8.1.2 with GPL components enabled. <https://ffmpeg.org/legal.html>.

Exact direct and transitive dependency versions are recorded in `package-lock.json`; each installed package retains its own license and notices. No stock footage, recordings, music, sound effects, logos, or voice samples are imported. The current preview is silent.

At the user's explicit request, stage 2 uses original background, transparent foreground and gateway layers generated with the built-in imagegen tool. These local assets are under `public/assets/scenes/`; per-scene prompts, production boundaries and asset records are in `briefs/`. Generated environments are combined with deterministic code animation and the shared procedural character rig. No historical painting scan, museum photograph or reference film frame was imported.

The four character direction boards under `design/character-concepts/` were also generated using built-in imagegen at the user's request. They remain design references; the character is drawn from code and these boards are not embedded as animation frames.

## Reference reading

The five requested documents from <https://github.com/Tunai-0511/meme67-art-history> were read for process research only. Its source code is MIT, while its film, cover, rendered frames and audio are all rights reserved. None of those materials are included. See `docs/参考与授权.md` for the reading record.
