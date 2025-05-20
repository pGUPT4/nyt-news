import { FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useLogoutMutation } from '../../redux/features/authApiSlice';
import { useDispatch } from 'react-redux';
import { setLogout } from '../../redux/features/authSlice';

export default function useLogout() {
    const dispatch = useDispatch();
	const router = useRouter();

    const [logout, {isLoading}] = useLogoutMutation();

    const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        logout({})
            .unwrap()
            .then(() => {
                dispatch(setLogout());
                toast.success('Logged out successfully');
                router.push('/auth/login');
            })
            .catch(() => {
                toast.error('Failed to log out');
            });
    };

	return {
        onClick
	};
}