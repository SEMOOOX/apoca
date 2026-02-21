fx_version 'cerulean'
game 'gta5'

author 'Arena Bot'
description 'Advanced FiveM Arena Bot - Competitive Match System with Auto-Revive'
version '1.0.0'

-- Shared config (loaded before client/server)
shared_script 'config.lua'

-- Client-side scripts
client_scripts {
    'client.lua',
}

-- Server-side scripts
server_scripts {
    'server.lua',
}

-- NUI (HTML interface)
ui_page 'nui/index.html'

files {
    'nui/index.html',
    'nui/**/*',
}

-- Dependencies
dependencies {
    'baseevents',
}
