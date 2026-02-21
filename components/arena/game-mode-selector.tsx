"use client"

import { useArena } from "@/lib/arena-context"
import { GAME_MODES, type GameMode } from "@/lib/arena-types"

const modePlayerCount: Record<GameMode, number> = {
  "1v1": 2,
  "2v2": 4,
  "3v3": 6,
  "4v4": 8,
  "5v5": 10,
}

export function GameModeSelector() {
  const { state, dispatch } = useArena()
  const currentMode = state.matchSettings.gameMode

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Game Mode
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          {modePlayerCount[currentMode]} Players
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {GAME_MODES.map((mode) => {
          const isActive = currentMode === mode
          return (
            <button
              key={mode}
              onClick={() => dispatch({ type: "SET_GAME_MODE", payload: mode })}
              disabled={state.isMatchActive}
              className={`
                relative flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg
                border transition-all duration-200
                ${
                  isActive
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)] arena-glow-red"
                    : "border-border bg-muted/30 hover:border-muted-foreground/30 hover:bg-muted/50"
                }
                ${state.isMatchActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              aria-label={`Select ${mode} game mode`}
              aria-pressed={isActive}
            >
              <span
                className={`text-base font-bold font-mono ${isActive ? "text-[hsl(var(--primary))] arena-text-glow" : "text-foreground"}`}
              >
                {mode}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {modePlayerCount[mode]}P
              </span>
              {isActive && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-8 bg-[hsl(var(--primary))] rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
