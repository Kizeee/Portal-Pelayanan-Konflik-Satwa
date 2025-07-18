# File: app.py
# Backend Flask dengan kemampuan sapaan realtime berdasarkan waktu.

import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from fuzzywuzzy import process
from datetime import datetime, timezone, timedelta

app = Flask(__name__)
CORS(app)

# Fungsi untuk memuat seluruh pengetahuan dari file JSON saat aplikasi dimulai
def load_knowledge_base():
    """Memuat data dari file knowledge_base.json."""
    try:
        with open('knowledge_base.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("ERROR: File 'knowledge_base.json' tidak ditemukan.")
        return {}
    except json.JSONDecodeError:
        print("ERROR: File 'knowledge_base.json' tidak dalam format JSON yang benar.")
        return {}

knowledge_base = load_knowledge_base()

# --- FUNGSI BARU UNTUK SAPAAN REALTIME ---
def get_greeting():
    """Membuat sapaan berdasarkan waktu saat ini (WIB/UTC+7)."""
    # Tentukan zona waktu WIB (UTC+7)
    wib_timezone = timezone(timedelta(hours=7))
    current_hour = datetime.now(wib_timezone).hour

    if 5 <= current_hour < 11:
        return "Selamat Pagi!"
    elif 11 <= current_hour < 15:
        return "Selamat Siang!"
    elif 15 <= current_hour < 19:
        return "Selamat Sore!"
    else:
        return "Selamat Malam!"

def get_bot_response(user_input):
    """Mencari jawaban yang paling cocok menggunakan fuzzy matching."""
    text = user_input.lower().strip()
    
    # --- PERUBAHAN DI SINI ---
    # Jika kata kunci sapaan cocok, gunakan fungsi sapaan realtime
    if any(keyword in text for keyword in knowledge_base.get('greetings', {}).get('keywords', [])):
        greeting = get_greeting()
        response_data = knowledge_base['greetings'].copy() # Salin data agar tidak mengubah aslinya
        response_data['response'] = f"{greeting} Saya Asisten Virtual BKSDA Riau. Silakan pilih topik di bawah ini:"
        return response_data

    highest_score = 0
    best_match_response = None

    for key, value in knowledge_base.items():
        if 'keywords' in value and key != 'greetings': # Lewati sapaan karena sudah ditangani
            match = process.extractOne(text, value['keywords'])
            if match and match[1] > highest_score:
                highest_score = match[1]
                best_match_response = value

    if highest_score > 75:
        return best_match_response

    return {
        "response": "Maaf, saya belum mengerti. Coba ketik 'menu' untuk melihat pilihan utama.",
        "suggestions": ["Menu Utama"]
    }

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Pesan tidak ditemukan'}), 400
    
    user_message = data['message']
    bot_answer = get_bot_response(user_message)
    return jsonify(bot_answer)

@app.route('/api/feedback', methods=['POST'])
def feedback():
    feedback_data = request.get_json()
    print(f"--- FEEDBACK DITERIMA ---")
    print(f"Pertanyaan: {feedback_data.get('question')}")
    print(f"Jawaban: {feedback_data.get('answer')}")
    print(f"Feedback: {feedback_data.get('feedback')}")
    print(f"--------------------------")
    return jsonify({"status": "success"}), 200

if __name__ == '__main__':
    if not knowledge_base:
        print("Aplikasi tidak dapat dijalankan karena knowledge_base kosong atau gagal dimuat.")
    else:
        app.run(debug=True, port=5000)
