import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/redux/features/authApiSlice';

export default function useRegister() {
	const router = useRouter();
	const [register, { isLoading }] = useRegisterMutation();

	const [formData, setFormData] = useState({
		email: '',
		password: '',
		re_password: '',
	});

	const { email, password, re_password } = formData;

	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;

		setFormData({ ...formData, [name]: value });
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		register({ email, password, re_password })
			.unwrap()
			.then(() => {
				router.push('/auth/login');
			})
			.catch(() => {
				// toast.error('Failed to register account');
			});
	};

	return {
		email,
		password,
		re_password,
		isLoading,
		onChange,
		onSubmit,
	};
}