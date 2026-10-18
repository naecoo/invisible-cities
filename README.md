# 看不见的城市 · 光之图集

> 伊塔洛·卡尔维诺《看不见的城市》——五十五座城的 three.js 叙事可视化。

**在线预览：** https://naecoo.github.io/invisible-cities/

## 关于

以「宣纸水墨 × 建筑手稿」为基调的轻盈叙事站。五十五座不存在的城化为程序化建筑雕塑，悬浮于纸白光域之中；滚动即旅程，点击即凝视。

- **十一类主题** — 记忆 · 欲望 · 符号 · 轻盈 · 贸易 · 眼睛 · 名字 · 死亡 · 天空 · 连绵 · 隐蔽
- **五十五城** — 中意双语名录，每城配一枚几何图腾与一句箴言
- **程序化雕塑** — 按主题母题生成半透明纸感几何 + 墨线描边
- **滚动叙事** — 御前对话 → 十一章主题 → 星图总览 → 跋

## 技术栈

| 层 | 选型 |
|---|---|
| 构建 | Vite 6 + TypeScript |
| 3D | Three.js 0.170 |
| 动效 | GSAP 3 |
| 样式 | 原生 CSS（系统字体栈，零外链） |
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
pnpm preview    # 本地预览产物
```

## 部署

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动：

1. 安装依赖（pnpm frozen lockfile）
2. 类型检查
3. 构建
4. 发布到 GitHub Pages

预览地址：`https://naecoo.github.io/invisible-cities/`

## 目录结构

```
├── index.html
├── src/
│   ├── main.ts              # 场景编排 / 相机路径 / 交互
│   ├── style.css            # 纸感排版系统
│   ├── data/cities.ts       # 55 城 + 11 类数据
│   ├── scene/
│   │   ├── world.ts         # 光照 / 雾 / 背景
│   │   └── cityGeometry.ts  # 程序化城市雕塑
│   └── ui/
│       ├── narrative.ts     # 滚动章节 / 星图
│       └── overlay.ts       # 城市详情浮层
└── .github/workflows/deploy.yml
```

## 致敬

文本结构与分类依据伊塔洛·卡尔维诺《看不见的城市》（*Le città invisibili*, 1972）。本站为原创视觉化作品，未转载原著段落。

## License

MIT
