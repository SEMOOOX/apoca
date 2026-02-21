--[[
    Arena Bot - FiveM Client Script
    Handles NUI communication, teleportation, auto-revive, HUD updates, and local player management.
]]

-- ============================================================================
-- LOCAL STATE
-- ============================================================================
local isMenuOpen = false
local isMatchActive = false
local isPaused = false
local currentTeam = nil -- "red" or "blue"
local currentRound = 0
local maxRounds = Config.DefaultMaxRounds
local matchTimer = Config.DefaultTimeLimit * 60
local autoReviveEnabled = Config.AutoRevive.enabled
local scores = { red = 0, blue = 0 }
local isInvincible = false
local gameMode = Config.DefaultGameMode

-- ============================================================================
-- NUI MANAGEMENT
-- ============================================================================
function ToggleMenu(show)
    isMenuOpen = show
    SetNuiFocus(show, show)
    SendNUIMessage({
        type = "toggleMenu",
        show = show,
    })
end

RegisterCommand("arenamenu", function()
    ToggleMenu(not isMenuOpen)
end, false)

RegisterKeyMapping("arenamenu", "Toggle Arena Menu", "keyboard", Config.OpenKey)

-- Close menu on Escape
RegisterNUICallback("closeMenu", function(_, cb)
    ToggleMenu(false)
    cb("ok")
end)

-- ============================================================================
-- MATCH CONTROL NUI CALLBACKS
-- ============================================================================
RegisterNUICallback("arena:startMatch", function(data, cb)
    gameMode = data.gameMode or Config.DefaultGameMode
    maxRounds = data.rounds or Config.DefaultMaxRounds
    matchTimer = (data.timeLimit or Config.DefaultTimeLimit) * 60
    autoReviveEnabled = data.autoRevive ~= false
    currentRound = 1
    scores = { red = 0, blue = 0 }
    isMatchActive = true
    isPaused = false

    TriggerServerEvent("arena:server:startMatch", {
        gameMode = gameMode,
        rounds = maxRounds,
        timeLimit = data.timeLimit or Config.DefaultTimeLimit,
        autoRevive = autoReviveEnabled,
    })

    ShowNotification("~g~Arena Match Started!~s~ Mode: " .. gameMode)
    cb("ok")
end)

RegisterNUICallback("arena:stopMatch", function(_, cb)
    isMatchActive = false
    isPaused = false
    currentRound = 0
    TriggerServerEvent("arena:server:stopMatch")
    ShowNotification("~r~Arena Match Stopped!~s~")
    cb("ok")
end)

RegisterNUICallback("arena:pauseMatch", function(_, cb)
    isPaused = true
    TriggerServerEvent("arena:server:pauseMatch")
    ShowNotification("~y~Match Paused~s~")
    cb("ok")
end)

RegisterNUICallback("arena:resumeMatch", function(_, cb)
    isPaused = false
    TriggerServerEvent("arena:server:resumeMatch")
    ShowNotification("~g~Match Resumed~s~")
    cb("ok")
end)

RegisterNUICallback("arena:nextRound", function(data, cb)
    local nextRound = data.round or (currentRound + 1)
    if nextRound > maxRounds then
        isMatchActive = false
        ShowNotification("~b~Match Complete!~s~")
    else
        currentRound = nextRound
        matchTimer = Config.DefaultTimeLimit * 60
        TriggerServerEvent("arena:server:nextRound", nextRound)
        ShowNotification("~b~Round " .. nextRound .. " Starting!~s~")
        -- Teleport all players to spawns
        TeleportTeamsToSpawns()
    end
    cb("ok")
end)

RegisterNUICallback("arena:resetMatch", function(_, cb)
    isMatchActive = false
    isPaused = false
    currentRound = 0
    scores = { red = 0, blue = 0 }
    matchTimer = Config.DefaultTimeLimit * 60
    TriggerServerEvent("arena:server:resetMatch")
    ShowNotification("~y~Match Reset~s~")
    cb("ok")
end)

RegisterNUICallback("arena:toggleAutoRevive", function(data, cb)
    autoReviveEnabled = data.enabled
    TriggerServerEvent("arena:server:setAutoRevive", data.enabled)
    if autoReviveEnabled then
        ShowNotification("~g~Auto-Revive Enabled~s~")
    else
        ShowNotification("~r~Auto-Revive Disabled~s~")
    end
    cb("ok")
end)

-- ============================================================================
-- TELEPORTATION NUI CALLBACKS
-- ============================================================================
RegisterNUICallback("arena:teleport", function(data, cb)
    local pos = data.position
    if pos then
        TeleportPlayer(pos.x, pos.y, pos.z, pos.heading or 0.0)
        ShowNotification("~b~Teleported!~s~")
    end
    cb("ok")
end)

RegisterNUICallback("arena:teleportTeam", function(data, cb)
    TriggerServerEvent("arena:server:teleportTeam", data.team, data.spawnPoints)
    ShowNotification("~b~Teleporting " .. (data.team or "team") .. " team!~s~")
    cb("ok")
end)

RegisterNUICallback("arena:addSpawn", function(data, cb)
    TriggerServerEvent("arena:server:addSpawn", data.team, data.spawn)
    cb("ok")
end)

RegisterNUICallback("arena:updateSpawn", function(data, cb)
    TriggerServerEvent("arena:server:updateSpawn", data.team, data.spawn)
    cb("ok")
end)

RegisterNUICallback("arena:removeSpawn", function(data, cb)
    TriggerServerEvent("arena:server:removeSpawn", data.team, data.spawnId)
    cb("ok")
end)

RegisterNUICallback("arena:addTeleportPoint", function(data, cb)
    TriggerServerEvent("arena:server:addTeleportPoint", data)
    cb("ok")
end)

RegisterNUICallback("arena:removeTeleportPoint", function(data, cb)
    TriggerServerEvent("arena:server:removeTeleportPoint", data.id)
    cb("ok")
end)

-- ============================================================================
-- TELEPORTATION FUNCTIONS
-- ============================================================================
function TeleportPlayer(x, y, z, heading)
    local ped = PlayerPedId()
    SetEntityCoords(ped, x + 0.0, y + 0.0, z + 0.0, false, false, false, true)
    SetEntityHeading(ped, heading + 0.0)
    -- Wait for collision to load
    RequestCollisionAtCoord(x, y, z)
    local timeout = 0
    while not HasCollisionLoadedAroundEntity(ped) and timeout < 1000 do
        Citizen.Wait(10)
        timeout = timeout + 10
    end
end

function TeleportTeamsToSpawns()
    TriggerServerEvent("arena:server:teleportAllToSpawns")
end

-- Server tells us to teleport
RegisterNetEvent("arena:client:teleport")
AddEventHandler("arena:client:teleport", function(x, y, z, heading)
    TeleportPlayer(x, y, z, heading)
end)

-- ============================================================================
-- AUTO-REVIVE SYSTEM
-- ============================================================================
local deathCheckThread = false

function StartAutoReviveThread()
    if deathCheckThread then return end
    deathCheckThread = true

    Citizen.CreateThread(function()
        while isMatchActive do
            Citizen.Wait(100)

            local ped = PlayerPedId()
            if IsEntityDead(ped) and autoReviveEnabled and not isPaused then
                -- Wait for respawn delay
                Citizen.Wait(Config.AutoRevive.respawnDelay)

                -- Check again if still dead and match still active
                if IsEntityDead(PlayerPedId()) and isMatchActive and autoReviveEnabled then
                    RevivePlayer()
                end
            end
        end
        deathCheckThread = false
    end)
end

function RevivePlayer()
    local ped = PlayerPedId()

    -- Resurrect the player
    local coords = GetEntityCoords(ped)
    NetworkResurrectLocalPlayer(coords.x, coords.y, coords.z, GetEntityHeading(ped), true, false)

    -- Clear death state
    ped = PlayerPedId()
    ClearPedBloodDamage(ped)
    ClearPedTasksImmediately(ped)
    SetPlayerInvincible(PlayerId(), false)

    -- Heal to full if configured
    if Config.AutoRevive.healToFull then
        SetEntityHealth(ped, GetEntityMaxHealth(ped))
    end

    -- Restore armor if configured
    if Config.AutoRevive.restoreArmor then
        SetPedArmour(ped, Config.AutoRevive.armorAmount)
    end

    -- Grant invincibility frames
    if Config.AutoRevive.invincibilityTime > 0 then
        isInvincible = true
        SetPlayerInvincible(PlayerId(), true)
        Citizen.SetTimeout(Config.AutoRevive.invincibilityTime, function()
            isInvincible = false
            SetPlayerInvincible(PlayerId(), false)
        end)
    end

    -- Respawn at team spawn point
    if currentTeam then
        local spawns = currentTeam == "red" and Config.RedTeamSpawns or Config.BlueTeamSpawns
        if #spawns > 0 then
            local spawn = spawns[math.random(#spawns)]
            TeleportPlayer(spawn.x, spawn.y, spawn.z, spawn.heading)
        end
    end

    -- Give weapons
    GivePlayerLoadout()

    ShowNotification("~g~Revived!~s~")
    TriggerServerEvent("arena:server:playerRevived", GetPlayerServerId(PlayerId()))
end

-- ============================================================================
-- WEAPON LOADOUT
-- ============================================================================
function GivePlayerLoadout()
    local ped = PlayerPedId()
    -- Remove all weapons first
    RemoveAllPedWeapons(ped, true)

    for _, item in ipairs(Config.DefaultLoadout) do
        local weaponHash = GetHashKey(item.weapon)
        GiveWeaponToPed(ped, weaponHash, item.ammo, false, true)
    end
end

-- ============================================================================
-- DEATH HANDLER
-- ============================================================================
AddEventHandler("baseevents:onPlayerDied", function()
    if isMatchActive then
        TriggerServerEvent("arena:server:playerDied", GetPlayerServerId(PlayerId()), currentTeam)
    end
end)

AddEventHandler("baseevents:onPlayerKilled", function(killerId)
    if isMatchActive then
        TriggerServerEvent("arena:server:playerKilled", GetPlayerServerId(PlayerId()), killerId, currentTeam)
    end
end)

-- ============================================================================
-- SERVER EVENT HANDLERS
-- ============================================================================
RegisterNetEvent("arena:client:matchStarted")
AddEventHandler("arena:client:matchStarted", function(data)
    isMatchActive = true
    isPaused = false
    gameMode = data.gameMode
    maxRounds = data.rounds
    currentRound = 1
    autoReviveEnabled = data.autoRevive
    scores = { red = 0, blue = 0 }
    matchTimer = data.timeLimit * 60
    StartAutoReviveThread()
    GivePlayerLoadout()
end)

RegisterNetEvent("arena:client:matchStopped")
AddEventHandler("arena:client:matchStopped", function()
    isMatchActive = false
    isPaused = false
    currentRound = 0
end)

RegisterNetEvent("arena:client:setTeam")
AddEventHandler("arena:client:setTeam", function(team)
    currentTeam = team
    ShowNotification("~b~Assigned to ~s~" .. (team == "red" and "~r~Red Team" or "~b~Blue Team"))
end)

RegisterNetEvent("arena:client:updateScore")
AddEventHandler("arena:client:updateScore", function(redScore, blueScore)
    scores.red = redScore
    scores.blue = blueScore
    SendNUIMessage({
        type = "updateScore",
        red = redScore,
        blue = blueScore,
    })
end)

RegisterNetEvent("arena:client:roundStarted")
AddEventHandler("arena:client:roundStarted", function(round)
    currentRound = round
    matchTimer = Config.DefaultTimeLimit * 60
    ShowNotification("~b~Round " .. round .. " Started!~s~")
end)

-- ============================================================================
-- MATCH TIMER THREAD
-- ============================================================================
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1000)
        if isMatchActive and not isPaused and matchTimer > 0 then
            matchTimer = matchTimer - 1
            if matchTimer <= 0 then
                -- Time's up for this round
                TriggerServerEvent("arena:server:roundTimeUp", currentRound)
            end
        end
    end
end)

-- ============================================================================
-- ARENA BOUNDARY CHECK
-- ============================================================================
if Config.ArenaBounds then
    Citizen.CreateThread(function()
        while true do
            Citizen.Wait(1000)
            if isMatchActive and not isPaused then
                local ped = PlayerPedId()
                local coords = GetEntityCoords(ped)
                local center = Config.ArenaBounds.center
                local dist = #(vector3(coords.x, coords.y, coords.z) - vector3(center.x, center.y, center.z))

                if dist > Config.ArenaBounds.radius then
                    -- Out of bounds - apply damage
                    local health = GetEntityHealth(ped)
                    SetEntityHealth(ped, math.max(0, health - Config.ArenaBounds.outOfBoundsDamage))
                    ShowNotification("~r~OUT OF BOUNDS! Return to arena!~s~")
                elseif dist > Config.ArenaBounds.warningRadius then
                    ShowNotification("~y~Warning: Approaching arena boundary!~s~")
                end
            end
        end
    end)
end

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================
function ShowNotification(text)
    SetNotificationTextEntry("STRING")
    AddTextComponentString(text)
    DrawNotification(false, true)
end

-- Debug logging
function DebugLog(msg)
    if Config.Debug then
        print("[Arena Bot] " .. msg)
    end
end

-- ============================================================================
-- RESOURCE CLEANUP
-- ============================================================================
AddEventHandler("onResourceStop", function(resourceName)
    if resourceName == GetCurrentResourceName() then
        ToggleMenu(false)
        isMatchActive = false
        SetPlayerInvincible(PlayerId(), false)
    end
end)
