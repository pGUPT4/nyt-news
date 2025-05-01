'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FeedTray from '@/components/news/feedTray';
import Navbar from '@/components/navbar';
import { useRetrieveUserQuery, useNewsMutation } from '@/redux/features/authApiSlice';

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
  const {data: user, isLoading, isFetching} = useRetrieveUserQuery(); 

  const config = [
    {
      label: 'Email',
      value: user?.email,
    },
  ];
  const username = config[0].value?.split('@')[0]
  console.log('username - ' + config[0].label)
	const navLinks: NavLink[] = [
		{ name: "News", path: "/home_page" },
		{ name: username || "Profile", path: "/profile", highlight: true },
	];

  	if (isLoading || isFetching) {
	    return <div className="text-white text-center">Loading...</div>;
	  }

  	return (
		<div className="w-full bg-black text-white">
			<Navbar links={navLinks} />
			<FeedTray />
		</div>
  	);
};

export default Home;