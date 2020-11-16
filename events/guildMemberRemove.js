const Discord = require('discord.js');

const isEqual = (value, other) => {
    const type = Object.prototype.toString.call(value);
    if (type !== Object.prototype.toString.call(other)) return false;
    if (["[object Array]", "[object Object]"].indexOf(type) < 0) return false;
    const valueLen = type === "[object Array]" ? value.length : Object.keys(value).length;
    const otherLen = type === "[object Array]" ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false;
    const compare = (item1, item2) => {
        const itemType = Object.prototype.toString.call(item1);
        if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
            if (!isEqual(item1, item2)) return false;
        }
        else {
            if (itemType !== Object.prototype.toString.call(item2)) return false;
            if (itemType === "[object Function]") {
                if (item1.toString() !== item2.toString()) return false;
            } else {
                if (item1 !== item2) return false;
            }
        }
    };
    if (type === "[object Array]") {
        for (var i = 0; i < valueLen; i++) {
            if (compare(value[i], other[i]) === false) return false;
        }
    } else {
        for (var key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                if (compare(value[key], other[key]) === false) return false;
            }
        }
    }
    return true;
};

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(member) {
        let startAt = Date.now()
        let client = this.client;

        let guild = member.guild

        let bot = false;
        let inviteType = 'normal'

        let invite;
        let inviterData;

        if (!member.user) return;

        let guildData = await client.database.fetchGuild({
            guildID: guild.id,
        })

        const memberData = await client.database.getMember({
            guildID: guild.id,
            userID: member.user.id,
            bot: member.user.bot
        }) || {}

        const inviter = memberData.inviteType === "normal" || memberData.inviteType === "oauth" ? await guild.members.cache.get(memberData.invitedBy) || await member.guild.members.fetch({
            user: memberData.invitedBy,
            cache: true
        }) : null;

        if (memberData) {
            if (memberData.invitedBy) {
                inviter = guild.members.cache.get(memberData.invitedBy) || await member.guild.members.fetch({
                    user: memberData.invitedBy,
                    cache: true
                });

                inviterData = await client.database.fetchMember({
                    guildID: guild.id,
                    userID: inviter.user.id,
                    bot: inviter.user.bot
                })

                if (!inviterData) inviteType = 'unknow'
            } else {
                inviteType = 'unknow'
            }
        }

        if (inviter && inviterData && inviteType !== "unknow") {
            inviterData.leaves++;
            inviterData.save()
        }

        let translate = client.languages.get(guildData.language)

        if (guildData.leave) {
            let channel = guild.channels.cache.get(guildData.leaveChannel);

            if (inviteType == 'normal') channel.send(client.formatMessage(guildData.leaveMessage, member, guildData.language, {
                invite: invite,
                inviterData: inviterData
            })).catch((err) => { })

            if (inviteType == 'oauth') channel.send(client.formatMessage(translate.message.leave.oauth, member, guildData.language, {
                inviterData: inviterData
            })).catch((err) => { })

            if (inviteType == 'oauth' && !inviter || !inviterData) channel.send(client.formatMessage(translate.message.leave.unknowOauth, member, guildData.language, {
                inviterData: inviterData
            })).catch((err) => { })

            if (inviteType == 'vanity') channel.send(client.formatMessage(translate.message.leave.vanity, member, guildData.language, {
                inviterData: inviterData
            })).catch((err) => { })

            if (inviteType == 'unknow') channel.send(client.formatMessage(translate.message.leave.unknow, member, guildData.language, {
                inviterData: inviterData
            })).catch((err) => { })
        }
    }
}