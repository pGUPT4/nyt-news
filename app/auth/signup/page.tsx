'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignUpForm } from '@/components/forms';

const Signup: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 rounded-lg shadow-lg">
      <SignUpForm />
      <p className="text-white text-center">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
      </p>
    </div>
  );
};

export default Signup;