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
from mongoengine import Document, StringField, ListField, BooleanField, connect
import pymongo.errors
from datetime import timedelta, datetime

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# Session configuration
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

CORS(app, supports_credentials=True, origins=["http://localhost:3000", "https://newsapp-parthgupta.vercel.app"])

env_vars = {
    "MONGO_URI": os.getenv("MONGO_URI"),
    "NYT_API_KEY": os.getenv("NYT_API_KEY"),
    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID"),
    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY"),
    "AWS_BUCKET_NAME": os.getenv("AWS_BUCKET_NAME", "pgupt4-news-app-s3"),
}

CACHE_FILE = "cache/news_cache.json"
CACHE_DURATION = timedelta(hours=1)

logger.info(f"Connecting to MongoDB with URI: {env_vars['MONGO_URI']}")
connect(db="news_app", host=env_vars["MONGO_URI"])

try:
    connect(db="news_app", host=env_vars["MONGO_URI"])
except pymongo.errors.ConnectionError as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise

# Define User schema with preferences and isFirstTime
class User(Document):
    email = StringField(required=True, unique=True)
    password = StringField(required=True)
    preferences = ListField(StringField(), default=[])
    isFirstTime = BooleanField(default=True)

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

lambda_client = boto3.client(
    "lambda",
    aws_access_key_id=env_vars["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=env_vars["AWS_SECRET_ACCESS_KEY"],
    region_name="us-east-2"
)

def upload_to_s3(data, bucket_name=env_vars["AWS_BUCKET_NAME"], key_prefix="raw"):
    key = f"{key_prefix}/news-{datetime.now().strftime('%Y-%m-%d-%H-%M-%S')}.json"
    s3.put_object(Bucket=bucket_name, Key=key, Body=json.dumps(data), ContentType="application/json")
    return {"status": "success", "key": key}

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            data = json.load(f)
            if datetime.now() - datetime.fromisoformat(data.get("timestamp")) < CACHE_DURATION:
                return data["results"]
    return None

def save_cache(data):
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, "w") as f:
        json.dump({"results": data, "timestamp": datetime.now().isoformat()}, f)

@app.route('/api/news-galore')
def news_galore():
    if 'email' not in session:
        return jsonify({"error": "Login required"}), 401
    
    # Fetch user preferences
    user = User.objects(email=session['email']).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    preferences = user.preferences
    logger.info(f"User preferences for {session['email']}: {preferences}")

    # Check cache first
    cached_data = load_cache()
    if cached_data:
        news_data = cached_data
    else:
        news_data = get_nyt_news()
        if "error" in news_data:
            return jsonify({"error": news_data["error"]}), 500
        save_cache(news_data)

    upload_result = upload_to_s3(news_data)
    if upload_result["status"] != "success":
        return jsonify({"error": upload_result.get("message", "Upload failed")}), 500
    # Invoke the Lambda function to filter news
    try:
        lambda_response = lambda_client.invoke(
            FunctionName="news-app-lambda",  # Updated to the correct function name
            InvocationType="RequestResponse",
            Payload=json.dumps({"preferences": preferences})
        )
        lambda_result = json.loads(lambda_response['Payload'].read().decode('utf-8'))
        logger.info(f"Lambda response status: {lambda_result['statusCode']}")

        if lambda_result['statusCode'] != 200:
            logger.error(f"Lambda error: {lambda_result['body']}")
            return jsonify({"error": json.loads(lambda_result['body'])['error']}), lambda_result['statusCode']

        filtered_news = json.loads(lambda_result['body'])
        logger.info(f"Returning {len(filtered_news)} filtered news items from Lambda")
        return jsonify(filtered_news)

    except Exception as e:
        logger.error(f"Error invoking Lambda: {str(e)}")
        # Fallback to raw news if Lambda fails
        return jsonify(news_data)

@app.route('/api/raw')
def hello_world():
    return jsonify(get_nyt_news())

@app.route('/api/')
def health_check():
    return jsonify({"status": "ok"}), 200

@app.route('/api/signup', methods=['POST'])
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

@app.route('/api/login', methods=['POST'])
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

@app.route('/api/logout')
def logout():
    session.pop('email', None)
    return jsonify({"message": "Logout successful"}), 200

@app.route('/api/user')
def get_user():
    if 'email' not in session:
        return jsonify({"error": "Not logged in"}), 401
    user = User.objects(email=session['email']).first()
    return jsonify({
        "email": user.email,
        "preferences": user.preferences,
        "isFirstTime": user.isFirstTime
    }), 200

@app.route('/api/preferences', methods=['POST'])
def update_preferences():
    if 'email' not in session:
        logger.error("Preferences update failed: User not logged in")
        return jsonify({"error": "Login required"}), 401
    data = request.get_json()
    preferences = data.get('preferences', [])
    logger.info(f"Updating preferences for user {session['email']}: {preferences}")
    try:
        user = User.objects(email=session['email']).first()
        if not user:
            logger.error(f"User {session['email']} not found")
            return jsonify({"error": "User not found"}), 404
        user.update(set__preferences=preferences, set__isFirstTime=False)
        logger.info(f"Preferences updated successfully for user {session['email']}")
        return jsonify({"message": "Preferences updated"}), 200
    except pymongo.errors.ServerSelectionTimeoutError as e:
        logger.error(f"Preferences update failed due to MongoDB timeout: {str(e)}")
        return jsonify({"error": "Database connection timeout"}), 500

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000)

if __name__ == "__main__":
    app.run()