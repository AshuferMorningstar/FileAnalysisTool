from flask import Flask, render_template, request, jsonify
import random
import os
import json
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Create the Flask application
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "louise-support-secret")

# Database configuration - ensure the environment variable is available
if os.environ.get("DATABASE_URL"):
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
else:
    # Fallback for development
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///louise.db"

app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize SQLAlchemy with our app
db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Import models after initializing db
with app.app_context():
    from models import Message, Compliment, BirthdayMessage, ChatMessage
    
    # Initialize database tables
    db.create_all()
    
    # Create initial compliments if none exist
    if Compliment.query.count() == 0:
        compliments = [
            "Your smile brightens everyone's day, Louise!",
            "You have the most wonderful heart, Louise!",
            "Your kindness inspires everyone around you!",
            "You're stronger than you know, Louise!",
            "Your creativity knows no bounds!",
            "You make the world a better place just by being you!",
            "Your laugh is absolutely contagious!",
            "You have such a beautiful soul, Louise!",
            "You're capable of achieving anything you set your mind to!",
            "Your positivity is absolutely refreshing!",
            "You're such a thoughtful and caring person, Louise!",
            "You handle challenges with such grace!",
            "Your perspective on life is truly inspiring!",
            "You're a true gem of a person, Louise!",
            "Your determination is admirable!",
            "You bring joy to everyone around you!",
            "Your compassion for others is beautiful to witness!",
            "You're incredibly talented, Louise!",
            "Your presence alone makes people feel comfortable!",
            "You have a heart of gold!"
        ]
        
        for content in compliments:
            compliment = Compliment(content=content, used=False)
            db.session.add(compliment)
        
        # Create messages for each feeling category
        feeling_messages = {
            "happy": [
                "I'm so happy that you're happy, Louise! Your joy spreads to everyone around you!",
                "Seeing you happy makes my day brighter too! Keep shining!",
                "Your happiness is contagious, Louise! Embrace this wonderful feeling!",
                "It's wonderful to see you in such high spirits! You deserve all this joy!",
                "That happiness looks amazing on you, Louise! Keep smiling!"
            ],
            "sad": [
                "I'm here for you during this difficult time, Louise. It's okay to feel sad sometimes.",
                "Sending you warm virtual hugs. Remember that all feelings pass, including sadness.",
                "Louise, your feelings are valid. Take all the time you need.",
                "Even on your saddest days, you're still so loved and cherished, Louise.",
                "This sadness won't last forever. I believe in your strength to get through this."
            ],
            "lonely": [
                "Even when you feel alone, please remember how many people care about you, Louise.",
                "I'm always here for you, Louise. You're never truly alone.",
                "Loneliness visits everyone sometimes, but it doesn't define you. You are loved.",
                "Reaching out when feeling lonely takes courage. I'm proud of you, Louise.",
                "Your wonderful spirit touches so many lives. This lonely feeling is temporary."
            ],
            "overwhelmed": [
                "Take a deep breath, Louise. You don't have to handle everything at once.",
                "One step at a time. You've overcome challenges before, and you'll do it again.",
                "It's okay to take a break when feeling overwhelmed. Your wellbeing matters most.",
                "Focus on what you can control, Louise. The rest will follow.",
                "You have the strength within you to handle this. I believe in you completely."
            ],
            "dontknow": [
                "It's perfectly okay not to know how you're feeling sometimes, Louise.",
                "Uncertainty is part of being human. Be gentle with yourself today.",
                "Sometimes the most honest answer is 'I don't know' and that's completely valid.",
                "Take some time for yourself today, Louise. Clarity often comes with rest.",
                "Whatever you're feeling, or not feeling, is okay. You're doing just fine."
            ]
        }
        
        for category, messages in feeling_messages.items():
            for content in messages:
                message = Message(category=category, content=content, used=False)
                db.session.add(message)
        
        # Create birthday messages
        birthday_messages = [
            "Happy Birthday to someone truly special! Louise, you light up the world!",
            "Today we celebrate you, Louise! Happy Birthday to an amazing person!",
            "Another year of being wonderful! Happy Birthday, Louise!",
            "Wishing you a day filled with joy and a year filled with blessings! Happy Birthday!",
            "Happy Birthday, Louise! May your day be as beautiful as your heart!",
            "Cheers to another year of your amazing journey! Happy Birthday, Louise!",
            "Happy Birthday to you, Louise! Thank you for being such a wonderful person!",
            "Today is special because it's all about you! Happy Birthday, Louise!",
            "Wishing you endless happiness on your special day! Happy Birthday!",
            "Happy Birthday to the one and only Louise! May all your wishes come true!"
        ]
        
        for content in birthday_messages:
            birthday_msg = BirthdayMessage(content=content, used=False)
            db.session.add(birthday_msg)
            
        db.session.commit()

def get_unique_message(category):
    """Retrieve a unique message for the given emotion category"""
    # Query for unused messages
    unused_messages = Message.query.filter_by(category=category, used=False).all()
    
    # If all messages have been used, reset them all to unused
    if not unused_messages:
        Message.query.filter_by(category=category).update({Message.used: False})
        db.session.commit()
        unused_messages = Message.query.filter_by(category=category).all()
    
    # Choose a random message
    message = random.choice(unused_messages)
    
    # Mark as used
    message.used = True
    message.last_used = datetime.utcnow()
    db.session.commit()
    
    return message.content

def get_unique_compliment():
    """Retrieve a unique compliment"""
    # Query for unused compliments
    unused_compliments = Compliment.query.filter_by(used=False).all()
    
    # If all compliments have been used, reset them all to unused
    if not unused_compliments:
        Compliment.query.filter_by().update({Compliment.used: False})
        db.session.commit()
        unused_compliments = Compliment.query.all()
    
    # Choose a random compliment
    compliment = random.choice(unused_compliments)
    
    # Mark as used
    compliment.used = True
    compliment.last_used = datetime.utcnow()
    db.session.commit()
    
    return compliment.content

def get_birthday_message():
    """Retrieve a unique birthday message"""
    # Query for unused birthday messages
    unused_messages = BirthdayMessage.query.filter_by(used=False).all()
    
    # If all messages have been used, reset them all to unused
    if not unused_messages:
        BirthdayMessage.query.filter_by().update({BirthdayMessage.used: False})
        db.session.commit()
        unused_messages = BirthdayMessage.query.all()
    
    # Choose a random message
    birthday_message = random.choice(unused_messages)
    
    # Mark as used
    birthday_message.used = True
    birthday_message.last_used = datetime.utcnow()
    db.session.commit()
    
    return birthday_message.content

@app.route("/")
def home():
    # Note: On May 6th, this will automatically display the birthday page
    today = datetime.now()
    if today.month == 5 and today.day == 6:
        greeting = get_birthday_message()
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
    """Save a chat message to the database"""
    data = request.json
    
    if not data or 'sender' not in data or 'message' not in data:
        return jsonify({"status": "error", "message": "Invalid data"}), 400
        
    new_message = ChatMessage(
        sender=data['sender'],
        content=data['message']
    )
    
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "message": {
            "id": new_message.id,
            "sender": new_message.sender,
            "content": new_message.content,
            "timestamp": new_message.timestamp.isoformat()
        }
    })
    
@app.route("/get_chat_history", methods=["GET"])
def get_chat_history():
    """Get the chat history from the database"""
    limit = request.args.get('limit', 50, type=int)
    messages = ChatMessage.query.order_by(ChatMessage.timestamp.asc()).limit(limit).all()
    
    message_list = [{
        "id": msg.id,
        "sender": msg.sender,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat()
    } for msg in messages]
    
    return jsonify({"status": "success", "messages": message_list})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
