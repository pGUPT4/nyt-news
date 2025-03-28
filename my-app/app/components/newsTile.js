'use client'

import React from 'react';

const NewsTile = ({ title, url }) => {
  return (
    <div 
        className="border border-gray-200 rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition-shadow"
        style={{ width: `${350}px`, height: `${350}px` }}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <a
        href={url}
        target="_blank"
        className="text-blue-600 hover:underline"
      >
        Read More
      </a>
    </div>
  );n
};

export default NewsTile;