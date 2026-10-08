import type { User } from "firebase/auth"
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"

import { db } from "@/lib/firebase"

export type AppUser = {
  uid: string
  displayName: string
  email: string
}

export function userRef(uid: string) {
  return doc(db, "users", uid)
}

/** Ghi/cập nhật hồ sơ users/{uid} để có thể tham chiếu (Ref) từ dữ liệu khác. */
export async function upsertUserProfile(user: User): Promise<void> {
  await setDoc(
    userRef(user.uid),
    {
      displayName: user.displayName ?? "",
      email: user.email ?? "",
      photoURL: user.photoURL ?? "",
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  )
}

/** Lấy danh sách người dùng trong collection users. */
export async function getUsers(): Promise<AppUser[]> {
  const snapshot = await getDocs(collection(db, "users"))
  return snapshot.docs
    .map((d) => ({
      uid: d.id,
      displayName: d.data().displayName ?? "",
      email: d.data().email ?? "",
    }))
    .sort((a, b) =>
      (a.displayName || a.email).localeCompare(b.displayName || b.email, "vi")
    )
}

export function userLabel(user: AppUser): string {
  return user.displayName || user.email || user.uid
}
