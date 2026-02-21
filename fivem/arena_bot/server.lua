--[[
    Arena Bot - FiveM Server Script
    Handles match state synchronization, team management, scoring, and player coordination.
]]

-- ============================================================================
-- SERVER STATE
-- ============================================================================
local isMatchActive = false
local isPaused = false
local currentGameMode = Config.DefaultGameMode
local maxRounds = Config.DefaultMaxRounds
local currentRound = 0
local timeLimit = Config.DefaultTimeLimit
local autoRevive = Config.AutoRevive.enabled
local scores = { red = 0, blue = 0 }

local teams = {
    red = {},  -- { serverId, ... }
    blue = {}, -- { serverId, ... }
}

local redSpawns = Config.RedTeamSpawns
local blueSpawns = Config.BlueTeamSpawns
local teleportPoints = Config.TeleportPoints

-- ============================================================================
-- MATCH MANAGEMENT
-- ============================================================================
RegisterNetEvent("arena:server:startMatch")
AddEventHandler("arena:server:startMatch", function(data)
    local src = source
    isMatchActive = true
    isPaused = false
    currentGameMode = data.gameMode or Config.DefaultGameMode
    maxRounds = data.rounds or Config.DefaultMaxRounds
    timeLimit = data.timeLimit or Config.DefaultTimeLimit
    autoRevive = data.autoRevive ~= false
    currentRound = 1
    scores = { red = 0, blue = 0 }

    -- Auto-assign teams based on game mode
    AutoAssignTeams()

    -- Notify all players
    TriggerClientEvent("arena:client:matchStarted", -1, {
        gameMode = currentGameMode,
        rounds = maxRounds,
        timeLimit = timeLimit,
        autoRevive = autoRevive,
    })

    -- Teleport teams to spawns
    TeleportAllToSpawns()

    PrintLog("Match started: " .. currentGameMode .. " | Rounds: " .. maxRounds .. " | Time: " .. timeLimit .. "m")
end)

RegisterNetEvent("arena:server:stopMatch")
AddEventHandler("arena:server:stopMatch", function()
    isMatchActive = false
    isPaused = false
    currentRound = 0
    TriggerClientEvent("arena:client:matchStopped", -1)
    PrintLog("Match stopped.")
end)

RegisterNetEvent("arena:server:pauseMatch")
AddEventHandler("arena:server:pauseMatch", function()
    isPaused = true
    PrintLog("Match paused.")
end)

RegisterNetEvent("arena:server:resumeMatch")
AddEventHandler("arena:server:resumeMatch", function()
    isPaused = false
    PrintLog("Match resumed.")
end)

RegisterNetEvent("arena:server:nextRound")
AddEventHandler("arena:server:nextRound", function(round)
    if round > maxRounds then
        -- End match
        isMatchActive = false
        AnnounceWinner()
        return
    end
    currentRound = round
    TriggerClientEvent("arena:client:roundStarted", -1, round)
    TeleportAllToSpawns()
    PrintLog("Round " .. round .. " started.")
end)

RegisterNetEvent("arena:server:resetMatch")
AddEventHandler("arena:server:resetMatch", function()
    isMatchActive = false
    isPaused = false
    currentRound = 0
    scores = { red = 0, blue = 0 }
    teams = { red = {}, blue = {} }
    TriggerClientEvent("arena:client:matchStopped", -1)
    PrintLog("Match reset.")
end)

RegisterNetEvent("arena:server:setAutoRevive")
AddEventHandler("arena:server:setAutoRevive", function(enabled)
    autoRevive = enabled
    PrintLog("Auto-revive: " .. tostring(enabled))
end)

RegisterNetEvent("arena:server:roundTimeUp")
AddEventHandler("arena:server:roundTimeUp", function(round)
    if not isMatchActive or round ~= currentRound then return end
    -- Round ended by time - determine round winner by remaining alive players
    local redAlive = CountAlivePlayers("red")
    local blueAlive = CountAlivePlayers("blue")

    if redAlive > blueAlive then
        scores.red = scores.red + 1
    elseif blueAlive > redAlive then
        scores.blue = scores.blue + 1
    end
    -- Tie = no points awarded

    BroadcastScore()

    -- Check if match should end
    local halfRounds = math.ceil(maxRounds / 2)
    if scores.red > halfRounds or scores.blue > halfRounds or currentRound >= maxRounds then
        isMatchActive = false
        AnnounceWinner()
    else
        -- Auto advance to next round
        currentRound = currentRound + 1
        Citizen.SetTimeout(3000, function()
            TriggerClientEvent("arena:client:roundStarted", -1, currentRound)
            TeleportAllToSpawns()
        end)
    end
end)

-- ============================================================================
-- TEAM MANAGEMENT
-- ============================================================================
function AutoAssignTeams()
    local players = GetPlayers()
    local modeConfig = Config.GameModes[currentGameMode]
    local teamSize = modeConfig and modeConfig.teamSize or 1

    teams = { red = {}, blue = {} }

    local assigned = 0
    for _, playerId in ipairs(players) do
        local id = tonumber(playerId)
        if assigned < teamSize then
            table.insert(teams.red, id)
            TriggerClientEvent("arena:client:setTeam", id, "red")
        elseif assigned < teamSize * 2 then
            table.insert(teams.blue, id)
            TriggerClientEvent("arena:client:setTeam", id, "blue")
        end
        assigned = assigned + 1
        if assigned >= teamSize * 2 then break end
    end

    PrintLog("Teams assigned. Red: " .. #teams.red .. " | Blue: " .. #teams.blue)
end

function GetPlayerTeam(serverId)
    for _, id in ipairs(teams.red) do
        if id == serverId then return "red" end
    end
    for _, id in ipairs(teams.blue) do
        if id == serverId then return "blue" end
    end
    return nil
end

function CountAlivePlayers(team)
    local count = 0
    local teamList = teams[team] or {}
    for _, id in ipairs(teamList) do
        local ped = GetPlayerPed(id)
        if ped and ped > 0 and not IsEntityDead(ped) then
            count = count + 1
        end
    end
    return count
end

-- ============================================================================
-- SCORING
-- ============================================================================
RegisterNetEvent("arena:server:playerDied")
AddEventHandler("arena:server:playerDied", function(deadId, team)
    if not isMatchActive then return end
    PrintLog("Player " .. deadId .. " (" .. (team or "unknown") .. ") died.")

    -- Check if all players on a team are dead (if auto-revive is off)
    if not autoRevive then
        local teamName = team or GetPlayerTeam(deadId)
        if teamName then
            local alive = CountAlivePlayers(teamName)
            if alive <= 0 then
                -- Other team wins the round
                local winningTeam = teamName == "red" and "blue" or "red"
                scores[winningTeam] = scores[winningTeam] + 1
                BroadcastScore()
                PrintLog(winningTeam .. " team wins round " .. currentRound)

                -- Check for match end
                local halfRounds = math.ceil(maxRounds / 2)
                if scores[winningTeam] > halfRounds or currentRound >= maxRounds then
                    AnnounceWinner()
                else
                    currentRound = currentRound + 1
                    Citizen.SetTimeout(5000, function()
                        TriggerClientEvent("arena:client:roundStarted", -1, currentRound)
                        TeleportAllToSpawns()
                    end)
                end
            end
        end
    end
end)

RegisterNetEvent("arena:server:playerKilled")
AddEventHandler("arena:server:playerKilled", function(deadId, killerId, team)
    if not isMatchActive then return end
    PrintLog("Player " .. deadId .. " killed by " .. killerId)
end)

RegisterNetEvent("arena:server:playerRevived")
AddEventHandler("arena:server:playerRevived", function(playerId)
    PrintLog("Player " .. playerId .. " revived.")
end)

function BroadcastScore()
    TriggerClientEvent("arena:client:updateScore", -1, scores.red, scores.blue)
end

function AnnounceWinner()
    isMatchActive = false
    local winner = "Draw"
    if scores.red > scores.blue then
        winner = "Red Team"
    elseif scores.blue > scores.red then
        winner = "Blue Team"
    end

    PrintLog("Match ended! Winner: " .. winner .. " | Score: Red " .. scores.red .. " - " .. scores.blue .. " Blue")
    TriggerClientEvent("arena:client:matchStopped", -1)
    -- Could add more winner announcement logic here
end

-- ============================================================================
-- TELEPORTATION
-- ============================================================================
RegisterNetEvent("arena:server:teleportTeam")
AddEventHandler("arena:server:teleportTeam", function(team, spawnPoints)
    local teamList = teams[team] or {}
    local spawns = spawnPoints or (team == "red" and redSpawns or blueSpawns)

    for i, playerId in ipairs(teamList) do
        local spawnIndex = ((i - 1) % #spawns) + 1
        local spawn = spawns[spawnIndex]
        TriggerClientEvent("arena:client:teleport", playerId, spawn.x, spawn.y, spawn.z, spawn.heading or 0.0)
    end
end)

RegisterNetEvent("arena:server:teleportAllToSpawns")
AddEventHandler("arena:server:teleportAllToSpawns", function()
    TeleportAllToSpawns()
end)

function TeleportAllToSpawns()
    -- Teleport red team
    for i, playerId in ipairs(teams.red) do
        local spawnIndex = ((i - 1) % #redSpawns) + 1
        local spawn = redSpawns[spawnIndex]
        TriggerClientEvent("arena:client:teleport", playerId, spawn.x, spawn.y, spawn.z, spawn.heading or 0.0)
    end

    -- Teleport blue team
    for i, playerId in ipairs(teams.blue) do
        local spawnIndex = ((i - 1) % #blueSpawns) + 1
        local spawn = blueSpawns[spawnIndex]
        TriggerClientEvent("arena:client:teleport", playerId, spawn.x, spawn.y, spawn.z, spawn.heading or 0.0)
    end
end

-- ============================================================================
-- SPAWN & TELEPORT POINT MANAGEMENT (from NUI)
-- ============================================================================
RegisterNetEvent("arena:server:addSpawn")
AddEventHandler("arena:server:addSpawn", function(team, spawn)
    if team == "red" then
        table.insert(redSpawns, spawn)
    else
        table.insert(blueSpawns, spawn)
    end
end)

RegisterNetEvent("arena:server:updateSpawn")
AddEventHandler("arena:server:updateSpawn", function(team, spawn)
    local spawns = team == "red" and redSpawns or blueSpawns
    for i, s in ipairs(spawns) do
        if s.id == spawn.id then
            spawns[i] = spawn
            break
        end
    end
end)

RegisterNetEvent("arena:server:removeSpawn")
AddEventHandler("arena:server:removeSpawn", function(team, spawnId)
    local spawns = team == "red" and redSpawns or blueSpawns
    for i, s in ipairs(spawns) do
        if s.id == spawnId then
            table.remove(spawns, i)
            break
        end
    end
end)

RegisterNetEvent("arena:server:addTeleportPoint")
AddEventHandler("arena:server:addTeleportPoint", function(point)
    table.insert(teleportPoints, point)
end)

RegisterNetEvent("arena:server:removeTeleportPoint")
AddEventHandler("arena:server:removeTeleportPoint", function(id)
    for i, tp in ipairs(teleportPoints) do
        if tp.id == id then
            table.remove(teleportPoints, i)
            break
        end
    end
end)

-- ============================================================================
-- UTILITY
-- ============================================================================
function GetPlayers()
    local players = {}
    for _, id in ipairs(GetPlayerIndices()) do
        table.insert(players, id)
    end
    return players
end

function PrintLog(msg)
    print("[Arena Bot] " .. msg)
end
