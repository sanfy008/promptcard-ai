# PromptCard - Image to Prompt AI 浏览器扩展

> 一键将网页图片或屏幕框选截图逆向解析为 Midjourney, FLUX, Stable Diffusion, DALL-E 3 等高质量 AI 提示词与视觉维度标签。

## ✨ 核心特性

1. **多引擎支持 (免积分 / 自由配置)**:
   - **离线演示模式 (Mock AI)**: 内置专业提示词模拟引擎，无需任何 API Key，开箱即用。
   - **Google Gemini 1.5 / 2.0 Flash**: 推荐使用，在 Google AI Studio 免费申请，速度极快且完全免费。
   - **OpenAI GPT-4o / GPT-4o-mini**: 极高细节与质感还原。
   - **Anthropic Claude 3.5 Sonnet**: 顶级艺术审美与构图修辞。
   - **自定义 / 本地 OpenAI 兼容 API**: 支持 Ollama, DeepSeek-VL, OneAPI, NewAPI, SiliconFlow 等。

2. **多端交互体验**:
   - **网页内原位悬浮卡片 (Floating Card)**: 右键点击网页任意图片或使用屏幕截图后，在当前页面直接弹出浮窗，支持拖拽、最小化、中英文一键切换与复制。
   - **侧边栏工作台 (SidePanel Studio)**: 深度工作台，支持拖放上传本地图片、微调生图参数（--ar, --v, --stylize, --style）、可视化点击标签云实时重组提示词。
   - **快捷弹窗 (Popup)**: 极速上传与快捷截图工具。
   - **独立设置中心 (Options)**: 完善的 API 配置、连通性实时测试、默认参数预设及历史数据导入导出备份。

3. **快捷键**:
   - `Alt+Shift+P`: 触发全屏交互式框选截图，截取后自动逆向解析。

## 🚀 安装指南

1. 打开 Google Chrome 或 Edge 浏览器，访问 `chrome://extensions/`。
2. 开启右上角的 **「开发者模式」 (Developer mode)**。
3. 点击 **「加载已解压的扩展程序」 (Load unpacked)**。
4. 选择本项目所在的 `promptcard-extension` 目录。
5. 固定 PromptCard 图标至浏览器工具栏，即可立即体验！

## ⚙️ 设置选项位置

- **悬浮卡片**: 顶部右上角齿轮图标 `⚙️` 及底部「⚙️ 设置」按钮。
- **扩展弹窗**: 顶部右上角「⚙️ 设置」按钮。
- **侧边栏**: 顶部第三个选项卡「⚙️ 设置中心」。
- **Chrome 扩展管理**: 右键点击扩展图标 -> 选择「选项 (Options)」。