# PromptCard - Image to Prompt AI 浏览器扩展

> 🚀 **2026 旗舰级多模态图像逆向解析器**：一键将网页图片或屏幕框选截图逆向解构为 **Midjourney v6.1, FLUX.1.1 Pro, Stable Diffusion 3.5, DALL-E 3** 等高质量 AI 提示词与专业视觉维度标签。

---

## ✨ 核心特性

### 1. 🌐 2026 前沿多模态视觉大模型直连（免积分限制 / 自由配置）

- **✨ 离线演示模式 (Mock AI)**：
  - 内置基于图片特征哈希的专业级动态提示词生成引擎（包含摄影、日漫、时尚、3D角色、巴洛克油画、赛博朋克等预设），无需任何 API Key，开箱即用。
- **🌐 Google Gemini 2.0 / 1.5 系列**：
  - 支持 **Gemini 2.0 Flash / Pro**、**Gemini 1.5 Flash / Pro** 以及前沿 **Flash Thinking / Experimental** 系列。
  - **支持在设置中心一键 🔄 自动拉取 Google 官方最新模型列表**，享受 Google AI Studio 每日免费多模态额度。
- **🤖 OpenAI GPT-4o / o3-mini / o1 系列**：
  - 支持 **GPT-4o**、**GPT-4o-mini**、**o3-mini** 及 **o1** 视觉深度推理，支持自动拉取可用模型列表。
- **🧠 Anthropic Claude 3.7 / 3.5 系列**：
  - 支持 **Claude 3.7 Sonnet (混合思维链推理)**、**Claude 3.5 Sonnet** 与 **Claude 3.5 Haiku**，在艺术流派、构图修辞与光影词汇上具备极强审美能力。
- **⚡ 自定义 / 本地 / 开源视觉大模型**：
  - 原生兼容任何 OpenAI 规范端点，轻松接入 **Qwen2.5-VL (通义千问视觉)**、**DeepSeek-VL2**、**Ollama**、**SiliconFlow (硅基流动)**、**OneAPI / NewAPI** 及 **vLLM** 本地私有化算力。

---

### 2. 🎨 全能生图提示词转换矩阵

一键解析并自动转换为对应模型的黄金生图语法：

| 生成器目标 | 输出格式与特性 | 示例支持 |
| :--- | :--- | :--- |
| **Midjourney** | 包含主体、环境、艺术流派、光影、镜头并自动附加 `--ar`, `--v 6.1`, `--stylize`, `--style raw` | `Cyberpunk portrait..., volumetric neon --ar 16:9 --v 6.1 --stylize 250` |
| **FLUX.1.1 Pro / FLUX.1 [dev]** | 极度契合 FLUX 语义理解的自然语言摄影与长句式描述 | `A high-detail photograph of... Captured with 85mm f/1.4 lens...` |
| **SDXL / SD 3.5 Large** | 拆分为 Positive Prompt 质量词组 + Negative Prompt 负向过滤标签 | `masterpiece, 8k, detailed...` / `Negative: blurry, bad anatomy...` |
| **DALL-E 3** | 强调空间关系与艺术意境的连贯提示词段落 | `Create an image featuring...` |
| **多语言 / 维度解构** | 中文（简/繁）、英语、日语一键切换，解构主体/风格/光影/构图/色彩/氛围 | 实时点击标签云自由复制重组 |

---

### 3. 🎯 四端一体化极速交互

1. **网页内原位悬浮卡片 (Floating Card)**：
   - 网页内右键点击任意图片或按下快捷键 `Alt+Shift+P` 框选截图，即在当前页面弹出毛玻璃悬浮卡片；
   - 自由拖拽、支持一键最小化、中英日多语言切换、标签云复制。
2. **侧边栏工作台 (SidePanel Studio)**：
   - 支持拖放本地图片上传解析；
   - 历史记录管理、⭐ 收藏夹筛选、历史数据一键导出/导入备份。
3. **快捷弹窗工具 (Popup)**：
   - 工具栏图标快速点击，支持即时本地上传与屏幕截图。
4. **独立设置中心 (Options)**：
   - 模型连通性实时测试、动态模型列表自动拉取、Midjourney 参数全局预设。

---

### 4. 🛡️ 4 级弹性防盗链与 CORS 跨域提取管道

针对防盗链保护严格的图床（如微博、知乎、B站、微信公众号、小红书、Pinterest 等）：
- **Level 1 (Service Worker 跨域特权通道)**：利用 Manifest V3 `<all_urls>` 权限直取网络字节流，并使用纯二进制 `ArrayBuffer` 分块算法高效转码 Base64，彻底免疫网页 DOM CORS 污染。
- **Level 2 (In-DOM Direct Canvas)**：同源图片离屏 Canvas 直取，零网络请求。
- **Level 3 (Referer Header 动态伪装)**：借助 `declarativeNetRequest` 动态补全来源头。
- **Level 4 (视口坐标无损精准裁剪)**：针对极端受保护元素，自动基于 `getBoundingClientRect` 坐标结合视口截屏无损裁剪，保证 100% 成功率。

---

## 🚀 安装与使用指南

1. 打开 Google Chrome 或 Edge 浏览器，在地址栏输入访问 `chrome://extensions/`。
2. 开启右上角的 **「开发者模式」 (Developer mode)**。
3. 点击左上角 **「加载已解压的扩展程序」 (Load unpacked)**。
4. 选择本项目所在目录 `promptcard-extension`。
5. 将 PromptCard 图标固定至浏览器工具栏，即可立即体验！

---

## ⌨️ 快捷键

- `Alt+Shift+P`：启动全屏交互式框选截图，拖拽框选任意区域即可自动提取提示词。

---

## 📄 开源许可证

MIT License © 2026 PromptCard Team