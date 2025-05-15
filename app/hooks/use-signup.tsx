import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from "react-toastify";
import { useSignupMutation } from '@/redux/features/authApiSlice';
import { useDispatch } from 'react-redux';


export default function useSignUp() {
    const dispatch = useDispatch();
	const router = useRouter();

    const [signup, {isLoading}] = useSignupMutation();

	const [inputValue, setInputValue] = useState({
		email: '',
		password: '',
		re_password: '',
	});

	const { email, password, re_password } = inputValue;

	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;

		setInputValue({ ...inputValue, [name]: value });
	};

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		signup({ email, password, re_password })
			.unwrap()
			.then(() => {
				toast.success('Please check email to verify account');
				router.push('/auth/login');
			})
			.catch(() => {
				toast.error('Failed to register account');
			});
	};

	return {
		email,
		password,
		re_password,
		onChange,
		onSubmit,
	};
}