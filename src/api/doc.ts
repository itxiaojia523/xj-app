import { DocItem, DocsSideBarItem } from "../type";
import api from "./index";

export const getDocs = async () => {
  const res = await api.get("/api/docs");
  return res.data;
};

export const createDoc = async (doc: DocItem) => {
  const res = await api.post("/api/docs", doc);
  return res.data;
};

export const getDocsSideBar = async (): Promise<DocsSideBarItem[]> => {
  const res = await api.get<DocsSideBarItem[]>("/api/docs/sidebar");
  return res.data;
};

export const getDocDetail = async (id: string): Promise<DocItem> => {
  const res = await api.get<DocItem>(`/api/docs/${id}`);
  return res.data;
};

export const updateDoc = async (doc: DocItem) => {
  const res = await api.put(`/api/docs/${doc.id}`, doc);
  return res.data;
};

export const reorderDocs = async (order: string[]) => {
  await api.patch("/api/docs/reorder", { order });
};

export const deleteDoc = async (id: string) => {
  await api.delete(`/api/docs/${id}`);
};
