const { ShardingManager } = require('discord.js')
const { shards } = require('config.json')
const manager = new ShardingManager({
    file: './index.js',
    totalShards: shards,
    respawn: true,
    token: 'NzY3Mzc2NTUxOTUxMDczMjgw.X4xBGw.EewxlpHEyG--IWHAkR3Ns7HPBi8'
})