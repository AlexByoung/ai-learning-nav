# ai-learning-nav

AI 学习导航站：课程分类、难度标注、个人简介、学习路线和进度。网站本身不存放任何课程内容，所有卡片都链接到课程官网或 YouTube。

- 线上地址：https://alexbyoung.github.io/ai-learning-nav/
- 技术栈：Astro（纯静态输出）+ content collections + zod 校验，部署在 GitHub Pages
- 无后端、无数据库、无账号、无 analytics / cookie；学习进度只存在浏览器 localStorage
- 界面按 [tasteskill v2](https://github.com/Leonxlnx/taste-skill)（MIT）的流程设计，第三方授权见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

## 本地运行

需要 Node.js ≥ 22.23.4（Astro 7 的要求，推荐 Node 24，见 `.nvmrc`）。

```bash
npm ci
npm run dev       # 本地开发：http://localhost:4321/ai-learning-nav/
npm run build     # 生成 dist/，数据不合法时直接失败
npm run preview   # 预览 build 结果
```

注意站点挂在 `/ai-learning-nav/` 子路径下（`astro.config.mjs` 里的 `base`），本地访问也要带这个前缀。页面里的内部链接一律用 `src/lib/url.ts` 的 `withBase()` 生成，不要手写以 `/` 开头的路径。

Astro CLI 自带匿名使用统计（只针对开发工具，不影响网站本身），不想上报可以执行 `npx astro telemetry disable`；CI 里已通过 `ASTRO_TELEMETRY_DISABLED=1` 关闭。

## 检查链接

```bash
npm run check-links                      # 检查 src/data/courses.yaml 里的所有链接
npm run check-links -- --report out.md   # 另外输出 Markdown 报告
npm run check-links -- --node            # 强制使用内置检查器
```

- 装了 [lychee](https://github.com/lycheeverse/lychee) 时用 lychee（配置在 `lychee.toml`），否则退回脚本内置的 Node 检查器。
- 有失效链接时退出码非 0。
- `.github/workflows/check-links.yml` 每周一自动跑一次，也可以在 Actions 页面手动触发（Run workflow）。发现失效链接会自动开一个带 `broken-links` 标签的 issue；已有未关闭的同类 issue 时改为追加评论。

## 新增一门课

编辑 `src/data/courses.yaml`，在列表里加一条（列表顺序就是课程页的显示顺序）：

```yaml
- id: some-course-id            # 唯一，小写字母/数字/连字符
  title: "课程原名"
  provider: "学校或作者 · 讲师"
  category: agents              # apps | agents | llm | foundations | infra（从上层到底层）
  level: intermediate           # beginner(入门) | intermediate(中级) | advanced(进阶)
  prerequisites:                # 建议前置，可为空列表 []
    - 熟练 Python
  formats: [video, slides]      # 至少一个：video | slides | assignments | notes
  free: true
  term: "Fall 2026"             # 没有学期就写 null
  links:
    official: "https://..."     # 必填，必须是 https
    youtube: "https://www.youtube.com/..."   # 可选，必须是 youtube.com / youtu.be
    other: "https://..."        # 可选
  summary_zh: "用自己的话写的一句简介"
  why: "为什么值得学，一句话"
  verified_at: 2026-10-23       # 亲自打开链接核实的日期
```

规则：

1. 每个链接都要亲自打开，确认是官方页面、确实对应这门课，再填 `verified_at`。不确定的链接不要放。
2. 简介和“为什么值得学”用自己的话写，不要复制课程官网的描述；不放 slides、截图、logo 或 PDF。
3. 填了 `links.youtube` 时，`formats` 必须包含 `video`。
4. 改完运行 `npm run build`（校验 schema）和 `npm run check-links`。

缺少必填字段、枚举值写错、URL 格式不对时 `npm run build` 会直接报错退出，例如：

```
[InvalidContentEntryDataError] courses → harvard-cs2680 data does not match collection schema.
  summary_zh**: **summary_zh: Required
```

分类、难度、形式的显示文字在 `src/i18n/zh-CN.ts`，键名在 `src/data/taxonomy.ts`。

## 新增一条学习路线

编辑 `src/data/paths.yaml`：

```yaml
- id: my-path                   # 唯一，会成为网址 /paths/my-path/
  title: 路线名称
  description: 一两句说明这条路线适合谁、学完能做到什么。
  featured: false               # true 表示在首页作为推荐路线展示（只取第一条 featured）
  steps:                        # 按学习顺序排列，先易后难
    - course: hf-agents-course  # courses.yaml 里的 id
      note: 这一步为什么放在这里、要重点关注什么。
```

引用了不存在的课程 id 时 build 会失败。

## 设计说明

- 方向：tasteskill v2 发的 “One motif” 方向（seed 526277564，记录在 `.taste-skill/direction.json`），石墨灰 + 安全橙，字体 General Sans（自托管在 `src/assets/fonts/`，中文回退系统字体），全站直角。
- 母题是“层”：学习路线从最上层的应用一路往下到底层系统，所以五层叠起来的横条贯穿全站——首页大图被切成五层、每门课旁边的小标记点亮它所在的那一层、页脚的字块也是一层层的高低。
- 图片是这五层各自的历史物件（IBM 704 机房、Shakey 机器人、Hollerith 穿孔卡、Mark I 感知机、ENIAC），来自 Wikimedia Commons 的公有领域 / CC 授权图片，存放在 `public/archive/`，来源与授权见 `public/archive/CREDITS.md` 和页脚。它们不代表任何课程本身。
- 新增一层的图片时，在 `src/data/pictures.ts` 里登记文件、尺寸、alt、来源页面和署名。
- 站点默认就是深色界面（`color-scheme: dark`），没有单独的浅色主题。

## 部署

push 到 `main` 时 `.github/workflows/deploy.yml` 自动 build 并用 `actions/upload-pages-artifact` + `actions/deploy-pages` 发布到 GitHub Pages（repo 的 Pages Source 需设为 GitHub Actions）。Pull request 只跑 build，不部署。部署完成后 `smoke-test` job 会实际请求线上首页、课程页、路线页以及它们引用的全部 CSS/JS/字体/图片，任何一个不是 200 就让这次 run 失败。本地也可以对预览服务器运行：`npm run preview` 后执行 `npm run smoke-test -- http://localhost:4321/ai-learning-nav/`。

## 目录结构

```
src/
  content.config.ts   # zod schema（courses / paths）
  data/               # courses.yaml、paths.yaml、taxonomy.ts、pictures.ts
  i18n/               # 所有界面文案（zh-CN.ts）
  components/         # CourseRow（课程行）、LayerMark（层标记）
  layouts/Base.astro  # 顶栏、页脚（字块标志、图片署名）
  pages/              # 首页、/courses/、/paths/、/paths/[id]/、404
  scripts/            # 进度（localStorage）、滚动出现动画
scripts/check-links.mjs
```

## 以后加英文

把 `src/i18n/zh-CN.ts` 复制成 `en.ts` 并翻译，再在 `src/i18n/index.ts` 里按路由或设置切换导出的 `t`。课程的 `summary_zh` / `why` 目前只有中文，需要时可以在 schema 里加 `summary_en` 等字段。
