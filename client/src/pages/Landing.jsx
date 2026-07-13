import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 text-center">
      <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
        For university students
      </span>
      <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
        Learn from real courses.
        <br />
        Track real progress.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500">
        Program connects students with instructor-built courses — browse, enroll,
        watch lessons, and track your progress in one place.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <Link
          to="/register"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Create free account
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Log in
        </Link>
      </div>
    </div>
  );
};

export default Landing;
