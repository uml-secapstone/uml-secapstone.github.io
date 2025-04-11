// config.js - Never commit this to public repos! 
// chat.js - OpenRouter Chat Implementation
document.addEventListener("DOMContentLoaded", function() {
  // Configuration - REPLACE WITH YOUR ACTUAL KEY
  const OPENROUTER_API_KEY = "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"; 
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

  // Call OpenRouter API
  async function callOpenRouter(message) {
      try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                  "Content-Type": "application/json",
                  "HTTP-Referer": window.location.href,
                  "X-Title": "UML Chat Demo"
              },
              body: JSON.stringify({
                  model: DEFAULT_MODEL,
                  messages: [{ role: "user", content: message }]
              })
          });

          if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
          }

          return await response.json();
      } catch (error) {
          console.error("API call failed:", error);
          throw error;
      }
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
          const response = await callOpenRouter(message);
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