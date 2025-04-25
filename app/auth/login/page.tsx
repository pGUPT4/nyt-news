'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

interface LoginResponse {
  error?: string;
  message?: string;
}

const Login: React.FC = () => {
  const prod_url = "https://nyt-news-api.pgupt4.com/api/jwt/create/"
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 8;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at<LMNT> least 8 characters');
      return;
    }

    try {
      console.log('Sending Login data:', { email, password });
      const response = await fetch(`${prod_url}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data: LoginResponse = await response.json();
      console.log('Login response:', data, 'Status:', response.status);
      if (response.ok) {
        router.push('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit} className="bg-gray-400 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-mono font-bold mb-4">Login</h1>
          <input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 mb-4 border text-black rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 mb-4 border text-black rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4"
          >
            Login
          </button>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        </form>
        <p className="mt-4 text-white text-center">
          New here?{' '}
          <Link href="/auth/signup" className="text-blue-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;