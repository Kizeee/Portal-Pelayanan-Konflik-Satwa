import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COUNTER_FILE = os.path.join(BASE_DIR, "visitor_count.txt")

@app.route('/api/visit', methods=['POST'])
def track_visit():
    """Mencatat dan mengupdate jumlah pengunjung."""
    count = 0
    try:
        if os.path.exists(COUNTER_FILE):
            with open(COUNTER_FILE, 'r') as f:
                count = int(f.read())
    except (IOError, ValueError):
        count = 0
    
    count += 1
    
    try:
        with open(COUNTER_FILE, 'w') as f:
            f.write(str(count))
    except IOError as e:
        print(f"Gagal menulis ke file counter: {e}")
        return jsonify({"status": "error", "message": "Could not write to counter file."}), 500

    return jsonify({"status": "success", "visits": count})

if __name__ == '__main__':
    app.run(debug=True)