from datetime import datetime
from app import db

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    used = db.Column(db.Boolean, default=False)
    last_used = db.Column(db.DateTime, nullable=True)

class Compliment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    used = db.Column(db.Boolean, default=False)
    last_used = db.Column(db.DateTime, nullable=True)

class BirthdayMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    used = db.Column(db.Boolean, default=False)
    last_used = db.Column(db.DateTime, nullable=True)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_name = db.Column(db.String(100), nullable=True)
    device_id = db.Column(db.String(100), nullable=True)
    message_type = db.Column(db.String(20), default='text')
    file_path = db.Column(db.String(200), nullable=True)