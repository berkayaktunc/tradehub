from server import app, db

with app.app_context():
    db.create_all()
    print("Database tabloları oluşturuldu!") 