// config.js - Never commit this to public repos! 
// chat.js - OpenRouter Chat Implementation
//https://uml-secapstone-github-io.onrender.com
document.addEventListener("DOMContentLoaded", function() {
  // Environment-aware configuration
  const isLocal = window.location.hostname === "localhost" || 
                 window.location.hostname === "127.0.0.1";
  
  const BACKEND_URL = isLocal 
      ? "http://localhost:5000/chat"  // For local Flask development
      : "https://uml-secapstone-github-io.onrender.com/chat";  // Render production

  const chatbox = document.getElementById("chatbox");
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");

  function addMessage(text, sender) {
      const msg = document.createElement("div");
      msg.className = `message ${sender}`;
      msg.textContent = text;
      chatbox.appendChild(msg);
      chatbox.scrollTop = chatbox.scrollHeight;
  }

  async function callChatAPI(message, imageUrl = null) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                image_url: imageUrl
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}


async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  messageInput.value = "";

  const typingIndicator = document.createElement("div");
  typingIndicator.id = "typing-indicator";
  typingIndicator.className = "message bot typing";
  typingIndicator.textContent = "Thinking...";
  chatbox.appendChild(typingIndicator);

  try {
      const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"; // static for now
      const response = await callChatAPI(message, imageUrl);

      // Remove typing indicator
      const indicator = document.getElementById("typing-indicator");
      if (indicator) indicator.remove();

      // Check if the model returned internal thoughts
if (response.content) {
  const content = response.content;

  // Extract internal thought (optional) and final message
  const thinkMatch = content.match(/◁think▷([\s\S]*?)◁\/think▷/);
  const internalThought = thinkMatch ? thinkMatch[1].trim() : null;
  const finalMessage = content.replace(/◁think▷[\s\S]*?◁\/think▷/, "").trim();

  if (internalThought) {
          // Show the internal thought in a lighter or italic style
          addMessage("💭 " + internalThought, "thought");
      }

      addMessage(finalMessage, "bot");

    } else if (response.error) {
      addMessage("Error from API: " + response.error, "error");
      console.error("Full API Error:", response);
    } else {
      addMessage("Unexpected response format", "error");
      console.error("Full Unexpected Response:", response);
    }

  } catch (error) {
      const indicator = document.getElementById("typing-indicator");
      if (indicator) indicator.remove();

      addMessage("Something went wrong: " + error.message, "error");
      console.error("Caught Exception:", error);
  }
}


  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
  });
});