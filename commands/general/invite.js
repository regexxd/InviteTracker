const Discord = require("discord.js")

module.exports = {
    name: "invite",
    aliases: ["invites", "rank"],
    cooldown: 2000,
    ownerOnly: false,
    userPermissions: [],
    botPermissions: ["EMBED_LINKS"],
    async execute(client, message, args, data) {
        let member = message.mentions.members.first() || message.guild.members.cache.find(x => x.user.username.includes(args[0])) || message.guild.members.cache.get(args[0]) || message.member

        let memberData = await client.database.fetchMember({
            userID: member.user.id,
            guildID: message.guild.id
        })

        if (!member) return message.channel.send(message.translate.error(this, "args"))

        message.channel.send(message.translate.general.invite.invites(member, memberData, data, message))
    }
}
