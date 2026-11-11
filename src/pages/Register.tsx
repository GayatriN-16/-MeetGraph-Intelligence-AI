
import { useState } from 'react';
import {
  AudioLines,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

interface RegisterProps {
  onRegister: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  onNavigateLogin: () => void;
}

export default function Register({
  onRegister,
  onNavigateLogin,
}: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await onRegister(name.trim(), email.trim(), password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create account.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#E8E8FA] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7412D8] to-[#5135E8] text-white shadow-lg shadow-[#6810D9]/20">
            <AudioLines size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#17152B]">
              MeetGraph AI
            </h1>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#77738F]">
              MEETING INTELLIGENCE
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-7 shadow-xl shadow-[#5135E8]/5 sm:p-9">
          <div className="mb-6">
            <span className="inline-flex rounded-full border border-[#E2DDF5] bg-[#F0E9FF] px-3 py-1 text-xs font-semibold text-[#6810D9]">
              CREATE YOUR WORKSPACE ACCOUNT
            </span>

            <h2 className="mt-5 text-2xl font-bold text-[#17152B]">
              Create account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#625D7A]">
              Get started with intelligent meeting management.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#25213B]">
                Full name
              </label>

              <div className="flex items-center rounded-xl border border-[#E2DDF5] bg-[#F8F5FF] px-3 transition focus-within:border-[#6810D9] focus-within:ring-2 focus-within:ring-[#F0E9FF]">
                <User size={18} className="text-[#89849F]" />

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={150}
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#25213B] outline-none placeholder:text-[#89849F]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#25213B]">
                Email address
              </label>

              <div className="flex items-center rounded-xl border border-[#E2DDF5] bg-[#F8F5FF] px-3 transition focus-within:border-[#6810D9] focus-within:ring-2 focus-within:ring-[#F0E9FF]">
                <Mail size={18} className="text-[#89849F]" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#25213B] outline-none placeholder:text-[#89849F]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#25213B]">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-[#E2DDF5] bg-[#F8F5FF] px-3 transition focus-within:border-[#6810D9] focus-within:ring-2 focus-within:ring-[#F0E9FF]">
                <Lock size={18} className="text-[#89849F]" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#25213B] outline-none placeholder:text-[#89849F]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#89849F] transition hover:text-[#6810D9]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#25213B]">
                Confirm password
              </label>

              <div className="flex items-center rounded-xl border border-[#E2DDF5] bg-[#F8F5FF] px-3 transition focus-within:border-[#6810D9] focus-within:ring-2 focus-within:ring-[#F0E9FF]">
                <Lock size={18} className="text-[#89849F]" />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#25213B] outline-none placeholder:text-[#89849F]"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#DC2626]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7412D8] to-[#5135E8] px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#6810D9]/15 transition hover:shadow-lg hover:shadow-[#6810D9]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#625D7A]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-semibold text-[#6810D9] hover:underline"
            >
              Sign in
            </button>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-[#89849F]">
          MeetGraph AI · Meeting Intelligence Workspace
        </p>
      </div>
    </main>
  );
}
