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
from pymongo import MongoClient

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your-secret-key-here")

# Enable CORS for Next.js frontend (adjust origin as needed)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

env_vars = {
    "MONGO_URI": os.getenv("MONGO_URI"),
    "NYT_API_KEY": os.getenv("NYT_API_KEY"),
    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID"),
    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY"),
    "AWS_BUCKET_NAME": os.getenv("AWS_BUCKET_NAME", "pgupt4-news-app-s3"), 
}

# MongoDB setup
client = MongoClient(env_vars["MONGO_URI"])
db = client["news_app"]
users_collection = db["users"]

# NYT
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

# S3
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

# User management (using S3 JSON for simplicity)
def load_users():
    try:
        obj = s3.get_object(Bucket=env_vars["AWS_BUCKET_NAME"], Key="users/users.json")
        return json.loads(obj["Body"].read().decode("utf-8"))
    except:
        return {}  # Empty if no users file exists yet

def save_users(users):
    s3.put_object(
        Bucket=env_vars["AWS_BUCKET_NAME"],
        Key="users/users.json",
        Body=json.dumps(users),
        ContentType="application/json"
    )

@app.route('/news-galore')
def news_galore():
    if 'username' not in session:
        return jsonify({"error": "Login required"}), 401
    news_data = get_nyt_news()
    upload_result = upload_to_s3(news_data)
    if upload_result["status"] != "success":
        return jsonify({"error": upload_result["message"]}), 500
    processed_data = get_from_s3()
    if "error" not in processed_data:
        return jsonify(processed_data)
    return jsonify(news_data)  # Fallback to raw news

@app.route('/raw')
def hello_world():
    return jsonify(get_nyt_news())

@app.route('/')
def health_check():
    return jsonify({"status": "ok"}), 200


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = users_collection.find_one({"username": username})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid username or password"}), 401

    # Set session
    session['username'] = username
    return jsonify({"message": "Login successful"}), 200

# Authentication Routes
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    # Check if user already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    # Hash the password and store the user
    hashed_password = generate_password_hash(password)
    user = {"username": username, "password": hashed_password}
    users_collection.insert_one(user)
    
    return jsonify({"message": "Signup successful"}), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)