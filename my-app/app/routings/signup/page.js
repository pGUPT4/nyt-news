'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('https://news-flask-backend-a6bd30d085ef.herokuapp.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',  // For session cookies
      });
      const data = await response.json();
      if (response.ok) {
        router.push('/routings/login');  // Redirect to login after signup
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = 'https://news-flask-backend-a6bd30d085ef.herokuapp.com/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="bg-gray-400 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-mono font-bold mb-4">Sign Up</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-2 mb-4 border text-black rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border text-black rounded"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="w-full p-2 mb-4 border text-black rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4"
        >
          Sign Up
        </button>
        <button
          type="button"  // Prevent form submission
          onClick={handleGoogleSignup}
          className="w-full bg-blue-800 text-white p-2 rounded hover:bg-blue-900"
        >
          Sign Up with Google
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
}