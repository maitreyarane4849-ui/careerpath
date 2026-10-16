import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/dashboard', 'Dashboard'],
  ['/profile', 'Profile'],
  ['/results', 'Results'],
  ['/roadmap', 'Roadmap'],
  ['/reports', 'Reports'],
  ['/settings', 'Settings'],
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <Link to="/" className="text-xl font-bold text-blue-700">
          CareerPath
        </Link>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {user ? (
            <>
              {links.map(([to, label]) => (
                <Link key={to} to={to} className="text-gray-700 hover:text-blue-700">
                  {label}
                </Link>
              ))}
              <span className="text-gray-400 hidden md:inline">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-700">Login</Link>
              <Link to="/register" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}