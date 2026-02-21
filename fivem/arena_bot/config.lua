--[[
    Arena Bot - FiveM Resource Configuration
    Configuration file for arena match settings, spawn coordinates, and teleport points.
]]

Config = {}

-- ============================================================================
-- GENERAL SETTINGS
-- ============================================================================
Config.ResourceName = "arena_bot"
Config.Debug = false

-- NUI settings
Config.NUIFocus = true
Config.OpenKey = "F5" -- Key to toggle arena menu

-- ============================================================================
-- GAME MODE SETTINGS
-- ============================================================================
Config.GameModes = {
    ["1v1"] = { teamSize = 1, totalPlayers = 2 },
    ["2v2"] = { teamSize = 2, totalPlayers = 4 },
    ["3v3"] = { teamSize = 3, totalPlayers = 6 },
    ["4v4"] = { teamSize = 4, totalPlayers = 8 },
    ["5v5"] = { teamSize = 5, totalPlayers = 10 },
}

Config.DefaultGameMode = "1v1"

-- ============================================================================
-- MATCH SETTINGS
-- ============================================================================
Config.DefaultTimeLimit = 20  -- minutes (max 20)
Config.MaxTimeLimit = 20      -- minutes
Config.DefaultMaxRounds = 10
Config.MaxRounds = 30
Config.RoundOptions = { 5, 10, 20, 30 }

-- ============================================================================
-- AUTO-REVIVE SETTINGS
-- ============================================================================
Config.AutoRevive = {
    enabled = true,
    respawnDelay = 3000,       -- ms delay before respawning
    invincibilityTime = 2000,  -- ms of invincibility after respawn
    healToFull = true,
    restoreArmor = true,
    armorAmount = 100,
}

-- ============================================================================
-- TEAM CONFIGURATIONS
-- ============================================================================
Config.Teams = {
    red = {
        name = "Red Team",
        color = { r = 224, g = 36, b = 36 }, -- hsl(0 72% 51%)
        blipColor = 1,
        markerColor = { r = 224, g = 36, b = 36, a = 100 },
    },
    blue = {
        name = "Blue Team",
        color = { r = 59, g = 130, b = 246 }, -- hsl(217 91% 60%)
        blipColor = 3,
        markerColor = { r = 59, g = 130, b = 246, a = 100 },
    },
}

-- ============================================================================
-- SPAWN COORDINATES
-- Red Team Spawns (Cordes 1, Cordes 2, etc.)
-- ============================================================================
Config.RedTeamSpawns = {
    {
        id = "red-spawn-1",
        label = "Cordes 1",
        x = -248.5,
        y = 152.3,
        z = 73.0,
        heading = 90.0,
    },
    {
        id = "red-spawn-2",
        label = "Cordes 2",
        x = -252.1,
        y = 148.7,
        z = 73.0,
        heading = 90.0,
    },
    {
        id = "red-spawn-3",
        label = "Cordes 3",
        x = -245.0,
        y = 155.0,
        z = 73.0,
        heading = 90.0,
    },
    {
        id = "red-spawn-4",
        label = "Cordes 4",
        x = -255.0,
        y = 145.0,
        z = 73.0,
        heading = 90.0,
    },
    {
        id = "red-spawn-5",
        label = "Cordes 5",
        x = -250.0,
        y = 160.0,
        z = 73.0,
        heading = 90.0,
    },
}

-- ============================================================================
-- Blue Team Spawns (Team Reed Coordinates)
-- ============================================================================
Config.BlueTeamSpawns = {
    {
        id = "blue-spawn-1",
        label = "Team Reed Cordes 1",
        x = 248.5,
        y = -152.3,
        z = 73.0,
        heading = 270.0,
    },
    {
        id = "blue-spawn-2",
        label = "Team Reed Cordes 2",
        x = 252.1,
        y = -148.7,
        z = 73.0,
        heading = 270.0,
    },
    {
        id = "blue-spawn-3",
        label = "Team Reed Cordes 3",
        x = 245.0,
        y = -155.0,
        z = 73.0,
        heading = 270.0,
    },
    {
        id = "blue-spawn-4",
        label = "Team Reed Cordes 4",
        x = 255.0,
        y = -145.0,
        z = 73.0,
        heading = 270.0,
    },
    {
        id = "blue-spawn-5",
        label = "Team Reed Cordes 5",
        x = 250.0,
        y = -160.0,
        z = 73.0,
        heading = 270.0,
    },
}

-- ============================================================================
-- TELEPORT POINTS
-- ============================================================================
Config.TeleportPoints = {
    {
        id = "tp-1",
        name = "Arena Center",
        x = 0.0,
        y = 0.0,
        z = 73.0,
        heading = 0.0,
        team = "neutral",
    },
    {
        id = "tp-2",
        name = "Red Base",
        x = -250.0,
        y = 150.0,
        z = 73.0,
        heading = 90.0,
        team = "red",
    },
    {
        id = "tp-3",
        name = "Blue Base",
        x = 250.0,
        y = -150.0,
        z = 73.0,
        heading = 270.0,
        team = "blue",
    },
}

-- ============================================================================
-- WEAPON LOADOUT (given on spawn)
-- ============================================================================
Config.DefaultLoadout = {
    { weapon = "WEAPON_CARBINERIFLE", ammo = 500 },
    { weapon = "WEAPON_PISTOL", ammo = 200 },
    { weapon = "WEAPON_SMOKEGRENADE", ammo = 3 },
}

-- ============================================================================
-- ARENA BOUNDARIES (optional, set to nil to disable)
-- ============================================================================
Config.ArenaBounds = {
    center = { x = 0.0, y = 0.0, z = 73.0 },
    radius = 500.0, -- distance from center before out-of-bounds
    warningRadius = 450.0,
    outOfBoundsDamage = 5, -- HP per second when out of bounds
}
