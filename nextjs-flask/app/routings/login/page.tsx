'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

interface LoginResponse {
  error?: string;
  message?: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data: LoginResponse = await response.json();
      console.log('Login response:', data, 'Status:', response.status); // Debug log
      if (response.ok) {
        router.push('/');  // Redirect to main page
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit} className="bg-gray-400 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-mono font-bold mb-4">Login</h1>
          <input
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            placeholder="Username"
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
          <Link href="/routings/signup" className="text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;