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

  async function callChatAPI(message) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
              
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

  // Create and show "Thinking..." indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.id = "typing-indicator";
  typingIndicator.className = "message bot typing";
  typingIndicator.textContent = "Thinking...";
  chatbox.appendChild(typingIndicator);

  try {
      // If using image, pass it here. If not, just pass message
      const response = await callChatAPI(message); 

      // Always remove the "thinking" bubble once response is received
      document.getElementById("typing-indicator")?.remove();

      // Parse and show response
      if (response?.content) {
          const content = response.content;
          const thinkMatch = content.match(/◁think▷([\s\S]*?)◁\/think▷/);
          const internalThought = thinkMatch ? thinkMatch[1].trim() : null;
          const finalMessage = content.replace(/◁think▷[\s\S]*?◁\/think▷/, "").trim();

          if (internalThought) {
              addMessage("💭 " + internalThought, "thought");
              await new Promise(res => setTimeout(res, 500));
          }

          addMessage(finalMessage, "bot");
      } else if (response?.error) {
          addMessage("Error from API: " + response.error, "error");
      } else {
          addMessage("Unexpected response format", "error");
          console.error("Unexpected response:", response);
      }

  } catch (error) {
      document.getElementById("typing-indicator")?.remove();
      addMessage("Something went wrong: " + error.message, "error");
      console.error(error);
  }
}



  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
  });
});