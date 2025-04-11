const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

// Replace with YOUR OpenAI API key (for testing only!)
const OPENAI_API_KEY = "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";

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
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    chatbox.lastChild.remove(); // remove "Typing..."

    if (data.choices && data.choices.length > 0) {
      addMessage(data.choices[0].message.content.trim(), "bot");
    } else {
      addMessage("No response from ChatGPT.", "bot");
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
