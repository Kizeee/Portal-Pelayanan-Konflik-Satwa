import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from fuzzywuzzy import process
from datetime import datetime

app = Flask(__name__)
CORS(app)

def load_knowledge_base():
    try:
        with open('knowledge_base.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error memuat knowledge_base.json: {e}")
        return {}

knowledge_base = load_knowledge_base()

user_context = {"topic": None}

def get_dynamic_greeting():
    """Membuat sapaan berdasarkan waktu saat ini."""
    current_hour = datetime.now().hour
    if 5 <= current_hour < 12:
        return "Selamat Pagi!"
    elif 12 <= current_hour < 15:
        return "Selamat Siang!"
    elif 15 <= current_hour < 18:
        return "Selamat Sore!"
    else:
        return "Selamat Malam!"

def get_bot_response(user_input):
    text = user_input.lower().strip()
    
    if user_context.get("topic"):
        for key, value in knowledge_base.items():
            if value.get("parent_context") == user_context["topic"]:
                match = process.extractOne(text, value.get('keywords', []))
                if match and match[1] > 85:
                    return value

    highest_score = 0
    best_match_key = None
    for key, value in knowledge_base.items():
        match = process.extractOne(text, value.get('keywords', []))
        if match and match[1] > highest_score:
            highest_score = match[1]
            best_match_key = key

    if highest_score > 75:
        response_data = knowledge_base[best_match_key].copy()
        if best_match_key == 'greetings':
            greeting = get_dynamic_greeting()
            response_data['response'] = f"{greeting} {response_data['response']}"

        if "context_id" in response_data:
            user_context["topic"] = response_data["context_id"]
            print(f"Konteks diubah menjadi: {user_context['topic']}")
        elif "parent_context" not in response_data:
            user_context["topic"] = None
            print("Konteks dihapus.")
            
        return response_data

    user_context["topic"] = None
    return {
        "response": "Maaf, saya belum mengerti. Coba ketik 'menu' untuk melihat pilihan utama.",
        "suggestions": ["Menu Utama"]
    }

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    bot_answer = get_bot_response(user_message)
    return jsonify(bot_answer)

@app.route('/api/feedback', methods=['POST'])
def feedback():
    feedback_data = request.get_json()
    print(f"--- FEEDBACK DITERIMA ---")
    print(f"Data: {feedback_data}")
    print(f"--------------------------")
    return jsonify({"status": "success"})

if __name__ == '__main__':
    if not knowledge_base:
        print("Aplikasi tidak dapat dijalankan karena knowledge_base kosong atau gagal dimuat.")
    else:
        app.run(debug=True, port=5000)