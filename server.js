require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const {
    GoogleGenerativeAI
} = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// LOAD FAQ DATA

const faqs = JSON.parse(
    fs.readFileSync("faq.json", "utf-8")
);

// GEMINI API

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
});

// CHAT HISTORY

let chatHistory = [];

// CHAT API

app.post("/chat", async (req, res) => {

    const userMessage = req.body.message;

    // SAVE USER MESSAGE

    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    // KEEP ONLY LAST 10 MESSAGES

    if (chatHistory.length > 10) {
        chatHistory.shift();
    }

    // FAQ SEARCH FIRST

    let foundAnswer = null;

    for (let faq of faqs) {

        if (
            userMessage
                .toLowerCase()
                .includes(faq.question.toLowerCase())
        ) {

            foundAnswer = faq.answer;
            break;
        }
    }

    // IF FAQ FOUND

    if (foundAnswer) {

        return res.json({
            reply: foundAnswer
        });
    }

    // OTHERWISE GEMINI AI

    try {

        const chat = model.startChat({
            history: chatHistory
        });

        const result = await chat.sendMessage(userMessage);

        const response =
            result.response.text();

        // SAVE BOT RESPONSE

        chatHistory.push({
            role: "model",
            parts: [{ text: response }]
        });

        res.json({
            reply: response
        });

    } catch (error) {

        console.log(error);

        res.json({
            reply:
                "Gemini AI is temporarily busy. Please try again in a few seconds."
        });
    }
});

// START SERVER

app.listen(3000, () => {

    console.log(
        "Server running on port 3000"
    );
});