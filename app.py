from flask import Flask, render_template, request, jsonify, url_for, send_from_directory
import random
import os
import json
import uuid
import werkzeug
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
    
    # Drop ChatMessage table to recreate with new columns
    ChatMessage.__table__.drop(db.engine, checkfirst=True)
    
    # Initialize database tables
    db.create_all()
    
    # Create initial compliments if none exist
    if Compliment.query.count() == 0:
        compliments = [
            "Your smile brightens everyone's day, Louise!",
            "You have the most wonderful heart, Louise!",
            "Your kindness inspires everyone around you, Louise!",
            "You're stronger than you know, Louise!",
            "Your creativity knows no bounds, Louise!",
            "You make the world a better place just by being you, Louise!",
            "Your laugh is absolutely contagious, Louise!",
            "You have such a beautiful soul, Louise!",
            "You're capable of achieving anything you set your mind to, Louise!",
            "Your positivity is absolutely refreshing, Louise!",
            "You're such a thoughtful and caring person, Louise!",
            "You handle challenges with such grace, Louise!",
            "Your perspective on life is truly inspiring, Louise!",
            "You're a true gem of a person, Louise!",
            "Your determination is admirable, Louise!",
            "You bring joy to everyone around you, Louise!",
            "Your compassion for others is beautiful to witness, Louise!",
            "You're incredibly talented, Louise!",
            "Your presence alone makes people feel comfortable, Louise!",
            "You have a heart of gold, Louise!",
            "The way you listen to others is so special, Louise!",
            "Your resilience in tough times is remarkable, Louise!",
            "You inspire me every single day, Louise!",
            "Your creativity shines in everything you do, Louise!",
            "The way your eyes light up when you're happy is magical, Louise!",
            "Your generosity never ceases to amaze me, Louise!",
            "You're a blessing in the lives of everyone who knows you, Louise!",
            "I admire your courage and bravery so much, Louise!",
            "You have a gift for making others feel special, Louise!",
            "Your patience and understanding are extraordinary, Louise!",
            "The warmth of your spirit is truly unforgettable, Louise!",
            "Your optimism is contagious and uplifting, Louise!",
            "You're a source of strength for so many people, Louise!",
            "Your authenticity is refreshing and beautiful, Louise!",
            "You light up every room you enter, Louise!",
            "Your thoughtfulness never goes unnoticed, Louise!",
            "I cherish every moment spent with you, Louise!",
            "Your inner beauty radiates outward, Louise!",
            "You've grown so much, and it's inspiring to witness, Louise!",
            "Your enthusiasm for life is absolutely infectious, Louise!",
            "You face challenges with remarkable grace, Louise!",
            "Your intuition and wisdom are truly impressive, Louise!",
            "You've touched so many lives with your kindness, Louise!",
            "The care you show others is heartwarming, Louise!",
            "You have an extraordinary way with words, Louise!",
            "Your curiosity about the world is inspiring, Louise!",
            "The way you express yourself is beautiful and unique, Louise!",
            "You have such a captivating presence, Louise!",
            "Your imagination knows no bounds, Louise!",
            "You're a wonderful listener when others need you, Louise!",
            "The compassion you show others is remarkable, Louise!",
            "Your sense of humor brightens everyone's day, Louise!",
            "The way you care for others shows your beautiful heart, Louise!",
            "Your determination in pursuing your goals is admirable, Louise!",
            "You have a gift for bringing people together, Louise!",
            "Your insights are always thoughtful and valuable, Louise!",
            "You have such a vibrant and beautiful energy, Louise!",
            "The kindness in your heart shines through in everything you do, Louise!",
            "Your smile can light up the darkest day, Louise!",
            "You approach life with such wonderful enthusiasm, Louise!",
            "Your thoughtfulness makes everyone feel special, Louise!",
            "The way you express your emotions is beautiful and honest, Louise!",
            "You have a rare and beautiful authenticity, Louise!",
            "Your empathy for others is truly remarkable, Louise!",
            "You tackle obstacles with incredible resilience, Louise!",
            "Your creative spirit brings joy to everyone around you, Louise!",
            "The depth of your understanding is impressive, Louise!",
            "You have an amazing ability to see the good in everyone, Louise!",
            "Your friendship is a gift I treasure daily, Louise!",
            "The passion you bring to everything you do is inspiring, Louise!",
            "You have a way of making challenging times feel manageable, Louise!",
            "Your emotional intelligence is truly remarkable, Louise!",
            "You brighten every space with your presence, Louise!",
            "The gentleness of your spirit is truly beautiful, Louise!",
            "You inspire others to be their best selves, Louise!",
            "Your dedication to your passions is admirable, Louise!",
            "You have a natural grace that's captivating, Louise!",
            "The care you put into your relationships is beautiful, Louise!",
            "Your strength in difficult times is remarkable, Louise!",
            "You have a beautiful way of expressing yourself, Louise!",
            "The wisdom you share is always valuable, Louise!",
            "Your courage to be vulnerable is inspiring, Louise!",
            "You handle life's challenges with impressive poise, Louise!",
            "The sincerity in everything you do is refreshing, Louise!",
            "Your ability to stay positive is truly inspiring, Louise!",
            "You have a wonderful way of making others feel valued, Louise!",
            "The effort you put into your passions shows your dedication, Louise!",
            "Your integrity in all situations is admirable, Louise!",
            "You have a beautiful way of seeing the world, Louise!",
            "The thoughtfulness you show others is heartwarming, Louise!",
            "Your perseverance through difficulties is remarkable, Louise!",
            "You have a natural ability to lift others' spirits, Louise!",
            "The joy you find in simple things is beautiful, Louise!",
            "Your capacity for growth and learning is impressive, Louise!",
            "You bring such wonderful energy to every situation, Louise!",
            "The depth of your compassion is truly beautiful, Louise!",
            "Your attention to detail shows how much you care, Louise!",
            "You have a remarkable way of connecting with others, Louise!",
            "The warmth of your personality is comforting, Louise!",
            "Your determination to overcome obstacles is admirable, Louise!"
        ]
        
        for content in compliments:
            compliment = Compliment(content=content, used=False)
            db.session.add(compliment)
        
        # Create messages for each feeling category
        feeling_messages = {
            "happy": [
                "I'm so happy that you're happy, Louise! Your joy spreads to everyone around you!",
                "Seeing you happy makes my day brighter too, Louise! Keep shining!",
                "Your happiness is contagious, Louise! Embrace this wonderful feeling!",
                "It's wonderful to see you in such high spirits, Louise! You deserve all this joy!",
                "That happiness looks amazing on you, Louise! Keep smiling!",
                "Your joy is such a gift to everyone around you, Louise!",
                "I love seeing that beautiful smile of yours, Louise!",
                "Louise, your happiness radiates and lifts everyone's spirits!",
                "There's nothing more wonderful than seeing you happy, Louise!",
                "Your joy is truly infectious, Louise - in the best possible way!",
                "The way you express your happiness is beautiful, Louise!",
                "Louise, I cherish these moments when I see you so happy!",
                "Your happiness is like sunshine on a cloudy day, Louise!",
                "The world is brighter when you're happy, Louise!",
                "I hope this happiness stays with you all day, Louise!",
                "Your joyful spirit is one of the things I love most about you, Louise!",
                "Seeing you this happy fills my heart with joy too, Louise!",
                "Louise, your happiness has a beautiful ripple effect on everyone around you!",
                "That happy glow suits you perfectly, Louise!",
                "Your joy is a reminder of all the good things in life, Louise!"
            ],
            "sad": [
                "I'm here for you during this difficult time, Louise. It's okay to feel sad sometimes.",
                "Sending you warm virtual hugs, Louise. Remember that all feelings pass, including sadness.",
                "Louise, your feelings are valid. Take all the time you need.",
                "Even on your saddest days, you're still so loved and cherished, Louise.",
                "This sadness won't last forever, Louise. I believe in your strength to get through this.",
                "Louise, I wish I could take away your sadness, but please know I'm here with you through it.",
                "It's okay to not be okay sometimes, Louise. Your feelings matter.",
                "Louise, sadness is part of being human - honor your emotions without judgment.",
                "I'm holding space for your sadness, Louise. You don't have to face it alone.",
                "Your tears are never wasted, Louise. They're healing in their own way.",
                "Louise, remember that your sadness doesn't diminish your light - it's just part of your beautiful humanity.",
                "Your capacity to feel deeply is a gift, Louise, even when it hurts.",
                "This moment of sadness is not forever, Louise. Better days are coming.",
                "Louise, your strength shows even in these moments of sadness.",
                "Whatever you're feeling, Louise, I'm here to listen without judgment.",
                "It's okay to rest and nurture yourself when you're sad, Louise.",
                "Louise, sadness often comes to teach us something - be gentle with yourself as you learn.",
                "Your heart is precious, Louise, even when it's heavy.",
                "This sadness is a visitor, Louise - it won't stay forever.",
                "I believe in your ability to weather this storm, Louise. You are incredibly resilient."
            ],
            "lonely": [
                "Even when you feel alone, please remember how many people care about you, Louise.",
                "I'm always here for you, Louise. You're never truly alone.",
                "Loneliness visits everyone sometimes, Louise, but it doesn't define you. You are loved.",
                "Reaching out when feeling lonely takes courage. I'm proud of you, Louise.",
                "Your wonderful spirit touches so many lives, Louise. This lonely feeling is temporary.",
                "Louise, you may feel alone, but your place in my heart is permanent.",
                "This feeling of loneliness will pass, Louise. You are deeply connected to so many who love you.",
                "Louise, remember that being physically alone doesn't mean you're not held in others' thoughts.",
                "I'm thinking of you right now, Louise, even if you can't see me.",
                "Your presence has touched so many lives, Louise. That connection exists even in moments of loneliness.",
                "Louise, loneliness reminds us how much relationships matter - and you matter so much to many people.",
                "This lonely moment is just that - a moment. It doesn't reflect your true place in the world, Louise.",
                "Louise, I wish I could sit with you right now and remind you how special you are.",
                "Sometimes the people who feel the most lonely are the ones who give the most to others. Your giving heart is treasured, Louise.",
                "Loneliness often comes when our hearts are particularly tender. Your sensitivity is a gift, Louise.",
                "Louise, remember all the lives you've touched - your impact continues even when you feel alone.",
                "This lonely feeling is valid, Louise, but it isn't the whole truth of your life.",
                "You are held in so many hearts, Louise, even when you can't feel it in this moment.",
                "Louise, your capacity for connection is beautiful, and it remains even in lonely moments.",
                "You are seen, Louise, even when you feel invisible."
            ],
            "overwhelmed": [
                "Take a deep breath, Louise. You don't have to handle everything at once.",
                "One step at a time, Louise. You've overcome challenges before, and you'll do it again.",
                "It's okay to take a break when feeling overwhelmed, Louise. Your wellbeing matters most.",
                "Focus on what you can control, Louise. The rest will follow.",
                "You have the strength within you to handle this, Louise. I believe in you completely.",
                "Louise, overwhelm is often a sign you're carrying too much - it's okay to set some things down.",
                "When everything feels too much, Louise, just focus on the very next step.",
                "Louise, you don't have to do everything perfectly. Progress over perfection.",
                "Your capacity is incredible, Louise, but everyone has limits. Honor yours.",
                "Louise, it's okay to ask for help when things feel overwhelming.",
                "This overwhelming feeling will pass, Louise. Your clarity will return.",
                "Sometimes feeling overwhelmed is your body's way of asking for rest, Louise.",
                "Louise, you've navigated overwhelming times before, and that strength is still in you.",
                "Remember to breathe, Louise. Sometimes that's all you need to do in this moment.",
                "It's okay to simplify when things feel too complex, Louise.",
                "Louise, your worth isn't tied to how much you accomplish. You matter, even when doing nothing at all.",
                "This overwhelm is temporary, Louise. Your capacity to handle life's challenges is enduring.",
                "Louise, can you identify just one small thing to focus on right now?",
                "Feeling overwhelmed often comes before a breakthrough, Louise. Hold on.",
                "Louise, your resilience in overwhelming moments is truly remarkable."
            ],
            "dontknow": [
                "It's perfectly okay not to know how you're feeling sometimes, Louise.",
                "Uncertainty is part of being human, Louise. Be gentle with yourself today.",
                "Sometimes the most honest answer is 'I don't know' and that's completely valid, Louise.",
                "Take some time for yourself today, Louise. Clarity often comes with rest.",
                "Whatever you're feeling, or not feeling, is okay, Louise. You're doing just fine.",
                "Louise, not knowing is often the beginning of wisdom.",
                "Sometimes our feelings need time to reveal themselves, Louise. That's perfectly normal.",
                "The space between emotions can feel confusing, Louise, but it's a natural part of being human.",
                "Louise, even when you don't know what you're feeling, you're still worthy of care and attention.",
                "Not having words for your emotions doesn't invalidate them, Louise.",
                "Louise, sometimes 'I don't know' is the most truthful answer we can give.",
                "Your emotions don't need to be clearly labeled to be honored, Louise.",
                "Louise, uncertainty about your feelings can actually be a time of important processing.",
                "It's okay to sit with the uncertainty, Louise. Clarity often emerges in its own time.",
                "Louise, even when you can't name your feelings, they're still teaching you something valuable.",
                "Sometimes our emotions are complex blends that defy simple labels, Louise.",
                "Louise, there's wisdom in acknowledging when you don't know.",
                "Your emotional awareness is a journey, Louise, not a destination.",
                "Louise, it's perfectly normal for feelings to be unclear sometimes.",
                "The fact that you're reflecting on your emotions shows your emotional intelligence, Louise, even when the answers aren't clear."
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
            "Wishing you a day filled with joy and a year filled with blessings! Happy Birthday, Louise!",
            "Happy Birthday, Louise! May your day be as beautiful as your heart!",
            "Cheers to another year of your amazing journey! Happy Birthday, Louise!",
            "Happy Birthday to you, Louise! Thank you for being such a wonderful person!",
            "Today is special because it's all about you! Happy Birthday, Louise!",
            "Wishing you endless happiness on your special day! Happy Birthday, Louise!",
            "Happy Birthday to the one and only Louise! May all your wishes come true!",
            "May this birthday bring you all the joy your heart can hold, Louise!",
            "Louise, your birthday is a perfect time to celebrate the wonderful person you are!",
            "On your special day, Louise, I'm sending you all the love and warmth in the world!",
            "Happy Birthday, Louise! May this year bring you adventures that make your heart soar!",
            "Today we celebrate the day the world was blessed with you, Louise! Happy Birthday!",
            "Louise, your birthday is the perfect reminder of how lucky we are to have you in our lives!",
            "Wishing you a birthday filled with laughter and surrounded by love, Louise!",
            "Happy Birthday, Louise! May your day be as radiant as your spirit!",
            "Louise, on your birthday, I hope you feel how much you're loved and appreciated!",
            "Another trip around the sun with you in our lives is worth celebrating, Louise! Happy Birthday!",
            "May this birthday mark the beginning of a wonderful year ahead for you, Louise!",
            "Here's to celebrating you today and every day, Louise! Happy Birthday!",
            "Louise, your birthday is a reminder of all the joy you bring to others' lives!",
            "Wishing you a day as special as you are, Louise! Happy Birthday!",
            "Happy Birthday to someone who makes the world a better place just by being in it, Louise!",
            "On your birthday, Louise, I hope you're surrounded by all the things that make you happiest!",
            "Louise, may your birthday be the start of a year filled with beautiful possibilities!",
            "Every birthday is a gift, Louise, just like you are a gift to everyone who knows you!",
            "Happy Birthday, Louise! Today is all about celebrating the amazing person you are!",
            "Louise, on your birthday, may you feel the love that surrounds you every day!"
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
    
    # Get user name and device ID if provided
    user_name = data.get('user_name', 'Anonymous')
    device_id = data.get('device_id', str(uuid.uuid4()))
    message_type = data.get('message_type', 'text')
    file_path = data.get('file_path', None)
        
    new_message = ChatMessage(
        sender=data['sender'],
        content=data['message'],
        user_name=user_name,
        device_id=device_id,
        message_type=message_type,
        file_path=file_path
    )
    
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "message": {
            "id": new_message.id,
            "sender": new_message.sender,
            "content": new_message.content,
            "timestamp": new_message.timestamp.isoformat(),
            "user_name": new_message.user_name,
            "device_id": new_message.device_id,
            "message_type": new_message.message_type,
            "file_path": new_message.file_path
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
        "timestamp": msg.timestamp.isoformat(),
        "user_name": msg.user_name,
        "device_id": msg.device_id,
        "message_type": msg.message_type,
        "file_path": msg.file_path
    } for msg in messages]
    
    return jsonify({"status": "success", "messages": message_list})
    
@app.route("/update_chat", methods=["POST"])
def update_chat():
    """Update a chat message in the database"""
    data = request.json
    
    if not data or 'id' not in data or 'content' not in data:
        return jsonify({"status": "error", "message": "Invalid data"}), 400
        
    message_id = data['id']
    new_content = data['content']
    
    # Find the message
    message = ChatMessage.query.get(message_id)
    
    if not message:
        return jsonify({"status": "error", "message": "Message not found"}), 404
        
    # Update the message content
    message.content = new_content
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "message": {
            "id": message.id,
            "sender": message.sender,
            "content": message.content,
            "timestamp": message.timestamp.isoformat(),
            "user_name": message.user_name,
            "device_id": message.device_id,
            "message_type": message.message_type,
            "file_path": message.file_path
        }
    })
    
@app.route("/delete_chat", methods=["POST"])
def delete_chat():
    """Delete a chat message from the database"""
    data = request.json
    
    if not data or 'id' not in data:
        return jsonify({"status": "error", "message": "Invalid data"}), 400
        
    message_id = data['id']
    
    # Find the message
    message = ChatMessage.query.get(message_id)
    
    if not message:
        return jsonify({"status": "error", "message": "Message not found"}), 404
        
    # Delete the message
    db.session.delete(message)
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "message": "Message deleted successfully"
    })

# Create uploads directory if it doesn't exist
uploads_dir = os.path.join(app.root_path, 'static/uploads')
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
    
@app.route("/upload_file", methods=["POST"])
def upload_file():
    """Upload a file (image or audio)"""
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
    
    # Determine file type
    file_type = None
    if file.content_type.startswith('image/'):
        file_type = 'image'
    elif file.content_type.startswith('audio/'):
        file_type = 'audio'
    else:
        return jsonify({"status": "error", "message": "Unsupported file type"}), 400
    
    # Create a unique filename to prevent collisions
    original_filename = werkzeug.utils.secure_filename(file.filename)
    file_extension = os.path.splitext(original_filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Save the file
    file_path = os.path.join(uploads_dir, unique_filename)
    file.save(file_path)
    
    # Get the relative path for storing in the database and serving
    relative_path = f"uploads/{unique_filename}"
    
    return jsonify({
        "status": "success",
        "file": {
            "path": relative_path,
            "type": file_type,
            "url": url_for('static', filename=relative_path, _external=True)
        }
    })

@app.route("/birthday-preview")
def birthday_preview():
    """A special route to preview the birthday page any time"""
    greeting = get_birthday_message()
    return render_template("birthday.html", greeting=greeting)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
