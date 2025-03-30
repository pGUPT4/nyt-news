'use client';

import Navbar from "./components/navbar";
import FeedTray from "./components/feedTray";

// Define interface for navigation link objects
interface NavLink {
  name: string;
  path: string;
  highlight?: boolean;
}

export default function Home(): JSX.Element {
  const navLinks: NavLink[] = [
    { name: "News", path: "/" },
    { name: "Profile", path: "/routings/profile", highlight: true },
  ];

  return (
    <div className="w-full">
      <Navbar links={navLinks} />
      <FeedTray />
    </div>
  );
}