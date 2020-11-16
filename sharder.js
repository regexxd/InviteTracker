const { ShardingManager } = require('discord.js')
const { shards, token } = require('config.json')
const manager = new ShardingManager({
    file: './index.js',
    totalShards: shards,
    respawn: true,
    token: token
})
