# 01｜旧石器时代 · Paleolithic

## 阶段 2 美术与叙事

- **范围：**史前北方石灰岩洞穴的艺术想象，不指认具体遗址、服饰、岩画或用火方式的复原。
- **依据：**[UNESCO：周口店北京人遗址](https://whc.unesco.org/en/list/449/)。根任务已核对出处；仅将石灰岩洞穴与用火背景作为环境依据。图层均为本项目原创生成，未使用遗址照片、真实岩画摹本或古画扫描。
- **主色与画材：**炭黑、焦赭、棕土、暖琥珀；洞口留少量冷蓝灰。岩面矿物、烟熏凹陷和碎砾保持可辨认的粗粝质感。
- **景别：**宽画幅侧面行走舞台，左侧厚重岩壁承接投影，右侧洞口打开远处石灰岩山谷。构图原创，不将地貌当作遗址地形测绘。
- **远处兽群：**洞外右侧小坡面放置三只微小野鹿式剪影，约 14–20 逻辑单位高，冷灰低对比。所有蹄端逐一计算至同一条坡线，用轻微雾色地形承托并衔接右侧岩坡；没有骑乘者、鞍具、人形或工具。不将泛化野鹿形象解释为遗址物种鉴定。
- **人物：**用户已选定的 C 水墨剪影与共用骨架；皮毛式轮廓、简单束带仅是艺术暗示。本场景不修改骨骼、步态、衣着模块或共享相位。
- **道路：**逻辑画布 1777.777 × 1000；接触高度 GROUND=780。底图的水平泥土台面左右贯通，前景下移到 y=140，主体脚部没有石块遮挡。
- **标题：**左上暗处为浅色标题保留安静区域，不把说明文字生成为图像像素。
- **声音提示：**后续配乐阶段使用风、石击、木击、低频脉冲与泥土触地的程序合成；本次只完成画面与触地数据对应。

## 时间、动作与转场

本段 3 小节，120 BPM，6 秒，时间 5.00–11.00 秒。

1. **5–7 秒：**同一行者进入暖色洞穴舞台，火堆位于固定世界位置，随跟拍镜头离开画面。只有共享骨架绘制人物，底图没有人形或人形壁画。
2. **7–9 秒：**火焰与反射光按多个确定性相位起伏，统一人物的影子在岩壁放大约 1.78 倍；头部沿用 `caveHeadTilt`，只将投影的低头动作延迟 0.25 秒，其他关节仍使用当前姿态。
3. **9–11 秒：**脚印继续按 `footAt` 的真实触地位置、左右脚和触地时刻出现，出口两块天然岩石构成不规则门框，炭色地面印记在右侧接入红黑彩陶纹带。

入口沿用根任务的 Intro 淡入。出口使用独立透明石门图层，地面不设置门槛；下一时代仍处于阶段 1 占位，精细场景与占位景观的细节差异是现阶段已知边界。

## 图层与生成记录

工具：内置 `image_gen.imagegen`，使用 imagegen 技能默认模式；未使用 CLI/API fallback。生成于 2026-10-26，源文件保留在 `/Users/shen/.codex/generated_images/01a176c3-fe1f-74b0-a9be-ed3f475aa8e3/`，交付文件全部复制进本工作树。

| 文件 | 尺寸 | 格式 | 用途 |
| --- | --- | --- | --- |
| `public/assets/scenes/paleolithic/back.png` | 1672 × 941 | RGB PNG | 岩壁、洞口、远山与泥土台面的独立背景 |
| `public/assets/scenes/paleolithic/front.png` | 1672 × 941 | RGBA PNG | 真透明底缘碎岩前景，代码下移以避开脚步 |
| `public/assets/scenes/paleolithic/gate.png` | 1672 × 940 | RGBA PNG | 出口两块独立天然立石；中间开放透明通道 |

源文件分别为 `exec-19784c9e-11bb-4b7d-8617-96d4f48be214.png`、`exec-59e8a5f6-6aa2-4eb6-b3ff-ca33ec0b3648.png`、`exec-666646c4-5724-4a03-9c11-d493ac5ddb33.png`。图像未做抠图、补画或像素替换，保留生成输出的透明通道，代码只负责合成、位置与动态。

### 背景生成提示词

Create ONE high quality cinematic background painting asset, exactly landscape 16:9, for an original Chinese prehistory animated film, NO text. Use-case: stylized-concept. Art direction: magnificent tactile ochre limestone cave with layered soot, charcoal, burnt sienna and umber, elegant painterly naturalism, believable geology, velvety charcoal shadows, close mineral textures, cinematic amber bounced firelight against cool blue-gray daylight, refined film production art, not game low-poly, not vector. Camera is a level side-on tracking stage, wide composition. Main wall occupies left 75% as a broad coherent dark warm ochre surface suitable to receive one projected human shadow later. Upper left x 5%-42%, y 5%-29% must be a calm dark area without cracks or objects for a cream title overlay. To the far right 25%, an irregular natural cave mouth opens onto a small remote pale blue limestone valley with tiny uninhabited trees, hazy, a sliver of sky. Earth is NOT a perspective road: a flat horizontal, physically solid compact dirt walking shelf must have its exact top contact edge at y=78% of the whole image, connecting both left and right edge without any slopes, steps, rocks, breaks. Lower 22% is richly textured foreground soil with subtle warm grit. Keep actor zone x=33%-54%, y=48%-80% free of objects; no fire baked into image, only warm amber offscreen light emanating from lower left. Right wall may have very subtle small original non-figurative charcoal mineral smears, no symbols or legible markings. Strictly empty scene: NO people, NO human silhouettes, NO humanlike cave paintings, NO handprints, NO animals, NO vehicle, bicycle, wheel, riding, machinery, tools, architecture, typography, logo, borders. This is the BACKGROUND only, NO foreground overhangs. The result must feel crafted, archaeological material without claiming any specific archaeological reconstruction.

### 透明前景生成提示词

Generate ONE independent 16:9 foreground overlay asset for a cinematic animated film, on genuine transparent alpha background. NOT a full scene. Only a narrow irregular foreground fringe along the very bottom 12% of the image and tiny slivers at the extreme lower left and extreme lower right edges: beautifully observed rough limestone fragments, a few charcoal-dark river stones, crumbling ochre clay and fine grit. Main center must be COMPLETELY transparent from top to at least y=86% of image; particularly x=30%-58% is empty clear alpha above y=91%. Top 85% must be fully transparent with no haze, no shadow, no wall, no sky, no background fill. Corners rocks may reach y=83% but never above. The bottom edge rock fringe extends continuously to bleed offscreen, organic low arrangement rather than repeated circles or rectangles. Color palette burnt umber, sienna, charcoal and very subtle amber highlights from lower left, side-lit, painterly highly tactile geology matching a masterfully art-directed warm prehistoric limestone cave painting, cinematic elegant material detail, no low poly or vector. No white or black solid background, no checkerboard drawn into image. NO people, silhouettes, human marks, tools, fire, animals, vehicles, wheels, typography, text, logo, borders. Keep edges nuanced and physically believable, preserve true alpha. Production asset, transparent foreground layer, wide landscape 16:9.

生成结果的左角石块高于请求范围，代码将完整透明图层下移 140 逻辑单位，保留底角质感并避开人物的 y=780 接触区；没有把不透明背景伪称为透明图层。

### 透明出口生成提示词

Create a production-ready transparent alpha PNG sprite sheet with a SINGLE scene element, landscape 16:9 full canvas. Two tall natural deeply weathered limestone boulders standing next to each other, forming an unconnected irregular gateway with an empty vertical passage between. The pair occupies center 28% of entire canvas only. Left boulder occupies x=37%-45%, top=36%, bottom exactly y=78%; right boulder x=55%-63%, top=41%, bottom exactly y=78%. The gap x45%-55% is perfectly transparent all the way from top to bottom. Boulders are organically shaped vertical stone masses, geological texture, ochre charcoal burnt sienna, subtle amber bounced light on inner left-facing planes and cooler gray outer planes. Dense believable craggy material with painterly cinematic prehistory film quality, no low-poly, no vector strokes. Both their bases are flat at exactly the same horizontal y78%, few tiny gravel chips may sit below bases y80% but no ground plane or ground shadow. Everything outside the TWO isolated vertical stones must be true transparent alpha, including above, below, between, and around. No solid background, no black or white fill, no checkerboard drawn into image. The upper third and bottom fifth fully transparent. No sky, no cave wall, no landscape, no vegetation, no people, human shapes, carvings, text, wheels, vehicles, tools, animals, architecture, lintel, joined arch. They are two separate natural stones with a very clear open gap, original art asset.

生成结果的立石实际占幅不同于提示词位置数值。代码按实际透明边界将底部对齐 GROUND，保持原始比例，不把 PNG 拉伸成柱子。

## 合成与验收记录

- 背景保持稳定，独立代码绘制火焰、余烬、接触脚印、漂浮矿尘、暖色照度起伏和统一骨架投影；没有用单张图整体平移冒充动画。
- 静态前景、动态图层和人物使用独立绘制顺序；所有相位由 t 与固定 hash 得出，没有状态累积或随机采样。
- `front.png` 完全零 alpha 像素占 83.57%，`gate.png` 占 80.74%。前景人物区和门框中间有极少 alpha=1 的生成边缘像素（1/255），视觉上透明；主要背景均为精确 alpha=0。
- `npm run capture -- --at 8 --out out/agent-01` 成功，已查看 `out/agent-01/frame-8.png`。
- `npm run capture -- --at 10.8 --out out/agent-01` 成功，已查看 `out/agent-01/frame-10.8.png`，出口两侧立石与红黑纹带清晰。
- 根级复核后补上三只洞外远坡兽群剪影，仅修改本场景及本简报。重新捕获并查看 8 秒截图；坡面保持低对比，没有大块几何色块。
- 同一浏览器内按 8 → 10.8 → 5.1 → 8 秒跳转，两次 8 秒 PNG SHA-256 一致（补兽群后）：`d27eef25d5bb9cf13d92e9eb1ef07a8262d55189bf274aef0e88bc70d9f1c0ac`。页面错误为空。
- 尚需根任务统一复核动态片段、共享转场和全片美术一致性；本简报不把阶段 2 验收或整片成片称为已完成。
