// src/components/Sidebar.tsx
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';

export type DocItem = {
  id: string;
  title: string;
};

const STORAGE_KEY = 'sidebar_order';

export default function Sidebar({
  items,
  selectedId,
  onReorder,
}: {
  items: DocItem[];
  selectedId?: string;
  onReorder: (newItems: DocItem[]) => void;
}) {
  const [orderedItems, setOrderedItems] = useState<DocItem[]>([]);

  // 初始化：从 localStorage 读取排序结果
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedOrder = JSON.parse(saved) as string[];
        const sorted = [...items].sort(
          (a, b) => savedOrder.indexOf(a.id) - savedOrder.indexOf(b.id)
        );
        setOrderedItems(sorted);
        return;
      } catch (e) {
        console.warn('Failed to parse sidebar order, fallback to default', e);
      }
    }
    setOrderedItems(items);
  }, [items]);

  // 拖拽完成
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(orderedItems);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);

    setOrderedItems(newItems);

    // 保存顺序
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems.map((i) => i.id)));

    // 通知父组件
    onReorder(newItems);
  };

  return (
    <aside className="w-60 border-r p-4">
      <h2 className="text-lg font-semibold mb-3">文档</h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sidebar-list">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
              {orderedItems.map((it, index) => (
                <Draggable key={it.id} draggableId={it.id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`rounded transition ${
                        snapshot.isDragging ? 'bg-gray-200 shadow-md' : ''
                      }`}
                    >
                      <NavLink
                        to={`/docs/${it.id}`}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded hover:bg-gray-100 ${
                            isActive ? 'bg-gray-100 font-medium' : ''
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
