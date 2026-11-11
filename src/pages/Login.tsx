import { useState } from 'react';
import { AudioLines, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onNavigateRegister: () => void;
}

export default function Login({
  onLogin,
  onNavigateRegister,
}: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D64F88] text-white">
            <AudioLines size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#26364A]">
              MeetGraph AI
            </h1>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#718096]">
              MEETING INTELLIGENCE
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-[#F1D5E1] bg-white p-7 shadow-sm sm:p-9">
          <div className="mb-7">
            <span className="inline-flex rounded-full border border-[#BCE7EB] bg-[#E8F8F9] px-3 py-1 text-xs font-semibold text-[#087F91]">
              SECURE WORKSPACE ACCESS
            </span>

            <h2 className="mt-5 text-2xl font-bold text-[#087F91]">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#718096]">
              Sign in to access your meeting intelligence workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#26364A]">
                Email address
              </label>

              <div className="flex items-center rounded-xl border border-[#DCE7EA] px-3 focus-within:border-[#078B9B]">
                <Mail size={18} className="text-[#94A3B8]" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#26364A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#26364A]">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-[#DCE7EA] px-3 focus-within:border-[#078B9B]">
                <Lock size={18} className="text-[#94A3B8]" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#26364A] outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#94A3B8] hover:text-[#087F91]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D64F88] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C44279] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#718096]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              className="font-semibold text-[#D64F88] hover:underline"
            >
              Create one
            </button>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          Secure access to your MeetGraph AI workspace.
        </p>
      </div>
    </main>
  );
}