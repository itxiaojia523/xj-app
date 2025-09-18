// src/layouts/AuthLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* 左边区域：可放置LOGO或品牌信息 */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold">My React App</h1>
          <p className="mt-4 text-lg">欢迎使用本系统，请登录或注册。</p>
        </div>
      </div>

      {/* 右边区域：登录/注册的表单容器 */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="absolute top-4 right-4 flex gap-4 text-sm">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-500'
            }
          >
            登录
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-500'
            }
          >
            注册
          </NavLink>
        </div>

        {/* 子路由将渲染在这里 */}
        <Outlet />
      </div>
    </div>
  );
}
