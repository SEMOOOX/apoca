"use client"

import { useState } from "react"
import { useArena } from "@/lib/arena-context"
import type { TeamCoordinate, Coordinate } from "@/lib/arena-types"

interface TeamCoordinatesEditorProps {
  team: "red" | "blue"
}

export function TeamCoordinatesEditor({ team }: TeamCoordinatesEditorProps) {
  const { state, dispatch, sendToFiveM } = useArena()
  const teamConfig =
    team === "red" ? state.matchSettings.redTeam : state.matchSettings.blueTeam
  const teamColor = team === "red" ? "primary" : "secondary"
  const panelClass = team === "red" ? "arena-panel-red" : "arena-panel-blue"
  const glowClass = team === "red" ? "arena-glow-red" : "arena-glow-blue"
  const textGlowClass =
    team === "red" ? "arena-text-glow" : "arena-text-glow-blue"

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    label: string
    x: string
    y: string
    z: string
    heading: string
  }>({
    label: "",
    x: "0",
    y: "0",
    z: "73",
    heading: "0",
  })

  const handleAdd = () => {
    const newSpawn: TeamCoordinate = {
      id: `${team}-spawn-${Date.now()}`,
      label: formData.label || `Spawn ${teamConfig.spawnPoints.length + 1}`,
      position: {
        x: parseFloat(formData.x) || 0,
        y: parseFloat(formData.y) || 0,
        z: parseFloat(formData.z) || 73,
        heading: parseFloat(formData.heading) || 0,
      },
    }
    dispatch({ type: "ADD_SPAWN_POINT", payload: { team, spawn: newSpawn } })
    sendToFiveM("arena:addSpawn", { team, spawn: newSpawn })
    setIsAdding(false)
    setFormData({ label: "", x: "0", y: "0", z: "73", heading: "0" })
  }

  const handleEdit = (spawn: TeamCoordinate) => {
    setEditingId(spawn.id)
    setFormData({
      label: spawn.label,
      x: spawn.position.x.toString(),
      y: spawn.position.y.toString(),
      z: spawn.position.z.toString(),
      heading: (spawn.position.heading || 0).toString(),
    })
  }

  const handleSaveEdit = (spawnId: string) => {
    const updated: TeamCoordinate = {
      id: spawnId,
      label: formData.label,
      position: {
        x: parseFloat(formData.x) || 0,
        y: parseFloat(formData.y) || 0,
        z: parseFloat(formData.z) || 73,
        heading: parseFloat(formData.heading) || 0,
      },
    }
    dispatch({
      type: "UPDATE_SPAWN_POINT",
      payload: { team, spawn: updated },
    })
    sendToFiveM("arena:updateSpawn", { team, spawn: updated })
    setEditingId(null)
  }

  const handleRemove = (spawnId: string) => {
    dispatch({
      type: "REMOVE_SPAWN_POINT",
      payload: { team, spawnId },
    })
    sendToFiveM("arena:removeSpawn", { team, spawnId })
  }

  const handleTeleport = (position: Coordinate) => {
    sendToFiveM("arena:teleport", { position })
  }

  const formatCoord = (n: number) => n.toFixed(1)

  return (
    <div className={`${panelClass} rounded-lg border p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full bg-[hsl(var(--${teamColor}))] ${glowClass}`}
          />
          <h4
            className={`text-sm font-bold uppercase tracking-wider text-[hsl(var(--${teamColor}))] ${textGlowClass}`}
          >
            {teamConfig.name}
          </h4>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {teamConfig.spawnPoints.length} spawn{teamConfig.spawnPoints.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Team Name Edit */}
      <input
        type="text"
        value={teamConfig.name}
        onChange={(e) =>
          dispatch({
            type: "SET_TEAM_NAME",
            payload: { team, name: e.target.value },
          })
        }
        className="w-full px-3 py-1.5 rounded-md bg-muted/50 border border-border text-xs
          font-mono text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:border-[hsl(var(--ring))]"
        placeholder="Team name..."
        aria-label={`${team} team name`}
      />

      {/* Spawn Points List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {teamConfig.spawnPoints.map((spawn) => (
          <div
            key={spawn.id}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-background/50 border border-border/50"
          >
            {editingId === spawn.id ? (
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full px-2 py-1 rounded bg-muted border border-border text-xs font-mono text-foreground focus:outline-none"
                  placeholder="Label"
                  aria-label="Spawn label"
                />
                <div className="grid grid-cols-4 gap-1">
                  {(["x", "y", "z", "heading"] as const).map((axis) => (
                    <input
                      key={axis}
                      type="number"
                      value={formData[axis]}
                      onChange={(e) =>
                        setFormData({ ...formData, [axis]: e.target.value })
                      }
                      className="w-full px-1.5 py-1 rounded bg-muted border border-border text-[10px] font-mono text-foreground focus:outline-none"
                      placeholder={axis.toUpperCase()}
                      step="0.1"
                      aria-label={`${axis} coordinate`}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSaveEdit(spawn.id)}
                    className="px-2 py-1 rounded bg-[hsl(var(--arena-success)/0.2)] text-[hsl(var(--arena-success))] text-[10px] font-mono uppercase hover:bg-[hsl(var(--arena-success)/0.3)]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 rounded bg-muted text-muted-foreground text-[10px] font-mono uppercase hover:bg-muted/80"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {spawn.label}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {formatCoord(spawn.position.x)}, {formatCoord(spawn.position.y)},{" "}
                    {formatCoord(spawn.position.z)} H:{formatCoord(spawn.position.heading || 0)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTeleport(spawn.position)}
                    className={`p-1.5 rounded hover:bg-[hsl(var(--${teamColor})/0.15)] text-[hsl(var(--${teamColor}))] transition-colors`}
                    title="Teleport here"
                    aria-label={`Teleport to ${spawn.label}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEdit(spawn)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
                    title="Edit spawn"
                    aria-label={`Edit ${spawn.label}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemove(spawn.id)}
                    className="p-1.5 rounded hover:bg-[hsl(var(--destructive)/0.15)] text-muted-foreground hover:text-[hsl(var(--destructive))] transition-colors"
                    title="Remove spawn"
                    aria-label={`Remove ${spawn.label}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New Spawn */}
      {isAdding ? (
        <div className="space-y-2 p-3 rounded-md bg-background/30 border border-border/50">
          <input
            type="text"
            value={formData.label}
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
            className="w-full px-2 py-1.5 rounded bg-muted border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Spawn label (e.g., Cordes 3)"
            aria-label="New spawn label"
          />
          <div className="grid grid-cols-4 gap-1.5">
            {(["x", "y", "z", "heading"] as const).map((axis) => (
              <div key={axis}>
                <label className="text-[9px] font-mono text-muted-foreground uppercase">
                  {axis === "heading" ? "H" : axis}
                </label>
                <input
                  type="number"
                  value={formData[axis]}
                  onChange={(e) =>
                    setFormData({ ...formData, [axis]: e.target.value })
                  }
                  className="w-full px-1.5 py-1 rounded bg-muted border border-border text-xs font-mono text-foreground focus:outline-none"
                  step="0.1"
                  aria-label={`${axis} coordinate for new spawn`}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className={`flex-1 px-3 py-1.5 rounded-md bg-[hsl(var(--${teamColor}))] text-primary-foreground text-xs font-bold uppercase tracking-wider`}
            >
              Add Spawn
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
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md
            border border-dashed border-[hsl(var(--${teamColor})/0.3)]
            text-[hsl(var(--${teamColor}))] text-xs font-mono uppercase
            hover:bg-[hsl(var(--${teamColor})/0.05)] transition-colors`}
          aria-label={`Add new ${team} team spawn point`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Spawn Point
        </button>
      )}
    </div>
  )
}
