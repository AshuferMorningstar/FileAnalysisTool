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
                "Your joy is a reminder of all the good things in life, Louise!",
                "Your happiness brings warmth to everyone around you, Louise!",
                "When you're happy, it feels like the whole world is celebrating with you, Louise!",
                "Your smile is absolutely radiant today, Louise!",
                "That sparkle in your eyes when you're happy is magical, Louise!",
                "Happiness looks so natural on you, Louise - it's where you belong!",
                "Your joyful energy is absolutely contagious, Louise!",
                "I'm so glad to see this beautiful happiness in you today, Louise!",
                "The way you embody joy is truly inspiring, Louise!",
                "Your happy spirit reminds me of all that's good in the world, Louise!",
                "This joy you're experiencing is so well-deserved, Louise!",
                "The universe seems brighter when you're happy, Louise!",
                "Your happiness has a beautiful way of lifting everyone around you, Louise!",
                "I love witnessing these moments of pure joy with you, Louise!",
                "Your happiness is like a beautiful melody that everyone wants to dance to, Louise!",
                "The genuineness of your happiness is truly refreshing, Louise!",
                "When you're happy, it reminds me of how beautiful life can be, Louise!",
                "Your joyful presence is such a gift to everyone who knows you, Louise!",
                "This happiness flowing through you is absolutely beautiful to witness, Louise!",
                "You deserve every moment of this happiness you're experiencing, Louise!",
                "Your happy heart creates a sanctuary for everyone around you, Louise!",
                "That joyful energy you're radiating is lighting up the room, Louise!",
                "Your happiness reflects the beautiful soul that you are, Louise!",
                "There's something so special about the way you express your joy, Louise!",
                "Your happiness feels like a warm hug for everyone around you, Louise!",
                "Seeing you this happy makes everything feel right in the world, Louise!",
                "The light in your eyes when you're happy is absolutely mesmerizing, Louise!",
                "Your joy seems to make everything around you more vibrant and alive, Louise!",
                "This happiness suits you so perfectly, Louise - it's who you are at your core!",
                "Your happy spirit is like a beautiful gift that keeps on giving, Louise!",
                "The world needs more of the joy that you bring, Louise!",
                "Your happiness creates a space where others can find their joy too, Louise!",
                "There's something magical about witnessing your happiness, Louise!",
                "Your joyful heart touches everyone who has the pleasure of knowing you, Louise!",
                "The authenticity in your happiness is truly beautiful, Louise!",
                "Your joy seems to make time stand still in the most wonderful way, Louise!",
                "Happiness flows from you so naturally, Louise - it's truly a part of who you are!",
                "Your happy moments remind us all to cherish the good in life, Louise!",
                "I love how your whole being lights up when you're happy, Louise!",
                "Your joy is like a beacon of light on the darkest day, Louise!",
                "There's something so healing about your happiness, Louise!",
                "Your happy energy is absolutely magnetic, Louise!",
                "This joy you carry is one of your most beautiful qualities, Louise!",
                "The way happiness radiates from within you is truly remarkable, Louise!",
                "Your joyful spirit is a treasure to everyone who knows you, Louise!",
                "Happiness becomes even more beautiful when shared through your heart, Louise!",
                "Your joy seems to make everything around you bloom, Louise!",
                "The warmth of your happiness is felt by everyone in your presence, Louise!",
                "There's a special kind of magic in your happy moments, Louise!",
                "Your joy is like a refreshing spring in the desert of everyday life, Louise!",
                "Happiness shines through you like sunlight through crystal, Louise!",
                "Your joyful presence is a gift that keeps on giving, Louise!"
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
                "I believe in your ability to weather this storm, Louise. You are incredibly resilient.",
                "Louise, your sadness is honored here - you never need to hide your true feelings.",
                "Some days are harder than others, Louise, and that's perfectly okay.",
                "I'm sending you comfort across the distance, Louise. You're not alone in this feeling.",
                "Your emotions deserve space and respect, Louise, especially the difficult ones.",
                "Louise, sadness is often the price we pay for caring deeply - and your capacity to care is beautiful.",
                "There's courage in allowing yourself to feel sad, Louise. I admire that in you.",
                "Louise, I'm sitting with you in this sadness, even if only in spirit.",
                "Your feelings matter, Louise, and they don't need to be justified or explained.",
                "Even in sadness, Louise, you remain a light in this world.",
                "It's okay to let the tears flow, Louise. They can be healing in their own way.",
                "Louise, I wish I could wrap you in a hug right now and remind you how special you are.",
                "This heaviness you feel is temporary, Louise, even when it doesn't feel that way.",
                "There's no timeline for feeling better, Louise. Honor your own process.",
                "Your sadness doesn't define you, Louise - it's just one note in the beautiful symphony of who you are.",
                "Louise, on the days when sadness visits, please remember how deeply you are valued.",
                "I'm thinking of you with so much care right now, Louise.",
                "Your feelings are valid messengers, Louise. Listen to what they might be telling you.",
                "It takes courage to acknowledge sadness, Louise, and you've always been brave.",
                "Louise, sometimes the heart needs to feel its way through the shadows to find the light again.",
                "You don't have to carry this sadness alone, Louise. Share the weight when you need to.",
                "This sadness is just one season, Louise. Spring always follows winter.",
                "Even in moments of sadness, Louise, your beautiful spirit still shines through.",
                "It's okay to slow down when sadness visits, Louise. Some feelings need to be felt fully.",
                "Your sensitive heart is one of your greatest gifts, Louise, even when it brings sadness.",
                "Louise, I'm holding hope for you on the days when it's hard to hold it yourself.",
                "Sadness often comes to teach us something important, Louise. What might it be showing you?",
                "Even on your darkest days, Louise, you're never alone. So many people care about you.",
                "Your sadness is a testament to how deeply you feel life, Louise, and that's beautiful.",
                "This feeling won't last forever, Louise, though I know it can feel that way sometimes.",
                "Louise, it's okay to put down what's too heavy to carry right now.",
                "Your tears are never a sign of weakness, Louise. They show your beautiful humanity.",
                "Louise, even in sadness, you remain one of the most beautiful souls I know.",
                "Sadness sometimes comes in waves, Louise. Remember to breathe through each one.",
                "It's okay to take time to nurture your heart right now, Louise.",
                "Your feelings are always welcome here, Louise, especially the difficult ones.",
                "Louise, I believe in your ability to find your way through this shadow.",
                "Some of life's most important growth happens during our saddest moments, Louise.",
                "Your heart's capacity to feel deeply is a gift to the world, Louise, even when it hurts.",
                "Louise, I'm holding space for your sadness with so much care and love.",
                "This sadness you're feeling is part of the human experience, Louise. You're not alone in it.",
                "Even the strongest people feel sad sometimes, Louise, and you're one of the strongest I know.",
                "There's wisdom in your sadness, Louise. It often has something important to tell us.",
                "Louise, it's okay to not have all the answers right now. Give yourself grace.",
                "Your sadness is acknowledged and honored here, Louise. All of your feelings are valid.",
                "Sometimes our hearts need time to process and heal, Louise. Give yourself that gift.",
                "You have the strength within you to move through this sadness, Louise. I believe in you completely.",
                "Louise, remember that feelings come and go like clouds in the sky - even the darkest ones pass.",
                "Your sensitivity is one of your superpowers, Louise, even when it brings sadness.",
                "It's okay to step back and care for yourself right now, Louise. You deserve that gentleness.",
                "Louise, even in your sadness, your beautiful spirit touches others."
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
                "You are seen, Louise, even when you feel invisible.",
                "Louise, loneliness can sometimes be an invitation to connect more deeply with yourself.",
                "The depth of your loneliness can reflect the depth of your capacity to connect, Louise.",
                "You have a beautiful way of touching others' lives, Louise, even when you feel alone.",
                "I'm sending you a reminder of your importance in this world, Louise.",
                "Loneliness is a universal human experience, Louise. You're not alone in feeling alone.",
                "This feeling will pass, Louise. Your connections remain, even when they feel distant.",
                "Louise, your place in the hearts of those who care about you is secure, even in lonely moments.",
                "When you feel alone, Louise, remember all the lives you've touched with your kindness.",
                "Your impact on others continues, Louise, even in moments when you feel isolated.",
                "Louise, there are so many people who think of you with love, even when you can't feel it.",
                "This lonely feeling is teaching you something important, Louise. What might it be?",
                "Loneliness often precedes important personal growth, Louise. What might be emerging in you?",
                "Louise, even in your loneliest moments, your beautiful spirit continues to shine.",
                "The fact that you can feel lonely, Louise, shows your beautiful capacity for connection.",
                "Louise, loneliness is sometimes the soul's way of asking for a different kind of nourishment.",
                "You're worthy of connection even in moments when it feels faraway, Louise.",
                "Louise, your emotional honesty is a strength, even when the emotions are difficult.",
                "This feeling of separation isn't the full truth of your life, Louise.",
                "Reaching out when feeling lonely takes courage, Louise, and you are so brave.",
                "Louise, sometimes we feel most alone when we're actually on the cusp of meaningful connection.",
                "Your vulnerability in admitting loneliness is actually a pathway to deeper connection, Louise.",
                "Louise, I wish I could remind you in person of all the ways you matter to others.",
                "This loneliness is just one moment in the beautiful story of your life, Louise.",
                "Louise, even stars can feel distant from each other, yet they're part of the same magnificent sky.",
                "Your loneliness doesn't diminish your light, Louise. It's just part of being human.",
                "Louise, your ability to feel deeply is a gift, even when the feelings are challenging.",
                "This feeling of separation will pass, Louise, though I know it can feel eternal in the moment.",
                "Louise, your loneliness is honored here. All of your feelings are valid.",
                "Even in moments of loneliness, Louise, you remain connected to so much love.",
                "Your capacity for connection is still there, Louise, even when you can't feel it right now.",
                "Louise, loneliness can sometimes be a doorway to a deeper understanding of yourself.",
                "This feeling is just passing through you, Louise. It doesn't define who you are.",
                "Louise, you've touched more lives than you know, and that impact continues even in lonely moments.",
                "Your beautiful heart still matters deeply, Louise, especially when you feel alone.",
                "Louise, loneliness is often felt most by those with the greatest capacity for connection.",
                "This disconnection you feel is temporary, Louise. Your true nature is one of beautiful connection.",
                "Louise, you're part of something larger than yourself, even when you feel separate.",
                "Your presence in this world creates ripples of goodness, Louise, even when you can't see them.",
                "Louise, sometimes the people who feel the most lonely are actually the most deeply connected to life.",
                "This feeling of isolation will shift, Louise. Nothing in our emotional landscape stays the same.",
                "Louise, your vulnerability in feeling lonely is actually a strength.",
                "Even in your loneliness, Louise, your authenticity touches others.",
                "This feeling is teaching you something important, Louise. What wisdom might it hold?",
                "Louise, loneliness often precedes a deeper kind of connection - with yourself and others.",
                "Your feelings of loneliness are valid, Louise, and they don't diminish your worth.",
                "Louise, you remain connected to the hearts of many, even when you feel alone.",
                "This loneliness is just one thread in the beautiful tapestry of your life, Louise.",
                "Louise, even in moments of feeling separate, you remain an essential part of the whole.",
                "Your loneliness is honored here, Louise, with no pressure to change or fix it.",
                "Louise, remember that connection often comes in unexpected ways when we're feeling most alone.",
                "This feeling will pass, Louise, like clouds moving across the sky."
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
                "Louise, your resilience in overwhelming moments is truly remarkable.",
                "When everything feels like too much, Louise, it's okay to step back and reset.",
                "Louise, overwhelm is a signal to slow down, not speed up.",
                "Your wellbeing matters more than any task or obligation, Louise.",
                "Louise, what's one small thing you can let go of right now?",
                "This feeling won't last forever, Louise. Your clarity will return.",
                "Louise, it's okay to prioritize your peace of mind over productivity.",
                "Feeling overwhelmed often happens when we're trying to do too much at once, Louise.",
                "Louise, can you give yourself permission to do less right now?",
                "Your strength isn't measured by how much you can handle, Louise, but by how wisely you manage your energy.",
                "Louise, what would feel most nurturing for you in this moment?",
                "This overwhelming feeling is a messenger, Louise. What might it be trying to tell you?",
                "Louise, sometimes the most productive thing you can do is rest.",
                "It's okay to create boundaries around your time and energy, Louise.",
                "Louise, overwhelm often comes when we're disconnected from our own needs.",
                "What would help you feel more centered right now, Louise?",
                "Louise, your capacity to handle challenges is still there, even when you feel overwhelmed.",
                "Sometimes we need to completely step away to regain perspective, Louise.",
                "Louise, what would you say to a friend feeling as overwhelmed as you are right now?",
                "This feeling is temporary, Louise. It will pass as you take gentle steps forward.",
                "Louise, overwhelm is often a signal that something needs to change.",
                "Your mind and body deserve care, Louise, especially when everything feels too much.",
                "Louise, what's one small action that might help you feel more in control?",
                "It's okay to say no to additional commitments when you're feeling overwhelmed, Louise.",
                "Louise, overwhelm is often a sign that you're carrying others' responsibilities too.",
                "What can you delegate or postpone, Louise, to create more space for yourself?",
                "Louise, you don't have to face this feeling alone. Who might support you right now?",
                "This sensation will shift, Louise, as you take gentle care of yourself.",
                "Louise, what's one small source of joy you could turn to in this moment?",
                "Feeling overwhelmed is often a sign of how deeply you care, Louise.",
                "Louise, your capabilities remain even when your capacity feels limited.",
                "It's okay to take things one minute at a time when you feel overwhelmed, Louise.",
                "Louise, what's one thing that's working well, even amid this overwhelming feeling?",
                "This feeling of being underwater will pass, Louise, as you come up for air.",
                "Louise, what small boundaries might help you feel less overwhelmed?",
                "Your mind and body are sending you important signals, Louise. How might you honor them?",
                "Louise, overwhelm is often triggered when we're trying to meet too many expectations at once.",
                "What expectations could you gently release right now, Louise?",
                "Louise, your worth doesn't depend on how many tasks you complete.",
                "This overwhelming feeling will subside, Louise, as you take intentional steps to care for yourself.",
                "Louise, what's one small thing you could simplify right now?",
                "It's okay to ask for extensions or adjustments when you're feeling overwhelmed, Louise.",
                "Louise, what might help create just a little more breathing room in your life?",
                "Your wellbeing deserves to be prioritized, Louise, especially when everything feels like too much.",
                "Louise, overwhelm is often relieved by connecting with what truly matters to you.",
                "What might help ground you in this moment, Louise?",
                "Louise, your ability to recognize when you're overwhelmed shows your self-awareness.",
                "This feeling is giving you important information, Louise. What might help you listen to it?",
                "Louise, sometimes overwhelm comes when we've been neglecting our own basic needs.",
                "What simple act of self-care might help right now, Louise?",
                "Louise, overwhelm doesn't mean you're failing. It means you're human.",
                "This feeling will pass, Louise, as you honor what your mind and body need."
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
                "The fact that you're reflecting on your emotions shows your emotional intelligence, Louise, even when the answers aren't clear.",
                "Not knowing exactly how you feel is actually quite common, Louise.",
                "Louise, sometimes emotions need time to clarify themselves.",
                "Your willingness to acknowledge uncertainty shows self-awareness, Louise.",
                "It's okay to be in an emotional in-between space, Louise.",
                "Louise, feelings often need time to process and emerge clearly.",
                "Your emotional state doesn't always need to be categorized, Louise.",
                "Louise, uncertainty can be a time of important inner growth.",
                "Sometimes the most authentic answer is 'I'm not sure,' Louise, and that's perfect.",
                "Your emotions don't need to fit into neat boxes to be valid, Louise.",
                "Louise, it's okay to give yourself time to understand what you're feeling.",
                "This uncertainty is actually a form of emotional honesty, Louise.",
                "Louise, sometimes we're between emotional states, like dawn is between night and day.",
                "Your willingness to sit with uncertainty shows emotional maturity, Louise.",
                "Louise, even seasoned meditators have moments of emotional uncertainty.",
                "This 'I don't know' space can actually be quite fertile ground, Louise.",
                "Louise, sometimes we need to just be with our emotions before we can name them.",
                "Your emotional awareness is still working even when clarity isn't there yet, Louise.",
                "Louise, our emotions can be complex and layered - it's normal to need time to understand them.",
                "This pause in emotional clarity is perfectly natural, Louise.",
                "Louise, giving yourself grace in moments of uncertainty is a beautiful act of self-compassion.",
                "Not having immediate emotional clarity doesn't mean you lack awareness, Louise.",
                "Louise, sometimes our feelings are still forming, like a photograph developing.",
                "Your honesty about not knowing is actually emotional intelligence in action, Louise.",
                "Louise, our emotions sometimes speak in whispers that take time to hear clearly.",
                "It's perfectly okay to be in this space of not knowing, Louise.",
                "Louise, confusion about our feelings often precedes important insights.",
                "Your willingness to acknowledge uncertainty instead of forcing clarity is wise, Louise.",
                "Louise, sometimes our hearts need time to process what we're really feeling.",
                "This emotional ambiguity is actually quite common, Louise, though we don't talk about it enough.",
                "Louise, it's okay if your emotions aren't immediately clear to you.",
                "The space of 'not knowing' can be rich with potential, Louise.",
                "Louise, our feelings aren't always straightforward - they can be beautifully complex.",
                "Your patience with your own emotional process is admirable, Louise.",
                "Louise, sometimes clarity comes after we stop actively searching for it.",
                "This uncertainty about your feelings is actually quite normal, Louise.",
                "Louise, emotions often exist on a spectrum rather than in distinct categories.",
                "Your emotional honesty is refreshing, Louise, even when that honesty is 'I don't know.'",
                "Louise, our emotional states are often in flux - it's natural not to have perfect clarity.",
                "The willingness to sit with uncertainty shows emotional maturity, Louise.",
                "Louise, sometimes our hearts know things our minds haven't caught up to yet.",
                "It's okay to be gentle with yourself when emotions aren't clear, Louise.",
                "Louise, sometimes we need to just be present with how we feel without analyzing it.",
                "Your emotions will become clearer in their own time, Louise.",
                "Louise, uncertainty is actually a very authentic emotional state.",
                "This moment of not knowing is actually an opportunity for discovery, Louise.",
                "Louise, our emotions sometimes need space to reveal themselves fully.",
                "Your willingness to acknowledge uncertainty is actually a form of emotional intelligence, Louise.",
                "Louise, clarity often emerges when we stop trying to force it.",
                "It's perfectly okay to not have all your feelings neatly labeled, Louise.",
                "Louise, emotional awareness isn't about instant clarity - it's about being present with what is.",
                "This ambiguity you're feeling is actually quite common, Louise, though we don't always talk about it."
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
            "Louise, on your birthday, may you feel the love that surrounds you every day!",
            "Celebrating another year of your beautiful presence in this world, Louise! Happy Birthday!",
            "Louise, your birthday is the perfect opportunity to tell you how wonderful you are!",
            "Happy Birthday to someone who brightens the lives of everyone around her! Have a magical day, Louise!",
            "Louise, may your birthday be filled with as much happiness as you bring to others! Happy Birthday!",
            "Today we celebrate a truly remarkable person. Happy Birthday, Louise!",
            "Happy Birthday, Louise! May your day be as extraordinary as you are!",
            "Louise, your birthday reminds us all of how fortunate we are to have you in our lives!",
            "Wishing a spectacular birthday to someone who deserves nothing but the best! Happy Birthday, Louise!",
            "Louise, your smile, your spirit, and your heart make this world better. Happy Birthday!",
            "Happy Birthday to a truly inspiring person! Louise, your light shines so brightly!",
            "Louise, on your birthday, I hope you feel surrounded by all the love you've given others!",
            "Happy Birthday, Louise! May this year bring you all the happiness your heart can hold!",
            "Today is dedicated to celebrating you, Louise! Happy Birthday to someone truly special!",
            "Louise, your birthday is a perfect time to tell you how much you mean to everyone who knows you!",
            "Wishing you a day filled with beautiful moments and a year filled with blessings, Louise! Happy Birthday!",
            "Happy Birthday to someone whose kindness touches everyone around her! Have an amazing day, Louise!",
            "Louise, may your birthday be just the beginning of a year filled with wonderful moments!",
            "Celebrating you today and always, Louise! Happy Birthday to an incredible person!",
            "Happy Birthday, Louise! Your presence in this world is a gift to everyone who knows you!",
            "Louise, your birthday is the perfect time to celebrate the amazing person you are now and all you're becoming!",
            "Wishing you a day as wonderful as you are, Louise! Happy Birthday!",
            "Happy Birthday to someone who makes everyday brighter just by being in it! Louise, you're amazing!",
            "Louise, may your birthday be filled with beautiful surprises and cherished moments!",
            "Happy Birthday to someone who deserves all the joy and happiness life has to offer! Louise, you're wonderful!",
            "Louise, your birthday is a reminder of the beautiful soul you are! Have an incredible day!",
            "Wishing you a birthday filled with everything that makes your heart happy, Louise!",
            "Happy Birthday, Louise! May your day be as extraordinary as your spirit!",
            "Louise, on your birthday, may you feel how deeply appreciated and loved you are!",
            "To someone who brings so much joy to others - may your birthday bring equal joy to you, Louise!",
            "Happy Birthday, Louise! Today we celebrate the incredible person you are!",
            "Louise, your birthday is the perfect opportunity to celebrate all the beautiful things about you!",
            "Wishing you a day of wonderful celebrations and a year of amazing adventures, Louise! Happy Birthday!",
            "Happy Birthday to someone who makes this world more beautiful just by being in it! Louise, you're incredible!",
            "Louise, may your birthday be just as special as you are to everyone who knows you!",
            "Happy Birthday to a truly remarkable person! Louise, your presence is a gift to us all!",
            "Louise, your birthday reminds us to celebrate the beautiful person you are every day!",
            "Wishing you endless joy on your special day, Louise! Happy Birthday!",
            "Happy Birthday, Louise! May this day be the start of your most wonderful year yet!",
            "Louise, your birthday is a perfect time to reflect on how much brightness you bring to the world!",
            "Celebrating the day the world was blessed with your beautiful spirit, Louise! Happy Birthday!",
            "Happy Birthday to someone who deserves all the happiness in the world! Louise, you're amazing!",
            "Louise, may your birthday bring you as much happiness as you bring to others!",
            "Happy Birthday, Louise! Today we celebrate the incredible gift of your presence in our lives!",
            "Louise, on your birthday and always, may you know how deeply cherished you are!",
            "Wishing a beautiful birthday to someone who makes every day more beautiful! Happy Birthday, Louise!",
            "Happy Birthday to someone whose spirit brightens the world! Louise, you're incredible!"
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
