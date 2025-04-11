from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat_proxy():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200

    try:
        # Accept frontend data
        user_message = request.json.get("message", "")
        image_url = request.json.get("image_url")

        content = [{"type": "text", "text": user_message}]
        if image_url:
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": image_url
                }
            })

        # Send to OpenRouter using OpenAI-compatible SDK
        completion = client.chat.completions.create(
            model="moonshotai/kimi-vl-a3b-thinking:free",
            messages=[
                {
                    "role": "user",
                    "content": content
                }
            ],
            extra_headers={
                "HTTP-Referer": "https://uml-secapstone.github.io",
                "X-Title": "UML Chat Demo"
            }
        )

        return jsonify({"content": completion.choices[0].message.content})

    except Exception as e:
        print("Server Error:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
