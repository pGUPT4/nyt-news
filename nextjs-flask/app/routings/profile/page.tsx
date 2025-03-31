'use client';

import { useRouter } from 'next/navigation';
import Link from "next/link";
import Navbar from '@/app/components/navbar';

interface NavLink {
  name: string;
  path: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  highlight?: boolean;
}

const Profile: React.FC = () => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/logout', {  // Update to local backend
        credentials: 'include',
      });
      if (response.ok) {
        router.push('/routings/login');
      } else {
        alert('Logout failed');
      }
    } catch (err) {
      alert('Something went wrong');
    }
  };

  const navLinks: NavLink[] = [
    { name: "Home", path: "../" },
    { name: "Logout", path: "#", onClick: handleLogout, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar links={navLinks} />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p>Welcome to your profile!</p>
      </div>
    </div>
  );
};

export default Profile;