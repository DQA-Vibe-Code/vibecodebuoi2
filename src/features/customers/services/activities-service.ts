import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import { userRef } from "@/lib/users-service"
import { hasContent, hasNote } from "../constants"
import type { Activity, ActivityInput } from "../types"

export function activitiesCollection(customerId: string) {
  return collection(db, "customers", customerId, "activities")
}

function activityDoc(customerId: string, id: string) {
  return doc(db, "customers", customerId, "activities", id)
}

function toMillis(value: unknown): number | null {
  return value instanceof Timestamp ? value.toMillis() : null
}

function toUid(value: unknown): string | null {
  return value instanceof DocumentReference ? value.id : null
}

/** Timestamp → yyyy-mm-dd (theo giờ địa phương). */
function toDateString(value: unknown): string {
  if (!(value instanceof Timestamp)) return ""
  const d = value.toDate()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** yyyy-mm-dd → Timestamp lúc 00:00 giờ địa phương. */
function toTimestamp(date: string): Timestamp {
  const [y, m, d] = date.split("-").map(Number)
  return Timestamp.fromDate(new Date(y, m - 1, d))
}

function toActivity(id: string, data: DocumentData): Activity {
  return {
    id,
    type: data.type ?? "note",
    date: toDateString(data.date),
    callQuality: data.callQuality ?? null,
    content: data.content ?? "",
    note: data.note ?? "",
    createdBy: toUid(data.createdBy),
    updatedBy: toUid(data.updatedBy),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  }
}

/** Chỉ ghi các trường thuộc loại hoạt động đã chọn. */
function toFirestore(input: ActivityInput) {
  return {
    type: input.type,
    date: toTimestamp(input.date),
    callQuality: input.type === "call" ? input.callQuality : null,
    content: hasContent(input.type) ? input.content : "",
    note: hasNote(input.type) ? input.note : "",
  }
}

/** Lấy danh sách hoạt động của khách hàng, mới nhất trước. */
export async function getActivities(customerId: string): Promise<Activity[]> {
  const snapshot = await getDocs(
    query(activitiesCollection(customerId), orderBy("date", "desc"))
  )
  return snapshot.docs.map((d) => toActivity(d.id, d.data()))
}

export async function createActivity(
  customerId: string,
  input: ActivityInput,
  uid: string
): Promise<string> {
  const ref = await addDoc(activitiesCollection(customerId), {
    ...toFirestore(input),
    createdBy: userRef(uid),
    updatedBy: userRef(uid),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateActivity(
  customerId: string,
  id: string,
  input: ActivityInput,
  uid: string
): Promise<void> {
  await updateDoc(activityDoc(customerId, id), {
    ...toFirestore(input),
    updatedBy: userRef(uid),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteActivity(
  customerId: string,
  id: string
): Promise<void> {
  await deleteDoc(activityDoc(customerId, id))
}
