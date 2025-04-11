from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Keep your existing CORS config

# Free model options
FREE_MODELS = {
    "kimi": "moonshotai/kimi-vl-a3b-thinking:free",
    "mistral": "mistralai/mistral-7b-instruct:free", 
    "claude": "anthropic/claude-3-haiku"  # Free tier limited
}

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    
    # Allow model selection from frontend (defaults to kimi)
    model = data.get("model", "kimi")  
    selected_model = FREE_MODELS.get(model, FREE_MODELS["kimi"])
    
    response = client.chat.completions.create(
        extra_headers={
            "HTTP-Referer": data.get("site_url", "https://uml-secapstone.github.io"),
            "X-Title": "UML Chat"
        },
        model=selected_model,
        messages=[{"role": "user", "content": data["message"]}]
    )
    
    return jsonify({
        "response": response.choices[0].message.content,
        "model_used": selected_model
    })

@app.route('/api/chat', methods=['POST'])
def chat_proxy():
    data = request.json
    headers = {
        'Authorization': f'Bearer {os.getenv("OPENROUTER_KEY")}',
        'Content-Type': 'application/json'
    }
    response = requests.post(
        'https://openrouter.ai/api/v1/chat/completions',
        headers=headers,
        json=data
    )
    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True)