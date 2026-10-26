const chatForm = document.getElementById("chat-form");
const questionInput = document.getElementById("question-input");
const chatMessages = document.getElementById("chat-messages");
const sendButton = document.getElementById("send-button");
const clearButton = document.getElementById("clear-chat");
const suggestions = document.querySelectorAll(".suggestion");

const welcomeMessage = `
    <div class="message assistant-message">
        <div class="message-avatar">A</div>
        <div class="message-content">
            <div class="message-label">AURA_AI</div>
            <div class="message-bubble">
                Hello! 👋 I'm AURA_AI. Ask me about science,
                technology, education, coding, or anything you're
                curious about. Let's figure it out together!
            </div>
        </div>
    </div>
`;

function scrollToLatest() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = `message ${sender}-message`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = sender === "user" ? "Y" : "A";

    const content = document.createElement("div");
    content.className = "message-content";

    const label = document.createElement("div");
    label.className = "message-label";
    label.textContent = sender === "user" ? "YOU" : "AURA_AI";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = text;

    content.appendChild(label);
    content.appendChild(bubble);
    message.appendChild(avatar);
    message.appendChild(content);

    chatMessages.appendChild(message);
    scrollToLatest();

    return bubble;
}

function setLoading(isLoading) {
    sendButton.disabled = isLoading;
    questionInput.disabled = isLoading;
    sendButton.querySelector("span:first-child").textContent =
        isLoading ? "Thinking..." : "Ask AI";
}

async function askAura(question) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || sendButton.disabled) {
        return;
    }

    addMessage(cleanQuestion, "user");
    questionInput.value = "";
    questionInput.style.height = "auto";

    const answerBubble = addMessage("AURA_AI is thinking...", "assistant");
    setLoading(true);

    try {
        const response = await fetch("/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: cleanQuestion
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "The request could not be completed.");
        }

        answerBubble.textContent = data.answer || "I couldn't generate an answer.";
    } catch (error) {
        answerBubble.textContent =
            "Sorry, I couldn't get an answer right now. " +
            (error.message || "Please try again.");
    } finally {
        setLoading(false);
        questionInput.focus();
        scrollToLatest();
    }
}

chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    askAura(questionInput.value);
});

questionInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

questionInput.addEventListener("input", function () {
    questionInput.style.height = "auto";
    questionInput.style.height =
        Math.min(questionInput.scrollHeight, 140) + "px";
});

suggestions.forEach(function (button) {
    button.addEventListener("click", function () {
        askAura(button.dataset.question || "");
    });
});

clearButton.addEventListener("click", function () {
    if (sendButton.disabled) {
        return;
    }

    chatMessages.innerHTML = welcomeMessage;
    questionInput.value = "";
    questionInput.style.height = "auto";
    questionInput.focus();
});
