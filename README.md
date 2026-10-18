# 看不见的城市 · 光之图集

> 伊塔洛·卡尔维诺《看不见的城市》——五十五座城的 three.js 交互可视化。

**在线预览：** https://naecoo.github.io/invisible-cities/

## 这是什么

一座可漫游的光之地图：五十五座不存在的城悬浮于纸白光域。
点击城市，相机从宏观潜入微观，展示按原著意象构建的完整城市场景——
建筑、人物、水体、光影，以及每座城独有的符号。

## 功能

| 模块 | 说明 |
|---|---|
| **光之地图** | 55 城标签可点，自动避让；支持 3D 拾取 |
| **城市舞台** | 点城后全屏模型页：拖拽环视、滚轮缩放 |
| **55 城场景** | 程序化建筑 + 人物 + 水体 + 光影，贴合原著意象 |
| **游览路线** | 原书 / 分类 / 空间 / 环城，四条路径 |
| **环境音** | Web Audio 程序化声景（风/集市/星空/地下），可开关 |
| **人物细模** | 发型、长袍、姿态、手持物、浴者 |
| **水体** | 波纹着色器、瀑布水雾、运河网 |

## 游览路线

- **原书之旅** — 九章出场顺序
- **分类之旅** — 十一类主题串行
- **空间之旅** — 自天穹沉入地下
- **环城之旅** — 轻盈→贸易→连绵→隐蔽→绕回记忆

## 操作

| 操作 | 效果 |
|---|---|
| 点击城市标签 / 3D 模型 | 进入城市舞台 |
| 拖拽 | 环视模型 |
| 滚轮 | 拉近 / 拉远 |
| `←` `→` | 沿当前路线翻城 |
| `↑` `↓` | 切换游览路线 |
| `Esc` | 返回地图 |
| 右下「环境音」 | 开关声景 |

## 技术栈

| 层 | 选型 |
|---|---|
| 构建 | Vite 6 + TypeScript |
| 3D | Three.js 0.170 |
| 动效 | GSAP 3 |
| 音效 | Web Audio API（程序化，零资源文件） |
| 样式 | 原生 CSS（系统字体栈） |
| 部署 | GitHub Actions → GitHub Pages |

## 本地开发

```bash
pnpm install
pnpm dev        # http://127.0.0.1:5173/
```

## 构建与检查

```bash
pnpm typecheck  # tsc --noEmit
pnpm build      # 产出 dist/
pnpm preview
```

## 部署

推送到 `main` 后，`.github/workflows/deploy.yml` 自动 typecheck + build 并发布到 GitHub Pages。

## 目录结构

```
├── index.html
├── public/favicon.svg
├── src/
│   ├── main.ts              # 场景编排 / 相机 / 交互
│   ├── style.css            # 纸感排版系统
│   ├── audio/ambient.ts     # 程序化环境音
│   ├── data/
│   │   ├── cities.ts        # 55 城 + 11 类数据
│   │   └── routes.ts        # 4 条游览路线
│   ├── scene/
│   │   ├── world.ts         # 光照 / 雾 / 背景
│   │   ├── cityEnv.ts       # 环境件（地面/水/建筑/人物/光影）
│   │   ├── cityModels.ts    # 55 城场景生成器
│   │   └── cityGeometry.ts  # 主题几何（历史）
│   └── ui/
│       ├── mapUI.ts         # 地图标签与模型页 UI
│       ├── narrative.ts     # 叙事章节（历史）
│       └── overlay.ts       # 城市浮层（历史）
└── .github/workflows/deploy.yml
```

## 致敬

文本结构与分类依据伊塔洛·卡尔维诺《看不见的城市》（*Le città invisibili*, 1972）。
本站为原创视觉化作品，未转载原著段落。

## License

MIT
