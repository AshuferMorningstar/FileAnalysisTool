from flask import Flask, render_template, request, jsonify
import random
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "louise-support-secret")

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Initialize used_messages.json if it doesn't exist
if not os.path.exists('data/used_messages.json'):
    with open('data/used_messages.json', 'w') as f:
        json.dump({}, f)

# Load used messages from file
with open('data/used_messages.json', 'r') as f:
    try:
        used_data = json.load(f)
    except json.JSONDecodeError:
        used_data = {}

# Define messages and compliments
compliments = [f"You are amazing #{i}" for i in range(1, 101)]
messages = {
    "happy": [f"I'm so happy you're happy #{i}" for i in range(1, 101)],
    "sad": [f"Sending love and support #{i}" for i in range(1, 101)],
    "lonely": [f"You're never alone, Louise! #{i}" for i in range(1, 101)],
    "overwhelmed": [f"Take a deep breath, you're doing great #{i}" for i in range(1, 101)],
    "dontknow": [f"It's okay not to know, just take it easy #{i}" for i in range(1, 101)]
}
birthday_messages = [f"Happy Birthday, Louise! You are cherished #{i}" for i in range(1, 51)]

def get_unique_message(category):
    global used_data
    used = used_data.get(category, [])
    options = [msg for msg in messages[category] if msg not in used]
    if not options:
        used_data[category] = []
        options = messages[category]
    msg = random.choice(options)
    used_data[category].append(msg)
    with open('data/used_messages.json', 'w') as f:
        json.dump(used_data, f)
    return msg

def get_unique_compliment():
    global used_data
    used = used_data.get("compliments", [])
    options = [msg for msg in compliments if msg not in used]
    if not options:
        used_data["compliments"] = []
        options = compliments
    msg = random.choice(options)
    used_data["compliments"].append(msg)
    with open('data/used_messages.json', 'w') as f:
        json.dump(used_data, f)
    return msg

@app.route("/")
def home():
    today = datetime.now()
    if today.month == 5 and today.day == 6:
        greeting = random.choice(birthday_messages)
        return render_template("birthday.html", greeting=greeting)
    return render_template("index.html")

@app.route("/feelings")
def feelings():
    compliment = get_unique_compliment()
    return render_template("feelings.html", compliment=compliment)

@app.route("/message", methods=["POST"])
def message():
    feeling = request.form.get("feeling")
    msg = get_unique_message(feeling)
    return render_template("response.html", message=msg, feeling=feeling)

@app.route("/save_chat", methods=["POST"])
def save_chat():
    # This endpoint is not actually used for storing chat
    # Chat is stored in localStorage on client side
    # This is just a placeholder for potential future server-side chat storage
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
