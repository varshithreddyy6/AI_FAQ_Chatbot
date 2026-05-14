# ReddyBOT - AI FAQ Chatbot

An intelligent AI-powered chatbot built with Node.js, Express, and Google Gemini API. Features a clean ChatGPT-style interface with multi-chat support, voice input, conversation export, dark/light themes, and intelligent context-aware responses.

## Live Demo

http://localhost:3000

---

# Project Overview

ReddyBOT is a production-grade AI assistant designed to answer questions across multiple domains including technology, programming, AI/ML, and general knowledge.

Built as part of the HorizonTechX Internship Program, this project demonstrates:

- Full-stack development
- AI integration
- Modern UI/UX design
- API handling
- Responsive frontend development

---

# Features

## Core Features

- AI-powered conversational responses using Google Gemini
- Multi-model auto-fallback system
- Context-aware conversations
- Real-time typing animation
- Markdown rendering
- Code block support
- Table rendering

## User Interface

- ChatGPT-inspired UI
- Dark and Light mode
- Fully responsive design
- Smooth animations
- Sidebar conversation history
- Quick prompt suggestions

## Chat Management

- Multiple chats support
- Auto-save conversations
- Search chat history
- Delete chats
- Clear conversation
- Export chat as text file

## Input Features

- Auto-resize text input
- Voice input support
- Character counter
- Keyboard shortcuts
- Copy AI response button

## Security & Performance

- Environment variable protection
- Input sanitization
- Error handling
- Health check endpoint
- Retry support

---

# Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES6+)
- Marked.js
- DOMPurify
- Web Speech API

## Backend

- Node.js
- Express.js
- Google Gemini API
- dotenv
- CORS

## Deployment

- Render
- GitHub

---

# Installation

## Prerequisites

- Node.js v18 or above
- npm
- Google Gemini API Key

Get API Key:
https://aistudio.google.com/apikey

---

# Setup Steps

## 1. Clone Repository

```bash
git clone https://github.com/varshithreddyy6/HorizonTechX_AI_FAQ_Chatbot.git
```

## 2. Open Project Folder

```bash
cd HorizonTechX_AI_FAQ_Chatbot
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Create `.env` File

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

## 5. Start Server

```bash
node server.js
```

## 6. Open Browser

```bash
http://localhost:3000
```

---

# Project Structure

```bash
AI_FAQ_Chatbot/
│
├── node_modules/
├── .env
├── .gitignore
├── index.html
├── style.css
├── script.js
├── server.js
├── package.json
├── package-lock.json
├── faq.json
└── README.md
```

---

# Environment Variables

| Variable | Description |
|----------|-------------|
| GEMINI_API_KEY | Google Gemini API Key |
| PORT | Server Port |

---

# API Endpoints

## POST `/chat`

Send user message and receive AI response.

### Request

```json
{
  "message": "What is AI?",
  "history": []
}
```

### Response

```json
{
  "reply": "Artificial Intelligence is...",
  "status": "success"
}
```

---

## GET `/health`

### Response

```json
{
  "status": "ok"
}
```

---

# AI Models Used

- gemini-flash-latest
- gemini-2.5-flash
- gemini-2.0-flash
- gemini-flash-lite-latest
- gemini-2.5-flash-lite

Auto fallback system ensures reliability if one model fails.

---

# Usage Guide

## Basic Chat

1. Type your message
2. Press Enter
3. Receive AI response
4. Continue conversation

## Voice Input

1. Click microphone icon
2. Allow microphone access
3. Speak clearly
4. Stop recording
5. Send message

## Conversation Management

- Create new chat
- Search conversations
- Delete old chats
- Export chats

## Theme Toggle

Switch between dark and light mode using the topbar button.

---

# Deployment on Render

## Steps

1. Push project to GitHub
2. Open Render
3. Create New Web Service
4. Connect GitHub repository
5. Add configurations

### Build Command

```bash
npm install
```

### Start Command

```bash
node server.js
```

## Add Environment Variable

```env
GEMINI_API_KEY=your_api_key
```

Deploy project.

---

# Troubleshooting

## Server Not Starting

Check:

- `.env` file exists
- API key is valid
- Node.js version is 18+

Check version:

```bash
node --version
```

---

## AI Not Responding

- Verify Gemini API key
- Restart server
- Check terminal errors

---

## Voice Input Not Working

Use:

- Chrome
- Edge

Allow microphone permission.

---

## Port Already In Use

Change:

```env
PORT=3001
```

---

# Future Enhancements

- Streaming responses
- Image upload
- File attachments
- Authentication system
- Cloud database
- Multiple languages
- PDF export
- PWA support

---

# Internship Details

- Internship: HorizonTechX
- Domain: AI & Data Science
- Task: AI FAQ Chatbot
- Status: Completed

---

# Author

## Varshith Reddy

GitHub:
https://github.com/varshithreddyy6

Project:
ReddyBOT AI FAQ Chatbot

# Repository

https://github.com/varshithreddyy6/HorizonTechX_AI_FAQ_Chatbot