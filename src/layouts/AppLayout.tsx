// src/layouts/AppLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white shadow">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">My React App</h1>
          <nav className="flex gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'text-blue-400 font-semibold' : 'hover:text-gray-300'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? 'text-blue-400 font-semibold' : 'hover:text-gray-300'
              }
            >
              About
            </NavLink>

             <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-400 font-semibold'
                  : 'hover:text-gray-300'
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-400 font-semibold'
                  : 'hover:text-gray-300'
              }
            >
              Register
            </NavLink>
            <NavLink
              to="/recipes"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-400 font-semibold'
                  : 'hover:text-gray-300'
              }
            >
              Recipes
            </NavLink>
            <NavLink
              to="/docs"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-400 font-semibold'
                  : 'hover:text-gray-300'
              }
            >
              Document
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* 子路由将渲染在这里 */}
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-3 text-gray-600 text-sm">
        © {new Date().getFullYear()} My React App. All rights reserved.
      </footer>
    </div>
  );
}
