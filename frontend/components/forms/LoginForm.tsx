'use client';

import Form from './Form';
import { useLogin } from '@/app/hooks';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';

export default function LoginForm() {
  const { email, password, onChange, onSubmit } = useLogin();

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
  ];

  return (
    <div>
      <Form
        config={config}
        btnText="Login"
        formHeader="Login"
        onChange={onChange}
        onSubmit={onSubmit}
      >
        <p className="text-white text-center mt-4">
          New here?{' '}
          <Link href="/auth/register" className="text-blue-400 hover:underline">
            Create an account
          </Link>
        </p>
      </Form>
      <ToastContainer />
    </div>
  );
}