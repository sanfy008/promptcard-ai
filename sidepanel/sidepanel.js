import { StorageService } from "../lib/storage.js";
import { PromptParser } from "../lib/prompt-parser.js";
import { AIService } from "../lib/ai-service.js";

let currentAnalysisData = null;
let currentTab = 'midjourney';
let currentLang = 'en';

document.addEventListener('DOMContentLoaded', async () => {
  await updateEngineHeader();
  setupNavigation();
  setupEvents();
  await renderHistoryList();
});

async function updateEngineHeader() {
  const settings = await StorageService.getSettings();
  const providerNames = {
    mock: '✨ 离线演示模式 (Mock)',
    gemini: `🌐 Google Gemini (${settings.models?.gemini || '1.5-flash'})`,
    openai: `🤖 OpenAI (${settings.models?.openai || 'gpt-4o'})`,
    claude: `🧠 Claude (${settings.models?.claude || '3.5'})`,
    custom: `⚡ 自定义 (${settings.models?.custom || 'gpt-4o'})`
  };
  document.getElementById('sp-header-engine').innerText = providerNames[settings.provider] || '离线演示模式';
}

function setupNavigation() {
  document.querySelectorAll('.sp-nav-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.sp-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sp-view').forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const viewId = `view-${btn.dataset.view}`;
      document.getElementById(viewId)?.classList.add('active');

      if (btn.dataset.view === 'history') {
        renderHistoryList();
      }
    };
  });
}

function setupEvents() {
  document.getElementById('sp-btn-options').onclick = () => chrome.runtime.openOptionsPage();

  document.getElementById('sp-btn-snip').onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'START_SCREEN_SNIPPER' }).catch(async () => {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/content.js'] });
        await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content/content.css'] });
        chrome.tabs.sendMessage(tab.id, { action: 'START_SCREEN_SNIPPER' });
      });
    }
  };

  const dropzone = document.getElementById('sp-dropzone');
  const fileInput = document.getElementById('sp-file-input');

  dropzone.onclick = () => fileInput.click();

  dropzone.ondragover = (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#6366f1';
  };

  dropzone.ondragleave = () => {
    dropzone.style.borderColor = 'rgba(255, 255, 255, 0.08)';
  };

  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  fileInput.onchange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  document.querySelectorAll('.sp-lang-pill').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.sp-lang-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = btn.dataset.lang;
      updatePromptDisplay();
    };
  });

  document.querySelectorAll('.sp-prompt-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.sp-prompt-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      updatePromptDisplay();
    };
  });

  document.getElementById('sp-btn-copy').onclick = () => {
    const text = document.getElementById('sp-prompt-content').innerText;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('sp-btn-copy');
      const origin = btn.innerText;
      btn.innerText = '✅ 已复制！';
      setTimeout(() => { btn.innerText = origin; }, 1500);
    });
  };

  document.getElementById('sp-btn-fav').onclick = async () => {
    if (!currentAnalysisData?.historyItem?.id) return;
    const updated = await StorageService.toggleFavorite(currentAnalysisData.historyItem.id);
    const item = updated.find(i => i.id === currentAnalysisData.historyItem.id);
    document.getElementById('sp-btn-fav').innerText = item?.favorite ? '⭐' : '☆';
  };

  document.getElementById('sp-history-search').oninput = (e) => {
    renderHistoryList(e.target.value.trim());
  };

  document.querySelectorAll('.sp-filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.sp-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderHistoryList(document.getElementById('sp-history-search').value.trim(), btn.dataset.filter === 'fav');
    };
  });
}

function handleImageFile(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    showLoading();

    try {
      const settings = await StorageService.getSettings();
      const analysis = await AIService.analyzeImage(base64, file.type, settings);

      const prompts = {
        midjourney: PromptParser.formatMidjourney(analysis, settings.midjourneyPreset),
        flux: PromptParser.formatFlux(analysis),
        stableDiffusion: PromptParser.formatStableDiffusion(analysis),
        dalle: PromptParser.formatDalle(analysis)
      };

      const tagCloud = PromptParser.extractTagCloud(analysis);

      const historyItem = {
        id: 'pc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        timestamp: Date.now(),
        thumbnail: base64.length < 500000 ? base64 : null,
        provider: settings.provider || 'mock',
        analysis,
        prompts,
        tagCloud,
        favorite: false
      };

      await StorageService.addHistoryItem(historyItem);
      renderAnalysisResult({ analysis, prompts, tagCloud, historyItem }, base64);
    } catch (err) {
      alert('解析失败: ' + err.message);
      hideLoading();
    }
  };
  reader.readAsDataURL(file);
}

function showLoading() {
  document.getElementById('sp-loading-card').style.display = 'flex';
  document.getElementById('sp-result-area').style.display = 'none';
}

function hideLoading() {
  document.getElementById('sp-loading-card').style.display = 'none';
}

function renderAnalysisResult(data, imageSrc = null) {
  hideLoading();
  currentAnalysisData = data;
  document.getElementById('sp-result-area').style.display = 'flex';

  if (imageSrc) {
    document.getElementById('sp-preview-img').src = imageSrc;
  }

  const analysis = data.analysis || {};
  document.getElementById('sp-meta-title').innerText = analysis.subject || '视觉解析完成';
  document.getElementById('sp-chip-ar').innerText = analysis.aspectRatio || '16:9';
  document.getElementById('sp-chip-style').innerText = analysis.style ? analysis.style.slice(0, 18) + '...' : 'Artistic';

  document.getElementById('sp-btn-fav').innerText = data.historyItem?.favorite ? '⭐' : '☆';

  updatePromptDisplay();
  renderTags(data.tagCloud);
}

function updatePromptDisplay() {
  if (!currentAnalysisData) return;
  const analysis = currentAnalysisData.analysis || {};
  const prompts = currentAnalysisData.prompts || {};
  const box = document.getElementById('sp-prompt-content');

  if (currentTab === 'midjourney') {
    box.innerText = prompts.midjourney || '';
  } else if (currentTab === 'flux') {
    box.innerText = prompts.flux || '';
  } else if (currentTab === 'sd') {
    const sd = prompts.stableDiffusion || {};
    box.innerText = `【Positive】\n${sd.positive || ''}\n\n【Negative】\n${sd.negative || ''}`;
  } else if (currentTab === 'dalle') {
    box.innerText = prompts.dalle || '';
  } else if (currentTab === 'breakdown') {
    let loc = analysis;
    if (currentLang !== 'en' && analysis.translations && analysis.translations[currentLang]) {
      loc = { ...analysis, ...analysis.translations[currentLang] };
    }
    box.innerText = [
      `🎯 主体: ${loc.subject || 'N/A'}`,
      `🎨 风格: ${loc.style || 'N/A'}`,
      `💡 光影: ${loc.lighting || 'N/A'}`,
      `📐 构图: ${loc.composition || ''} ${loc.camera || ''}`,
      `🌈 配色: ${loc.colorPalette || 'N/A'}`,
      `🔮 氛围: ${loc.atmosphere || 'N/A'}`
    ].join('\n\n');
  }
}

function renderTags(tagCloud) {
  const wrapper = document.getElementById('sp-tags-wrapper');
  wrapper.innerHTML = '';
  if (!tagCloud) return;

  Object.entries(tagCloud).forEach(([key, tags]) => {
    if (!tags || tags.length === 0) return;
    const group = document.createElement('div');
    group.className = 'sp-tag-group';
    group.innerHTML = `
      <div style="font-size:10.5px;color:#a1a1aa;margin:6px 0 2px;">${key.toUpperCase()}</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${tags.map(t => `<span class="sp-tag-chip" style="background:#27272a;padding:2px 6px;border-radius:4px;font-size:10px;cursor:pointer;">${escapeHtml(t)}</span>`).join('')}
      </div>
    `;
    wrapper.appendChild(group);
  });

  wrapper.querySelectorAll('.sp-tag-chip').forEach(chip => {
    chip.onclick = () => {
      navigator.clipboard.writeText(chip.innerText);
    };
  });
}

async function renderHistoryList(searchQuery = '', favOnly = false) {
  const history = await StorageService.getHistory();
  const listEl = document.getElementById('sp-history-list');

  let filtered = history;
  if (favOnly) {
    filtered = filtered.filter(i => i.favorite);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(i => {
      const s = JSON.stringify(i.analysis || {}).toLowerCase();
      return s.includes(q);
    });
  }

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="sp-empty-history">暂无匹配的历史记录</div>';
    return;
  }

  listEl.innerHTML = filtered.map(item => {
    const title = item.analysis?.subject || '视觉解析记录';
    const time = new Date(item.timestamp).toLocaleString();
    const thumb = item.thumbnail;
    return `
      <div class="sp-history-card" data-id="${item.id}">
        <div style="display:flex;gap:8px;align-items:center;">
          ${thumb ? `<img src="${thumb}" style="width:36px;height:36px;border-radius:4px;object-fit:cover;">` : `<div style="width:36px;height:36px;background:#27272a;border-radius:4px;display:flex;align-items:center;justify-content:center;">✨</div>`}
          <div style="flex:1;overflow:hidden;">
            <div style="font-size:11.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(title)}</div>
            <div style="font-size:10px;color:#71717a;">${time} · ${item.provider || 'mock'}</div>
          </div>
          <span>${item.favorite ? '⭐' : ''}</span>
        </div>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.sp-history-card').forEach(el => {
    el.onclick = () => {
      const item = history.find(i => i.id === el.dataset.id);
      if (item) {
        document.querySelectorAll('.sp-nav-btn')[0].click();
        renderAnalysisResult(item, item.thumbnail);
      }
    };
  });
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}