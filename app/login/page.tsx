"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to Clerk sign-in
    router.push("/sign-in")
  }, [router])

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px", textAlign: "center" }}>
      <p>Redirecting to sign in...</p>
    </div>
  )
}
