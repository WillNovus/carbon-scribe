'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/store';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';

  const login = useStore((s) => s.login);
  const error = useStore((s) => s.error);
  const clearError = useStore((s) => s.clearError);
  const loading = useStore((s) => s.loading.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    if (!email.includes('@')) return; // basic sanity
    if (password.length < 6) return;

    try {
      await login(email, password);
      router.replace(next);
    } catch {
      // error already stored
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Login</h1>
        <p className="text-gray-600 mt-1">Sign in to your portal.</p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@domain.com"
              type="email"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/register')}
            className="w-full py-2 rounded-lg border border-gray-300 text-gray-900 font-medium hover:bg-gray-50"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
