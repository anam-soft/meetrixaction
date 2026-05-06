"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SubscriptionContextType {
  isPro: boolean
  isLoading: boolean
  refetch: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPro: false,
  isLoading: true,
  refetch: async () => {},
})

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/usage")
      const data = await res.json()
      setIsPro(data.isPro || false)
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  return (
    <SubscriptionContext.Provider
      value={{ isPro, isLoading, refetch: fetchSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  return useContext(SubscriptionContext)
}
