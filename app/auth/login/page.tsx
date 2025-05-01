'use client';

import Link from "next/link";
import { LoginForm } from '@/components/forms';

interface LoginResponse {
  error?: string;
  message?: string;
}

const Login: React.FC = () => {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="flex flex-col items-center">
        <LoginForm />
        <p className="text-white text-center">
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