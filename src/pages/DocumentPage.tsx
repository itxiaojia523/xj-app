// src/pages/DocumentPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ContentMarkdown from '../components/ContentMarkdown';
import { getDocs } from '../api/doc';

// const defaultItems: DocItem[] = [
//   { id: 'doc-intro', title: '项目说明' },
//   { id: 'doc-ts-course', title: 'TypeScript 课件' },
//   { id: 'doc-todo', title: '待办清单' },
// ];

const initialById: Record<string, string> = {
  'doc-intro': '# 项目说明\n\n这里写项目概览、目录结构、约定…',
  'doc-ts-course': '# TypeScript 课件\n\n- 什么是 TS\n- 基本类型\n- 泛型与工具类型',
  'doc-todo': '# 待办清单\n\n- [ ] 需求梳理\n- [ ] 组件拆分\n- [ ] 接口联调',
};

function keyOf(id: string) {
  return `md:${id}`;
}

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  // const [docs, setDocs] = useState(defaultItems);

  // const current = useMemo(() => docs.find((i) => i.id === id), [id, docs]);

 

  // if (!id || !current) return <Navigate to={`/docs/${docs[0].id}`} replace />;



  return (
    <div className="flex h-screen">
      <Sidebar
        // items={docs}
        // selectedId={id}
        // onReorder={(newItems) => setDocs(newItems)}
      />
      <ContentMarkdown
        // storageKey={keyOf(current.id)}
        // title={current.title}
        // initial={initialById[current.id]}
      />
    </div>
  );
}
