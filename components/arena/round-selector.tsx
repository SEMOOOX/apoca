"use client"

import { useArena } from "@/lib/arena-context"
import { ROUND_OPTIONS, type RoundOption } from "@/lib/arena-types"

export function RoundSelector() {
  const { state, dispatch } = useArena()
  const currentRounds = state.matchSettings.maxRounds

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Rounds
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          Max 30
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ROUND_OPTIONS.map((rounds: RoundOption) => {
          const isActive = currentRounds === rounds
          return (
            <button
              key={rounds}
              onClick={() => dispatch({ type: "SET_ROUNDS", payload: rounds })}
              disabled={state.isMatchActive}
              className={`
                flex items-center justify-center px-3 py-2.5 rounded-lg border
                transition-all duration-200 font-mono text-sm font-bold
                ${
                  isActive
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] arena-glow-red"
                    : "border-border bg-muted/30 text-foreground hover:border-muted-foreground/30 hover:bg-muted/50"
                }
                ${state.isMatchActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              aria-label={`Set rounds to ${rounds}`}
              aria-pressed={isActive}
            >
              {rounds}
            </button>
          )
        })}
      </div>
    </div>
  )
}
