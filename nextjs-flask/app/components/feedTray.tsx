'use client';

import React, { useState, useEffect } from 'react';
import NewsTile from './newsTile';
import { useRouter } from 'next/navigation';

// Define interface for news item
interface NewsItem {
  title: string;
  url: string;
  // Add other properties if they exist in your API response
}

const FeedTray: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNews = async (): Promise<void> => {
      try {
        const response = await fetch('https://news-recommender-backend-20d530136c15.herokuapp.com/news-galore', {
          credentials: 'include',  // Send session cookie from OAuth
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/routings/login');  // Redirect to login on unauthorized
            return;
          }
          throw new Error('Failed to fetch news');
        }
        
        const data: NewsItem[] = await response.json();
        setNewsItems(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchNews();
  }, [router]);  // Add router as dependency

  return (
    <div className="flex justify-center min-h-screen">
      <div className="mt-20 w-full max-w-[1150px] h-[900px] bg-gray-400 rounded-lg p-4 overflow-y-auto">
        {loading ? (
          <div className="text-gray-800 text-center">Loading news...</div>
        ) : error ? (
          <div className="text-red-900 text-center">Error: {error}</div>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {newsItems.map((item: NewsItem, index: number) => (
              <NewsTile key={index} title={item.title} url={item.url} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedTray;