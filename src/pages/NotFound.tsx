// src/pages/NotFound.tsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
      <p className="mt-2 text-gray-700">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:opacity-90">
        Back to Home
      </Link>
    </div>
  );
}
