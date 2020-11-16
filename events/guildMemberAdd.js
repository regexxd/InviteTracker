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

        let guildData = await client.database.fetchGuild({
            guildID: guild.id,
        })

        let bot = false;
        let inviteType = 'normal'
        let inviter;
        let invite;

        if (member.user.bot) {
            bot = true;
            if (guild.me.hasPermission("VIEW_AUDIT_LOG")) inviter = await member.guild.fetchAuditLogs({ type: "BOT_ADD" }).then(async (audit) => audit.entries.first().executor);
            inviteType = 'oauth'
        }

        if (guild.me.hasPermission("MANAGE_GUILD")) {
            inviteType = 'unknow'
        }

        const guildInvites = await guild.fetchInvites().catch(() => { });
        const oldGuildInvites = client.invitations[guild.id];

        if (guildInvites && oldGuildInvites) {

            this.client.invitations[member.guild.id] = guildInvites;

            let inviteUsed = guildInvites.find((i) => oldGuildInvites.get(i.code) && ((Object.prototype.hasOwnProperty.call(oldGuildInvites.get(i.code), "uses") ? oldGuildInvites.get(i.code).uses : "Infinite") < i.uses));
            if ((isEqual(oldGuildInvites.map((i) => `${i.code}|${i.uses}`).sort(), guildInvites.map((i) => `${i.code}|${i.uses}`).sort())) && !inviteUsed && member.guild.features.includes("VANITY_URL")) {
                inviteType = 'vanity'
            } else if (!inviteUsed) {
                const newAndUsed = guildInvites.filter((i) => !oldGuildInvites.get(i.code) && i.uses === 1);
                if (newAndUsed.size === 1) {
                    inviteUsed = newAndUsed.first();
                }
            }
            if (inviteUsed && inviteType !== 'vanity') invite = inviteUsed;
        }
        if (!invite) {
            const targetInvite = guildInvites.some((i) => i.targetUser && (i.targetUser.id === member.id));
            if (targetInvite.uses === 1) {
                invite = targetInvite;
            }
        }

        if (invite) inviter = invite.inviter

        let inviterData = await client.database.fetchMember({
            guildID: guild.id,
            userID: inviter.id,
            bot: inviter.bot
        })

        let invitedData = await client.database.fetchMember({
            guildID: guild.id,
            userID: member.user.id,
            bot: member.user.bot
        })

        if (invite) {
            let fakeInvite = await client.database.checkLog({
                userID: member.user.id,
                guildID: guild.id,
                inviterID: inviter.id,
                type: "join"
            })
            if (fakeInvite) {
                inviterData.leaves--;
                inviterData.fake++;
            } else if (inviter.id === member.id) {
                inviterData.fake++;
            } else {
                inviterData.regular++;
            }

            invitedData.invitedBy = inviter.id
            invitedData.inviteType = inviteType


            invitedData.save()
            inviterData.save()
        }

        if (bot) {
            invitedData.invitedBy = inviter.id
        }

        let translate = client.languages.get(guildData.language)


        if (guildData.join) {
            let channel = guild.channels.cache.get(guildData.joinChannel);

            if (inviteType == 'normal') channel.send(client.formatMessage(guildData.joinMessage, member, guildData.language, {
                invite: invite,
                inviter,
                inviterData: inviterData
            })).catch((err) => { })

            if (inviteType == 'oauth' && inviter) channel.send(client.formatMessage(translate.message.join.oauth, member, guildData.language, {
                inviter: inviter,
                inviterData: inviterData
            })).catch((err) => { })

            if (inviteType == 'oauth' && !inviter) channel.send(client.formatMessage(translate.message.join.unknowOauth, member, guildData.language)).catch((err) => { })

            if (inviteType == 'vanity') channel.send(client.formatMessage(translate.message.join.vanity, member, guildData.language)).catch((err) => { })

            if (inviteType == 'unknow') channel.send(client.formatMessage(translate.message.join.unknow, member, guildData.language)).catch((err) => { })
        }
        client.database.pushLog({
            guildID: guild.id,
            userID: member.user.id,
            inviterID: inviter.id ? inviter.id : null,
            type: "join",
            inviteType: inviteType,
            date: Date.now()
        })
    }
}