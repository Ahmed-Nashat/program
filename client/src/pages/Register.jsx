import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card max-w-[520px]">
        <div className="flex gap-1.5 mb-7">
           <div className="flex-1 h-1.5 rounded bg-brand"></div>
           <div className="flex-1 h-1.5 rounded bg-[#EDEAFB]"></div>
           <div className="flex-1 h-1.5 rounded bg-[#EDEAFB]"></div>
        </div>
        
        <p className="text-[13px] font-semibold text-brand uppercase tracking-wider mb-1.5">Step 1 of 3</p>
        <h2 className="text-[22px] font-bold mb-2 tracking-tight text-slate-900">Tell us about you</h2>
        <p className="text-sm text-text-secondary mb-7 leading-relaxed">Join as a student or an instructor to personalize your learning path.</p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="mb-4.5">
            <label htmlFor="name" className="block text-[13px] font-semibold mb-2 text-slate-900">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Ahmed Mohamed"
              value={formData.name}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="mb-4.5">
            <label htmlFor="email" className="block text-[13px] font-semibold mb-2 text-slate-900">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@university.edu"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="mb-4.5">
            <label htmlFor="password" className="block text-[13px] font-semibold mb-2 text-slate-900">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="mb-6">
            <label className="block text-[13px] font-semibold mb-2 text-slate-900">I am a</label>
            <div className="flex gap-2.5">
              {['student', 'instructor'].map((role) => (
                <div
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`flex-1 border-[1.5px] rounded-xl p-3.5 text-center cursor-pointer text-sm font-semibold capitalize transition-all ${
                    formData.role === role
                      ? 'border-brand bg-[#F3EEFF] text-brand'
                      : 'border-[#E4E1F5] text-text-secondary hover:border-brand/40'
                  }`}
                >
                  {role}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="auth-btn flex-1"
            >
              {submitting ? 'Creating account…' : 'Continue'}
            </button>
          </div>
        </form>

        <p className="mt-5.5 text-center text-[13px] text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
