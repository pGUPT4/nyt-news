'use client';

import React, { useState, useEffect } from 'react';
import NewsTile from './newsTile';
import { useRouter } from 'next/navigation';

interface NewsItem {
  title: string;
  url: string;
  des_facet: string[];
}

const FeedTray: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<string[]>([]); // State for preferences
  const router = useRouter();

  const fetchNewsAndPreferences = async (): Promise<void> => {
    try {
      // Fetch user preferences
      const prefResponse = await fetch('/api/user', {
        credentials: 'include',
      });
      if (!prefResponse.ok) throw new Error('Failed to fetch user preferences');
      const prefData = await prefResponse.json();
      
      // Check if preferences have changed
      const newPreferences = prefData.preferences || [];
      if (JSON.stringify(newPreferences) !== JSON.stringify(preferences)) {
        setPreferences(newPreferences);

        // Fetch news based on the latest preferences
        const newsResponse = await fetch('/api/news-galore', {
          credentials: 'include',
        });

        if (!newsResponse.ok) {
          if (newsResponse.status === 401) {
            router.push('/routings/login');
            return;
          }
          throw new Error('Failed to fetch news');
        }

        const data = await newsResponse.json();
        console.log('Raw data from /news-galore:', data); // Debug log
        if (!Array.isArray(data)) {
          throw new Error('Unexpected data format: Expected an array');
        }
        setNewsItems(data);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNewsAndPreferences();

    // Set up polling to check for preference updates every 5 seconds
    const intervalId = setInterval(() => {
      fetchNewsAndPreferences();
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [router]); // Only depend on router

  return (
    <div className="flex justify-center min-h-screen">
      <div className="mt-20 w-full max-w-[1150px] h-[900px] bg-gray-400 rounded-lg p-4 overflow-y-auto">
        {loading ? (
          <div className="text-gray-800 text-center">Loading news...</div>
        ) : error ? (
          <div className="text-red-900 text-center">Error: {error}</div>
        ) : newsItems.length === 0 ? (
          <div className="text-gray-800 text-center">
            No news available for your preferences. Try updating your preferences in the{' '}
            <a href="/routings/profile" className="text-blue-600 hover:underline">
              Profile
            </a>{' '}
            page.
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {newsItems.map((item: NewsItem, index: number) => (
              <NewsTile
                key={index}
                title={item.title}
                url={item.url}
                des_facet={item.des_facet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedTray;