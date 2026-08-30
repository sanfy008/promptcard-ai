import { StorageService } from "../lib/storage.js";

document.addEventListener('DOMContentLoaded', async () => {
  await updateStatus();
  await renderRecentHistory();
  setupEventListeners();
});

async function updateStatus() {
  const settings = await StorageService.getSettings();
  const providerNames = {
    mock: '离线演示模式 (Mock AI)',
    gemini: `Google Gemini (${settings.models?.gemini || '1.5-flash'})`,
    openai: `OpenAI (${settings.models?.openai || 'gpt-4o'})`,
    claude: `Anthropic Claude (${settings.models?.claude || '3.5'})`,
    custom: `自定义 (${settings.models?.custom || 'gpt-4o'})`
  };

  const statusText = document.getElementById('status-model-text');
  statusText.innerText = '当前引擎: ' + (providerNames[settings.provider] || '演示模式');
}

async function renderRecentHistory() {
  const history = await StorageService.getHistory();
  const listEl = document.getElementById('history-mini-list');
  if (!history || history.length === 0) {
    listEl.innerHTML = '<div class="empty-state">暂无历史记录，右键网页图片即可提取</div>';
    return;
  }

  const recent = history.slice(0, 3);
  listEl.innerHTML = recent.map(item => {
    const title = item.analysis?.subject || '视觉逆向提示词';
    const thumb = item.thumbnail || '';
    return `
      <div class="history-mini-item" data-id="${item.id}">
        ${thumb ? `<img src="${thumb}" class="history-mini-thumb" alt="thumb">` : `<div class="history-mini-thumb" style="display:flex;align-items:center;justify-content:center;font-size:12px;">✨</div>`}
        <span class="history-mini-title">${escapeHtml(title)}</span>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.history-mini-item').forEach(el => {
    el.onclick = () => {
      chrome.sidePanel?.open?.({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      window.close();
    };
  });
}

function setupEventListeners() {
  document.getElementById('btn-open-options').onclick = () => {
    chrome.runtime.openOptionsPage();
  };

  document.getElementById('btn-open-sidepanel').onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.windowId && chrome.sidePanel?.open) {
      chrome.sidePanel.open({ windowId: tab.windowId });
    }
    window.close();
  };

  document.getElementById('btn-view-all-history').onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.windowId && chrome.sidePanel?.open) {
      chrome.sidePanel.open({ windowId: tab.windowId });
    }
    window.close();
  };

  document.getElementById('btn-snip-screen').onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'START_SCREEN_SNIPPER' }).catch(async () => {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/content.js'] });
        await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content/content.css'] });
        chrome.tabs.sendMessage(tab.id, { action: 'START_SCREEN_SNIPPER' });
      });
      window.close();
    }
  };

  const uploadInput = document.getElementById('input-upload-file');
  uploadInput.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      chrome.sidePanel?.open?.({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      chrome.runtime.sendMessage({
        action: 'ANALYZE_IMAGE',
        imageBase64: base64,
        mimeType: file.type || 'image/jpeg',
        imageMeta: {}
      });
      window.close();
    };
    reader.readAsDataURL(file);
  };
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