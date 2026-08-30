const SYSTEM_PROMPT = `You are PromptCard, the world's premier AI prompt reverse-engineering specialist.
Analyze the provided image in extreme, professional detail to reverse-engineer the prompt that could reproduce this exact visual aesthetic, subject, composition, and mood across Midjourney v6, FLUX, Stable Diffusion, and DALL-E 3.

Return ONLY a valid JSON object matching the following structure (no markdown formatting, no code fence blocks):
{
  "subject": "Clear and detailed description of the primary subject, character features, clothing, poses, expressions",
  "environment": "Setting, background details, architecture, nature, indoor/outdoor context",
  "style": "Specific artistic style, medium, genre, artist inspirations or artistic technique",
  "lighting": "Lighting setup, light sources, direction, quality, shadows, volumetric effects",
  "composition": "Framing, camera angle, shot type, focal length, perspective, balance",
  "camera": "Camera model, lens type, aperture, depth of field, film stock (if photographic)",
  "colorPalette": "Dominant colors, accent colors, color grading, saturation, harmony",
  "atmosphere": "Emotional tone, mood, vibe, ambiance",
  "renderingDetails": "Surface textures, materials, reflections, render engine qualities (e.g. Octane render, raytracing, subsurface scattering)",
  "negativePrompt": "Suggested negative prompt tags to prevent distortion or common artifacts for this specific image style",
  "suggestedStylize": 250,
  "translations": {
    "zh-CN": {
      "subject": "主体详细中文描述",
      "environment": "环境与背景中文描述",
      "style": "艺术风格与媒介",
      "lighting": "光影光效与明暗",
      "composition": "构图与镜头视角",
      "colorPalette": "色彩搭配与色调",
      "atmosphere": "情绪与氛围"
    }
  }
}`;

const MOCK_PRESETS = [
  {
    "subject": "Cinematic portrait of an ethereal cyberpunk female explorer with glowing bioluminescent neon accents, wearing detailed futuristic streetwear jacket",
    "environment": "Rainy futuristic neo-Tokyo alleyway illuminated by vibrant holographic neon billboards and reflections in wet pavement puddles",
    "style": "Cinematic cyberpunk concept art, hyper-detailed digital illustration, Blade Runner 2049 aesthetic, Octane 3D render",
    "lighting": "High-contrast neon backlighting, vibrant cyan and magenta rim light, soft ambient glow, volumetric fog rays",
    "composition": "Medium close-up shot, eye-level angle, shallow depth of field, centered focal point with leading lines in background",
    "camera": "Shot on 85mm f/1.4 lens, cinematic anamorphic bokeh, 8k resolution, photorealistic clarity",
    "colorPalette": "Electric cyan, hot magenta, deep midnight obsidian, neon violet, amber accent highlights",
    "atmosphere": "Futuristic, enigmatic, atmospheric, gritty yet mesmerizing, cyberpunk noir",
    "renderingDetails": "Subsurface skin scattering, intricate fabric embroidery, raytraced wet reflections, micro-detail metal textures",
    "negativePrompt": "low quality, blurry, deformed anatomy, distorted fingers, watermark, oversaturated artifacts, 2d cartoon",
    "suggestedStylize": 250,
    "translations": {
      "zh-CN": {
        "subject": "身着精致未来机能风夹克、带有发光生物荧光纹路的赛博朋克女性探险者特写肖像",
        "environment": "雨后的新东京未来街道，街道水洼倒映着绚丽的全息霓虹招牌与路灯",
        "style": "电影级赛博朋克概念艺术，超细腻数字插画，《银翼杀手2049》视觉美学，Octane 3D渲染",
        "lighting": "高对比度霓虹逆光，青色与品红色轮廓光，柔和环境辉光，丁达尔体积雾效",
        "composition": "中近景特写构图，平视角度，浅景深虚化背景，主体居中",
        "colorPalette": "电光青、霓虹洋红、午夜暗黑、荧光紫、琥珀色高光",
        "atmosphere": "未来主义、神秘深邃、赛博朋克黑色电影质感"
      }
    }
  },
  {
    "subject": "Majestic snow-capped mountain peaks soaring above a serene crystal-clear glacial alpine lake, pine evergreen forest along the shoreline",
    "environment": "Swiss Alps backcountry wilderness at golden hour dawn, soft low-hanging mist drifting across the turquoise water surface",
    "style": "National Geographic landscape photography, ultra-realistic fine art nature photography, Hasselblad medium format clarity",
    "lighting": "Warm golden morning sunlight illuminating mountain ridges, gentle soft ambient sky fill, crystal clear water reflections",
    "composition": "Wide-angle landscape shot, rule of thirds, dramatic foreground leading lines with alpine rocks and still water reflections",
    "camera": "Shot on Hasselblad H6D-100c, 24mm f/8, ISO 64, infinite depth of field, ultra-sharp detail",
    "colorPalette": "Turquoise glacial blue, warm morning amber, alpine emerald green, granite gray, crisp white snow",
    "atmosphere": "Tranquil, awe-inspiring, peaceful, pure, sublime natural serenity",
    "renderingDetails": "Ultra-high dynamic range, crystal clear water ripples, micro rock textures, individual pine needle sharpness",
    "negativePrompt": "oversaturated, noisy, blurry, modern buildings, power lines, low contrast, haze artifacts",
    "suggestedStylize": 150,
    "translations": {
      "zh-CN": {
        "subject": "雄伟的雪山峰峦耸立于清澈透亮的高山冰川湖之上，湖畔环绕着沉静的松树林",
        "environment": "阿尔卑斯山自然荒野的金色黎明，柔和的薄雾在绿松石色湖面上缓缓流淌",
        "style": "国家地理风光摄影，超写实顶级自然艺术，哈苏中画幅极致清晰度",
        "lighting": "温暖的早晨金色阳光照亮雪山山脊，柔和的天空环境光，倒映着完美镜面倒影",
        "composition": "广角风景构图，三分法，前景高山礁石与平静湖水引导线",
        "colorPalette": "冰川湖蓝、晨曦暖金、椎木翠绿、花岗岩灰、纯净雪白",
        "atmosphere": "宁静、空灵、宏伟、神圣而纯粹的大自然之美"
      }
    }
  },
  {
    "subject": "A nostalgic anime student gazing into a vast dramatic twilight sky filled with blooming volumetric cumulus clouds and twinkling stars",
    "environment": "A tranquil countryside train station platform surrounded by blossoming pink cherry blossom trees and distant hills",
    "style": "Makoto Shinkai anime aesthetic, CoMix Wave Films visual style, vibrant painterly anime background art, 4k wallpaper quality",
    "lighting": "Radiant golden twilight rays bursting through clouds, glowing lens flares, soft pastel evening twilight glow",
    "composition": "Atmospheric wide shot, character in lower-left third looking upwards, immense panoramic sky filling upper canvas",
    "camera": "Cinematic anime perspective, hand-painted digital background, vivid dynamic range",
    "colorPalette": "Lavender purple, coral sunset orange, azure sky blue, sakura pink, luminous golden amber",
    "atmosphere": "Nostalgic, romantic, wistful, dreamy, deeply emotional and serene",
    "renderingDetails": "Hand-painted cloud brush textures, floating cherry blossom petals with motion blur, glistening light reflections",
    "negativePrompt": "photorealistic, 3d render, western comic, dull colors, dark gritty, muddy textures",
    "suggestedStylize": 300,
    "translations": {
      "zh-CN": {
        "subject": "一位怀旧风格的动漫学生仰望着庄严而漫长的暮色天空，天空中绽放着层叠的体积云与闪烁的繁星",
        "environment": "宁静的乡间电车月台，身旁环绕着盛开的粉色樱花树与远山",
        "style": "新海诚动漫美学，CoMix Wave Films 视觉风格，绚丽的绘画动漫背景，4K壁纸级质感",
        "lighting": "暖金色夕阳余晖穿透云层，透亮的镜头光晕，柔美的粉紫色暮光",
        "composition": "空气感全景构图，人物位于左下三分之一仰望天际，天空占据画面主体",
        "colorPalette": "薰衣草紫、珊瑚晚霞橙、蔚蓝天空、樱花粉、琥珀金",
        "atmosphere": "怅惘、浪漫、唯美梦幻、激荡心弦的青春情感"
      }
    }
  },
  {
    "subject": "High-fashion editorial portrait of a charismatic model wearing a tailored sculptural haute-couture avant-garde minimalist garment",
    "environment": "Monochromatic luxury studio background with soft geometric concrete architectural blocks and subtle cast shadows",
    "style": "Vogue cover editorial photography, high-end commercial fashion, sleek contemporary aesthetics",
    "lighting": "Professional Profoto softbox studio lighting, gentle wrap-around key light, delicate specular catchlights in eyes",
    "composition": "Centered vertical portrait, dramatic upper-body framing, perfect facial symmetry with subtle angle tilt",
    "camera": "Shot on Phase One XF IQ4 150MP, Schneider Kreuznach 110mm LS f/2.8, razor sharp focus",
    "colorPalette": "Warm alabaster, rich charcoal, champagne cream, muted bronze, natural skin tones",
    "atmosphere": "Sophisticated, elegant, commanding, refined, contemporary luxury",
    "renderingDetails": "Ultra-fine pore texture, realistic skin micro-details, crisp silk garment weave, flawless matte makeup",
    "negativePrompt": "plastic skin, over-retouched, cartoon, cartoonish, low resolution, bad hands, blown out highlights",
    "suggestedStylize": 100,
    "translations": {
      "zh-CN": {
        "subject": "身着前卫结构感高级定制极简服饰的高级时尚杂志封面模特肖像",
        "environment": "单色调奢华摄影棚，灰白色几何混凝土艺术块与细腻的空间投影",
        "style": "《VOGUE》时尚美妆大片摄影，高端商业时装秀，现代先锋美学",
        "lighting": "专业 Profoto 柔光箱布光，柔和环绕主光，眼睛中精致明亮的漂亮眼神光",
        "composition": "精确居中竖向肖像，上半身视觉聚焦，完美的面部骨相与微侧角度",
        "colorPalette": "暖白江石、高级炭黑、香槟奶油、亚光霞金、真实透亮肤色",
        "atmosphere": "高雅、自信、前卫、稍带高冷的当代奢华气质"
      }
    }
  },
  {
    "subject": "An adorable fluffy magical mythical creature sitting cheerfully with large sparkling expressive eyes and glowing tiny antennas",
    "environment": "An enchanted fairytale forest clearing filled with glowing neon mushrooms, sparkling fairy dust, and soft mossy stones",
    "style": "Pixar 3D animation style, Disney modern concept character design, Unreal Engine 5 render, cute whimsical aesthetic",
    "lighting": "Magical bioluminescent mushroom glow, warm rim lighting on soft fur, dappled fairy forest sunbeams",
    "composition": "Close-up front angle, character centered with playful slight head tilt, warm blurred background",
    "camera": "3D camera render, 50mm portrait lens, shallow depth of field, Octane render quality",
    "colorPalette": "Pastel mint turquoise, warm peach coral, glowing luminescent gold, soft forest lavender",
    "atmosphere": "Charming, heartwarming, playful, whimsical, magical wonder",
    "renderingDetails": "Individual micro-hair grooming strands, soft subsurface skin scattering, crystal refraction in eyes, velvet fur texture",
    "negativePrompt": "creepy, scary, photorealistic human, dark, gritty, low poly, noisy, distorted eyes",
    "suggestedStylize": 200,
    "translations": {
      "zh-CN": {
        "subject": "一只萌态可掬、毛茸茸的魔法幻兽幼崽，拥有水汪汪的发光大眼睛与可爱的小触角",
        "environment": "梦幻的童话森林空地，四周点缀着发光的荧光蘑菇、飘浮的精灵微光与柔软的苔藓",
        "style": "皮克斯3D动画电影风格，迪士尼角色设计，Unreal Engine 5渲染，可爱治愈系美学",
        "lighting": "自发光蘑菇的神秘荧光，毛发边缘温暖的金色轮廓光，森林丁达尔光",
        "composition": "特写正面视角，主体居中带有俏皮的歪头动作，柔和的背景虚化",
        "colorPalette": "薄荷粉绿、汽水蜜桃粉、灵动金黄、森林薰衣草紫",
        "atmosphere": "治愈、温馨、梦幻、充满童趣与好奇心"
      }
    }
  },
  {
    "subject": "An enigmatic classical noble figure in ornate velvet baroque drapery with intricate gold embroidery and lace collar",
    "environment": "A dimly lit antique library with dark mahogany wood bookshelves, leather-bound tomes, and an ornate golden candelabra",
    "style": "Rembrandt chiaroscuro oil painting, Caravaggio dramatic lighting technique, Renaissance museum masterpiece",
    "lighting": "Extreme chiaroscuro lighting, single candle flame light source illuminating facial features, deep rich shadow gradients",
    "composition": "Three-quarters profile portrait, classical painterly framing, golden ratio balance",
    "camera": "Oil on canvas texture, historical oil glaze layers, fine craquelure varnish finish",
    "colorPalette": "Deep burnt umber, Venetian red, rich imperial gold, raw sienna, shadowed obsidian",
    "atmosphere": "Solemn, intellectual, dramatic, timeless, historical gravitas",
    "renderingDetails": "Visible impasto brushwork, authentic canvas weave texture, cracked antique varnish, realistic fabric weight",
    "negativePrompt": "digital art, anime, modern, smooth plastic, 3d render, bright modern neon, photographic",
    "suggestedStylize": 400,
    "translations": {
      "zh-CN": {
        "subject": "身着缀有精美金丝刺绣与蕾丝领的古典华贵丝绒巴洛克长袍的神秘贵族肖像",
        "environment": "暗光的古董图书馆，身后是深色红木书架、皮革典籍与华丽的金属烛台",
        "style": "伦勃朗明暗对照法油画，卡拉瓦乔火光渲染，文艺复兴博物馆珍藏名画",
        "lighting": "极致的明暗对照法，微弱的蜡烛烛光照亮面部骨骼，深邃浓重的古典暗部",
        "composition": "侧面三分之二古典肖像构图，黄金分割美学布局",
        "colorPalette": "焦褐色、威尼斯深红、宫廷金黄、黄棕石色、深邃油画黑",
        "atmosphere": "庄重、典雅、历史厚重感、文艺复兴古典韵味"
      }
    }
  }
];

export const AIService = {
  async analyzeImage(imageBase64, mimeType = "image/jpeg", settings = {}, imageMeta = {}) {
    const provider = settings.provider || "mock";
    let rawBase64 = imageBase64;
    if (imageBase64.includes("base64,")) {
      rawBase64 = imageBase64.split("base64,")[1];
      const match = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      if (match) mimeType = match[1];
    }

    try {
      let analysisResult;
      switch (provider) {
        case "mock":
          analysisResult = await this._callMock(imageBase64, imageMeta);
          break;
        case "openai":
          analysisResult = await this._callOpenAI(rawBase64, mimeType, settings);
          break;
        case "gemini":
          analysisResult = await this._callGemini(rawBase64, mimeType, settings);
          break;
        case "claude":
          analysisResult = await this._callClaude(rawBase64, mimeType, settings);
          break;
        case "custom":
          analysisResult = await this._callCustomOpenAI(rawBase64, mimeType, settings);
          break;
        default:
          analysisResult = await this._callMock(imageBase64, imageMeta);
          break;
      }

      if (imageMeta.width && imageMeta.height) {
        analysisResult.width = imageMeta.width;
        analysisResult.height = imageMeta.height;
      }

      analysisResult._provider = provider;
      return analysisResult;
    } catch (err) {
      console.error("AIService error:", err);
      throw err;
    }
  },

  async _callOpenAI(base64, mimeType, settings) {
    const apiKey = settings.apiKeys?.openai;
    if (!apiKey) throw new Error("请在设置中配置 OpenAI API Key");

    const endpoint = (settings.endpoints?.openai || "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = settings.models?.openai || "gpt-4o-mini";

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image and return the structured reverse-engineered prompt JSON." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        temperature: settings.temperature || 0.3,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API 请求失败 (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return this._safeJsonParse(content);
  },

  async _callGemini(base64, mimeType, settings) {
    const apiKey = settings.apiKeys?.gemini;
    if (!apiKey) throw new Error("请在设置中配置 Google Gemini API Key (可前往 aistudio.google.com 免费获取)");

    let endpoint = (settings.endpoints?.gemini || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, "");
    const model = settings.models?.gemini || "gemini-1.5-flash";

    const url = `${endpoint}/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${SYSTEM_PROMPT}\n\nAnalyze this image and return the structured reverse-engineered prompt JSON.` },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64
                }
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: settings.temperature || 0.3,
          maxOutputTokens: 2500
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API 请求失败 (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return this._safeJsonParse(text);
  },

  async _callClaude(base64, mimeType, settings) {
    const apiKey = settings.apiKeys?.claude;
    if (!apiKey) throw new Error("请在设置中配置 Anthropic Claude API Key");

    const endpoint = (settings.endpoints?.claude || "https://api.anthropic.com/v1").replace(/\/+$/, "");
    const model = settings.models?.claude || "claude-3-5-sonnet-20241022";

    let validMime = mimeType;
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(validMime)) {
      validMime = "image/jpeg";
    }

    const response = await fetch(`${endpoint}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: model,
        system: SYSTEM_PROMPT,
        max_tokens: 2500,
        temperature: settings.temperature || 0.3,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: validMime,
                  data: base64
                }
              },
              {
                type: "text",
                text: "Analyze this image and return the structured reverse-engineered prompt JSON only."
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API 请求失败 (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    return this._safeJsonParse(text);
  },

  async _callCustomOpenAI(base64, mimeType, settings) {
    const endpoint = (settings.endpoints?.custom || "https://api.openai.com/v1").replace(/\/+$/, "");
    const apiKey = settings.apiKeys?.custom || "sk-none";
    const model = settings.models?.custom || "gpt-4o";

    const headers = { "Content-Type": "application/json" };
    if (apiKey && apiKey !== "sk-none") {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image and return the structured reverse-engineered prompt JSON." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`
                }
              }
            ]
          }
        ],
        temperature: settings.temperature || 0.3,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`自定义 API 请求失败 (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return this._safeJsonParse(content);
  },

  async _callMock(imageBase64 = "", imageMeta = {}) {
    await new Promise(r => setTimeout(r, 350));

    let hash = 0;
    const len = imageBase64.length;
    for (let i = 0; i < Math.min(len, 8000); i += 19) {
      hash = ((hash << 5) - hash) + imageBase64.charCodeAt(i);
      hash |= 0;
    }
    if (imageMeta.width && imageMeta.height) {
      hash += imageMeta.width * 31 + imageMeta.height * 17;
    }
    hash = Math.abs(hash);

    const selected = MOCK_PRESETS[hash % MOCK_PRESETS.length];
    return JSON.parse(JSON.stringify(selected));
  },

  _safeJsonParse(text) {
    if (!text) throw new Error("AI 返回内容为空");
    let clean = text.trim();

    if (clean.startsWith("```")) {
      clean = clean.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
    }

    try {
      return JSON.parse(clean);
    } catch (e) {
      const start = clean.indexOf("{");
      const end = clean.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        const sub = clean.substring(start, end + 1);
        try {
          return JSON.parse(sub);
        } catch (e2) {
          throw new Error("解析 AI 响应 JSON 格式失败: " + e2.message);
        }
      }
      throw new Error("未在 AI 响应中找到有效的 JSON 结构");
    }
  },

  // Dynamic model fetcher for Gemini, OpenAI and Custom endpoints
  async fetchAvailableModels(provider, apiKey, endpoint = "") {
    if (provider === "gemini") {
      if (!apiKey) throw new Error("请先填写 Google Gemini API Key");
      const url = (endpoint || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, "");
      const res = await fetch(`${url}/models?key=${apiKey}`);
      if (!res.ok) {
        throw new Error(`获取 Gemini 模型失败 HTTP ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      if (!data.models || !Array.isArray(data.models)) {
        throw new Error("Gemini 返回的模型列表格式不符合预期");
      }
      // Filter models that support content generation and vision
      const list = data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace(/^models\//, ""))
        .filter(name => !name.includes("embedding") && !name.includes("aqa"));
      
      return list;
    } else if (provider === "openai" || provider === "custom") {
      const url = (endpoint || "https://api.openai.com/v1").replace(/\/+$/, "");
      const headers = {};
      if (apiKey && apiKey !== "sk-none") {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      const res = await fetch(`${url}/models`, { headers });
      if (!res.ok) {
        throw new Error(`获取模型列表失败 HTTP ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("返回的模型列表格式不符合预期");
      }
      return data.data.map(m => m.id);
    }
    return [];
  },

  async testConnection(provider, apiKey, endpoint, model) {
    if (provider === "mock") {
      return { success: true, message: "离线演示模式连接正常（无需 API Key）" };
    }

    try {
      if (provider === "openai" || provider === "custom") {
        const url = (endpoint || "https://api.openai.com/v1").replace(/\/+$/, "");
        const res = await fetch(`${url}/models`, {
          headers: apiKey && apiKey !== "sk-none" ? { "Authorization": `Bearer ${apiKey}` } : {}
        });
        if (res.ok) {
          return { success: true, message: "API 连接成功！" };
        } else {
          return { success: false, message: `连接失败 HTTP ${res.status}: ${await res.text()}` };
        }
      } else if (provider === "gemini") {
        const url = (endpoint || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, "");
        const res = await fetch(`${url}/models?key=${apiKey}`);
        if (res.ok) {
          return { success: true, message: "Gemini API 连接成功！" };
        } else {
          return { success: false, message: `Gemini 连接失败 HTTP ${res.status}: ${await res.text()}` };
        }
      } else if (provider === "claude") {
        const url = (endpoint || "https://api.anthropic.com/v1").replace(/\/+$/, "");
        const res = await fetch(`${url}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
          },
          body: JSON.stringify({
            model: model || "claude-3-haiku-20240307",
            max_tokens: 10,
            messages: [{ role: "user", content: "hi" }]
          })
        });
        if (res.ok) {
          return { success: true, message: "Claude API 连接成功！" };
        } else {
          return { success: false, message: `Claude 连接失败 HTTP ${res.status}: ${await res.text()}` };
        }
      }
    } catch (e) {
      return { success: false, message: `网络错误: ${e.message}` };
    }
    return { success: false, message: "未知的 Provider" };
  }
};
