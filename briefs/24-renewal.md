# 24｜山河新生时代

阶段 2 精制代表场景；10 秒 / 5 小节，165–175 秒。约 4000 年及以后，**未来虚构设定 / 艺术想象**，不是技术预测，也不宣称建筑史复原。

## 空间与材料

画面采用平远横卷：低缓青绿群山、贯通河网、湿地田园、顺地形生长的低层居住台地。庭院使用温暖玻璃、浅石材和连续曲面檐顶，山脊有少量地面通信仪器；维护良好的古石桥与新生林木并存。技术服务生活，山河没有成为废墟。与北宋的巨大积墨峰体形成清楚区别。

矿物青绿、赭石、细金线与暖纸白。左上保留标题呼吸空间。画中无人、无背景人影，无车辆、自行车、轮子、飞行器、巨大轨道环或外星城市；唯一主角由既有 C 剪影统一骨骼绘制。

## 分层文件

| 文件 | 尺寸 / 格式 | 用途 |
| --- | --- | --- |
| `public/assets/scenes/renewal/back.png` | 1672 × 941 RGB PNG | 原创未来青绿山水、河网、台地居住、古桥、山脊通信 |
| `public/assets/scenes/renewal/front.png` | 1672 × 941 RGBA PNG | 真透明的底部低矮水岸石草，单独视差；不遮脚 |

内置 imagegen 生成，最终图层已从生成目录复制进项目。没有远程素材依赖。首次透明前景因植株过高未采用；最终使用第二版低矮石草。

## 动效与接口

保持 `drawRenewal(ctx, scene, view, t)`、`renewalPortal(ctx, x, exit=false)`。经 `registerArt` 注册，使用共享预载器；未修改骨骼、共享调度、其它时代。

- 背景 / 前景相机响应分别为世界距离的 0.022 / 0.055；全部由绝对时间和固定 `hash` 决定。石径接触面始终是 `GROUND=780`，实际铺装分缝使用 `view.project` 固定在世界中。
- 第 1–2 小节：星图细金线沿河网柔和弯曲消隐，远方回归家园；底层水面有 105 条稀疏反光呼吸，光线弱幅变化，前景轻微摇曳。
- 第 3 小节：复用 `memoryState(t)` 的赭石、陶纹、墨线、青砖、星图五种铺装纹理；依次显现，速度平缓，不闪烁。
- 第 4 小节：一小段普通土面接合处与既有幼苗，复用 `FOOTPRINT_TIME` / `FOOTPRINT_X`；local=7s 真实触地后才留下脚跟与前掌痕迹。幼苗在触地前就存在。
- 第 5 小节：local 8–10 秒山水、前景、水光退向纸白，仍留下石径土面纹理、足迹与幼苗。出口是未完成纸框边缘，供 Outro 接续。
- 音效建议：古琴式拨弦、石击与清澈数字泛音逐渐收束；脚印只配既有统一真实触地事件，不自行生成脚步。

## 原始生成提示词

### 背景（内置 imagegen，非透明）

Use case: stylized-concept. Asset type: original 16:9 cinematic painted background layer for a 1920x1080 art film, no text. Create an exceptionally exquisite expansive Chinese blue-green landscape scroll imagining Earth in China circa 4000 AD and later, an explicitly fictional ecological civilization. Horizontal 'level distance' composition, layered low rolling emerald and malachite hills, intricate river networks, quiet rice wetland gardens, inhabited low residential terraces growing with the contours, pristine pale stone and wood courtyard architecture with softly curved contemporary continuous roofs, delicate glazing and a few small warm windows, small maintained old stone footbridges integrated into banks, dense carefully tended tree groves, tiny understated interstellar communications instruments anchored into one distant ridge. These future homes must have subtly advanced architecture, not only an ancient Song landscape recolored green. No dominant tall peak, no giant metropolis. Supreme refined hand-painted mineral pigment on warm ivory silk/paper, fine ochre and antique gold contour lines, luminous jade shallows, soft atmospheric haze, astonishing micro-detail, rich refined texture, not cartoon, not photorealistic, beautifully composed gallery quality. The upper left 40% should be mostly misty paper-white sky with only faint distant hills, suitable for title overlay. Landscape occupies middle region. Lower quarter should be subdued pale sandy riverbank, with perfectly horizontal flat continuous physical pale stone footpath at exactly 78% image height across the whole image, road surface below this line 2% high, clear visual ground for a solitary code-drawn walker later at x42% and y78%. Keep open clear space around x42% y58-80%, no objects there. Lower bottom corners show jade water, small rocks and low reed patches, avoiding dense vegetation. Quiet afternoon, tender hopeful light, subtle intricate future life, no sci-fi spectacle. Strictly no humans, no people, no human figures or silhouettes anywhere, no animals, no vehicles, no bicycles, no wheels, no aircraft, no spacecraft, no orbit ring, no alien city, no ruins, no logos, no calligraphy or text. Full bleed 16:9 landscape.

### 最终生态前景（内置 imagegen，真透明）

Use case: stylized-concept. Create a very wide 16:9 TRANSPARENT PNG overlay for compositing over a river landscape. Nearly the entire canvas is empty transparent. ONLY AT THE BOTTOM EDGE place two extremely short, small detailed rock and grass clusters: a flat smooth gray jade boulder with tiny moss and three thin green grass blades at the extreme bottom left, and a few small pale ochre river stones with tiny green sedges at the extreme bottom right. Each group occupies no more than 20% of image width and 12% of image height. All objects sit on the very bottom border, silhouettes stay below the bottom 15 percent. No tall branches, no bushes, no flowers, no large reeds. The image center and top 85% are completely transparent and contain zero objects. Style exquisite hand-painted Chinese mineral-color landscape, refined fine gold contour highlights, tiny botanical detail, soft jade/ochre colors. Genuine transparent background. No paper, no background scenery, no water surface, no black, red or colored background, no text, no people, no animals, no vehicles, no wheels.

## 验证与限制

1920 × 1080 截帧：`out/agent-24/frame-171.png`（全景 / 五种记忆）、`frame-172.25.png`（触地后足迹）、`frame-174.png`、`frame-174.8.png`（退向留白）。截图中道路准确贴脚，标题清楚，前景不遮脚。任意跳转同一时刻应产生相同画面。此阶段未配乐，实际声音由后续阶段统一制作。

绘画层是静态美术基础，水光、视差、星河、记忆、土面与足迹均为独立程序层；目前没有分离每栋建筑和每棵树。场景入口与相邻星际时代仍受前一时代占位状态限制，整片验收由根代理统一处理。
