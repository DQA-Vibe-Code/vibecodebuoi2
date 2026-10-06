import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { Task, TaskInput } from "../types"

const tasksCollection = collection(db, "tasks")

function toMillis(value: unknown): number | null {
  return value instanceof Timestamp ? value.toMillis() : null
}

function toTask(id: string, data: DocumentData): Task {
  return {
    id,
    title: data.title ?? "",
    description: data.description ?? "",
    status: data.status ?? "todo",
    priority: data.priority ?? "medium",
    assignee: data.assignee ?? "",
    dueDate: data.dueDate ?? "",
    createdBy: data.createdBy ?? "",
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  }
}

/** Lấy danh sách tasks, mới nhất trước. */
export async function getTasks(): Promise<Task[]> {
  const snapshot = await getDocs(query(tasksCollection, orderBy("createdAt", "desc")))
  return snapshot.docs.map((d) => toTask(d.id, d.data()))
}

/** Lấy chi tiết một task, trả về null nếu không tồn tại. */
export async function getTask(id: string): Promise<Task | null> {
  const snapshot = await getDoc(doc(db, "tasks", id))
  return snapshot.exists() ? toTask(snapshot.id, snapshot.data()) : null
}

/** Thêm mới task, trả về id của task vừa tạo. */
export async function createTask(
  input: TaskInput,
  createdBy: string
): Promise<string> {
  const ref = await addDoc(tasksCollection, {
    ...input,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Cập nhật task. */
export async function updateTask(
  id: string,
  input: Partial<TaskInput>
): Promise<void> {
  await updateDoc(doc(db, "tasks", id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

/** Xóa task. */
export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, "tasks", id))
}
