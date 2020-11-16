const Discord = require('discord.js');

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        let startAt = Date.now()
        let client = this.client;

        client.user.setActivity("InviteScanner | i!help");

        setInterval(() => {
            client.user.setActivity("InviteScanner | i!help");
        }, 60000 * 60);

        await client.asyncForEach(client.guilds.cache.array().filter(g => g.me.hasPermission("MANAGE_GUILD")), async (guild) => {
            const member = await guild.members.fetch(client.user.id).catch(() => { });
            const i = await guild.fetchInvites().catch(() => { }) || new Discord.Collection()
            client.invitations[guild.id] = i || new Map();
        });

        client.database.fetchMember = async function (where) {
            let member = await client.database.models.members.findOrCreate({
                where: where
            })

            return member[0]
        }

        client.database.getMember = async function (where) {
            let member = await client.database.models.members.findOne({
                where: where
            })

            return member
        }

        client.database.fetchGuild = async function (where) {
            let member = await client.database.models.guilds.findOrCreate({
                where: where
            })

            return member[0]
        }
        client.database.pushLog = async function (data) {
            await client.database.models.logs.create(data)
        }

        client.database.checkLog = async function (data) {
            await client.database.models.logs.findOne({
                where: data
            })
        }
    }
}