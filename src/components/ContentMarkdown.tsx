// src/components/ContentMarkdown.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import MarkdownEditor from "@uiw/react-markdown-editor";
import Markdown from "@uiw/react-markdown-preview";
import { getDocDetail, updateDoc } from "../api/doc";
import { useParams } from "react-router-dom";
import EditableTitle from "./EditableTitle";
import type { DocItem } from "../type";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ContentMarkdown() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // 1) 读取详情：只在有 id 时启用；用 placeholderData 避免 undefined
  const {
    data: docItem = {
      id: id ?? "",
      title: "",
      content: "",
      sortIndex: 9999,
    } as DocItem,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["doc", id],
    queryFn: () => getDocDetail(id as string),
    enabled: !!id,
    placeholderData: {
      id: id ?? "",
      title: "",
      content: "",
      sortIndex: 9999,
    } as DocItem,
  });

  // 本地编辑态（只控制是否显示编辑器）
  const [isEditing, setIsEditing] = useState(false);

  // 2) 保存正文：乐观更新 + 失败回滚 + 失效刷新（正文与侧栏都刷新）
  const saveContentMutation = useMutation({
    mutationFn: (next: DocItem) => updateDoc(next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ["doc", next.id] });
      const prevDoc = queryClient.getQueryData<DocItem>(["doc", next.id]);
      // 乐观更新正文缓存
      queryClient.setQueryData<DocItem>(["doc", next.id], (old) =>
        old ? { ...old, content: next.content } : next
      );
      // 侧栏标题可能不变，这里不更新；若需要也可同步更新 docsSidebar 的缓存
      return { prevDoc };
    },
    onError: (_err, next, ctx) => {
      if (ctx?.prevDoc) {
        queryClient.setQueryData(["doc", next.id], ctx.prevDoc);
      }
    },
    onSettled: (_data, _err, variables) => {
      // 以后端为准刷新：正文与侧栏
      queryClient.invalidateQueries({ queryKey: ["doc", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["docsSidebar"] });
    },
  });

  // 3) 保存标题：防抖 + 乐观更新 + 失效刷新（侧栏会立即看到变化）
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTitleMutation = useMutation({
    mutationFn: (next: DocItem) => updateDoc(next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ["doc", next.id] });
      const prevDoc = queryClient.getQueryData<DocItem>(["doc", next.id]);
      // 乐观更新正文缓存中的标题
      queryClient.setQueryData<DocItem>(["doc", next.id], (old) =>
        old ? { ...old, title: next.title } : next
      );
      // 同步乐观更新侧栏列表（如果缓存已存在）
      const prevList = queryClient.getQueryData<DocItem[]>(["docsSidebar"]);
      if (prevList) {
        queryClient.setQueryData<DocItem[]>(["docsSidebar"], (old) =>
          (old ?? []).map((d) =>
            d.id === next.id ? { ...d, title: next.title } : d
          )
        );
      }
      return { prevDoc, prevList };
    },
    onError: (_err, next, ctx) => {
      if (ctx?.prevDoc) queryClient.setQueryData(["doc", next.id], ctx.prevDoc);
      if (ctx?.prevList)
        queryClient.setQueryData(["docsSidebar"], ctx.prevList);
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doc", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["docsSidebar"] });
    },
  });

  const handleSave = useCallback(() => {
    if (!docItem?.id) return;
    saveContentMutation.mutate(docItem);
    setIsEditing(false);
  }, [docItem, saveContentMutation]);

  // EditableTitle 的保存回调（已防抖）
  const handleSaveTitle = useCallback(
    (newTitle: string) => {
      if (!docItem?.id) return;
      const next: DocItem = { ...docItem, title: newTitle };
      // 防抖：用户快速输入时合并请求
      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
      titleDebounceRef.current = setTimeout(() => {
        saveTitleMutation.mutate(next);
      }, 300);
      // 立即做本地“看得见”的更新（也能只靠 onMutate 乐观更新）
      queryClient.setQueryData<DocItem>(["doc", next.id], next);
    },
    [docItem, queryClient, saveTitleMutation]
  );

  // 键盘快捷键：Ctrl/Cmd+S 保存，Esc 取消编辑
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

  // 无 id 的空白页
  if (!id) {
    return (
      <section
        className="flex-1 p-4 flex flex-col gap-3"
        data-color-mode="light"
      >
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
          <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              请新建文档
            </h1>
            <p className="text-gray-600 mb-6">
              还没有选择或创建文档，请先新建一个文档以开始编辑。
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="flex-1 p-4" data-color-mode="light">
        <div className="text-gray-500">加载中...</div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="flex-1 p-4" data-color-mode="light">
        <div className="text-red-500">
          加载失败：{(error as Error)?.message}
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 flex flex-col gap-3" data-color-mode="light">
      <div className="flex items-center justify-between">
        <EditableTitle value={docItem.title} onSave={handleSaveTitle} />
        {isEditing ? (
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white"
              onClick={handleSave}
              disabled={saveContentMutation.isPending}
            >
              {saveContentMutation.isPending
                ? "保存中..."
                : "保存（Ctrl/Cmd+S）"}
            </button>
            <button
              className="px-3 py-1 rounded border"
              onClick={() => setIsEditing(false)}
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
          height="520px"
          onChange={(v) =>
            queryClient.setQueryData<DocItem>(["doc", docItem.id], {
              ...docItem,
              content: v,
            })
          }
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
