// src/components/Sidebar.tsx
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createDoc, deleteDoc, getDocs, getDocsSideBar } from "../api/doc";
import { DocsSideBarItem } from "../type";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "sidebar_order";

// {
//   items,
//   selectedId,
//   onReorder,
// }: {
//   items: DocItem[];
//   selectedId?: string;
//   onReorder: (newItems: DocItem[]) => void;
// }
export default function Sidebar() {
  const [sideBarItems, setSideBarItems] = useState<DocsSideBarItem[]>([]);

  const [orderedItems, setOrderedItems] = useState<DocsSideBarItem[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await getDocsSideBar();
      setSideBarItems(res);
    };
    fetchData();
  }, []);
  // 初始化：从 localStorage 读取排序结果
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedOrder = JSON.parse(saved) as string[];
        const sorted = [...sideBarItems].sort(
          (a, b) => savedOrder.indexOf(a.id) - savedOrder.indexOf(b.id)
        );
        setOrderedItems(sorted);
        return;
      } catch (e) {
        console.warn("Failed to parse sidebar order, fallback to default", e);
      }
    }
    setOrderedItems(sideBarItems);
  }, [sideBarItems]);

  // 拖拽完成
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(orderedItems);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);

    setOrderedItems(newItems);

    // 保存顺序
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newItems.map((i) => i.id))
    );

    // 通知父组件
    // onReorder(newItems);
  };
  const navigate = useNavigate();

  const handleNewDoc = async () => {
    const newId = uuidv4();
    await createDoc({
      id: newId,
      title: "无标题",
      content: "",
      sortIndex: 9999,
    });
    setOrderedItems((prev) => [
      { id: newId, title: "无标题", sortIndex: 9999 },
      ...prev,
    ]);
    navigate(`/docs/${newId}`, { replace: true });
  };

  const onDelete = async (id: string) => {
    const filtered = orderedItems.filter((it) => it.id !== id);
    setOrderedItems(filtered);
    await deleteDoc(id);
  };

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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sidebar-list">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-1"
            >
              {orderedItems.map((it, index) => (
                <Draggable key={it.id} draggableId={it.id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`rounded transition flex items-center justify-between ${
                        snapshot.isDragging ? "bg-gray-200 shadow-md" : ""
                      }`}
                    >
                      {/* 左侧标题 */}
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

                      {/* 右侧删除按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡，防止触发 NavLink
                          e.preventDefault(); // 阻止 NavLink 导航
                          onDelete(it.id); // 调用传入的删除函数
                        }}
                        className="ml-2 px-2 py-1 text-sm text-red-500 hover:text-red-700 rounded hover:bg-red-100 transition"
                      >
                        删除
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </aside>
  );
}
