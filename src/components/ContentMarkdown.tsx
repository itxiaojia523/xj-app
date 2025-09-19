// src/components/ContentMarkdown.tsx
import { use, useCallback, useEffect, useState } from "react";
import MarkdownEditor from "@uiw/react-markdown-editor";
import Markdown from "@uiw/react-markdown-preview";
import { getDocDetail, updateDoc } from "../api/doc";
import { Navigate, useParams } from "react-router-dom";
import { DocItem } from "../type";
import EditableTitle from "./EditableTitle";

// {
//   storageKey, title, initial = '# 双击正文开始编辑', height = 520,
// }: { storageKey: string; title: string; initial?: string; height?: number }
export default function ContentMarkdown() {
  // const [value, setValue] = useState('');
  // const [lastSaved, setLastSaved] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [docItem, setDocItem] = useState<DocItem>({
    id: "",
    title: "",
    content: "",
    sortIndex: 9999,
  });
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const res = await getDocDetail(id);
      setDocItem(res);
    };
    fetchData();
  }, [id]);

  // useEffect(() => {
  //   const saved = localStorage.getItem(storageKey);
  //   const text = saved ?? initial;
  //   setValue(text);
  //   setLastSaved(text);
  //   setIsEditing(false);
  // }, [storageKey, initial]);

  // const doSave = useCallback((next?: string) => {
  //   const content = next ?? value;
  //   localStorage.setItem(storageKey, content);
  //   setLastSaved(content);
  // }, [storageKey, value]);

  // useEffect(() => {
  //   if (!isEditing) return;
  //   const onKey = (e: KeyboardEvent) => {
  //     const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';
  //     const isEsc = e.key === 'Escape';
  //     if (isSave) { e.preventDefault(); doSave(); setIsEditing(false); }
  //     if (isEsc)  { e.preventDefault(); setValue(lastSaved); setIsEditing(false); }
  //   };
  //   window.addEventListener('keydown', onKey);
  //   return () => window.removeEventListener('keydown', onKey);
  // }, [isEditing, doSave, lastSaved]);
  const handleSave = async () => {
    await updateDoc(docItem);
    setIsEditing(false);
  };
  const handleSaveTitle = async (newTitle: string) => {
    const next = { ...docItem, title: newTitle };
    setDocItem(next);
    await updateDoc(next); // 🔥 同步落库（也可做成防抖）
  };

  if (!id)
    return (
      <>
        <h1>请新建文档</h1>
      </>
    );
  return (
    <section className="flex-1 p-4 flex flex-col gap-3" data-color-mode="light">
      <div className="flex items-center justify-between">
        <EditableTitle value={docItem.title} onSave={handleSaveTitle} />
        {isEditing ? (
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white"
              onClick={handleSave}
            >
              保存（Ctrl/Cmd+S）
            </button>
            <button
              className="px-3 py-1 rounded border"
              onClick={() => {
                // setValue(lastSaved);
                setIsEditing(false);
              }}
            >
              取消（Esc）
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-500">双击正文进入编辑</span>
        )}
      </div>

      {isEditing ? (
        <MarkdownEditor
          value={docItem.content}
          height={520 + "px"}
          onChange={(v) => setDocItem({ ...docItem, content: v })}
        />
      ) : (
        <div
          className="rounded border p-4 cursor-text select-text"
          onDoubleClick={() => setIsEditing(true)}
          title="双击进入编辑"
        >
          <Markdown source={docItem.content} />
        </div>
      )}
    </section>
  );
}
