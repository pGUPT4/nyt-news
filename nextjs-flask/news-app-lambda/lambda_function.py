import json
import boto3
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize S3 client
s3 = boto3.client('s3')

def filter_news_by_preferences(news_data, preferences):
    if not preferences:  # If no preferences, return all news
        return news_data
    # Normalize preferences to lowercase for case-insensitive matching
    preferences = [pref.lower() for pref in preferences]
    filtered_news = []
    for item in news_data:
        des_facet = item.get("des_facet", [])
        # Normalize des_facet to lowercase for comparison
        if des_facet and any(pref in [facet.lower() for facet in des_facet] for pref in preferences):
            filtered_news.append(item)
    return filtered_news

def lambda_handler(event, context):
    try:
        # Get user preferences from the event
        preferences = event.get('preferences', [])
        logger.info(f"Received preferences: {preferences}")

        # S3 bucket and prefix details
        bucket_name = "pgupt4-news-app-s3"
        prefix = "raw/"

        # List objects in S3 to find the latest raw news file
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        if 'Contents' not in response:
            logger.error("No raw news files found in S3")
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'No raw news files found'})
            }

        # Get the latest file based on LastModified
        latest_file = max(response['Contents'], key=lambda x: x['LastModified'])
        latest_key = latest_file['Key']
        logger.info(f"Fetching latest file: {latest_key}")

        # Fetch the latest news file from S3
        obj = s3.get_object(Bucket=bucket_name, Key=latest_key)
        news_data = json.loads(obj['Body'].read().decode('utf-8'))
        logger.info(f"Fetched {len(news_data)} news items from S3")

        # Filter news based on preferences
        filtered_news = filter_news_by_preferences(news_data, preferences)
        logger.info(f"Returning {len(filtered_news)} filtered news items")

        return {
            'statusCode': 200,
            'body': json.dumps(filtered_news)
        }

    except Exception as e:
        logger.error(f"Error in Lambda function: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }