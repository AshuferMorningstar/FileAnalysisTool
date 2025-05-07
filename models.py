# models.py
from datetime import datetime
from core import db

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500))
    category = db.Column(db.String(50))
    used = db.Column(db.Boolean, default=False)
    last_used = db.Column(db.DateTime)

class Compliment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(300))
    used = db.Column(db.Boolean, default=False)
    last_used = db.Column(db.DateTime)

class BirthdayMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500))
    used = db.Column(db.Boolean, default=False)
    last_used = db.Column(db.DateTime)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(100))
    content = db.Column(db.String(500))
    user_name = db.Column(db.String(100))
    device_id = db.Column(db.String(100))
    user_identifier = db.Column(db.String(200))
    message_type = db.Column(db.String(50))
    file_path = db.Column(db.String(300))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
