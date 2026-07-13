import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-lg mx-auto mb-5">
          U
        </div>
        <h1 className="text-2xl font-bold text-center mb-1.5 tracking-tight text-slate-900">Welcome Back</h1>
        <p className="text-sm text-text-secondary text-center mb-7">Continue learning with your account</p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="mb-4.5">
            <label htmlFor="email" className="block text-[13px] font-semibold mb-2 text-slate-900">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
          </div>

          <div className="mb-4.5">
            <label htmlFor="password" className="block text-[13px] font-semibold mb-2 text-slate-900">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </div>
          
          <div className="flex items-center justify-between mt-0.5 mb-6">
            <label className="flex items-center gap-2 text-[13px] text-text-secondary cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-brand w-4 h-4 cursor-pointer" /> 
              Remember Me
            </label>
            <a href="#" className="text-[13px] text-brand font-semibold hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="auth-btn"
          >
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-5.5 text-center text-[13px] text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Create Account
          </Link>
        </p>
        <p className="mt-3.5 text-center text-xs text-[#B4B1C6]">
          Students: use your university email · Others: any email works
        </p>
      </div>
    </div>
  );
};

export default Login;
