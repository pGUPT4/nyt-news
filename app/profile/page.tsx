'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Navbar from '@/components/navbar';
import { useRetrieveUserQuery } from '@/redux/features/authApiSlice';

interface NavLink {
  name: string;
  path: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  highlight?: boolean;
}

interface UserData {
  email: string;
  preferences: string[];
}

interface NewsItem {
  des_facet: string[];
}

const Profile: React.FC = () => {
  const {data: user, isLoading, isFetching} = useRetrieveUserQuery();
  const prod_url = "https://news-backend-django-5ae28e9da582.herokuapp.com"
  const [activeSection, setActiveSection] = useState<'userInfo' | 'preferences'>('userInfo');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const router = useRouter();

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       // Fetch user data
  //       const userResponse = await fetch(`${prod_url}/user/`, {
  //         credentials: 'include',
  //         method: 'GET'
  //       });
  //       if (!userResponse.ok) {
  //         throw new Error('Failed to fetch user data');
  //       }
  //       const userData = await userResponse.json();
  //       setUserData({
  //         email: userData.email,
  //         preferences: Array.isArray(userData.preferences) ? userData.preferences : [],
  //       });
  //       setSelectedCategories(userData.preferences || []);

  //       // Fetch categories from /raw
  //       const rawResponse = await fetch(`${prod_url}/raw/`, {
  //         credentials: 'include',
  //         method: 'GET'
  //       });
  //       const rawData: NewsItem = await rawResponse.json();
  //       // Check if rawData is an array (news items) or an error object
  //       if (Array.isArray(rawData)) {
  //         const allCategories = rawData.flatMap((item: NewsItem) => item.des_facet || []);
  //         const uniqueCategories = Array.from(new Set(allCategories)) as string[];
  //         setCategories(uniqueCategories);
  //       } else {
  //         // Handle error case (e.g., { error: "NYT API request failed" })
  //         console.error('Failed to fetch categories');
  //         setCategories([]);
  //       }
  //     } catch (err) {
  //       setError('Failed to load user data');
  //       router.push('/auth/login');
  //     }
  //   };
  //   fetchUserData();
  // }, [router]);

  // const handleLogout = async (): Promise<void> => {
  //   try {
  //     const response = await fetch(`${prod_url}/logout/`, {
  //       credentials: 'include',
  //       method: 'GET'
  //     });
  //     if (response.ok) {
  //       router.push('/auth/login');
  //     } else {
  //       alert('Logout failed');
  //     }
  //   } catch (err) {
  //     alert('Something went wrong');
  //   }
  // };

  // const handleCategoryChange = (category: string) => {
  //   setSelectedCategories((prev) =>
  //     prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
  //   );
  // };

  // const handleSavePreferences = async () => {
  //   try {
  //     const response = await fetch(`${prod_url}/preferences/`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ preferences: selectedCategories }),
  //       credentials: 'include',
  //     });
  //     if (response.ok) {
  //       setUserData((prev) => prev ? { ...prev, preferences: selectedCategories } : prev);
  //     } else {
  //       alert('Failed to save preferences');
  //     }
  //   } catch (err) {
  //     alert('Something went wrong');
  //   }
  // };

  const navLinks: NavLink[] = [
    { name: "Home", path: "../home" },
    // { name: "Logout", path: "#", onClick: handleLogout, highlight: true },
    { name: "Logout", path: "#", highlight: true },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar links={navLinks} />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 p-4 h-[calc(100vh-64px)]">
          <h1 className="text-2xl font-mono font-bold mb-6">Profile</h1>
          <div className="space-y-2">
            <button
              onClick={() => setActiveSection('userInfo')}
              className={`w-full text-left px-4 py-2 rounded font-mono ${
                activeSection === 'userInfo' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'
              }`}
            >
              User Information
            </button>
            <button
              onClick={() => setActiveSection('preferences')}
              className={`w-full text-left px-4 py-2 rounded font-mono ${
                activeSection === 'preferences' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'
              }`}
            >
              Personal Preferences
            </button>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-6 flex justify-center">
          <div className="mt-10 w-full max-w-[1150px] h-[900px] bg-gray-400 rounded-lg p-4 overflow-y-auto">
            {error && <p className="text-red-900 mb-4">{error}</p>}
            {!userData ? (
              <p className="text-gray-800 text-center">Loading...</p>
            ) : (
              <>
                {activeSection === 'userInfo' && (
                  <div>
                    <h2 className="text-xl font-mono font-semibold mb-2 text-gray-800">User Information</h2>
                    <p className="text-gray-800">Email: {userData.email}</p>
                  </div>
                )}
                {activeSection === 'preferences' && (
                  <div>
                    <h2 className="text-xl font-mono font-semibold mb-2 text-gray-800">Personal Preferences</h2>
                    <div className="mb-4">
                      <h3 className="text-lg font-mono font-medium mb-2 text-gray-800">Current Preferences:</h3>
                      {userData.preferences && userData.preferences.length > 0 ? (
                        <ul className="list-disc pl-5 text-gray-800">
                          {userData.preferences.map((pref, index) => (
                            <li key={index}>{pref}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-800">No preferences set yet.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-mono font-medium mb-2 text-gray-800">Update Preferences:</h3>
                      {/* <div className="max-h-60 overflow-y-auto">
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
                      </div> */}
                      {/* <button
                        onClick={handleSavePreferences}
                        className="mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                      >
                        Save Preferences
                      </button> */}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;