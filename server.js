const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname)));

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY missing in .env");
  process.exit(1);
}

const GEMINI_KEY = process.env.GEMINI_API_KEY;
console.log("Gemini Key loaded:", GEMINI_KEY.substring(0, 15) + "...");

const SYSTEM_PROMPT = `You are ReddyBOT, an AI assistant created by Varshith Reddy.

Response style:
- Answer questions directly and naturally
- Do not introduce yourself in every message
- Do not say "I am an AI" or "I am a chatbot" repeatedly
- Do not start with greetings unless the user greets first
- Be concise and conversational like a real assistant
- Use markdown formatting when helpful (lists, code blocks, bold)
- Keep tone professional but friendly
- For coding questions, provide clean working code
- For factual questions, give direct factual answers

Behave like ChatGPT or Claude. Answer the question, nothing more.`;

const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-lite-latest",
  "gemini-2.5-flash-lite",
];

async function callGemini(userMessage, history = []) {
  const contents = [];

  contents.push({ role: "user", parts: [{ text: SYSTEM_PROMPT }] });
  contents.push({
    role: "model",
    parts: [{ text: "Understood. I will answer questions directly." }],
  });

  history.forEach((msg) => {
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    });
  });

  contents.push({ role: "user", parts: [{ text: userMessage }] });

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  for (const model of GEMINI_MODELS) {
    console.log(`Trying ${model}...`);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          console.log(`Success with ${model}`);
          return reply;
        }
      }

      const errMsg = data?.error?.message || `Status ${response.status}`;
      console.log(`${model} failed: ${errMsg.substring(0, 80)}`);
    } catch (err) {
      console.log(`${model} error: ${err.message}`);
    }
  }

  throw new Error("All models failed. Please try again.");
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("\nUser:", userMessage);

    if (!userMessage) {
      return res.status(400).json({ reply: "Empty message." });
    }

    const reply = await callGemini(userMessage, req.body.history || []);
    console.log("Reply sent\n");

    res.json({ reply, status: "success" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ reply: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nReddyBOT running on http://localhost:${PORT}\n`);
});