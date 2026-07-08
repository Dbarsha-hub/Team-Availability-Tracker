from flask import Flask
from flask_cors import CORS

from config import Config
from models import db,User
from flask import request, jsonify

app = Flask(__name__)

app.config.from_object(Config)

CORS(app)

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return {
        "message": "Backend Running!"
    }
@app.route("/api/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return [user.to_dict() for user in users]

@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):

    user = User.query.get_or_404(user_id)

    data = request.get_json()

    user.available = data["available"]

    db.session.commit()

    return jsonify(user.to_dict())

if __name__ == "__main__":
    app.run(debug=True)