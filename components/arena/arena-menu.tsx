"use client"

import { useState } from "react"
import { ArenaHeader } from "./arena-header"
import { GameModeSelector } from "./game-mode-selector"
import { RoundSelector } from "./round-selector"
import { TimeLimitConfig } from "./time-limit-config"
import { MatchControls } from "./match-controls"
import { AutoReviveToggle } from "./auto-revive-toggle"
import { ScoreBoard } from "./scoreboard"
import { TeamCoordinatesEditor } from "./team-coordinates-editor"
import { TeleportManager } from "./teleport-manager"
import { useArena } from "@/lib/arena-context"

type Tab = "settings" | "teams" | "teleport"

export function ArenaMenu() {
  const { state } = useArena()
  const [activeTab, setActiveTab] = useState<Tab>("settings")

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "settings",
      label: "Match",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: "teams",
      label: "Teams",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "teleport",
      label: "Teleport",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden bg-background">
      <ArenaHeader />

      {/* Live Scoreboard - always visible when match active */}
      {state.isMatchActive && (
        <div className="px-6 py-3 border-b border-border/40">
          <ScoreBoard />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 px-6 pt-4 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider
                transition-all duration-200
                ${
                  isActive
                    ? "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
                }
              `}
              aria-label={`Switch to ${tab.label} tab`}
              aria-selected={isActive}
              role="tab"
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5" role="tabpanel">
        {activeTab === "settings" && (
          <>
            <GameModeSelector />
            <div className="h-px bg-border/40" />
            <RoundSelector />
            <div className="h-px bg-border/40" />
            <TimeLimitConfig />
            <div className="h-px bg-border/40" />
            <AutoReviveToggle />
            <div className="h-px bg-border/40" />
            <MatchControls />
          </>
        )}

        {activeTab === "teams" && (
          <>
            <TeamCoordinatesEditor team="red" />
            <TeamCoordinatesEditor team="blue" />
          </>
        )}

        {activeTab === "teleport" && <TeleportManager />}
      </div>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--arena-success))] animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Arena Bot v1.0
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground">
            Mode: {state.matchSettings.gameMode}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            Rounds: {state.matchSettings.maxRounds}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            Revive: {state.matchSettings.autoRevive ? "ON" : "OFF"}
          </span>
        </div>
      </footer>
    </div>
  )
}
