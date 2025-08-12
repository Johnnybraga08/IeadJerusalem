from app import db
from datetime import datetime

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TShirtOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    congregation_name = db.Column(db.String(100), nullable=False)
    responsible_name = db.Column(db.String(100), nullable=False)
    responsible_phone = db.Column(db.String(20))
    responsible_email = db.Column(db.String(120))
    lot_number = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    size = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    color = db.Column(db.String(50))
    observations = db.Column(db.Text)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    delivery_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Pendente')  # Pendente, Em Produção, Pronto, Entregue
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Lot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lot_number = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Size(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    size_name = db.Column(db.String(10), unique=True, nullable=False)
    description = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Model(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    model_name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
