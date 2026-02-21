"use client"

import { useArena } from "@/lib/arena-context"

export function ScoreBoard() {
  const { state, dispatch } = useArena()

  const incrementScore = (team: "red" | "blue") => {
    const current = state.scores[team]
    dispatch({
      type: "UPDATE_SCORE",
      payload: { team, score: current + 1 },
    })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Scoreboard
      </h3>
      <div className="grid grid-cols-3 gap-3 items-center">
        {/* Red Team Score */}
        <button
          onClick={() => incrementScore("red")}
          disabled={!state.isMatchActive}
          className="arena-panel-red rounded-lg p-4 flex flex-col items-center gap-1 border
            transition-all duration-200 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Increment red team score"
        >
          <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--primary))]">
            {state.matchSettings.redTeam.name}
          </span>
          <span className="text-3xl font-bold font-mono text-[hsl(var(--primary))] arena-text-glow tabular-nums">
            {state.scores.red}
          </span>
        </button>

        {/* VS Divider */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-muted-foreground">VS</span>
          {state.isMatchActive && (
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              R{state.matchSettings.currentRound}
            </span>
          )}
        </div>

        {/* Blue Team Score */}
        <button
          onClick={() => incrementScore("blue")}
          disabled={!state.isMatchActive}
          className="arena-panel-blue rounded-lg p-4 flex flex-col items-center gap-1 border
            transition-all duration-200 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Increment blue team score"
        >
          <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--secondary))]">
            {state.matchSettings.blueTeam.name}
          </span>
          <span className="text-3xl font-bold font-mono text-[hsl(var(--secondary))] arena-text-glow-blue tabular-nums">
            {state.scores.blue}
          </span>
        </button>
      </div>
    </div>
  )
}
