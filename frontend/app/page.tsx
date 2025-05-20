'use client';

import FeedTray from '@/components/newsItem/feedTray';
import Navbar from '@/components/nav/navbar';
import { useLogout } from './hooks';
import { useAppSelector } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface NavLink {
	name: string;
	path: string;
	highlight?: boolean;
	onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Home: React.FC = () => {
	const router = useRouter();
	const {onClick} = useLogout();
	
	const navLinks: NavLink[] = [
		{ name: "News", path: "/" },
		{ name: "Logout", path: "/auth/login", onClick: onClick },
	];

	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
	
	useEffect(() => {
		if (isAuthenticated == false) {
			router.push('/auth/login');
		}
	}, [isAuthenticated, router]);

  	return (
		<div className="w-full bg-black text-white">
			<Navbar links={navLinks} />
			<FeedTray />
		</div>
  	);
};

export default Home;