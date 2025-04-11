const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const API_URL = "chatapp-sooty-two.vercel.app"; // IMPORTANT: Replace with IP on same network!!

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

sendButton.addEventListener("click", () => {
  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, "user");
  messageInput.value = "";

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.response) {
        addMessage(data.response, "bot");
      } else {
        addMessage("Bot did not respond.", "bot");
      }
    })
    .catch(err => {
      console.error("API error:", err);
      addMessage("Error contacting the bot API.", "bot");
    });
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendButton.click();
});
