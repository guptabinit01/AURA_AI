import os

from flask import Flask, jsonify, render_template, request
from openai import OpenAI

app = Flask(__name__)

API_KEY = os.getenv("OPENROUTER_API_KEY")

if API_KEY:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=API_KEY,
    )
else:
    client = None


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask():
    if client is None:
        return jsonify({
            "error": (
                "The OpenRouter API key is not available. "
                "Please load your API key in PowerShell and restart AURA_AI."
            )
        }), 500

    data = request.get_json(silent=True) or {}
    question = str(data.get("question", "")).strip()

    if not question:
        return jsonify({
            "error": "Please type a question first."
        }), 400

    if len(question) > 5000:
        return jsonify({
            "error": "Your question is too long. Please keep it under 5000 characters."
        }), 400

    try:
        response = client.chat.completions.create(
            model="openrouter/free",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are AURA_AI, a friendly and helpful AI assistant. "
                        "Answer questions clearly and accurately. "
                        "Use simple language when appropriate. "
                        "For complicated topics, organize your answer into "
                        "clear sections or numbered steps. "
                        "If you are unsure about something, say so honestly."
                    ),
                },
                {
                    "role": "user",
                    "content": question,
                },
            ],
        )

        answer = response.choices[0].message.content

        if not answer:
            answer = "I couldn't generate an answer. Please try again."

        return jsonify({"answer": answer})

    except Exception as error:
        print("AI request failed:", type(error).__name__, str(error))

        return jsonify({
            "error": (
                "I couldn't get an answer from the AI service. "
                "Please try again in a moment. Free models may be temporarily busy."
            )
        }), 502


if __name__ == "__main__":
    print("\n" + "=" * 45)
    print("  AURA_AI WEBSITE")
    print("  Open your browser at http://127.0.0.1:5000")
    print("=" * 45 + "\n")

    app.run(host="127.0.0.1", port=5000, debug=False)
