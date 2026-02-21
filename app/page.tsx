"use client"

import { ArenaProvider } from "@/lib/arena-context"
import { ArenaMenu } from "@/components/arena/arena-menu"

export default function ArenaPage() {
  return (
    <ArenaProvider>
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md h-[90vh] rounded-2xl arena-panel arena-glow-red overflow-hidden arena-scanline">
          <ArenaMenu />
        </div>
      </main>
    </ArenaProvider>
  )
}
