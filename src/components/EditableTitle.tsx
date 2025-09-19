import { useState, useEffect } from "react";

interface EditableTitleProps {
  value: string;                      // 改成受控 value
  onSave: (v: string) => void;        // 确认保存
}

export default function EditableTitle({ value,  onSave }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  // 父传 value 变化时，同步到本地草稿
  useEffect(() => {
    console.log('isEditing', isEditing)
    if (!isEditing) setDraft(value);
  }, [value, isEditing]);

  const commit = () => {
    setIsEditing(false);
    const next = draft.trim();
    if (next && next !== value) onSave(next);
  };


  return isEditing ? (
    <input
      className="text-xl font-bold border rounded px-2 py-1 w-full"
      autoFocus
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setIsEditing(false); setDraft(value); }
      }}
    />
  ) : (
    <h1
      className="text-xl font-bold cursor-pointer hover:bg-gray-100 px-1"
      onDoubleClick={() => setIsEditing(true)}
      title="双击编辑标题"
    >
      {value || "无标题"}
    </h1>
  );
}
