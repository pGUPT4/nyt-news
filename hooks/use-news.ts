import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useAppDispatch } from '@/redux/hook';
import { useNewsMutation } from '@/redux/features/authApiSlice';
import { setAuth } from '@/redux/features/authSlice';

// I store multiple news call and make a for loop in feedTray that creates
// newsTile's argument's content

export default function useNews() {
	const dispatch = useAppDispatch();
	const [rawNews, { isLoading }] = useNewsMutation();
    const [news, setNews] = useState([]);

    useEffect(() => {
        rawNews({})
            .unwrap()
            .then(data => {
                dispatch(setAuth());
                setNews(data);
            })
            .catch((error) => {
                console.error('Failed to fetch news:', error);
            });
  }, [dispatch, rawNews]);

	return {
		news,
        isLoading,
	};
}
