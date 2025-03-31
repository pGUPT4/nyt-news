from flask import Flask, jsonify, request, session
from dotenv import load_dotenv
import os
import requests
import logging
import boto3
from datetime import datetime
import json
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from mongoengine import Document, StringField, connect
import pymongo.errors

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

env_vars = {
    "MONGO_URI": os.getenv("MONGO_URI"),
    "NYT_API_KEY": os.getenv("NYT_API_KEY"),
    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID"),
    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY"),
    "AWS_BUCKET_NAME": os.getenv("AWS_BUCKET_NAME", "pgupt4-news-app-s3"),
}

logger.info(f"Connecting to MongoDB with URI: {env_vars['MONGO_URI']}")
# Connect to MongoDB using mongoengine (no need for pymongo client)
connect(db="news_app", host=env_vars["MONGO_URI"])

try:
    connect(db="news_app", host=env_vars["MONGO_URI"])
except pymongo.errors.ConnectionError as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise

# Define User schema
class User(Document):
    email = StringField(required=True, unique=True)
    password = StringField(required=True)

NYT_API_KEY = env_vars["NYT_API_KEY"]
def get_nyt_news():
    url = "http://api.nytimes.com/svc/news/v3/content/all/all.json"
    params = {"api-key": NYT_API_KEY}
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()["results"]
    except requests.RequestException as e:
        logger.error(f"NYT API request failed: {str(e)}")
        return {"error": str(e)}

s3 = boto3.client(
    "s3",
    aws_access_key_id=env_vars["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=env_vars["AWS_SECRET_ACCESS_KEY"]
)

def upload_to_s3(data, bucket_name=env_vars["AWS_BUCKET_NAME"], key_prefix="raw"):
    key = f"{key_prefix}/news-{datetime.now().strftime('%Y-%m-%d-%H-%M-%S')}.json"
    s3.put_object(Bucket=bucket_name, Key=key, Body=json.dumps(data), ContentType="application/json")
    return {"status": "success", "key": key}

def get_from_s3(bucket_name=env_vars["AWS_BUCKET_NAME"], key_prefix="processed"):
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=key_prefix)
    if "Contents" not in response:
        return {"error": "No processed files found"}
    latest_key = max(response["Contents"], key=lambda x: x["LastModified"])["Key"]
    obj = s3.get_object(Bucket=bucket_name, Key=latest_key)
    return json.loads(obj["Body"].read().decode("utf-8"))

@app.route('/news-galore')
def news_galore():
    if 'email' not in session:
        return jsonify({"error": "Login required"}), 401
    news_data = get_nyt_news()
    upload_result = upload_to_s3(news_data)
    if upload_result["status"] != "success":
        return jsonify({"error": upload_result.get("message", "Upload failed")}), 500
    processed_data = get_from_s3()
    if "error" not in processed_data:
        return jsonify(processed_data)
    return jsonify(news_data)

@app.route('/raw')
def hello_world():
    return jsonify(get_nyt_news())

@app.route('/')
def health_check():
    return jsonify({"status": "ok"}), 200

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        if User.objects(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

        hashed_password = generate_password_hash(password)
        user = User(email=email, password=hashed_password)
        user.save()
        return jsonify({"message": "Signup successful"}), 201
    except pymongo.errors.ServerSelectionTimeoutError as e:
        logger.error(f"Signup failed due to MongoDB timeout: {str(e)}")
        return jsonify({"error": "Database connection timeout"}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = User.objects(email=email).first()
        if not user or not check_password_hash(user.password, password):
            return jsonify({"error": "Invalid email or password"}), 401

        session['email'] = email
        return jsonify({"message": "Login successful"}), 200
    except pymongo.errors.ServerSelectionTimeoutError as e:
        logger.error(f"Login failed due to MongoDB timeout: {str(e)}")
        return jsonify({"error": "Database connection timeout"}), 500

@app.route('/logout')
def logout():
    session.pop('email', None)
    return jsonify({"message": "Logout successful"}), 200

@app.route('/user')
def get_user():
    if 'email' not in session:
        return jsonify({"error": "Not logged in"}), 401
    return jsonify({"email": session['email']}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)