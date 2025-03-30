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
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/news-galore', {
          credentials: 'include',  // Send session cookie
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          setIsAuthenticated(false);
          router.push('/routings/login');
        } else {
          throw new Error('Unexpected response');
        }
      } catch (err) {
        setIsAuthenticated(false);
        router.push('/routings/login');
      }
    };

    checkAuth();
  }, [router]);

  const navLinks: NavLink[] = [
    { name: "News", path: "/" },
    { name: "Profile", path: "/routings/profile", highlight: true },
  ];

  if (isAuthenticated === null) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;  // Redirect will handle this
  }

  return (
    <div className="w-full">
      <Navbar links={navLinks} />
      <FeedTray />
    </div>
  );
};

export default Home;