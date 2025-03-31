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

const Home: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string>(''); // Store username part of email
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndUser = async () => {
      try {
        const authResponse = await fetch('http://localhost:5000/news-galore', {
          credentials: 'include',
        });
        if (!authResponse.ok) {
          if (authResponse.status === 401) {
            setIsAuthenticated(false);
            router.push('/routings/login');
          }
          return;
        }
        setIsAuthenticated(true);

        const userResponse = await fetch('http://localhost:5000/user', {
          credentials: 'include',
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          // Extract username from email (e.g., "name" from "name@example.com")
          const email = userData.email;
          const username = email.split('@')[0];
          setUsername(username);
        }
      } catch (err) {
        setIsAuthenticated(false);
        router.push('/routings/login');
      }
    };

    checkAuthAndUser();
  }, [router]);

  const navLinks: NavLink[] = [
    { name: "News", path: "/" },
    { name: username || "Profile", path: "/routings/profile", highlight: true }, // Use username or fallback to "Profile"
  ];

  if (isAuthenticated === null) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirect will handle this
  }

  return (
    <div className="w-full">
      <Navbar links={navLinks} />
      <FeedTray />
    </div>
  );
};

export default Home;