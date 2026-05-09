const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Chat Bot 🚀</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f1f5f9;
      --primary: #38bdf8;
      --user-msg: #334155;
      --ai-msg: #0369a1;
    }

    body { 
      font-family: 'Inter', system-ui, -apple-system, sans-serif; 
      background-color: var(--bg); 
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      margin: 0;
    }

    .chat-header {
      padding: 20px;
      text-align: center;
      background: var(--card-bg);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    #out { 
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .msg {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 15px;
      line-height: 1.5;
      font-size: 0.95rem;
      word-wrap: break-word;
    }

    .user {
      align-self: flex-end;
      background-color: var(--user-msg);
      border-bottom-right-radius: 2px;
    }

    .ai {
      align-self: flex-start;
      background-color: var(--ai-msg);
      border-bottom-left-radius: 2px;
    }

    .input-area {
      padding: 20px;
      background: var(--card-bg);
      display: flex;
      gap: 10px;
    }

    input {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #475569;
      background: #0f172a;
      color: white;
      outline: none;
    }

    input:focus { border-color: var(--primary); }

    button {
      padding: 10px 20px;
      background: var(--primary);
      border: none;
      border-radius: 8px;
      color: #0f172a;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    button:hover { opacity: 0.9; }
    
    .loading { font-style: italic; opacity: 0.7; font-size: 0.8rem; }
  </style>
</head>
<body>

<div class="chat-header">
  <h2 style="margin:0">AI Chat Bot 🚀</h2>
</div>

<div id="out">
  <div class="msg ai">Merhaba! Size nasıl yardımcı olabilirim?</div>
</div>

<div class="input-area">
  <input id="msg" placeholder="Mesajınızı buraya yazın..." onkeypress="if(event.key==='Enter') send()">
  <button onclick="send()">Gönder</button>
</div>

<script>
async function send() {
  const input = document.getElementById("msg");
  const out = document.getElementById("out");
  const msg = input.value.trim();
  
  if (!msg) return;

  // Kullanıcı mesajını ekle
  out.innerHTML += \`<div class="msg user">\${msg}</div>\`;
  input.value = "";
  out.scrollTop = out.scrollHeight;

  // Yükleniyor göstergesi
  const loadingId = "load-" + Date.now();
  out.innerHTML += \`<div class="msg ai loading" id="\${loadingId}">AI düşünüyor...</div>\`;
  out.scrollTop = out.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();
    document.getElementById(loadingId).remove();
    
    out.innerHTML += \`<div class="msg ai">\${data.reply}</div>\`;
  } catch (err) {
    document.getElementById(loadingId).innerText = "Hata oluştu!";
  }
  
  out.scrollTop = out.scrollHeight;
}
</script>

</body>
</html>
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(html, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    if (url.pathname === "/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        
        // Workers AI Binding kullanımı (En hızlısı)
        const answer = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [{ role: "user", content: body.message }]
        });

        return Response.json({ reply: answer.response });
      } catch (e) {
        return Response.json({ reply: "Üzgünüm, bir hata oluştu: " + e.message });
      }
    }

    return new Response("Bulunamadı", { status: 404 });
  }
};