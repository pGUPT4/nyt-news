'use client';

import React from 'react';
// import { useNews } from '@/app/hooks';
// import NewsTile from '../news/newsTile';

const FeedTray: React.FC = () => {
  // const { news, isLoading } = useNews();
  const isLoading = false

  return (
    <div className="flex justify-center min-h-screen">
      <div className="mt-20 w-full max-w-[1150px] h-[900px] bg-gray-400 rounded-lg p-4 overflow-y-auto">
        {/* {isLoading ? (
          <p className="text-center text-gray-800">Loading news...</p>
        ) : news.length === 0 ? (
          <p className="text-center text-gray-800">No news available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item, index) => (
              <NewsTile
                key={index} 
                title={item.title || 'No title'} 
                url={item.url || '#'} 
              />
            ))}
          </div>
        )}
         */}

        
        <p className="text-center text-gray-800">Loading news...</p>
        
      </div>
    </div>
  );
};

export default FeedTray;