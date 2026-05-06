"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to Clerk sign-up
    router.push("/sign-up")
  }, [router])

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px", textAlign: "center" }}>
      <p>Redirecting to sign up...</p>
    </div>
  )
}
