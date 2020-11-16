const Discord = require("discord.js");

module.exports = {
    name: "setjoinchannel",
    aliases: [],
    cooldown: 2000,
    ownerOnly: false,
    userPermissions: ["MANAGE_GUILD"],
    botPermissions: [],
    async execute(client, message, args, data) {
        if (!args[0]) {
            data.join = false;
            data.save()
            return message.channel.send(message.translate.admin.setjoinchannel.disable).then(async (msg) => {
                msg.delete({
                    timeout: 5000
                })
            })
        }

        let channel = message.mentions.channels.first() || message.guild.channels.cache.find(x => x.name.includes(args[0])) || message.guild.channels.cache.get(args[0])

        if (!channel) return message.translate.error(this, "cannotFindChannel", {
            channel: args[0]
        })

        data.joinChannel = channel.id
        data.join = true;
        data.save().then(async () => {
            message.channel.send(message.translate.admin.setjoinchannel.success(args[0])).then(async (msg) => {
                msg.delete({
                    timeout: 10000
                })
            })
        })
    }
}
