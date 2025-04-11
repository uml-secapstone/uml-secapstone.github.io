
from flask import Flask, request, jsonify
from flask_cors import CORS  # Make sure this import exists
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Enhanced CORS configuration
CORS(app, resources={
    r"/chat": {
        "origins": ["https://uml-secapstone.github.io", "http://localhost:*"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/chat', methods=['POST'])
def chat_proxy():
    print("Incoming request headers:", request.headers)  # Debug log
    print("Request data:", request.json)  # Debug log
    
    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {os.getenv("OPENROUTER_API_KEY")}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://uml-secapstone.github.io',
                'X-Title': 'UML Chat Demo'
            },
            json=request.json
        )
        print("OpenRouter response:", response.json())  # Debug log
        return jsonify(response.json())
    except Exception as e:
        print("Error:", str(e))  # Debug log
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)