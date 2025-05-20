import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function useNews() {
    const [feed, setFeed] = useState<{ title: string; url: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const NEXT_PUBLIC_NYT_NEWS = process.env.NEXT_PUBLIC_NYT_NEWS;

    const nytUrl = `https://api.nytimes.com/svc/news/v3/content/all/all.json?api-key=${NEXT_PUBLIC_NYT_NEWS}`;

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const response = await fetch(nytUrl, { method: 'GET' });
                if (!response.ok) throw new Error('Network response was not ok');
                const result = await response.json();
                setFeed(result.results.map((item: any) => ({
                    title: item.title,
                    url: item.url,
                })));
            } catch (error) {
                //
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return {
        feed,
        loading,
    };
}