// src/components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createDoc, deleteDoc, getDocsSideBar } from "../api/doc";
import type { DocItem, DocsSideBarItem } from "../type";

export default function Sidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 列表查询
  // 将原来的 useEffect 数据请求逻辑 改成 React Query
  const {
    data: sideBarItems = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["docsSidebar"],
    queryFn: getDocsSideBar,
  });

  // 删掉数据，但页面不更新，是因为 React Query 的缓存还在
  // 用 useMutation + queryClient.invalidateQueries（或乐观更新 setQueryData）来同步前端列表。

  // 删除：乐观更新 + 失败回滚 + 成功后失效刷新
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDoc(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["docsSidebar"] });
      const prev = queryClient.getQueryData<DocsSideBarItem[]>(["docsSidebar"]);
      // 乐观移除
      queryClient.setQueryData<DocsSideBarItem[]>(["docsSidebar"], (old) =>
        (old ?? []).filter((x) => x.id !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      // 失败回滚
      if (ctx?.prev) {
        queryClient.setQueryData(["docsSidebar"], ctx.prev);
      }
    },
    onSettled: () => {
      // 最终以服务器为准
      queryClient.invalidateQueries({ queryKey: ["docsSidebar"] });
    },
  });

  //   乐观添加：

  // 用户点击按钮时，前端立即先在列表中添加一条新文档（模拟后端会返回的内容）。

  // 同时后台发送 API 请求。

  // 如果请求成功，保持 UI 不变或替换为后端的真实数据。

  // 如果请求失败，回滚，把之前加上去的假数据移除，并提示错误。

  // 优点：

  // 用户马上看到变化，交互非常流畅。

  // 对于操作简单且成功率高的场景，体验更佳。

  // 新建：成功后失效刷新；也可做乐观添加

  //   失效刷新 = 自动重新请求，让前端缓存和后端数据保持同步。
  // 它是 React Query 的核心机制之一，也是保证数据一致性的标准做法。
  const createMutation = useMutation({
    mutationFn: createDoc,
    onSuccess: (newDoc: DocItem) => {
      console.log("创建成功", newDoc);
      queryClient.invalidateQueries({ queryKey: ["docsSidebar"] });
      navigate(`/docs/${newDoc.id}`, { replace: true });
    },
  });

  const handleNewDoc = async () => {
    const newId = uuidv4();
    await createMutation.mutateAsync({
      id: newId,
      title: "无标题",
      content: "",
      sortIndex: 9999,
    });
  };

  const onDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div className="p-4 text-gray-500">加载中...</div>;
  if (isError)
    return (
      <div className="p-4 text-red-500">
        加载失败: {(error as Error).message}
        <button
          onClick={() => refetch()}
          className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          重试
        </button>
      </div>
    );

  return (
    <aside className="w-60 border-r p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">文档</h2>
        <button
          onClick={handleNewDoc}
          className="px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition"
        >
          + 新建
        </button>
      </div>

      <ul className="space-y-1">
        {sideBarItems.map((it) => (
          <li
            key={it.id} // ✅ 别忘了 key
            className="rounded transition flex items-center justify-between"
          >
            <NavLink
              to={`/docs/${it.id}`}
              className={({ isActive }) =>
                `block px-3 py-2 rounded hover:bg-gray-100 ${
                  isActive ? "bg-gray-100 font-medium" : ""
                }`
              }
            >
              {it.title}
            </NavLink>

            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(it.id);
              }}
              className="ml-2 px-2 py-1 text-sm text-red-500 hover:text-red-700 rounded hover:bg-red-100 transition"
              disabled={deleteMutation.isPending}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
