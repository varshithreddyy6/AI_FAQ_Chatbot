const chatBox =
    document.getElementById("chat-box");

const inputField =
    document.getElementById("user-input");

// SEND MESSAGE

async function sendMessage() {

    const message =
        inputField.value.trim();

    if (!message) return;

    // USER MESSAGE

    addMessage(
        message,
        "user-message"
    );

    inputField.value = "";

    // TYPING MESSAGE

    const typingDiv =
        document.createElement("div");

    typingDiv.className =
        "bot-message typing";

    typingDiv.innerHTML =
        `
        <div class="dots">
            Typing...
        </div>
    `;

    chatBox.appendChild(typingDiv);

    scrollBottom();

    try {

        const response =
            await fetch("/chat", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message
                })
            });

        const data =
            await response.json();

        // REMOVE TYPING

        typingDiv.remove();

        // BOT MESSAGE

        addMessage(
            data.reply,
            "bot-message"
        );

    } catch (error) {

        typingDiv.remove();

        addMessage(
            "Server error occurred.",
            "bot-message"
        );
    }
}

// ADD MESSAGE

function addMessage(
    text,
    className
) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        className;

    const time =
        new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    messageDiv.innerHTML =
        `
        <div>${text}</div>
        <div class="time">${time}</div>
    `;

    chatBox.appendChild(messageDiv);

    scrollBottom();
}

// ENTER KEY SUPPORT

inputField.addEventListener(
    "keypress",
    function (e) {

        if (e.key === "Enter") {
            sendMessage();
        }
    }
);

// CLEAR CHAT

function clearChat() {

    chatBox.innerHTML = `
        <div class="bot-message">
            <div>
                Hello 👋 <br><br>
                I am your AI FAQ Chatbot. <br>
                Ask me anything about AI, Machine Learning, internships, or technology.
            </div>
        </div>
    `;
}

// AUTO SCROLL

function scrollBottom() {

    chatBox.scrollTop =
        chatBox.scrollHeight;
}