from server import app
from models import db

with app.app_context():
    db.create_all()
    print("Veritabanı ve tablolar oluşturuldu.") 