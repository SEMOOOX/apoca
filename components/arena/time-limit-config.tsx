"use client"

import { useArena } from "@/lib/arena-context"

export function TimeLimitConfig() {
  const { state, dispatch } = useArena()
  const timeLimit = state.matchSettings.timeLimit

  const presets = [5, 10, 15, 20]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Time Limit
        </h3>
        <span className="text-xs font-mono text-[hsl(var(--primary))]">
          {timeLimit} min
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {presets.map((t) => {
          const isActive = timeLimit === t
          return (
            <button
              key={t}
              onClick={() =>
                dispatch({ type: "SET_TIME_LIMIT", payload: t })
              }
              disabled={state.isMatchActive}
              className={`
                flex items-center justify-center px-2 py-2 rounded-lg border
                transition-all duration-200 font-mono text-xs font-bold
                ${
                  isActive
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"
                    : "border-border bg-muted/30 text-foreground hover:border-muted-foreground/30"
                }
                ${state.isMatchActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              aria-label={`Set time limit to ${t} minutes`}
            >
              {t}m
            </button>
          )
        })}
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={20}
          value={timeLimit}
          onChange={(e) =>
            dispatch({
              type: "SET_TIME_LIMIT",
              payload: parseInt(e.target.value),
            })
          }
          disabled={state.isMatchActive}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer
            bg-muted accent-[hsl(var(--primary))]
            disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Adjust time limit"
        />
        <span className="text-xs font-mono text-muted-foreground w-8 text-right">
          {timeLimit}m
        </span>
      </div>
    </div>
  )
}
