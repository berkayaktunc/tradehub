from cryptography.fernet import Fernet
import os
import base64

# Şifreleme anahtarı (production'da environment variable'dan alınmalı)
SECRET_KEY = os.getenv('ENCRYPTION_KEY', Fernet.generate_key())
cipher_suite = Fernet(SECRET_KEY)

def encrypt_api_key(api_key: str) -> str:
    """API key'i şifreler"""
    if not api_key:
        return None
    encrypted = cipher_suite.encrypt(api_key.encode())
    return base64.b64encode(encrypted).decode()

def decrypt_api_key(encrypted_api_key: str) -> str:
    """Şifrelenmiş API key'i çözer"""
    if not encrypted_api_key:
        return None
    try:
        encrypted = base64.b64decode(encrypted_api_key.encode())
        decrypted = cipher_suite.decrypt(encrypted)
        return decrypted.decode()
    except Exception:
        return None

def encrypt_secret_key(secret_key: str) -> str:
    """Secret key'i şifreler"""
    if not secret_key:
        return None
    encrypted = cipher_suite.encrypt(secret_key.encode())
    return base64.b64encode(encrypted).decode()

def decrypt_secret_key(encrypted_secret_key: str) -> str:
    """Şifrelenmiş Secret key'i çözer"""
    if not encrypted_secret_key:
        return None
    try:
        encrypted = base64.b64decode(encrypted_secret_key.encode())
        decrypted = cipher_suite.decrypt(encrypted)
        return decrypted.decode()
    except Exception:
        return None 