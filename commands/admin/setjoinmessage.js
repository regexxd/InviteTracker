const Discord = require("discord.js");

module.exports = {
    name: "setjoinmessage",
    aliases: [],
    cooldown: 2000,
    ownerOnly: false,
    userPermissions: ["MANAGE_GUILD"],
    botPermissions: [],
    async execute(client, message, args, data) {
        if (!args[0]) return message.channel.send(message.translate.error(this, "args"))

        let member = await client.database.fetchMember({
            userID: message.author.id,
            guildID: message.guild.id,
            bot: message.author.bot
        })

        data.joinMessage = args.join(" ")
        data.save().then(async () => {
            message.channel.send(await message.translate.admin.setjoinmessage.success(args.join(" "), data, message, member)).then(async (msg) => {
                msg.delete({
                    timeout: 5000
                })
            })
        })
    }
}
