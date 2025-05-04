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