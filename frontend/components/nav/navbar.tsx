'use client';

import Link from "next/link";
import React from "react";

// Define interface for navigation link objects
interface NavLink {
  name: string;
  path: string;
  highlight?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void; // Optional click handler
}

// Define props interface for Navbar component
interface NavbarProps {
  links: NavLink[];
}

const Navbar: React.FC<NavbarProps> = ({ links }) => {


  return (
    <div className="w-full flex flex-row justify-between items-center bg-slate-800 text-white text-2xl font-mono font-bold px-6 py-4">
      {links.map((link: NavLink, index: number) => (
        <Link key={index} href={link.path} legacyBehavior>
          <a
            onClick={link.onClick}
            className={`hover:text-gray-300 ${link.highlight ? 'bg-slate-700 px-4 py-2 rounded-md' : ''}`}
          >
            {link.name}
          </a>
      </Link>
      ))}
    </div>
  );
};

export default Navbar;