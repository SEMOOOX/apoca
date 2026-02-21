"use client"

import { useState } from "react"
import { useArena } from "@/lib/arena-context"
import type { TeleportPoint } from "@/lib/arena-types"

export function TeleportManager() {
  const { state, dispatch, sendToFiveM } = useArena()
  const teleportPoints = state.matchSettings.teleportPoints

  const [isAdding, setIsAdding] = useState(false)
  const [newPoint, setNewPoint] = useState({
    name: "",
    x: "0",
    y: "0",
    z: "73",
    heading: "0",
    team: "neutral" as "red" | "blue" | "neutral",
  })

  const handleTeleport = (point: TeleportPoint) => {
    sendToFiveM("arena:teleport", {
      position: point.position,
      pointId: point.id,
    })
  }

  const handleTeleportAll = (team: "red" | "blue") => {
    const teamConfig =
      team === "red" ? state.matchSettings.redTeam : state.matchSettings.blueTeam
    sendToFiveM("arena:teleportTeam", {
      team,
      spawnPoints: teamConfig.spawnPoints,
    })
  }

  const handleAdd = () => {
    const tp: TeleportPoint = {
      id: `tp-${Date.now()}`,
      name: newPoint.name || `Point ${teleportPoints.length + 1}`,
      position: {
        x: parseFloat(newPoint.x) || 0,
        y: parseFloat(newPoint.y) || 0,
        z: parseFloat(newPoint.z) || 73,
        heading: parseFloat(newPoint.heading) || 0,
      },
      team: newPoint.team,
    }
    dispatch({ type: "ADD_TELEPORT_POINT", payload: tp })
    sendToFiveM("arena:addTeleportPoint", tp)
    setIsAdding(false)
    setNewPoint({ name: "", x: "0", y: "0", z: "73", heading: "0", team: "neutral" })
  }

  const handleRemove = (id: string) => {
    dispatch({ type: "REMOVE_TELEPORT_POINT", payload: id })
    sendToFiveM("arena:removeTeleportPoint", { id })
  }

  const teamColorMap = {
    red: { bg: "bg-[hsl(var(--primary)/0.12)]", border: "border-[hsl(var(--primary)/0.3)]", text: "text-[hsl(var(--primary))]", dot: "bg-[hsl(var(--primary))]" },
    blue: { bg: "bg-[hsl(var(--secondary)/0.12)]", border: "border-[hsl(var(--secondary)/0.3)]", text: "text-[hsl(var(--secondary))]", dot: "bg-[hsl(var(--secondary))]" },
    neutral: { bg: "bg-muted/30", border: "border-border", text: "text-foreground", dot: "bg-muted-foreground" },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Teleportation System
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          {teleportPoints.length} point{teleportPoints.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Quick Team Teleport Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleTeleportAll("red")}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
            arena-panel-red border text-xs font-bold uppercase tracking-wider
            text-[hsl(var(--primary))] hover:brightness-110 transition-all"
          aria-label="Teleport red team to spawn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 12l10 10 10-10L12 2z" />
          </svg>
          TP Red Team
        </button>
        <button
          onClick={() => handleTeleportAll("blue")}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
            arena-panel-blue border text-xs font-bold uppercase tracking-wider
            text-[hsl(var(--secondary))] hover:brightness-110 transition-all"
          aria-label="Teleport blue team to spawn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 12l10 10 10-10L12 2z" />
          </svg>
          TP Blue Team
        </button>
      </div>

      {/* Teleport Points */}
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {teleportPoints.map((point) => {
          const colors = teamColorMap[point.team]
          return (
            <div
              key={point.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${colors.bg} border ${colors.border} transition-all`}
            >
              <div className={`h-2.5 w-2.5 rounded-full ${colors.dot} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${colors.text} truncate`}>
                  {point.name}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {point.position.x.toFixed(1)}, {point.position.y.toFixed(1)},{" "}
                  {point.position.z.toFixed(1)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleTeleport(point)}
                  className={`px-2.5 py-1 rounded-md ${colors.bg} ${colors.text} text-[10px] font-mono font-bold uppercase
                    hover:brightness-125 transition-all border ${colors.border}`}
                  aria-label={`Teleport to ${point.name}`}
                >
                  TP
                </button>
                <button
                  onClick={() => handleRemove(point.id)}
                  className="p-1 rounded hover:bg-[hsl(var(--destructive)/0.15)] text-muted-foreground
                    hover:text-[hsl(var(--destructive))] transition-colors"
                  title="Remove point"
                  aria-label={`Remove ${point.name}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Teleport Point */}
      {isAdding ? (
        <div className="space-y-2 p-3 rounded-lg bg-background/30 border border-border/50">
          <input
            type="text"
            value={newPoint.name}
            onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
            className="w-full px-3 py-1.5 rounded-md bg-muted border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Point name..."
            aria-label="New teleport point name"
          />
          <div className="grid grid-cols-4 gap-1.5">
            {(["x", "y", "z", "heading"] as const).map((axis) => (
              <div key={axis}>
                <label className="text-[9px] font-mono text-muted-foreground uppercase">
                  {axis === "heading" ? "H" : axis}
                </label>
                <input
                  type="number"
                  value={newPoint[axis]}
                  onChange={(e) =>
                    setNewPoint({ ...newPoint, [axis]: e.target.value })
                  }
                  className="w-full px-1.5 py-1 rounded bg-muted border border-border text-xs font-mono text-foreground focus:outline-none"
                  step="0.1"
                  aria-label={`${axis} coordinate`}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["neutral", "red", "blue"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setNewPoint({ ...newPoint, team: t })}
                className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-mono uppercase font-bold transition-all
                  ${newPoint.team === t
                    ? `${teamColorMap[t].bg} ${teamColorMap[t].text} border ${teamColorMap[t].border}`
                    : "bg-muted/30 text-muted-foreground border border-border hover:bg-muted/50"
                  }`}
                aria-label={`Set team to ${t}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 px-3 py-1.5 rounded-md bg-[hsl(var(--primary))] text-primary-foreground text-xs font-bold uppercase"
            >
              Add Point
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs font-semibold uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg
            border border-dashed border-border text-muted-foreground text-xs font-mono uppercase
            hover:bg-muted/30 hover:border-muted-foreground/30 transition-colors"
          aria-label="Add new teleport point"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Teleport Point
        </button>
      )}
    </div>
  )
}
