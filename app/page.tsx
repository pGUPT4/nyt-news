'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FeedTray from '@/app/components/feedTray';
import Navbar from '@/app/components/navbar';

interface NavLink {
  name: string;
  path: string;
  highlight?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface NewsItem {
  title: string;
  url: string;
  des_facet: string[];
}

interface UserData {
  email: string;
  preferences: string[];
  isFirstTime: boolean;
}

const Home: React.FC = () => {
  const prod_url = "https://nyt-news-api.pgupt4.com/api"
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndUser = async () => {
      try {
        console.log('Checking authentication with /news-galore');
        const authResponse = await fetch(`${prod_url}/news-galore/`, {
          method: 'GET',
          credentials: 'include'
        });
        console.log('Auth response:', authResponse.status, authResponse);
        if (!authResponse.ok) {
          if (authResponse.status === 401) {
            setIsAuthenticated(false);
            router.push('/auth/login');
          }
          return;
        }
        setIsAuthenticated(true);

        // Fetch user data
        const userResponse = await fetch(`${prod_url}/user/`, {
          method: 'GET',
          credentials: 'include',
        });
        const userData: UserData = await userResponse.json();
        console.log('User data response:', userResponse.status, userData);
        if (userResponse.ok) {
          const emailUsername = userData.email.split('@')[0];
          setUsername(emailUsername);
          if (userData.isFirstTime) {
            // Fetch categories from /raw
            const rawResponse = await fetch(`${prod_url}/raw/`, {
              method: 'GET',
              credentials: 'include',
            });
            const rawData: NewsItem = await rawResponse.json();
            if (Array.isArray(rawData)) {
              const allCategories = rawData.flatMap((item: NewsItem) => item.des_facet || []);
              const uniqueCategories = Array.from(new Set(allCategories)) as string[];
              setCategories(uniqueCategories);
            } else {
              console.error('Failed to fetch categories:', rawData);
              setCategories([]);
            }
            setShowPopup(true);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAuthenticated(false);
        router.push('/auth/login');
      }
    };

    checkAuthAndUser();
  }, [router]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSavePreferences = async () => {
    try {
      const response = await fetch(`${prod_url}/preferences/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: selectedCategories }),
        credentials: 'include',
      });
      if (response.ok) {
        setShowPopup(false);
      } else {
        alert('Failed to save preferences');
      }
    } catch (err) {
      alert('Something went wrong');
    }
  };

  const navLinks: NavLink[] = [
    { name: "News", path: "/" },
    { name: username || "Profile", path: "/user/profile", highlight: true },
  ];

  if (isAuthenticated === null) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full bg-black text-white">
      <Navbar links={navLinks} />
      <FeedTray />
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-400 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-mono font-bold mb-4 text-gray-800">Select Your News Preferences</h2>
            <div className="max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <div key={category} className="mb-2">
                  <label className="flex items-center text-gray-800">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="mr-2"
                    />
                    {category}
                  </label>
                </div>
              ))}
            </div>
            <button
              onClick={handleSavePreferences}
              className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;