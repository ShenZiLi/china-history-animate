# china-history-animate

《一步千年》：同一位普通行者，沿同一条路走过中国的过去、今天与想象中的未来。

当前为 **阶段 1 无声结构预演**，总长 191 秒。24 个时代均为标名占位画面，用于验收步态、连续道路、穿框和 5 × 5 结尾展墙；最终场景美术与声音尚未制作。

## 预览

要求 Node.js >=22.12.0 与 ffmpeg。首次安装 Puppeteer 会下载配套 Chrome，渲染时不依赖在线素材。

```sh
npm ci
npm run dev
```

打开终端给出的本地地址。播放 / 暂停、进度拖动、时代跳转、倍速、全屏和逐帧检查可用；空格控制播放，左右键前后跳转 5 秒。默认暂停，隐藏页面时暂停。展开“动作检查”可显示骨骼和触地点，或关闭时代标题。

## 验证与导出

```sh
npm test
npm run build
npm run verify
npm run capture
npm run render -- --fps 30 --out out/stage-1/stage-1-30fps.mp4
npm run render -- --fps 30 --from 8 --to 12 --out out/stage-1/compare-30fps.mp4
npm run render -- --fps 60 --from 8 --to 12 --out out/stage-1/compare-60fps.mp4
```

`capture` 输出关键帧、接触表、步态接触图和自动生成的时间表。`render` 通过 Puppeteer 逐帧求值，PNG 流直接送 ffmpeg，输出无声 H.264 MP4；加 `--frames out/frames` 可同时保存 PNG 序列。渲染进程自行启动和关闭独立本地服务。已有 Chrome 也可通过 `CHROME_PATH` 指定完整可执行路径。

画面按 `from + frame / fps` 取样，结束时间不包含在内。完整 30fps 共 5730 帧，60fps 共 11460 帧。30fps 当前仅为结构预演版本；正式帧率在动态对比与反馈后确认。

`verify` 检查乱序跳转后画面哈希、24 段寻址、展墙边界和浏览器异常。单元测试检查累计时间、左右脚触地、支撑脚锁定与骨骼连续性，不替代人工观看动作。

## 规范

- 每次改动完成后提交本地 git，按逻辑单元拆分 commit。
- 提交信息格式：`type: 中文描述`（type 取 feat / fix / docs / style / refactor / chore 等）。
- 提交信息中不得出现真实姓名。
- 未经明确指示不执行 `git push`。

## 目录

- `src/beat/`：统一时间表、节拍和触地事件。
- `src/rig/`：共享骨骼、足部约束、两段腿部求解与服饰绘制。
- `src/kit/`：固定种子纹理、路径和文字工具。
- `src/scenes/`：当前为阶段 1 通用占位景；后续拆分独立美术场景。
- `src/main/`：纯时间画面、连续卷轴、开场、展墙和预览操作。
- `tools/`：逐帧采集、接触表、验证和 MP4 导出。
- `tests/`：时间轴与运动不变量检查。
- `docs/`：原始提示词、制作计划、参考授权与阶段验收记录。
- `out/stage-1/`：本机生成的演示视频、图片与验证结果，不提交 Git，可用命令重建。

创作要求见 [提示词](docs/提示词.md)，分阶段安排见 [制作计划](docs/制作计划.md)，依赖及素材说明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
