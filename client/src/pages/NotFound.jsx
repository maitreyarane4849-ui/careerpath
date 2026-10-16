import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-gray-600">That page doesn't exist.</p>
      <Link to="/" className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-blue-600 text-white">
        Go home
      </Link>
    </div>
  );
}