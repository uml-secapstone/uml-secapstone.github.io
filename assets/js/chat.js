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
    try {
        console.log("Sending request to:", BACKEND_URL);  // Debug log
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [{
                    role: "user",
                    content: message
                }]
            })
        });

        console.log("Received status:", response.status);  // Debug log
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: await response.text() };
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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

    // Add typing indicator with a unique ID
    const typingIndicator = document.createElement("div");
    typingIndicator.id = "typing-indicator";  // Add this line
    typingIndicator.className = "message bot typing";
    typingIndicator.textContent = "Thinking...";
    chatbox.appendChild(typingIndicator);

    try {
        const response = await callChatAPI(message);
        
        // Safely remove typing indicator
        const indicator = document.getElementById("typing-indicator");
        if (indicator) {
            indicator.remove();
        }
        
        addMessage(response.choices[0].message.content, "bot");
    } catch (error) {
        // Safely remove typing indicator even on error
        const indicator = document.getElementById("typing-indicator");
        if (indicator) {
            indicator.remove();
        }
        addMessage(`Error: ${error.message}`, "error");
    }
}

  // Event listeners
  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
  });
});