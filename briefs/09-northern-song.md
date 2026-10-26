# 09｜北宋 · Northern Song

## 阶段与取景

阶段 2 代表版块，53–59 秒，3 小节，960–1127 年。画面是原创的北方巨碑式山水意象，呈现普通行者与山河的尺度关系，不声称复原某一具体地点，也不复制任何具体古画构图。

艺术语言依据：国立故宫博物院典藏精选页面 <https://theme.npm.edu.tw/selection/Article.aspx?sNo=04000959>。由项目主代理阅读，用于理解雄厚山体、积墨与雨点皴、瀑布、云气及点景人物的尺度；未下载、描摹或取用该页面图片。

主色为暖纸白、墨黑、石灰、极淡青灰和苔色。主峰偏右，左上留出连续纸面供现代标题使用；左前景为蟠曲老松，右前景为小松与岩壁。人物由全片统一 C 剪影骨架叠加，不生成人物进背景。

## 分层与素材

四张均由内置 `image_gen.imagegen` 独立生成，未调用 CLI、未使用外部作品图片。原始生成图保留在 `/Users/shen/.codex/generated_images/01a176c4-9df7-71a0-b51f-92db2c1a6a00/`，实际消费文件已经复制进仓库。

| 文件 | 实际尺寸与格式 | 用途 |
| --- | --- | --- |
| `public/assets/scenes/northern-song/back.png` | 1659 × 948，RGB | 巨碑山体、远山、细瀑、连续干燥石径、下层溪谷 |
| `public/assets/scenes/northern-song/front.png` | 1672 × 941，RGBA | 两侧松石透明前景，独立视差与轻推近 |
| `public/assets/scenes/northern-song/gate.png` | 1672 × 941，RGBA | 入口独立松石 aperture，完整自然收边，中央为留白通道 |
| `public/assets/scenes/northern-song/exit.png` | 1672 × 941，RGBA | 出口完整木廊桥，精细木纹、瓦片、桥拱与石墩，中央通道净空 |

背景生成响应略偏离 16:9，绘制时始终保持原始宽高比，使用统一缩放和裁切；未单独拉伸横向或纵向。山径实测在源图画高约 75.2%，绘制变换将此边缘固定在逻辑 y=780。源图中的水流位于下层溪谷，和真实步行路之间有岩岸与留白。

透明检查：front alpha 范围 0–255，完全透明像素约 67.61%；原图中央步行区域 x38–60% / y71–82% alpha 范围为 0–1。gate alpha 范围 0–255，完全透明像素约 60.56%。图层原始 alpha 原样保留，没有以纯色背景冒充透明。

exit alpha 范围 0–255，完全透明像素约 67.26%；中央通道 x43–57% / y44–64% alpha 范围为 0–1。源图桥面实际在画高约 68.4%，绘制时以此边缘锚定 y780，全桥保持等比。中央梁下高度足够统一人物在场景结束时通过，桥柱与边栏避开中央行走位置。

## 代码动效与表演

- `drawNorthernSong(ctx, scene, view, t)` 与 `songPortal(ctx, x, exit=false)` 接口保持。
- 山体在 6 秒内以山径为基准微幅统一推近，远景位移系数 0.017；前景位移系数 0.044，缩放增量 2.5%，产生分层视差。
- 三处羽化云气以低频正弦缓动，始终避开地面与主角脚部；瀑布在已有墨白裂隙内部以细小高光段向下流动；下层溪面有稀疏细涟，不把整张画平移当成运动。
- 道路纹理细节使用固定 `hash`，在世界坐标锚定，渲染仅依赖 t。没有 `Math.random`、增量计时或播放顺序依赖。
- 小石平台顶面精确为 `GROUND - 18`，横向顶面为 STONE_X ±28，与共享 `terrainAt` 一致；边坡至 ±46。石体与纹理由代码细画，和统一跨石姿势相接。
- 不改共享骨骼、`viewAt` 或人物步态。统一镜头使人物从 0.22 比例增长到 0.44；56 秒进入跨石高光，行者仍是同一套骨骼。
- 入口为第三张图层的松石留白 aperture；出口为第四张精细木廊桥图层与周围留白，桥面仍在 y780，木柱、梁架与低檐形成画框，下一场接南宋。出口最初的简略代码线框已完全替换。

小节安排：53–55 秒以山体为主、松石入口让行者进入；55–57 秒轻推近并跨小石；57–59 秒继续步行，接留白木桥出口。配乐待阶段 4，建议古琴、低音持续声和山间水声，与脚步真实接触点对应。

## 生成提示词（最终实际使用）

### back.png

> Use case: historical-scene. Asset type: a premium hand-painted 16:9 background layer for an original Chinese history animated film, landscape 1792x1024 or exact 16:9 if possible. Original Northern Song monumental ink landscape, museum-quality traditional brush and black ink on warm softly aged ivory silk. Highly sophisticated dry-brush texture, rain-dot cun texture strokes, accumulated ink, gorgeous wet and dry tonal nuance; towering jagged mountain masses with the immense main peak distinctly RIGHT of center, lower layered mountains at left, distant faint ridges, fine white waterfalls descending in a cleft near the right third, pines clinging to ledges, clouds and vast luminous negative space between mountain planes. Real ink-and-paper material, exquisitely detailed but atmospheric, restrained pale celadon and warm umber only as subtle traces. Composition is original and asymmetric; do not copy any existing painting. Main mountain occupies upper and mid right with peak around x68% y8%; upper-left quadrant very pale empty mist for title. CRITICAL scene geometry: at exactly 78 percent image height a NARROW, SOLID horizontal earth-and-stone mountain trail runs uninterrupted from left edge to right edge, nearly level; top walking edge at 78%, trail thickness about 2%; this path is dry physical land. Below the trail a separate lower rocky stream valley with a wide misty blank gap and subtle water, natural banks; water must never cover or overlap the walking trail. No person may be on the picture. Foreground may be pale as a separate front layer will be composited. No people, travelers, miniature figures, porters, caravans, livestock, horses, oxen, riding animals, carts, wagons, vehicles, bicycles, wheels. No buildings in main foreground. NO calligraphy, characters, text, seals, signature, watermark, borders or decorative frame. The art should feel like a remarkable cinematic mountain panorama with tactile traditional ink, never a flat vector mountain silhouette or computer gradient.

原始文件：`exec-a3047960-fc8a-4459-a68f-22bf9dfa392f.png`。`transparent_background=false`。

### front.png

> Use case: historical-scene. Asset type: independent transparent foreground layer for a premium original Northern Song Chinese ink landscape animation, full wide 16:9 canvas. ONLY two elegant foreground clusters of ancient Chinese pine trees and scholar-like mountain rocks on a truly transparent background, no paper or solid background. Exquisite authentic traditional ink brush painting on silk feeling, highly refined rain-dot cun rock texture, dry and wet ink variation, aged-black and warm gray ink, trace of muted olive moss; luminous subtle gray washes inside rocks, crisp irregular ink lines and intricate pine needles. Left cluster begins at bottom left, low layered rough rocks occupy x0-24% y86-100%, a beautiful crooked old pine rising from lower-left rocks at x8% y88% to x16% y46%, umbrella pine branches reaching x32% only above y62%. Right cluster at bottom right x80-100% y87-100% contains finely modeled sharp rocks and one small pine at x96% extending upward to y65%. The middle HALF of the image is entirely transparent; especially x32-78% between y64-88% must be perfectly empty, because an animated tiny traveler walks along y78%. No continuous ground strip across center; no mountains, sky, clouds, water, path or bridge. Very original museum-quality detailed brushwork, cinematic tasteful composition, not simple vector shapes, not a cartoon, not 3D. No people, figures, animals, buildings, vehicles, bicycles, carts, wheels. No text, characters, seals, signature, watermarks. Transparent alpha is required, preserve soft brush edges.

原始文件：`exec-faa0c212-2b33-4029-9c4d-c6ae592531a9.png`。`transparent_background=true`。

### gate.png

> Use case: historical-scene. Asset type: an isolated freestanding pine-and-rock gateway sprite with genuine transparent alpha, wide 16:9 canvas. Original Northern Song ink painting, exquisite museum-quality wet and dry ink, fine rain-dot rock texture, calligraphic needle clusters and moss, dark warm gray with subtle pale stone washes. TWO freestanding clusters on the same transparent canvas: at left x18-41% a gracefully leaning ancient pine rooted among three low richly textured stones, its highest branch y20%, trunk base y77%. At right x64-79% a slender vertical weathered mountain rock with a smaller pine above, highest branch y38%, base y77%. Between the two clusters x43-62% is a perfectly empty vertical passage from top to bottom, the intended animated traveler gateway. The two cluster BASES are COMPLETE natural irregular silhouettes, entirely inside the image and floating as isolated sprites: lowest pixels at about y80%, the bottom20% of the entire image is totally TRANSPARENT. Every rock contour must terminate naturally, nothing is cropped, all objects surrounded by transparency, no vertical or horizontal cut edges, no scenery extending to canvas edges. No ground, floor, trail, horizontal rock shelf, mountains, paper, water, mist, sky, shadows on background or frame. The empty gap is not filled by a drawn arch or architectural gate; pine branches suggest an open aperture. No people, animals, human figures, text, symbols, calligraphy, seals, logos, vehicles, wheels, bicycles. Refined hand-painted traditional brush and ink material, never vector or 3D. Transparent output, keep all background fully transparent.

原始文件：`exec-ed33dd80-b87d-4755-b1c5-233f35fd1e08.png`。`transparent_background=true`。

### exit.png

> Use case: historical-scene. Asset type: isolated transparent EXIT FOOTBRIDGE layer for a museum-quality Northern Song Chinese ink landscape animated film, wide 16:9 canvas. A SMALL, elegant original timber covered pedestrian bridge in strict SIDE ELEVATION, delicately drawn and richly textured in authentic traditional Chinese ink on silk style. Extremely fine dry-brush wood grain, weathered gray-brown timber posts, sophisticated accumulated black ink and warm pale stone wash matching a monumental Northern Song mountain landscape. One low restrained gently pitched wooden shingle roof, no ornate palace ornament or bright paint, four slender wooden posts but only two main posts visible in the elevation. The posts frame a large CLEAR OPEN central aperture between x40% and x60%, full clearance from roof underside at y34% down to deck at y77%. The horizontal walking deck is perfectly FLAT at exactly 77 percent image height, extending x16%-84%, thin plank thickness, visible subtle plank end texture. NO center railing or horizontal crossbar in the middle opening from y45 to77%; keep a walking traveler's head, torso, legs and feet completely visible. Short low rails may appear only at the far-left and far-right approach ends. Below the deck a delicately modeled modest timber bow support and small natural rock abutments at both ends suggest the bridge span, all complete isolated natural contours. Highest roof ridge around y23%, bottom of support and stone at y89%; all bridge parts sit well inside the canvas and do not touch any edges. Transparent negative space around and under the bridge. This is a pedestrian mountain footbridge, not a huge building or temple, not a gate on an opaque base; elegant restrained proportions, tactile handmade brush detail, slightly irregular handmade timber. No mountains, trees, paper background, ground terrain, water, river, sky, clouds, shadows on background, backdrop or rectangular matte. NO people, figures, human silhouettes, animals, horse, vehicles, carts, bicycles, wheels, text, calligraphy, seals, signature or watermark. True RGBA transparency, preserve feathered ink edges.

原始文件：`exec-c96475d4-ce2f-43b8-bc08-2367822cfb3b.png`。`transparent_background=true`。

## 验证与已知边界

已运行 `npm run capture -- --at 56 --out out/agent-09` 并通过 `view_image` 目视检查；额外检查 53.6 秒入口与 58.7 秒出口，以及 `out/agent-09/foot-56.png` 跨石近景。透明木廊桥补精后又运行 `npm run capture -- --at 58.75 --out out/agent-09` 并目视检查，梁下与中央净空通过，桥面和脚底相接。标题留白完整，脚部没有被松石或云气挡住，路与水具有实体层次区分。已通过 `npm run build`。

阶段 2 的共享过框合成在 58.7 秒曾出现画面提前褪淡及阶梯矩形；主代理已用独立场景缓冲修复，58.75 秒保留画框截面的材质变化，本模块不修改共享合成。北宋下一场仍为占位版本，出口的最终墨色承接要等南宋精修后统一验收。图层实际分辨率约 1.6K，输出 1080p 仍有细腻材质；如后续需要 4K 成片，应另作高分辨率素材复核。
