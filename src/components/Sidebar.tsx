// src/components/Sidebar.tsx
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createDoc, getDocs, getDocsSideBar } from "../api/doc";
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

    navigate(`/docs/${newId}`, { replace: true });
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
                      className={`rounded transition ${
                        snapshot.isDragging ? "bg-gray-200 shadow-md" : ""
                      }`}
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
