'use client';

import { useSignUp } from '@/hooks';
import { Form } from '@/components/forms';

export default function RegisterForm() {
	const {
		email,
		password,
		re_password,
		onChange,
		onSubmit,
	} = useSignUp();

	const config = [
		{
			labelText: 'Email',
			labelId: 'email',
			type: 'email',
			value: email,
			required: true,
		},
		{
			labelText: 'Password',
			labelId: 'password',
			type: 'password',
			value: password,
			required: true,
		},
		{
			labelText: 'Confirm password',
			labelId: 're_password',
			type: 'password',
			value: re_password,
			required: true,
		},
	];

	return (
		<Form
			config={config}
			formHeader='Register'
			btnText='Sign up'
			onChange={onChange}
			onSubmit={onSubmit}
		/>
	);
}
