from flask import Flask, jsonify
from dotenv import load_dotenv
import os
import requests
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

env_vars = {
    "MONGO_URI": os.getenv("MONGO_URI"),
    "NYT_API_KEY": os.getenv("NYT_API_KEY"),
    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID"),
    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY"),
    "AWS_BUCKET_NAME": os.getenv("AWS_BUCKET_NAME", "pgupt4-news-app-s3")
}

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

@app.route('/raw')
def hello_world():
    return jsonify(get_nyt_news())

@app.route('/')
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
