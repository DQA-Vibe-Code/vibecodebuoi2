import {
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage"

import { db, storage } from "@/lib/firebase"
import { userRef } from "@/lib/users-service"
import type { CustomerFile } from "../types"

/** Giới hạn kích thước mỗi tệp; storage.rules cũng chặn ở mức này. */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

export function filesCollection(customerId: string) {
  return collection(db, "customers", customerId, "files")
}

/** Đường dẫn trên Storage: customers/{customerId}/files/{fileId}. */
export function fileStorageRef(customerId: string, fileId: string) {
  return ref(storage, `customers/${customerId}/files/${fileId}`)
}

function toCustomerFile(id: string, data: DocumentData): CustomerFile {
  return {
    id,
    name: data.name ?? "",
    url: data.url ?? "",
    contentType: data.contentType ?? "",
    size: data.size ?? 0,
    uploadedAt:
      data.uploadedAt instanceof Timestamp ? data.uploadedAt.toMillis() : null,
    uploadedBy:
      data.uploadedBy instanceof DocumentReference ? data.uploadedBy.id : null,
  }
}

/** Lấy danh sách tệp của khách hàng, mới nhất trước. */
export async function getCustomerFiles(
  customerId: string
): Promise<CustomerFile[]> {
  const snapshot = await getDocs(
    query(filesCollection(customerId), orderBy("uploadedAt", "desc"))
  )
  return snapshot.docs.map((d) => toCustomerFile(d.id, d.data()))
}

/**
 * Tải tệp lên Storage rồi ghi metadata vào Firestore.
 * fileId được sinh trước để dùng chung cho document và đường dẫn Storage.
 */
export async function uploadCustomerFile(
  customerId: string,
  file: File,
  uid: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const docRef = doc(filesCollection(customerId))
  const storageRef = fileStorageRef(customerId, docRef.id)
  const contentType = file.type || "application/octet-stream"

  const task = uploadBytesResumable(storageRef, file, {
    contentType,
    // Đường dẫn không có tên/đuôi file, nên khai báo tên để trình duyệt tải về đúng tên.
    contentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`,
  })
  task.on("state_changed", (snap) => {
    onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100))
  })
  await task
  const url = await getDownloadURL(storageRef)

  try {
    await setDoc(docRef, {
      name: file.name,
      url,
      contentType,
      size: file.size,
      uploadedAt: serverTimestamp(),
      uploadedBy: userRef(uid),
    })
  } catch (err) {
    // Không để lại tệp mồ côi trên Storage khi ghi metadata thất bại.
    await deleteObject(storageRef).catch(console.error)
    throw err
  }
  return docRef.id
}

/** Xóa tệp trên Storage và metadata trong Firestore. */
export async function deleteCustomerFile(
  customerId: string,
  fileId: string
): Promise<void> {
  await deleteObject(fileStorageRef(customerId, fileId)).catch((err) => {
    // Tệp đã không còn trên Storage thì vẫn xóa metadata.
    if (err?.code !== "storage/object-not-found") throw err
  })
  await deleteDoc(doc(filesCollection(customerId), fileId))
}
