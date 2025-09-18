// src/components/Content.tsx
import React from 'react';

interface ContentProps {
  title: string;
  breadcrumb: string[];
}

export default function Content({ title, breadcrumb }: ContentProps) {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* 面包屑导航 */}
      <div className="text-sm text-gray-500 mb-4">
        {breadcrumb.map((crumb, index) => (
          <span key={index}>
            {crumb}
            {index < breadcrumb.length - 1 && <span className="mx-2"></span>}
          </span>
        ))}
      </div>

      {/* 文档标题 */}
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      {/* 文档正文 */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">什么是 Typescript?</h2>
        <p className="mb-2">Typescript 是什么？</p>
        <ul className="list-disc list-inside space-y-1 mb-6">
          <li>Typescript 是 JavaScript 的超集</li>
          <li>Typescript 添加了严格的类型系统</li>
          <li>Typescript 可以编译为纯净的 JavaScript 代码</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-2">为什么使用 Typescript?</h2>
        <ul className="list-disc list-inside space-y-1 mb-6">
          <li>提高代码可读性和可维护性</li>
          <li>减少运行时错误</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-2">示例代码</h2>
        <pre className="bg-gray-100 rounded p-4 overflow-x-auto text-sm">
{`let message: string = "Hello, Typescript!";
console.log(message);`}
        </pre>
      </section>
    </div>
  );
}
