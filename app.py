from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app)  # Allow requests from your GitHub Pages domain

# In your app.py on Render
@app.route('/chat', methods=['POST'])
def chat_proxy():
    try:
        # Get and validate JSON
        data = request.get_json()
        if not data or 'messages' not in data:
            return jsonify({"error": "Invalid request format"}), 400
        
        # Forward to OpenRouter
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {os.getenv("OPENROUTER_API_KEY")}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://uml-secapstone.github.io',
                'X-Title': 'UML Chat Demo'
            },
            json={
                "model": data.get("model", "mistralai/mistral-7b-instruct:free"),
                "messages": data["messages"]
            }
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)