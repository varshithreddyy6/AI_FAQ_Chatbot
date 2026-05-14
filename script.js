const chatContainer = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const historyList = document.getElementById("historyList");
const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const sidebarClose = document.getElementById("sidebarClose");
const overlay = document.getElementById("overlay");
const voiceBtn = document.getElementById("voiceBtn");
const charCounter = document.getElementById("charCounter");
const searchInput = document.getElementById("searchInput");

let allChats = JSON.parse(localStorage.getItem("reddybot_chats")) || [];
let currentChatIndex = null;
let isTyping = false;
let recognition = null;
let isRecording = false;
let currentTheme = localStorage.getItem("reddybot_theme") || "dark";

document.documentElement.setAttribute("data-theme", currentTheme);
updateThemeIcon();

marked.setOptions({
  breaks: true,
  gfm: true,
});

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scrollBottom(smooth = true) {
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: smooth ? "smooth" : "instant",
  });
}

function saveChats() {
  localStorage.setItem("reddybot_chats", JSON.stringify(allChats));
}

function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "code", "pre", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "blockquote", "a", "span", "div",
      "table", "thead", "tbody", "tr", "th", "td"
    ],
    ALLOWED_ATTR: ["href", "target", "class", "rel"],
  });
}

function parseMarkdown(text) {
  return sanitizeHTML(marked.parse(text));
}

function updateThemeIcon() {
  if (currentTheme === "dark") {
    themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  } else {
    themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  }
}

themeBtn.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("reddybot_theme", currentTheme);
  updateThemeIcon();
});

function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

menuBtn.addEventListener("click", () => {
  if (sidebar.classList.contains("open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

sidebarClose.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

function createAvatar(sender) {
  const avatar = document.createElement("div");
  avatar.classList.add("msg-avatar");

  if (sender === "ai") {
    avatar.classList.add("ai-avatar");
    avatar.textContent = "R";
  } else {
    avatar.classList.add("user-msg-avatar");
    avatar.textContent = "VR";
  }

  return avatar;
}

function createMessageFooter(text, time, isUser = false) {
  const footer = document.createElement("div");
  footer.classList.add("message-footer");

  const left = document.createElement("div");
  left.classList.add("footer-left");

  const timeEl = document.createElement("span");
  timeEl.classList.add("time");
  timeEl.textContent = time;
  left.appendChild(timeEl);

  if (!isUser && text) {
    const copyBtn = document.createElement("button");
    copyBtn.classList.add("copy-btn");
    copyBtn.textContent = "Copy";

    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 2000);
      } catch {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 2000);
      }
    });

    left.appendChild(copyBtn);
  }

  footer.appendChild(left);
  return footer;
}

function createMessage(text, sender, time = getTime()) {
  const welcomeScreen = document.getElementById("welcomeScreen");
  if (welcomeScreen) welcomeScreen.remove();

  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  if (sender === "ai") {
    msg.appendChild(createAvatar("ai"));
  }

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  const content = document.createElement("div");
  content.innerHTML = parseMarkdown(text);
  bubble.appendChild(content);

  bubble.appendChild(createMessageFooter(text, time, sender === "user"));

  msg.appendChild(bubble);

  if (sender === "user") {
    msg.appendChild(createAvatar("user"));
  }

  chatContainer.appendChild(msg);
  scrollBottom();
  return { bubble, content };
}

function createLoadingBubble() {
  const welcomeScreen = document.getElementById("welcomeScreen");
  if (welcomeScreen) welcomeScreen.remove();

  const msg = document.createElement("div");
  msg.classList.add("message", "ai");
  msg.id = "loadingMsg";
  msg.appendChild(createAvatar("ai"));

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = `
    <div class="loading">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  msg.appendChild(bubble);
  chatContainer.appendChild(msg);
  scrollBottom();
  return bubble;
}

async function typeMessage(bubble, text, time = getTime()) {
  bubble.innerHTML = '<div class="typing-text"></div>';

  const textDiv = bubble.querySelector(".typing-text");
  let i = 0;
  const speed = 5;

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      textDiv.innerHTML = parseMarkdown(text.substring(0, i));
      i++;
      scrollBottom();

      if (i > text.length) {
        clearInterval(interval);
        bubble.appendChild(createMessageFooter(text, time, false));
        resolve();
      }
    }, speed);
  });
}

function startNewChat() {
  currentChatIndex = null;
  isTyping = false;
  chatContainer.innerHTML = "";

  const ws = document.createElement("div");
  ws.className = "welcome-screen";
  ws.id = "welcomeScreen";
  ws.innerHTML = `
    <div class="welcome-logo">R</div>
    <h1 class="welcome-title">ReddyBOT</h1>
    <p class="welcome-sub">
      How can I help you today?
    </p>
    <div class="quick-prompts">
      <div class="prompt-grid">
        <button class="prompt-chip" data-prompt="What is Artificial Intelligence?">What is Artificial Intelligence</button>
        <button class="prompt-chip" data-prompt="Explain machine learning with examples">Explain machine learning</button>
        <button class="prompt-chip" data-prompt="Difference between Python and JavaScript">Python vs JavaScript</button>
        <button class="prompt-chip" data-prompt="How does deep learning work?">How does deep learning work</button>
        <button class="prompt-chip" data-prompt="What is Node.js used for?">What is Node.js used for</button>
        <button class="prompt-chip" data-prompt="Write a simple HTML page">Write a simple HTML page</button>
      </div>
    </div>
  `;

  chatContainer.appendChild(ws);

  ws.querySelectorAll(".prompt-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      userInput.value = btn.dataset.prompt;
      updateCharCounter();
      sendMessage();
    });
  });

  renderHistory();

  if (window.innerWidth <= 768) closeSidebar();
}

function loadChat(index) {
  const chat = allChats[index];
  if (!chat) return;

  currentChatIndex = index;
  chatContainer.innerHTML = "";

  if (chat.messages.length === 0) {
    startNewChat();
    return;
  }

  chat.messages.forEach((m) => {
    createMessage(m.text, m.sender, m.time);
  });

  scrollBottom(false);
  renderHistory();

  if (window.innerWidth <= 768) closeSidebar();
}

function deleteChat(index, e) {
  e.stopPropagation();
  allChats.splice(index, 1);
  saveChats();

  if (currentChatIndex === index) {
    startNewChat();
  } else if (currentChatIndex > index) {
    currentChatIndex--;
  }

  renderHistory();
}

function renderHistory(filter = "") {
  historyList.innerHTML = "";

  const filtered = allChats
    .map((chat, index) => ({ chat, index }))
    .filter(({ chat }) =>
      chat.title.toLowerCase().includes(filter.toLowerCase())
    );

  if (filtered.length === 0) {
    historyList.innerHTML = `
      <div class="empty-history">
        ${filter ? "No results found" : "No conversations yet"}
      </div>
    `;
    return;
  }

  filtered.forEach(({ chat, index }) => {
    const item = document.createElement("div");
    item.classList.add("history-item");
    if (index === currentChatIndex) item.classList.add("active");

    const title = document.createElement("span");
    title.classList.add("history-item-title");
    title.title = chat.title;
    title.textContent = chat.title;

    const delBtn = document.createElement("button");
    delBtn.classList.add("history-item-delete");
    delBtn.title = "Delete chat";
    delBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
      </svg>
    `;

    title.addEventListener("click", () => loadChat(index));
    delBtn.addEventListener("click", (e) => deleteChat(index, e));

    item.appendChild(title);
    item.appendChild(delBtn);
    historyList.appendChild(item);
  });
}

searchInput.addEventListener("input", () => {
  renderHistory(searchInput.value);
});

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isTyping) return;

  if (currentChatIndex === null) {
    const title = text.replace(/\n/g, " ").trim().substring(0, 40);
    allChats.unshift({ title, messages: [] });
    currentChatIndex = 0;
    renderHistory();
  }

  const time = getTime();
  createMessage(text, "user", time);

  allChats[currentChatIndex].messages.push({
    sender: "user",
    text,
    time,
  });
  saveChats();

  userInput.value = "";
  userInput.style.height = "auto";
  updateCharCounter();
  sendBtn.disabled = true;

  isTyping = true;

  const loadingBubble = createLoadingBubble();

  const history = allChats[currentChatIndex].messages
    .slice(-10)
    .map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
    const reply = data.reply || "No response.";

    const aiTime = getTime();
    await typeMessage(loadingBubble, reply, aiTime);

    allChats[currentChatIndex].messages.push({
      sender: "ai",
      text: reply,
      time: aiTime,
    });
    saveChats();
  } catch (err) {
    console.error("Send error:", err);
    loadingBubble.innerHTML = `
      <div class="error-bubble">
        Failed to get response. Please try again.
        <button onclick="retryLastMessage()" class="retry-btn">Retry</button>
      </div>
    `;
  } finally {
    isTyping = false;
    sendBtn.disabled = userInput.value.trim().length === 0;
  }
}

window.retryLastMessage = function () {
  if (currentChatIndex === null) return;
  const msgs = allChats[currentChatIndex].messages;
  const lastUser = [...msgs].reverse().find((m) => m.sender === "user");
  if (!lastUser) return;

  const loadingEl = document.getElementById("loadingMsg");
  if (loadingEl) loadingEl.remove();

  userInput.value = lastUser.text;
  sendMessage();
};

function updateCharCounter() {
  const len = userInput.value.length;
  const max = 2000;
  charCounter.textContent = `${len} / ${max}`;
  charCounter.className = "char-counter";

  if (len > 1800) charCounter.classList.add("danger");
  else if (len > 1500) charCounter.classList.add("warning");

  sendBtn.disabled = len === 0 || isTyping;
}

userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 180) + "px";
  updateCharCounter();
});

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);
newChatBtn.addEventListener("click", startNewChat);

exportBtn.addEventListener("click", () => {
  if (currentChatIndex === null || allChats[currentChatIndex].messages.length === 0) {
    alert("No conversation to export.");
    return;
  }

  const chat = allChats[currentChatIndex];
  let content = `ReddyBOT Conversation\n`;
  content += `Date: ${new Date().toLocaleString()}\n`;
  content += `Title: ${chat.title}\n`;
  content += "=".repeat(50) + "\n\n";

  chat.messages.forEach((m) => {
    const sender = m.sender === "user" ? "You" : "ReddyBOT";
    content += `[${m.time}] ${sender}:\n${m.text}\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ReddyBOT_${chat.title.substring(0, 20)}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

clearBtn.addEventListener("click", () => {
  if (currentChatIndex === null) return;
  if (!confirm("Clear this conversation?")) return;

  allChats[currentChatIndex].messages = [];
  saveChats();
  startNewChat();
});

/* Voice Input Setup */
function setupVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceBtn.title = "Voice input not supported in this browser";
    voiceBtn.style.opacity = "0.4";
    voiceBtn.addEventListener("click", () => {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
    });
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";
  recognition.maxAlternatives = 1;

  let finalTranscript = "";

  recognition.onstart = () => {
    isRecording = true;
    voiceBtn.classList.add("recording");
    voiceBtn.title = "Listening... Click to stop";
    finalTranscript = "";
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    userInput.value = (finalTranscript + interimTranscript).trim();
    updateCharCounter();
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 180) + "px";
  };

  recognition.onend = () => {
    isRecording = false;
    voiceBtn.classList.remove("recording");
    voiceBtn.title = "Voice input";

    if (finalTranscript.trim()) {
      userInput.value = finalTranscript.trim();
      updateCharCounter();
      userInput.focus();
    }
  };

  recognition.onerror = (event) => {
    isRecording = false;
    voiceBtn.classList.remove("recording");
    voiceBtn.title = "Voice input";

    if (event.error === "not-allowed" || event.error === "permission-denied") {
      alert("Microphone permission denied. Please allow microphone access in your browser settings.");
    } else if (event.error === "no-speech") {
      console.log("No speech detected");
    } else {
      console.log("Voice error:", event.error);
    }
  };

  voiceBtn.addEventListener("click", async () => {
    if (isRecording) {
      recognition.stop();
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognition.start();
    } catch (err) {
      alert("Please allow microphone access to use voice input.");
      console.error("Mic error:", err);
    }
  });
}

setupVoiceInput();

renderHistory();
startNewChat();
updateCharCounter();