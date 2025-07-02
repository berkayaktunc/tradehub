from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    wallet_address = db.Column(db.String(128), unique=True, nullable=False)
    subscription_start = db.Column(db.DateTime, nullable=True)
    subscription_end = db.Column(db.DateTime, nullable=True)
    payment_tx = db.Column(db.String(128), nullable=True)
    # Şifreli API key'ler
    encrypted_api_key = db.Column(db.Text, nullable=True)  # Şifrelenmiş API key
    encrypted_secret_key = db.Column(db.Text, nullable=True)  # Şifrelenmiş Secret key
    # Trade data
    trade_data = db.Column(db.Text, nullable=True)  # JSON string olarak trade data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 