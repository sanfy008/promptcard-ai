class FloatingPromptCard {
  constructor() {
    this.container = null;
    this.card = null;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.initialX = 0;
    this.initialY = 0;
    this.currentData = null;
    this.currentTab = 'midjourney';
    this.currentLang = 'en';
    this.currentImageSrc = null;
    this.isMinimized = false;
  }

  mount() {
    if (document.getElementById('promptcard-floating-root')) return;

    this.container = document.createElement('div');
    this.container.id = 'promptcard-floating-root';
    document.body.appendChild(this.container);

    this.renderInitial();
    this.setupDrag();
  }

  showLoading(imageSrc = null) {
    this.mount();
    this.currentImageSrc = imageSrc;
    this.isMinimized = false;

    this.container.innerHTML = `
      <div class="pc-card">
        <div class="pc-header" id="pc-drag-handle">
          <div class="pc-brand">
            <div class="pc-logo-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"/></svg>
            </div>
            <span class="pc-title">PromptCard</span>
            <span class="pc-badge">解析中...</span>
          </div>
          <div class="pc-header-controls">
            <button class="pc-icon-btn" id="pc-btn-options" title="打开设置 (配置 API Key / 模型)">⚙️</button>
            <button class="pc-icon-btn" id="pc-btn-sidepanel" title="在侧边栏中打开">🗂️</button>
            <button class="pc-icon-btn" id="pc-btn-close" title="关闭">✕</button>
          </div>
        </div>
        <div class="pc-body">
          <div class="pc-loading">
            <div class="pc-spinner"></div>
            <div class="pc-loading-text">AI 正在深度逆向解析光影、主体、风格与构图...</div>
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
  }

  renderResult(data, imageSrc = null) {
    this.mount();
    this.currentData = data;
    if (imageSrc) this.currentImageSrc = imageSrc;

    const analysis = data.analysis || {};
    const prompts = data.prompts || {};
    const tagCloud = data.tagCloud || {};
    const provider = data.provider || analysis._provider || 'mock';

    const providerNames = {
      mock: '✨ 离线演示 (Mock)',
      gemini: '🌐 Gemini 1.5/2.0',
      openai: '🤖 OpenAI GPT-4o',
      claude: '🧠 Claude 3.5',
      custom: '⚡ 自定义 API'
    };
    const providerLabel = providerNames[provider] || '✨ 演示模式';

    const activePromptText = this.getActivePromptText();

    this.container.innerHTML = `
      <div class="pc-card">
        <div class="pc-header" id="pc-drag-handle">
          <div class="pc-brand">
            <div class="pc-logo-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"/></svg>
            </div>
            <span class="pc-title">PromptCard</span>
            <span class="pc-badge ${provider === 'mock' ? 'pc-badge-mock' : ''}" id="pc-header-badge" title="点击打开设置中心切换模型/配置Key">${providerLabel}</span>
          </div>
          <div class="pc-header-controls">
            <button class="pc-icon-btn" id="pc-btn-options" title="打开设置 (配置 API Key / 模型)">⚙️</button>
            <button class="pc-icon-btn" id="pc-btn-sidepanel" title="在侧边栏中打开">🗂️</button>
            <button class="pc-icon-btn" id="pc-btn-min" title="收起/展开">—</button>
            <button class="pc-icon-btn" id="pc-btn-close" title="关闭">✕</button>
          </div>
        </div>

        <div class="pc-body" id="pc-card-body">
          ${provider === 'mock' ? `
            <div class="pc-mock-banner" id="pc-banner-mock" title="点击前往配置 API Key">
              <span>💡 当前为免Key演示模式。如需真实实时AI反推，点此配置 Gemini / OpenAI Key</span>
            </div>
          ` : ''}

          <div class="pc-meta-bar">
            ${this.currentImageSrc ? `<img src="${this.currentImageSrc}" class="pc-thumb" alt="preview" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="pc-thumb-fallback" style="display:none;">✨</div>` : `<div class="pc-thumb-fallback">✨</div>`}
            <div class="pc-meta-info">
              <div class="pc-meta-title">${analysis.subject || '视觉解析完成'}</div>
              <div class="pc-meta-chips">
                <span class="pc-chip">${analysis.aspectRatio || '16:9'}</span>
                <span class="pc-chip">${analysis.style ? analysis.style.slice(0, 24) + '...' : 'Artistic'}</span>
              </div>
            </div>
          </div>

          <div class="pc-lang-switch">
            <button class="pc-lang-btn ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en">EN (生图推荐)</button>
            <button class="pc-lang-btn ${this.currentLang === 'zh-CN' ? 'active' : ''}" data-lang="zh-CN">简体中文</button>
            <button class="pc-lang-btn ${this.currentLang === 'zh-TW' ? 'active' : ''}" data-lang="zh-TW">繁體中文</button>
            <button class="pc-lang-btn ${this.currentLang === 'ja' ? 'active' : ''}" data-lang="ja">日本語</button>
          </div>

          <div class="pc-tabs">
            <button class="pc-tab-btn ${this.currentTab === 'midjourney' ? 'active' : ''}" data-tab="midjourney">Midjourney</button>
            <button class="pc-tab-btn ${this.currentTab === 'flux' ? 'active' : ''}" data-tab="flux">FLUX</button>
            <button class="pc-tab-btn ${this.currentTab === 'sd' ? 'active' : ''}" data-tab="sd">SD / SDXL</button>
            <button class="pc-tab-btn ${this.currentTab === 'breakdown' ? 'active' : ''}" data-tab="breakdown">维度标签</button>
            <button class="pc-tab-btn ${this.currentTab === 'json' ? 'active' : ''}" data-tab="json">JSON</button>
          </div>

          <div class="pc-prompt-box">
            <div class="pc-prompt-text" id="pc-prompt-content">${activePromptText}</div>
          </div>

          ${this.renderTagSection(tagCloud)}

          <div class="pc-footer">
            <button class="pc-primary-btn" id="pc-btn-copy-main">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              一键复制提示词
            </button>
            <button class="pc-secondary-btn" id="pc-btn-copy-json" title="复制完整结构化 JSON">JSON</button>
            <button class="pc-secondary-btn" id="pc-btn-footer-settings" title="打开设置中心">⚙️ 设置</button>
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
  }

  getActivePromptText() {
    if (!this.currentData) return '';
    const analysis = this.currentData.analysis || {};
    const prompts = this.currentData.prompts || {};

    if (this.currentTab === 'midjourney') {
      return prompts.midjourney || '';
    } else if (this.currentTab === 'flux') {
      return prompts.flux || '';
    } else if (this.currentTab === 'sd') {
      const sd = prompts.stableDiffusion || {};
      return `【Positive Prompt】\n${sd.positive || ''}\n\n【Negative Prompt】\n${sd.negative || ''}`;
    } else if (this.currentTab === 'json') {
      return JSON.stringify(analysis, null, 2);
    } else if (this.currentTab === 'breakdown') {
      let loc = analysis;
      if (this.currentLang !== 'en' && analysis.translations && analysis.translations[this.currentLang]) {
        loc = { ...analysis, ...analysis.translations[this.currentLang] };
      }
      return [
        `🎯 主体 (Subject): ${loc.subject || 'N/A'}`,
        `🎨 风格 (Style): ${loc.style || 'N/A'}`,
        `💡 光影 (Lighting): ${loc.lighting || 'N/A'}`,
        `📐 构图 (Composition): ${loc.composition || ''} ${loc.camera || ''}`,
        `🌈 配色 (Palette): ${loc.colorPalette || 'N/A'}`,
        `🔮 氛围 (Atmosphere): ${loc.atmosphere || 'N/A'}`
      ].join('\n\n');
    }
    return '';
  }

  renderTagSection(tagCloud) {
    if (!tagCloud || Object.keys(tagCloud).length === 0) return '';

    const groups = [
      { key: 'subject', label: '主体' },
      { key: 'style', label: '风格' },
      { key: 'lighting', label: '光影' },
      { key: 'palette', label: '配色' }
    ];

    const groupHtml = groups.map(g => {
      const tags = tagCloud[g.key] || [];
      if (tags.length === 0) return '';
      return `
        <div class="pc-tags-section">
          <div class="pc-tag-group-title">${g.label}</div>
          <div class="pc-tag-cloud">
            ${tags.map(t => `<span class="pc-tag-pill" data-tag="${t}">${t}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    return groupHtml;
  }

  setupEvents() {
    this.setupDrag();

    const btnClose = document.getElementById('pc-btn-close');
    if (btnClose) btnClose.onclick = () => this.destroy();

    const btnOptions = document.getElementById('pc-btn-options');
    if (btnOptions) {
      btnOptions.onclick = () => chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
    }
    const btnFooterSettings = document.getElementById('pc-btn-footer-settings');
    if (btnFooterSettings) {
      btnFooterSettings.onclick = () => chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
    }
    const headerBadge = document.getElementById('pc-header-badge');
    if (headerBadge) {
      headerBadge.onclick = () => chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
    }
    const mockBanner = document.getElementById('pc-banner-mock');
    if (mockBanner) {
      mockBanner.onclick = () => chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
    }

    const btnSidepanel = document.getElementById('pc-btn-sidepanel');
    if (btnSidepanel) {
      btnSidepanel.onclick = () => chrome.runtime.sendMessage({ action: 'OPEN_SIDEPANEL' });
    }

    const btnMin = document.getElementById('pc-btn-min');
    const body = document.getElementById('pc-card-body');
    if (btnMin && body) {
      btnMin.onclick = () => {
        this.isMinimized = !this.isMinimized;
        body.style.display = this.isMinimized ? 'none' : 'block';
        btnMin.innerText = this.isMinimized ? '＋' : '—';
      };
    }

    document.querySelectorAll('.pc-tab-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.pc-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        const contentBox = document.getElementById('pc-prompt-content');
        if (contentBox) contentBox.innerText = this.getActivePromptText();
      };
    });

    document.querySelectorAll('.pc-lang-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.pc-lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentLang = btn.dataset.lang;
        const contentBox = document.getElementById('pc-prompt-content');
        if (contentBox) contentBox.innerText = this.getActivePromptText();
      };
    });

    const btnCopyMain = document.getElementById('pc-btn-copy-main');
    if (btnCopyMain) {
      btnCopyMain.onclick = () => {
        const text = this.getActivePromptText();
        this.copyToClipboard(text, '✨ 提示词已复制到剪贴板！');
      };
    }

    const btnCopyJson = document.getElementById('pc-btn-copy-json');
    if (btnCopyJson) {
      btnCopyJson.onclick = () => {
        const json = JSON.stringify(this.currentData?.analysis || {}, null, 2);
        this.copyToClipboard(json, '✨ 结构化 JSON 已复制！');
      };
    }

    document.querySelectorAll('.pc-tag-pill').forEach(pill => {
      pill.onclick = () => {
        this.copyToClipboard(pill.dataset.tag, `已复制标签: ${pill.dataset.tag}`);
      };
    });
  }

  setupDrag() {
    const handle = document.getElementById('pc-drag-handle');
    if (!handle) return;

    handle.onmousedown = (e) => {
      if (e.target.closest('.pc-header-controls') || e.target.closest('.pc-badge')) return;
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;

      const rect = this.container.getBoundingClientRect();
      this.initialX = rect.left;
      this.initialY = rect.top;

      const onMouseMove = (ev) => {
        if (!this.isDragging) return;
        const dx = ev.clientX - this.startX;
        const dy = ev.clientY - this.startY;
        this.container.style.right = 'auto';
        this.container.style.left = `${this.initialX + dx}px`;
        this.container.style.top = `${this.initialY + dy}px`;
      };

      const onMouseUp = () => {
        this.isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
  }

  copyToClipboard(text, message = '已复制！') {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(message);
    });
  }

  showToast(message) {
    const existing = document.querySelector('.pc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'pc-toast';
    toast.innerText = message;
    this.container.querySelector('.pc-card')?.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  renderInitial() {}
}

class ScreenSnipperOverlay {
  constructor() {
    this.overlay = null;
    this.selection = null;
    this.startX = 0;
    this.startY = 0;
    this.isSelecting = false;
    this.cropCoords = null;
  }

  start() {
    if (document.getElementById('promptcard-snipper-overlay')) return;

    this.overlay = document.createElement('div');
    this.overlay.id = 'promptcard-snipper-overlay';

    this.overlay.innerHTML = `
      <div class="pc-snip-hint">✂️ 按住鼠标左键拖拽框选要提取提示词的区域 · 按 Esc 退出</div>
    `;

    document.body.appendChild(this.overlay);
    this.setupEvents();
  }

  setupEvents() {
    const onMouseDown = (e) => {
      if (e.target.closest('.pc-snip-toolbar')) return;
      this.isSelecting = true;
      this.startX = e.clientX;
      this.startY = e.clientY;

      if (this.selection) this.selection.remove();

      this.selection = document.createElement('div');
      this.selection.className = 'pc-snip-selection';
      this.overlay.appendChild(this.selection);
    };

    const onMouseMove = (e) => {
      if (!this.isSelecting || !this.selection) return;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const x = Math.min(this.startX, currentX);
      const y = Math.min(this.startY, currentY);
      const w = Math.abs(currentX - this.startX);
      const h = Math.abs(currentY - this.startY);

      this.selection.style.left = `${x}px`;
      this.selection.style.top = `${y}px`;
      this.selection.style.width = `${w}px`;
      this.selection.style.height = `${h}px`;

      this.cropCoords = { x, y, w, h };
    };

    const onMouseUp = () => {
      if (!this.isSelecting) return;
      this.isSelecting = false;

      if (!this.cropCoords || this.cropCoords.w < 20 || this.cropCoords.h < 20) {
        if (this.selection) this.selection.remove();
        this.selection = null;
        return;
      }

      this.showSelectionToolbar();
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        this.destroy();
      }
    };

    this.overlay.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);

    this.cleanup = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }

  showSelectionToolbar() {
    const existingToolbar = this.selection.querySelector('.pc-snip-toolbar');
    if (existingToolbar) existingToolbar.remove();

    const toolbar = document.createElement('div');
    toolbar.className = 'pc-snip-toolbar';
    toolbar.innerHTML = `
      <button class="pc-snip-btn-confirm" id="pc-snip-confirm">✨ 提取提示词</button>
      <button class="pc-snip-btn-cancel" id="pc-snip-cancel">取消</button>
    `;

    const dim = document.createElement('div');
    dim.className = 'pc-snip-dimensions';
    dim.innerText = `${Math.round(this.cropCoords.w)} × ${Math.round(this.cropCoords.h)} px`;
    this.selection.appendChild(dim);
    this.selection.appendChild(toolbar);

    document.getElementById('pc-snip-confirm').onclick = (e) => {
      e.stopPropagation();
      this.captureAndAnalyze();
    };

    document.getElementById('pc-snip-cancel').onclick = (e) => {
      e.stopPropagation();
      this.destroy();
    };
  }

  async captureAndAnalyze() {
    const coords = { ...this.cropCoords };
    this.destroy();

    const card = window.__promptCardInstance || new FloatingPromptCard();
    window.__promptCardInstance = card;
    card.showLoading();

    chrome.runtime.sendMessage({ action: 'CAPTURE_TAB' }, (res) => {
      if (!res || !res.success) {
        alert('截图失败: ' + (res?.error || '请刷新页面重试'));
        card.destroy();
        return;
      }

      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        canvas.width = coords.w * dpr;
        canvas.height = coords.h * dpr;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          img,
          coords.x * dpr,
          coords.y * dpr,
          coords.w * dpr,
          coords.h * dpr,
          0,
          0,
          coords.w * dpr,
          coords.h * dpr
        );

        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.95);

        chrome.runtime.sendMessage({
          action: 'ANALYZE_IMAGE',
          imageBase64: croppedBase64,
          mimeType: 'image/jpeg',
          imageMeta: { width: coords.w, height: coords.h }
        }, (analysisRes) => {
          if (!analysisRes || !analysisRes.success) {
            alert('分析提示词失败: ' + (analysisRes?.error || '未知错误'));
            card.destroy();
            return;
          }
          card.renderResult(analysisRes, croppedBase64);
        });
      };
      img.src = res.dataUrl;
    });
  }

  destroy() {
    if (this.cleanup) this.cleanup();
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

let lastRightClickedElement = null;
document.addEventListener('contextmenu', (e) => {
  lastRightClickedElement = e.target;
}, true);

async function extractImageBase64(srcUrl, targetElement = null) {
  const el = targetElement ||
             lastRightClickedElement ||
             document.querySelector(`img[src="${srcUrl}"]`) ||
             document.querySelector(`img[currentSrc="${srcUrl}"]`) ||
             Array.from(document.querySelectorAll('img')).find(img => img.src === srcUrl || img.currentSrc === srcUrl);

  // Method 1: Background Service Worker Fetch (Highest reliability, full <all_urls> permission, immune to CORS and tainted canvas)
  if (srcUrl && srcUrl.startsWith('http')) {
    try {
      const bgRes = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'FETCH_IMAGE_AS_BASE64',
          url: srcUrl,
          pageUrl: window.location.href
        }, resolve);
      });
      if (bgRes && bgRes.success && bgRes.base64) {
        return {
          base64: bgRes.base64,
          mimeType: bgRes.mimeType || 'image/jpeg',
          width: el?.naturalWidth || 1024,
          height: el?.naturalHeight || 1024
        };
      }
    } catch (bgErr) {}
  }

  // Method 2: In-DOM direct Canvas draw (For same-origin or pre-authorized images)
  if (el && el.tagName === 'IMG' && el.complete && el.naturalWidth > 0) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = el.naturalWidth;
      canvas.height = el.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(el, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      if (dataUrl && dataUrl.length > 200 && !dataUrl.startsWith('data:,')) {
        return { base64: dataUrl, mimeType: 'image/jpeg', width: el.naturalWidth, height: el.naturalHeight };
      }
    } catch (corsErr) {}
  }

  // Method 3: In-page fetch
  if (srcUrl) {
    try {
      const res = await fetch(srcUrl, { credentials: 'include' });
      if (res.ok) {
        const blob = await res.blob();
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        return { base64, mimeType: blob.type || 'image/jpeg' };
      }
    } catch (inPageErr) {}
  }

  // Method 4: Viewport screenshot and bounding-rect crop (Guaranteed fallback for protected elements)
  if (el) {
    try {
      const rect = el.getBoundingClientRect();
      if (rect.width > 10 && rect.height > 10) {
        const capRes = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'CAPTURE_TAB' }, resolve);
        });

        if (capRes && capRes.success && capRes.dataUrl) {
          const croppedBase64 = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const dpr = window.devicePixelRatio || 1;
              const canvas = document.createElement('canvas');
              canvas.width = Math.max(1, rect.width * dpr);
              canvas.height = Math.max(1, rect.height * dpr);
              const ctx = canvas.getContext('2d');

              ctx.drawImage(
                img,
                rect.x * dpr,
                rect.y * dpr,
                rect.width * dpr,
                rect.height * dpr,
                0,
                0,
                rect.width * dpr,
                rect.height * dpr
              );
              resolve(canvas.toDataURL('image/jpeg', 0.95));
            };
            img.onerror = reject;
            img.src = capRes.dataUrl;
          });

          return { base64: croppedBase64, mimeType: 'image/jpeg', width: rect.width, height: rect.height };
        }
      }
    } catch (cropErr) {}
  }

  throw new Error('无法获取该图片，请使用快捷键 Alt+Shift+P 框选截取提取。');
}

const promptCard = new FloatingPromptCard();
window.__promptCardInstance = promptCard;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_IMAGE_PROMPT') {
    promptCard.showLoading(request.srcUrl);

    extractImageBase64(request.srcUrl, lastRightClickedElement)
      .then((imgData) => {
        chrome.runtime.sendMessage({
          action: 'ANALYZE_IMAGE',
          imageBase64: imgData.base64,
          mimeType: imgData.mimeType,
          imageMeta: { width: imgData.width, height: imgData.height }
        }, (analysisRes) => {
          if (!analysisRes || !analysisRes.success) {
            alert('解析失败: ' + (analysisRes?.error || '请检查设置中的 API Key'));
            promptCard.destroy();
            return;
          }
          promptCard.renderResult(analysisRes, imgData.base64);
        });
      })
      .catch((err) => {
        alert('获取图片失败: ' + err.message);
        promptCard.destroy();
      });

    sendResponse({ received: true });
  }

  if (request.action === 'START_SCREEN_SNIPPER') {
    const snipper = new ScreenSnipperOverlay();
    snipper.start();
    sendResponse({ received: true });
  }
});
