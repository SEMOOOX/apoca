"use client"

import { useArena } from "@/lib/arena-context"

export function ArenaHeader() {
  const { state } = useArena()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/60">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center arena-glow-red">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider uppercase text-foreground arena-text-glow">
              Arena Bot
            </h1>
            <p className="text-xs text-muted-foreground font-mono tracking-widest">
              COMPETITIVE MATCH SYSTEM
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {state.isMatchActive && (
          <>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border border-border">
              <span className="text-xs text-muted-foreground font-mono uppercase">Round</span>
              <span className="text-sm font-bold font-mono text-foreground">
                {state.matchSettings.currentRound}/{state.matchSettings.maxRounds}
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border border-border">
              <div className={`h-2 w-2 rounded-full ${state.isPaused ? "bg-[hsl(var(--arena-warning))]" : "bg-[hsl(var(--arena-success))] animate-pulse"}`} />
              <span className="text-xl font-bold font-mono text-foreground tabular-nums">
                {formatTime(state.matchTimer)}
              </span>
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${state.isMatchActive ? "bg-[hsl(var(--arena-success))] animate-pulse" : "bg-muted-foreground"}`} />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {state.isMatchActive ? (state.isPaused ? "Paused" : "Live") : "Idle"}
          </span>
        </div>
      </div>
    </header>
  )
}
