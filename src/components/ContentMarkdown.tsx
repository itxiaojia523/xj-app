// src/components/ContentMarkdown.tsx
import { useCallback, useEffect, useState } from 'react';
import MarkdownEditor from '@uiw/react-markdown-editor';
import Markdown from '@uiw/react-markdown-preview';

export default function ContentMarkdown({
  storageKey, title, initial = '# 双击正文开始编辑', height = 520,
}: { storageKey: string; title: string; initial?: string; height?: number }) {
  const [value, setValue] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const text = saved ?? initial;
    setValue(text);
    setLastSaved(text);
    setIsEditing(false);
  }, [storageKey, initial]);

  const doSave = useCallback((next?: string) => {
    const content = next ?? value;
    localStorage.setItem(storageKey, content);
    setLastSaved(content);
  }, [storageKey, value]);

  useEffect(() => {
    if (!isEditing) return;
    const onKey = (e: KeyboardEvent) => {
      const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';
      const isEsc = e.key === 'Escape';
      if (isSave) { e.preventDefault(); doSave(); setIsEditing(false); }
      if (isEsc)  { e.preventDefault(); setValue(lastSaved); setIsEditing(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isEditing, doSave, lastSaved]);

  return (
    <section className="flex-1 p-4 flex flex-col gap-3" data-color-mode="light">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{title}</h1>
        {isEditing ? (
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => { doSave(); setIsEditing(false); }}>
              保存（Ctrl/Cmd+S）
            </button>
            <button className="px-3 py-1 rounded border" onClick={() => { setValue(lastSaved); setIsEditing(false); }}>
              取消（Esc）
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-500">双击正文进入编辑</span>
        )}
      </div>

      {isEditing ? (
        <MarkdownEditor value={value} height={height+"px"} onChange={(v) => setValue(v)} />
      ) : (
        <div className="rounded border p-4 cursor-text select-text" onDoubleClick={() => setIsEditing(true)} title="双击进入编辑">
          <Markdown source={lastSaved} />
        </div>
      )}
    </section>
  );
}
