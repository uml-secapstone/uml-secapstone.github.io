from flask import Flask, request, jsonify, make_response
from openai import OpenAI  # Updated import
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

# Initialize the client with your API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        
        # Updated API call syntax
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": user_message}],
            temperature=0.7
        )
        
        # Get the response content
        reply = response.choices[0].message.content
        
        return jsonify({"response": reply})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def home():
    return "ChatGPT API is running!"

if __name__ == "__main__":
    app.run(debug=True)