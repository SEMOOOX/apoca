export type GameMode = "1v1" | "2v2" | "3v3" | "4v4" | "5v5"

export type RoundOption = 5 | 10 | 20 | 30

export interface Coordinate {
  x: number
  y: number
  z: number
  heading?: number
}

export interface TeamCoordinate {
  id: string
  label: string
  position: Coordinate
}

export interface TeleportPoint {
  id: string
  name: string
  position: Coordinate
  team: "red" | "blue" | "neutral"
}

export interface TeamConfig {
  name: string
  color: "red" | "blue"
  spawnPoints: TeamCoordinate[]
  players: string[]
}

export interface MatchSettings {
  gameMode: GameMode
  timeLimit: number // in minutes, default 20
  maxRounds: RoundOption
  currentRound: number
  autoRevive: boolean
  redTeam: TeamConfig
  blueTeam: TeamConfig
  teleportPoints: TeleportPoint[]
}

export interface ArenaState {
  isMenuOpen: boolean
  isMatchActive: boolean
  isPaused: boolean
  matchSettings: MatchSettings
  matchTimer: number // seconds remaining
  scores: { red: number; blue: number }
}

export const DEFAULT_TELEPORT_POINTS: TeleportPoint[] = [
  {
    id: "tp-1",
    name: "Arena Center",
    position: { x: 0.0, y: 0.0, z: 73.0, heading: 0.0 },
    team: "neutral",
  },
  {
    id: "tp-2",
    name: "Red Base",
    position: { x: -250.0, y: 150.0, z: 73.0, heading: 90.0 },
    team: "red",
  },
  {
    id: "tp-3",
    name: "Blue Base",
    position: { x: 250.0, y: -150.0, z: 73.0, heading: 270.0 },
    team: "blue",
  },
]

export const DEFAULT_RED_SPAWNS: TeamCoordinate[] = [
  {
    id: "red-spawn-1",
    label: "Cordes 1",
    position: { x: -248.5, y: 152.3, z: 73.0, heading: 90.0 },
  },
  {
    id: "red-spawn-2",
    label: "Cordes 2",
    position: { x: -252.1, y: 148.7, z: 73.0, heading: 90.0 },
  },
]

export const DEFAULT_BLUE_SPAWNS: TeamCoordinate[] = [
  {
    id: "blue-spawn-1",
    label: "Team Reed Cordes 1",
    position: { x: 248.5, y: -152.3, z: 73.0, heading: 270.0 },
  },
  {
    id: "blue-spawn-2",
    label: "Team Reed Cordes 2",
    position: { x: 252.1, y: -148.7, z: 73.0, heading: 270.0 },
  },
]

export const GAME_MODES: GameMode[] = ["1v1", "2v2", "3v3", "4v4", "5v5"]
export const ROUND_OPTIONS: RoundOption[] = [5, 10, 20, 30]
export const MAX_TIME_LIMIT = 20 // minutes
