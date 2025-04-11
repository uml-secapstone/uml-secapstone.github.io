const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const API_URL = "https://uml-secapstone-github-io.onrender.com/chat"; // <-- This should call your Flask backend

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, "user");
  messageInput.value = "";
  addMessage("Typing...", "bot");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage
      }),
    });

    const data = await res.json();
    chatbox.lastChild.remove(); // remove "Typing..."

    if (data.response) {
      addMessage(data.response, "bot");
    } else {
      addMessage("No response from the bot.", "bot");
    }
  } catch (err) {
    console.error("API error:", err);
    chatbox.lastChild.remove(); // remove "Typing..."
    addMessage("Error contacting ChatGPT API.", "bot");
  }
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
