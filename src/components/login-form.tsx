"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth"
import { FirebaseError } from "firebase/app"

import { auth } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

function translateError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Email hoặc mật khẩu không đúng."
      case "auth/invalid-email":
        return "Email không hợp lệ."
      case "auth/email-already-in-use":
        return "Email này đã được đăng ký."
      case "auth/weak-password":
        return "Mật khẩu quá yếu (tối thiểu 6 ký tự)."
      case "auth/too-many-requests":
        return "Thử quá nhiều lần. Vui lòng thử lại sau."
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Bạn đã đóng cửa sổ đăng nhập."
      case "auth/operation-not-allowed":
        return "Phương thức đăng nhập này chưa được bật trong Firebase."
      case "auth/network-request-failed":
        return "Lỗi mạng. Vui lòng kiểm tra kết nối."
    }
  }
  return "Đã xảy ra lỗi. Vui lòng thử lại."
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [mode, setMode] = React.useState<"login" | "register">("login")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard")
  }, [authLoading, user, router])

  const run = async (action: () => Promise<unknown>) => {
    setSubmitting(true)
    setError(null)
    setInfo(null)
    try {
      await action()
      router.push("/dashboard")
    } catch (err) {
      setError(translateError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    run(() =>
      mode === "login"
        ? signInWithEmailAndPassword(auth, email, password)
        : createUserWithEmailAndPassword(auth, email, password)
    )
  }

  const handleGoogle = () =>
    run(() => signInWithPopup(auth, new GoogleAuthProvider()))

  const handleReset = async () => {
    setError(null)
    setInfo(null)
    if (!email) {
      setError("Vui lòng nhập email để đặt lại mật khẩu.")
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setInfo("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.")
    } catch (err) {
      setError(translateError(err))
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={handleSubmit}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  {mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản"}
                </h1>
                <p className="text-balance text-muted-foreground">
                  {mode === "login"
                    ? "Đăng nhập vào tài khoản Công Ty ABC của bạn"
                    : "Đăng ký tài khoản Công Ty ABC mới"}
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                    Quên mật khẩu?
                    </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </Field>
              <Field>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                {info && (
                  <p className="text-sm text-muted-foreground">{info}</p>
                )}
                <Button type="submit" disabled={submitting}>
                  {mode === "login" ? "Đăng nhập" : "Đăng ký"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Hoặc tiếp tục với
              </FieldSeparator>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogle}
                  disabled={submitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Đăng nhập với Google
                </Button>
              </Field>
              <FieldDescription className="text-center">
                {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                <button
                  type="button"
                  className="underline underline-offset-4"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login")
                    setError(null)
                    setInfo(null)
                  }}
                >
                  {mode === "login" ? "Đăng ký" : "Đăng nhập"}
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/placeholder.svg"
              alt="Hình nền"
              fill
              priority
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Khi tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
        và <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </FieldDescription>
    </div>
  )
}
