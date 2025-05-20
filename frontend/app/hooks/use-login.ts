import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useLoginMutation } from '../../redux/features/authApiSlice';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../redux/features/authSlice';

export default function useLogin() {
    const dispatch = useDispatch();
	const router = useRouter();

    const [login, {isLoading}] = useLoginMutation();

	const [inputValue, setInputValue] = useState({
		email: '',
		password: '',
	});

	const { email, password } = inputValue;

	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;

		setInputValue({ ...inputValue, [name]: value });
	};

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

        login({ email, password })
            .unwrap()
            .then(() => {
                dispatch(setAuth());
                toast.success('Logged in');
                router.push('/');
            })
            .catch(() => {
                toast.error('Failed to log in');
            });
	};

	return {
		email,
		password,
		onChange,
		onSubmit,
	};
}