import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import { userRef } from "@/lib/users-service"
import { activitiesCollection } from "./activities-service"
import { deleteCustomerFile, filesCollection } from "./files-service"
import type { Customer, CustomerInput } from "../types"

const customersCollection = collection(db, "customers")

function toMillis(value: unknown): number | null {
  return value instanceof Timestamp ? value.toMillis() : null
}

/** Ref users/uid → uid. */
function toUid(value: unknown): string | null {
  return value instanceof DocumentReference ? value.id : null
}

function toCustomer(id: string, data: DocumentData): Customer {
  return {
    id,
    name: data.name ?? "",
    email: data.email ?? "",
    status: data.status ?? "active",
    priority: data.priority ?? "medium",
    description: data.description ?? "",
    assignedTo: toUid(data.assignedTo),
    createdBy: toUid(data.createdBy),
    updatedBy: toUid(data.updatedBy),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  }
}

function toFirestore(input: CustomerInput) {
  return {
    ...input,
    assignedTo: input.assignedTo ? userRef(input.assignedTo) : null,
  }
}

/** Lấy danh sách khách hàng (bảng tự sắp xếp theo độ ưu tiên). */
export async function getCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(customersCollection)
  return snapshot.docs.map((d) => toCustomer(d.id, d.data()))
}

/** Lấy chi tiết một khách hàng, trả về null nếu không tồn tại. */
export async function getCustomer(id: string): Promise<Customer | null> {
  const snapshot = await getDoc(doc(db, "customers", id))
  return snapshot.exists() ? toCustomer(snapshot.id, snapshot.data()) : null
}

/** Thêm mới khách hàng, trả về id vừa tạo. */
export async function createCustomer(
  input: CustomerInput,
  uid: string
): Promise<string> {
  const ref = await addDoc(customersCollection, {
    ...toFirestore(input),
    createdBy: userRef(uid),
    updatedBy: userRef(uid),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Cập nhật khách hàng. */
export async function updateCustomer(
  id: string,
  input: CustomerInput,
  uid: string
): Promise<void> {
  await updateDoc(doc(db, "customers", id), {
    ...toFirestore(input),
    updatedBy: userRef(uid),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Xóa khách hàng cùng subcollection activities, files và các tệp trên Storage
 * (Firestore không tự xóa subcollection).
 */
export async function deleteCustomer(id: string): Promise<void> {
  const files = await getDocs(filesCollection(id))
  await Promise.all(files.docs.map((d) => deleteCustomerFile(id, d.id)))

  const activities = await getDocs(activitiesCollection(id))
  // writeBatch giới hạn 500 thao tác mỗi lần commit.
  for (let i = 0; i < activities.docs.length; i += 500) {
    const batch = writeBatch(db)
    activities.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  await deleteDoc(doc(db, "customers", id))
}
