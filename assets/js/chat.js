// config.js - Never commit this to public repos! 
// chat.js - OpenRouter Chat Implementation
//https://uml-secapstone-github-io.onrender.com
document.addEventListener("DOMContentLoaded", function() {
  // Configuration (no API key needed!)
  const BACKEND_URL = "https://uml-secapstone-github-io.onrender.com/chat"; // Your Render URL
  const DEFAULT_MODEL = "mistralai/mistral-7b-instruct:free";
  
  // DOM Elements
  const chatbox = document.getElementById("chatbox");
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");

  // Add message to chat
  function addMessage(text, sender) {
      const msg = document.createElement("div");
      msg.className = `message ${sender}`;
      msg.textContent = text;
      chatbox.appendChild(msg);
      chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Call your Render backend proxy
  async function callChatAPI(message) {
    const response = await fetch("https://your-render-app.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messages: [{
                role: "user",
                content: message
            }]
            // model parameter is now optional (handled by backend)
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  }
  // Handle message sending
  async function sendMessage() {
      const message = messageInput.value.trim();
      if (!message) return;

      addMessage(message, "user");
      messageInput.value = "";

      // Add typing indicator
      const typingIndicator = document.createElement("div");
      typingIndicator.className = "message bot typing";
      typingIndicator.textContent = "Thinking...";
      chatbox.appendChild(typingIndicator);

      try {
          const response = await callChatAPI(message);
          chatbox.removeChild(typingIndicator);
          addMessage(response.choices[0].message.content, "bot");
      } catch (error) {
          chatbox.removeChild(typingIndicator);
          addMessage(`Error: ${error.message}`, "error");
      }
  }

  // Event listeners
  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
  });
});