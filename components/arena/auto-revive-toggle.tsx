"use client"

import { useArena } from "@/lib/arena-context"

export function AutoReviveToggle() {
  const { state, dispatch, sendToFiveM } = useArena()
  const isEnabled = state.matchSettings.autoRevive

  const handleToggle = () => {
    dispatch({ type: "TOGGLE_AUTO_REVIVE" })
    sendToFiveM("arena:toggleAutoRevive", {
      enabled: !isEnabled,
    })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Auto-Revive System
      </h3>
      <button
        onClick={handleToggle}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-lg border
          transition-all duration-300
          ${
            isEnabled
              ? "border-[hsl(var(--arena-success)/0.5)] bg-[hsl(var(--arena-success)/0.08)] arena-glow-green"
              : "border-border bg-muted/30 hover:bg-muted/50"
          }
        `}
        aria-label="Toggle auto-revive system"
        aria-pressed={isEnabled}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
              isEnabled
                ? "bg-[hsl(var(--arena-success)/0.2)] text-[hsl(var(--arena-success))]"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              {isEnabled && <path d="M12 5v14" />}
              {isEnabled && <path d="M5 12h14" />}
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              Automatic Revive
            </p>
            <p className="text-xs text-muted-foreground">
              {isEnabled
                ? "Players revive instantly on death"
                : "Manual revive required"}
            </p>
          </div>
        </div>

        <div
          className={`
            relative w-11 h-6 rounded-full transition-colors duration-300
            ${isEnabled ? "bg-[hsl(var(--arena-success))]" : "bg-muted"}
          `}
        >
          <div
            className={`
              absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform duration-300
              ${isEnabled ? "translate-x-[22px]" : "translate-x-0.5"}
            `}
          />
        </div>
      </button>

      {isEnabled && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[hsl(var(--arena-success)/0.06)] border border-[hsl(var(--arena-success)/0.15)]">
          <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--arena-success))] animate-pulse" />
          <span className="text-xs text-[hsl(var(--arena-success))] font-mono">
            AUTO-REVIVE ACTIVE -- Respawn delay: 3s
          </span>
        </div>
      )}
    </div>
  )
}
