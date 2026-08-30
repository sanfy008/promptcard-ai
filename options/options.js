import { StorageService } from "../lib/storage.js";
import { AIService } from "../lib/ai-service.js";

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

async function loadSettings() {
  const settings = await StorageService.getSettings();

  const providerRadios = document.querySelectorAll('input[name="opt-provider"]');
  providerRadios.forEach(r => {
    r.checked = (r.value === settings.provider);
  });
  updateFieldsVisibility(settings.provider);

  document.getElementById('opt-endpoint-openai').value = settings.endpoints?.openai || 'https://api.openai.com/v1';
  document.getElementById('opt-key-openai').value = settings.apiKeys?.openai || '';

  document.getElementById('opt-endpoint-gemini').value = settings.endpoints?.gemini || 'https://generativelanguage.googleapis.com/v1beta';
  document.getElementById('opt-key-gemini').value = settings.apiKeys?.gemini || '';

  document.getElementById('opt-endpoint-claude').value = settings.endpoints?.claude || 'https://api.anthropic.com/v1';
  document.getElementById('opt-key-claude').value = settings.apiKeys?.claude || '';
  document.getElementById('opt-model-claude').value = settings.models?.claude || 'claude-5-sonnet';

  document.getElementById('opt-endpoint-custom').value = settings.endpoints?.custom || 'https://api.openai.com/v1';
  document.getElementById('opt-key-custom').value = settings.apiKeys?.custom || '';
  document.getElementById('opt-model-custom').value = settings.models?.custom || 'qwen3.8-27b';

  // Populate cached models if available
  if (settings.cachedModelLists?.gemini?.length > 0) {
    populateModelSelect('opt-model-gemini', settings.cachedModelLists.gemini, settings.models?.gemini || 'gemini-3.7-flash');
  } else {
    document.getElementById('opt-model-gemini').value = settings.models?.gemini || 'gemini-3.7-flash';
  }

  if (settings.cachedModelLists?.openai?.length > 0) {
    populateModelSelect('opt-model-openai', settings.cachedModelLists.openai, settings.models?.openai || 'gpt-5.5-instant');
  } else {
    document.getElementById('opt-model-openai').value = settings.models?.openai || 'gpt-5.5-instant';
  }

  document.getElementById('opt-mj-v').value = settings.midjourneyPreset?.version || '6.1';
  document.getElementById('opt-mj-stylize').value = settings.midjourneyPreset?.stylize || 250;
  document.getElementById('opt-mj-style').value = settings.midjourneyPreset?.style || 'raw';
  document.getElementById('opt-mj-ar').value = settings.midjourneyPreset?.ar || 'auto';

  document.getElementById('opt-pref-lang').value = settings.defaultLanguage || 'en';
  document.getElementById('opt-pref-floating').value = String(settings.showFloatingCard !== false);
}

function updateFieldsVisibility(provider) {
  document.querySelectorAll('.opt-provider-fields').forEach(f => f.style.display = 'none');
  const target = document.getElementById(`fields-${provider}`);
  if (target) target.style.display = 'flex';
}

function populateModelSelect(selectId, modelList, currentSelected = '') {
  const select = document.getElementById(selectId);
  if (!select) return;

  const currentVal = currentSelected || select.value;
  select.innerHTML = '';

  modelList.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.innerText = m;
    select.appendChild(opt);
  });

  const customOpt = document.createElement('option');
  customOpt.value = 'custom';
  customOpt.innerText = '✎ 自定义手动输入模型名称...';
  select.appendChild(customOpt);

  if (modelList.includes(currentVal)) {
    select.value = currentVal;
  } else if (currentVal && currentVal !== 'custom') {
    const opt = document.createElement('option');
    opt.value = currentVal;
    opt.innerText = currentVal;
    select.insertBefore(opt, customOpt);
    select.value = currentVal;
  } else {
    select.value = modelList[0] || 'custom';
  }
}

function setupEventListeners() {
  document.querySelectorAll('input[name="opt-provider"]').forEach(radio => {
    radio.onchange = () => {
      updateFieldsVisibility(radio.value);
    };
  });

  // Domestic / Custom preset selector binding
  const presetCustom = document.getElementById('opt-preset-custom-select');
  const inputModelCustom = document.getElementById('opt-model-custom');
  if (presetCustom && inputModelCustom) {
    presetCustom.onchange = () => {
      if (presetCustom.value !== 'custom') {
        inputModelCustom.value = presetCustom.value;
      }
    };
  }

  // Dynamic Gemini Models Fetcher
  const btnFetchGemini = document.getElementById('opt-btn-fetch-gemini');
  btnFetchGemini.onclick = async () => {
    const apiKey = document.getElementById('opt-key-gemini').value.trim();
    const endpoint = document.getElementById('opt-endpoint-gemini').value.trim();
    if (!apiKey) {
      alert('请先在上方输入 Gemini API Key！');
      return;
    }

    btnFetchGemini.innerText = '⏳ 正在拉取 2026 最新模型列表...';
    try {
      const models = await AIService.fetchAvailableModels('gemini', apiKey, endpoint);
      if (models.length === 0) throw new Error('未获取到可用模型');

      populateModelSelect('opt-model-gemini', models, 'gemini-3.7-flash');

      const settings = await StorageService.getSettings();
      settings.cachedModelLists = settings.cachedModelLists || {};
      settings.cachedModelLists.gemini = models;
      await StorageService.saveSettings(settings);

      btnFetchGemini.innerText = `✅ 已成功获取 ${models.length} 个 Google 模型！`;
      setTimeout(() => {
        btnFetchGemini.innerText = '🔄 自动拉取/刷新 Google 最新 2026 模型列表';
      }, 3000);
      showToast(`✨ 成功拉取 ${models.length} 个 Google 模型！`);
    } catch (err) {
      alert('获取模型失败: ' + err.message);
      btnFetchGemini.innerText = '❌ 拉取失败，点击重试';
    }
  };

  // Dynamic OpenAI Models Fetcher
  const btnFetchOpenAI = document.getElementById('opt-btn-fetch-openai');
  btnFetchOpenAI.onclick = async () => {
    const apiKey = document.getElementById('opt-key-openai').value.trim();
    const endpoint = document.getElementById('opt-endpoint-openai').value.trim();
    if (!apiKey) {
      alert('请先在上方输入 OpenAI API Key！');
      return;
    }

    btnFetchOpenAI.innerText = '⏳ 正在拉取...';
    try {
      const models = await AIService.fetchAvailableModels('openai', apiKey, endpoint);
      const filtered = models.filter(m => m.includes('gpt') || m.includes('o1') || m.includes('o3') || m.includes('chatgpt') || m.includes('dall'));
      const listToUse = filtered.length > 0 ? filtered : models;

      populateModelSelect('opt-model-openai', listToUse, 'gpt-5.5-instant');

      const settings = await StorageService.getSettings();
      settings.cachedModelLists = settings.cachedModelLists || {};
      settings.cachedModelLists.openai = listToUse;
      await StorageService.saveSettings(settings);

      btnFetchOpenAI.innerText = `✅ 获取到 ${listToUse.length} 个模型！`;
      setTimeout(() => {
        btnFetchOpenAI.innerText = '🔄 刷新 OpenAI 2026 可用模型';
      }, 3000);
      showToast(`✨ 成功拉取 ${listToUse.length} 个 OpenAI 模型！`);
    } catch (err) {
      alert('获取模型失败: ' + err.message);
      btnFetchOpenAI.innerText = '❌ 拉取失败，点击重试';
    }
  };

  // Dynamic Custom Endpoint Fetcher
  const btnFetchCustom = document.getElementById('opt-btn-fetch-custom');
  if (btnFetchCustom) {
    btnFetchCustom.onclick = async () => {
      const apiKey = document.getElementById('opt-key-custom').value.trim();
      const endpoint = document.getElementById('opt-endpoint-custom').value.trim();
      if (!endpoint) {
        alert('请先输入自定义 Base URL！');
        return;
      }
      btnFetchCustom.innerText = '⏳ 正在获取...';
      try {
        const models = await AIService.fetchAvailableModels('custom', apiKey, endpoint);
        if (models.length > 0) {
          presetCustom.innerHTML = '';
          models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.innerText = m;
            presetCustom.appendChild(opt);
          });
          inputModelCustom.value = models[0];
          btnFetchCustom.innerText = `✅ 获取到 ${models.length} 个端点模型！`;
          showToast(`✨ 成功拉取 ${models.length} 个模型！`);
        }
      } catch (e) {
        alert('获取失败: ' + e.message);
        btnFetchCustom.innerText = '❌ 获取失败';
      }
    };
  }

  // Auto fetch Gemini models on key input blur if empty
  const keyInputGemini = document.getElementById('opt-key-gemini');
  keyInputGemini.onblur = () => {
    const val = keyInputGemini.value.trim();
    if (val.length > 20) {
      btnFetchGemini.click();
    }
  };

  document.getElementById('opt-btn-save').onclick = async () => {
    await saveCurrentSettings();
    showToast('✨ 配置已成功保存！');
  };

  document.getElementById('opt-btn-test').onclick = async () => {
    const provider = document.querySelector('input[name="opt-provider"]:checked')?.value || 'mock';
    const testResult = document.getElementById('opt-test-result');
    testResult.className = 'opt-test-result';
    testResult.innerText = '正在测试连接...';

    const settings = await getCurrentFormSettings();
    const apiKey = settings.apiKeys[provider];
    const endpoint = settings.endpoints[provider];
    const model = settings.models[provider];

    const res = await AIService.testConnection(provider, apiKey, endpoint, model);
    if (res.success) {
      testResult.className = 'opt-test-result success';
      testResult.innerText = '✅ ' + res.message;
    } else {
      testResult.className = 'opt-test-result error';
      testResult.innerText = '❌ ' + res.message;
    }
  };

  document.getElementById('opt-btn-export').onclick = async () => {
    const { url, count } = await StorageService.exportHistory();
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptcard-history-backup-${Date.now()}.json`;
    a.click();
    showToast(`已导出 ${count} 条历史记录！`);
  };

  const fileImport = document.getElementById('opt-file-import');
  document.getElementById('opt-btn-import').onclick = () => fileImport.click();
  fileImport.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await StorageService.importHistory(ev.target.result);
        showToast('✨ 历史记录导入成功！');
      } catch (err) {
        alert('导入失败: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  document.getElementById('opt-btn-reset').onclick = async () => {
    if (confirm('确定要清空全部历史记录吗？此操作无法撤销。')) {
      await StorageService.clearHistory(false);
      showToast('已清空全部历史数据');
    }
  };
}

async function getCurrentFormSettings() {
  const provider = document.querySelector('input[name="opt-provider"]:checked')?.value || 'mock';

  let geminiModel = document.getElementById('opt-model-gemini').value;
  if (geminiModel === 'custom') {
    geminiModel = document.getElementById('opt-model-gemini-custom').value.trim() || 'gemini-3.7-flash';
  }

  let openaiModel = document.getElementById('opt-model-openai').value;
  if (openaiModel === 'custom') {
    openaiModel = document.getElementById('opt-model-openai-custom').value.trim() || 'gpt-5.5-instant';
  }

  return {
    provider,
    endpoints: {
      openai: document.getElementById('opt-endpoint-openai').value.trim(),
      gemini: document.getElementById('opt-endpoint-gemini').value.trim(),
      claude: document.getElementById('opt-endpoint-claude').value.trim(),
      custom: document.getElementById('opt-endpoint-custom').value.trim()
    },
    apiKeys: {
      openai: document.getElementById('opt-key-openai').value.trim(),
      gemini: document.getElementById('opt-key-gemini').value.trim(),
      claude: document.getElementById('opt-key-claude').value.trim(),
      custom: document.getElementById('opt-key-custom').value.trim()
    },
    models: {
      openai: openaiModel,
      gemini: geminiModel,
      claude: document.getElementById('opt-model-claude').value,
      custom: document.getElementById('opt-model-custom').value.trim()
    },
    midjourneyPreset: {
      version: document.getElementById('opt-mj-v').value,
      stylize: document.getElementById('opt-mj-stylize').value,
      style: document.getElementById('opt-mj-style').value,
      ar: document.getElementById('opt-mj-ar').value
    },
    defaultLanguage: document.getElementById('opt-pref-lang').value,
    showFloatingCard: document.getElementById('opt-pref-floating').value === 'true'
  };
}

async function saveCurrentSettings() {
  const newSettings = await getCurrentFormSettings();
  await StorageService.saveSettings(newSettings);
}

function showToast(msg) {
  const toast = document.getElementById('opt-toast');
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}