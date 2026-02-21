"use client"

import { useArena } from "@/lib/arena-context"

export function MatchControls() {
  const { state, dispatch, sendToFiveM } = useArena()

  const handleStart = () => {
    dispatch({ type: "START_MATCH" })
    sendToFiveM("arena:startMatch", {
      gameMode: state.matchSettings.gameMode,
      rounds: state.matchSettings.maxRounds,
      timeLimit: state.matchSettings.timeLimit,
      autoRevive: state.matchSettings.autoRevive,
      redTeam: state.matchSettings.redTeam,
      blueTeam: state.matchSettings.blueTeam,
    })
  }

  const handleStop = () => {
    dispatch({ type: "STOP_MATCH" })
    sendToFiveM("arena:stopMatch", {})
  }

  const handlePause = () => {
    if (state.isPaused) {
      dispatch({ type: "RESUME_MATCH" })
      sendToFiveM("arena:resumeMatch", {})
    } else {
      dispatch({ type: "PAUSE_MATCH" })
      sendToFiveM("arena:pauseMatch", {})
    }
  }

  const handleNextRound = () => {
    dispatch({ type: "NEXT_ROUND" })
    sendToFiveM("arena:nextRound", {
      round: state.matchSettings.currentRound + 1,
    })
  }

  const handleReset = () => {
    dispatch({ type: "RESET_MATCH" })
    sendToFiveM("arena:resetMatch", {})
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Match Controls
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {!state.isMatchActive ? (
          <button
            onClick={handleStart}
            className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
              bg-[hsl(var(--primary))] text-primary-foreground font-bold uppercase tracking-wider
              text-sm transition-all duration-200 hover:brightness-110 arena-glow-red"
            aria-label="Start match"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Match
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                font-bold uppercase tracking-wider text-sm transition-all duration-200
                ${
                  state.isPaused
                    ? "bg-[hsl(var(--arena-success))] text-primary-foreground arena-glow-green"
                    : "bg-[hsl(var(--arena-warning))] text-background"
                }
              `}
              aria-label={state.isPaused ? "Resume match" : "Pause match"}
            >
              {state.isPaused ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Resume
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Pause
                </>
              )}
            </button>
            <button
              onClick={handleStop}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                bg-[hsl(var(--destructive))] text-primary-foreground font-bold uppercase
                tracking-wider text-sm transition-all duration-200 hover:brightness-110"
              aria-label="Stop match"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
              Stop
            </button>
          </>
        )}
      </div>

      {state.isMatchActive && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleNextRound}
            disabled={
              state.matchSettings.currentRound >= state.matchSettings.maxRounds
            }
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
              border border-border bg-muted/30 text-foreground font-semibold text-xs
              uppercase tracking-wider transition-all duration-200
              hover:bg-muted/50 hover:border-muted-foreground/30
              disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next round"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
            Next Round
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
              border border-border bg-muted/30 text-foreground font-semibold text-xs
              uppercase tracking-wider transition-all duration-200
              hover:bg-muted/50 hover:border-muted-foreground/30"
            aria-label="Reset match"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Reset
          </button>
        </div>
      )}
    </div>
  )
}
