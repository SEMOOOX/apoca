"use client"

import { createContext, useContext, useReducer, useCallback, useRef, useEffect, type ReactNode } from "react"
import type {
  ArenaState,
  MatchSettings,
  GameMode,
  RoundOption,
  TeleportPoint,
  TeamCoordinate,
} from "@/lib/arena-types"
import {
  DEFAULT_TELEPORT_POINTS,
  DEFAULT_RED_SPAWNS,
  DEFAULT_BLUE_SPAWNS,
} from "@/lib/arena-types"

const initialMatchSettings: MatchSettings = {
  gameMode: "1v1",
  timeLimit: 20,
  maxRounds: 10,
  currentRound: 0,
  autoRevive: true,
  redTeam: {
    name: "Red Team",
    color: "red",
    spawnPoints: DEFAULT_RED_SPAWNS,
    players: [],
  },
  blueTeam: {
    name: "Blue Team",
    color: "blue",
    spawnPoints: DEFAULT_BLUE_SPAWNS,
    players: [],
  },
  teleportPoints: DEFAULT_TELEPORT_POINTS,
}

const initialState: ArenaState = {
  isMenuOpen: true,
  isMatchActive: false,
  isPaused: false,
  matchSettings: initialMatchSettings,
  matchTimer: 20 * 60,
  scores: { red: 0, blue: 0 },
}

type ArenaAction =
  | { type: "TOGGLE_MENU" }
  | { type: "SET_GAME_MODE"; payload: GameMode }
  | { type: "SET_ROUNDS"; payload: RoundOption }
  | { type: "SET_TIME_LIMIT"; payload: number }
  | { type: "TOGGLE_AUTO_REVIVE" }
  | { type: "START_MATCH" }
  | { type: "STOP_MATCH" }
  | { type: "PAUSE_MATCH" }
  | { type: "RESUME_MATCH" }
  | { type: "NEXT_ROUND" }
  | { type: "TICK_TIMER" }
  | { type: "UPDATE_SCORE"; payload: { team: "red" | "blue"; score: number } }
  | { type: "ADD_TELEPORT_POINT"; payload: TeleportPoint }
  | { type: "REMOVE_TELEPORT_POINT"; payload: string }
  | { type: "UPDATE_TELEPORT_POINT"; payload: TeleportPoint }
  | { type: "ADD_SPAWN_POINT"; payload: { team: "red" | "blue"; spawn: TeamCoordinate } }
  | { type: "REMOVE_SPAWN_POINT"; payload: { team: "red" | "blue"; spawnId: string } }
  | { type: "UPDATE_SPAWN_POINT"; payload: { team: "red" | "blue"; spawn: TeamCoordinate } }
  | { type: "SET_TEAM_NAME"; payload: { team: "red" | "blue"; name: string } }
  | { type: "RESET_MATCH" }

function arenaReducer(state: ArenaState, action: ArenaAction): ArenaState {
  switch (action.type) {
    case "TOGGLE_MENU":
      return { ...state, isMenuOpen: !state.isMenuOpen }

    case "SET_GAME_MODE":
      return {
        ...state,
        matchSettings: { ...state.matchSettings, gameMode: action.payload },
      }

    case "SET_ROUNDS":
      return {
        ...state,
        matchSettings: { ...state.matchSettings, maxRounds: action.payload },
      }

    case "SET_TIME_LIMIT":
      return {
        ...state,
        matchSettings: { ...state.matchSettings, timeLimit: action.payload },
        matchTimer: action.payload * 60,
      }

    case "TOGGLE_AUTO_REVIVE":
      return {
        ...state,
        matchSettings: {
          ...state.matchSettings,
          autoRevive: !state.matchSettings.autoRevive,
        },
      }

    case "START_MATCH":
      return {
        ...state,
        isMatchActive: true,
        isPaused: false,
        matchTimer: state.matchSettings.timeLimit * 60,
        matchSettings: { ...state.matchSettings, currentRound: 1 },
        scores: { red: 0, blue: 0 },
      }

    case "STOP_MATCH":
      return {
        ...state,
        isMatchActive: false,
        isPaused: false,
        matchSettings: { ...state.matchSettings, currentRound: 0 },
      }

    case "PAUSE_MATCH":
      return { ...state, isPaused: true }

    case "RESUME_MATCH":
      return { ...state, isPaused: false }

    case "NEXT_ROUND": {
      const nextRound = state.matchSettings.currentRound + 1
      if (nextRound > state.matchSettings.maxRounds) {
        return { ...state, isMatchActive: false, isPaused: false }
      }
      return {
        ...state,
        matchSettings: { ...state.matchSettings, currentRound: nextRound },
        matchTimer: state.matchSettings.timeLimit * 60,
      }
    }

    case "TICK_TIMER":
      if (!state.isMatchActive || state.isPaused || state.matchTimer <= 0) {
        return state
      }
      return { ...state, matchTimer: state.matchTimer - 1 }

    case "UPDATE_SCORE":
      return {
        ...state,
        scores: {
          ...state.scores,
          [action.payload.team]: action.payload.score,
        },
      }

    case "ADD_TELEPORT_POINT":
      return {
        ...state,
        matchSettings: {
          ...state.matchSettings,
          teleportPoints: [
            ...state.matchSettings.teleportPoints,
            action.payload,
          ],
        },
      }

    case "REMOVE_TELEPORT_POINT":
      return {
        ...state,
        matchSettings: {
          ...state.matchSettings,
          teleportPoints: state.matchSettings.teleportPoints.filter(
            (tp) => tp.id !== action.payload
          ),
        },
      }

    case "UPDATE_TELEPORT_POINT":
      return {
        ...state,
        matchSettings: {
          ...state.matchSettings,
          teleportPoints: state.matchSettings.teleportPoints.map((tp) =>
            tp.id === action.payload.id ? action.payload : tp
          ),
        },
      }

    case "ADD_SPAWN_POINT": {
      const teamKey = action.payload.team === "red" ? "redTeam" : "blueTeam"
      return {
        ...state,
        matchSettings: {
          ...state.matchSettings,
          [teamKey]: {
            ...state.matchSettings[teamKey],
            spawnPoints: [
              ...state.matchSettings[teamKey].spawnPoints,
              action.payload.spawn,
            ],
          },
        },
      }
    }

    case "REMOVE_SPAWN_POINT": {
      const teamKey2 = action.payload.team === "red" ? "redTeam" : "blueTeam"
      return {
        ...state,
        matchSettings: {
          ...state.matchSettings,
          [teamKey2]: {
            ...state.matchSettings[teamKey2],
            spawnPoints: state.matchSettings[teamKey2].spawnPoints.filter(
              (sp) => sp.id !== action.payload.spawnId
            ),
          },
        },
      }
    }

    case "UPDATE_SPAWN_POINT": {
      const teamKey3 = action.payload.team === "red" ? "redTeam" : "blueTeam"
      return {
        ...state,
        matchSettings: {
          ...state.matchSettings,
          [teamKey3]: {
            ...state.matchSettings[teamKey3],
            spawnPoints: state.matchSettings[teamKey3].spawnPoints.map((sp) =>
              sp.id === action.payload.spawn.id ? action.payload.spawn : sp
            ),
          },
        },
      }
    }

    case "SET_TEAM_NAME": {
      const teamKey4 = action.payload.team === "red" ? "redTeam" : "blueTeam"
      return {
        ...state,
        matchSettings: {
          ...state.matchSettings,
          [teamKey4]: {
            ...state.matchSettings[teamKey4],
            name: action.payload.name,
          },
        },
      }
    }

    case "RESET_MATCH":
      return {
        ...initialState,
        matchSettings: {
          ...initialMatchSettings,
          teleportPoints: state.matchSettings.teleportPoints,
          redTeam: { ...state.matchSettings.redTeam, players: [] },
          blueTeam: { ...state.matchSettings.blueTeam, players: [] },
        },
      }

    default:
      return state
  }
}

interface ArenaContextValue {
  state: ArenaState
  dispatch: React.Dispatch<ArenaAction>
  sendToFiveM: (event: string, data: unknown) => void
}

const ArenaContext = createContext<ArenaContextValue | null>(null)

export function ArenaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(arenaReducer, initialState)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const sendToFiveM = useCallback((event: string, data: unknown) => {
    // NUI callback to FiveM client
    if (typeof window !== "undefined" && (window as Record<string, unknown>).GetParentResourceName) {
      fetch(
        `https://${(window as Record<string, unknown> & { GetParentResourceName: () => string }).GetParentResourceName()}/${event}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      ).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (state.isMatchActive && !state.isPaused) {
      timerRef.current = setInterval(() => {
        dispatch({ type: "TICK_TIMER" })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.isMatchActive, state.isPaused])

  return (
    <ArenaContext.Provider value={{ state, dispatch, sendToFiveM }}>
      {children}
    </ArenaContext.Provider>
  )
}

export function useArena() {
  const ctx = useContext(ArenaContext)
  if (!ctx) throw new Error("useArena must be used within ArenaProvider")
  return ctx
}
