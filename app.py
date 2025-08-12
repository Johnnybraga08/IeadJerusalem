import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# Configure logging for debugging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "ieadajerusalem_secret_key_2024")

# Configure SQLite database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///church_orders.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the database with the app
db.init_app(app)

# Import routes after app creation to avoid circular imports
from routes import *

with app.app_context():
    # Import models to ensure tables are created
    import models
    db.create_all()
    
    # Create admin user if not exists
    from models import Admin
    from werkzeug.security import generate_password_hash
    
    existing_admin = Admin.query.filter_by(email="arielle.tigre@hotmail.com").first()
    if not existing_admin:
        admin = Admin(
            name="Arielle Tigre",
            email="arielle.tigre@hotmail.com",
            password_hash=generate_password_hash("Ar@983522274")
        )
        db.session.add(admin)
        db.session.commit()
        logging.info("Admin user created successfully")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
