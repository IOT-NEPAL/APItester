// Clean single-version script (removes duplicates causing double messages)
function fetchWithTimeout(resource, options = {}) {
  const { timeout = 25000, ...rest } = options
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  return fetch(resource, { ...rest, signal: controller.signal }).finally(() => clearTimeout(id))
}

async function callGoogleGemini(apiKey, userText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`
  const headers = { "Content-Type": "application/json" }
  const body = { contents: [ { role: "user", parts: [ { text: userText } ] } ] }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.error?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || ""
}

async function callDeepSeek(apiKey, userText) {
  const url = "https://api.deepseek.com/chat/completions"
  const headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
  const body = { model: "deepseek-chat", messages: [ { role: "user", content: userText } ], stream: false }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.error?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ""
}

async function callOpenAI(apiKey, userText) {
  const url = "https://api.openai.com/v1/chat/completions"
  const headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
  const body = { model: "gpt-4o-mini", messages: [ { role: "user", content: userText } ] }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.error?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ""
}

async function callAnthropic(apiKey, userText) {
  const url = "https://api.anthropic.com/v1/messages"
  const headers = { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" }
  const body = { model: "claude-3-haiku-20240307", max_tokens: 1024, messages: [ { role: "user", content: userText } ] }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.error?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  return data?.content?.map(p => p.text).join("") || ""
}

async function callMistral(apiKey, userText) {
  const url = "https://api.mistral.ai/v1/chat/completions"
  const headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
  const body = { model: "mistral-small", messages: [ { role: "user", content: userText } ] }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.error?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ""
}

async function callCohere(apiKey, userText) {
  const url = "https://api.cohere.ai/v1/chat"
  const headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
  const body = { model: "command-r", message: userText }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  return data?.text || data?.message?.content?.[0]?.text || ""
}

async function callTogether(apiKey, userText) {
  const url = "https://api.together.xyz/v1/chat/completions"
  const headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
  const body = { model: "meta-llama/Meta-Llama-3-8B-Instruct-Turbo", messages: [ { role: "user", content: userText } ] }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.error?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ""
}

async function callEdenAI(apiKey, userText) {
  const url = "https://api.edenai.run/v2/text/generation"
  const headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
  const body = { providers: "openai,cohere,google,anthropic,mistral", text: userText, temperature: 0.3 }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  const first = Object.values(data).find(v => v && v.generated_text)
  return (first && first.generated_text) || ""
}

async function callQwen(apiKey, userText) {
  const url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
  const headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
  const body = { model: "qwen2.5-7b-instruct", messages: [ { role: "user", content: userText } ] }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.error?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ""
}

async function callGroq(apiKey, userText) {
  const url = "https://api.groq.com/openai/v1/chat/completions"
  const headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
  const body = { model: "llama3-8b-8192", messages: [ { role: "user", content: userText } ] }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.error?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ""
}

async function callPerplexity(apiKey, userText) {
  const url = "https://api.perplexity.ai/chat/completions"
  const headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
  const body = { model: "llama-3.1-sonar-small-128k-chat", messages: [ { role: "user", content: userText } ] }
  const res = await fetchWithTimeout(url, { method: "POST", headers, body: JSON.stringify(body) })
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err?.error?.message || `HTTP ${res.status}`) }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ""
}

window.addEventListener("DOMContentLoaded", () => {
  const providerEl = document.getElementById("provider")
  const apiKeyEl = document.getElementById("apiKey")
  const inputEl = document.getElementById("input")
  const sendBtn = document.getElementById("sendBtn")
  const resetBtn = document.getElementById("resetBtn")
  const outputEl = document.getElementById("output")
  const statusEl = document.getElementById("status")
  const historyEl = document.getElementById("history")
  const heartStorm = document.getElementById("heartStorm")
  const igFollowBtn = document.getElementById("igFollowBtn")
  let inFlight = false

  sendBtn.addEventListener("click", async () => {
    if (inFlight) return
    inFlight = true
    statusEl.textContent = "Sending..."
    const provider = providerEl.value
    const apiKey = apiKeyEl.value.trim()
    const text = inputEl.value.trim()
    if (!apiKey) { statusEl.textContent = "API key required"; inFlight = false; return }
    if (!text) { statusEl.textContent = "Message is empty"; inFlight = false; return }
    sendBtn.disabled = true
    // prevent echoing same user message twice in a row
    const last = historyEl.lastElementChild?.querySelector?.('.bubble')?.textContent || ""
    if (last !== text) {
      appendMessage("user", text)
    }
    outputEl.textContent = ""
    try {
      let reply = ""
      switch (provider) {
        case "openai": reply = await callOpenAI(apiKey, text); break
        case "anthropic": reply = await callAnthropic(apiKey, text); break
        case "gemini": reply = await callGoogleGemini(apiKey, text); break
        case "mistral": reply = await callMistral(apiKey, text); break
        case "cohere": reply = await callCohere(apiKey, text); break
        case "deepseek": reply = await callDeepSeek(apiKey, text); break
        case "together": reply = await callTogether(apiKey, text); break
        case "edenai": reply = await callEdenAI(apiKey, text); break
        case "qwen": reply = await callQwen(apiKey, text); break
        case "groq": reply = await callGroq(apiKey, text); break
        case "perplexity": reply = await callPerplexity(apiKey, text); break
        default: throw new Error("Unsupported provider")
      }
      // normalize common provider echoes (some return "user:\n..." or wrap in spaces)
      const norm = (s) => (s || "").replace(/^\s+|\s+$/g, "").replace(/^user:\s*/i, "")
      reply = norm(reply)
      // avoid duplicating consecutive identical assistant messages
      const lastA = historyEl.lastElementChild?.querySelector?.('.bubble')?.textContent || ""
      if (norm(lastA) !== reply && reply !== text) {
        appendMessage("assistant", reply)
      }
      statusEl.textContent = ""
    } catch (e) {
      outputEl.textContent = ""
      const msg = (e && e.name === 'AbortError') ? 'Request timed out. Try again or check network.' : (e && e.message) || String(e)
      const full = `Error: ${msg}\nCheck:\n- API key validity/quotas\n- Provider access enabled for the key\n- Endpoint URL and region restrictions\n- CORS/network blocks (browsers may block some endpoints)`
      statusEl.textContent = full
      appendMessage("assistant", full)
    } finally {
      sendBtn.disabled = false
      inFlight = false
      historyEl.scrollTop = historyEl.scrollHeight
    }
  })

  resetBtn.addEventListener("click", () => {
    inputEl.value = ""
    outputEl.textContent = ""
    statusEl.textContent = ""
    historyEl.innerHTML = ""
  })

  function appendMessage(role, text) {
    const row = document.createElement("div")
    row.className = `msg ${role}`
    const bubble = document.createElement("div")
    bubble.className = "bubble"
    bubble.textContent = text
    row.appendChild(bubble)
    historyEl.appendChild(row)
  }

  // Animated Instagram follow: open link and spawn hearts
  igFollowBtn && igFollowBtn.addEventListener("mousemove", (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  })

  let heartActive = false
  igFollowBtn && igFollowBtn.addEventListener("click", () => {
    window.open("https://www.instagram.com/sakshyamupadhayaya", "_blank", "noopener,noreferrer")
    if (!heartStorm) return
    if (heartActive) return
    heartActive = true
    heartStorm.innerHTML = ""
    const emojis = ['❤','💖','💗','💓','💞','💕','💘','💝']
    const spawnBatch = (n) => {
      for (let i = 0; i < n; i++) {
        const h = document.createElement('div')
        h.className = 'heart'
        h.textContent = emojis[Math.floor(Math.random()*emojis.length)]
        h.style.left = Math.random() * 100 + 'vw'
        h.style.top = '-10%'
        h.style.fontSize = (14 + Math.random() * 20) + 'px'
        h.style.animationDuration = (3.5 + Math.random() * 2.5) + 's'
        heartStorm.appendChild(h)
        setTimeout(() => h.remove(), 6500)
      }
    }
    // spawn ~80 hearts once (still light for phones)
    spawnBatch(80)
    setTimeout(() => {
      const t = document.createElement('div')
      t.textContent = 'Thanks for following!'
      t.style.position = 'fixed'
      t.style.left = '50%'
      t.style.top = '50%'
      t.style.transform = 'translate(-50%, -50%)'
      t.style.padding = '10px 14px'
      t.style.border = '1px solid #2a2a2a'
      t.style.borderRadius = '12px'
      t.style.background = 'rgba(15,17,21,.9)'
      t.style.color = '#e5e7eb'
      t.style.zIndex = '45'
      t.style.fontSize = '14px'
      t.style.boxShadow = '0 10px 30px rgba(0,0,0,.4)'
      heartStorm.appendChild(t)
      setTimeout(() => { t.remove(); heartActive = false }, 1500)
    }, 4000)
  })
})


