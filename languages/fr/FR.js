const { MessageEmbed, DiscordAPIError } = require('discord.js')
const client = require('../../index')
const moment = require('moment')
const ms = require('msfrench')
const date = require('date-and-time');

function formatMessage(message, member, locale, invData) {
    moment.locale(locale.split('_')[0].toLowerCase());
    message = message
        .replace(/{user}/g, member.toString())
        .replace(/{user.name}/g, member.user.username)
        .replace(/{user.tag}/g, member.user.tag)
        .replace(/{user.createdat}/g, moment(member.user.createdAt, "YYYYMMDD").fromNow())
        .replace(/{user.id}/g, member.user.id)
        .replace(/{guild}/g, member.guild.name)
        .replace(/{guild.count}/g, member.guild.memberCount)
        .replace(/{server}/g, member.guild.name)
        .replace(/{server.count}/g, member.guild.name);

    if (invData) {
        const { inviterData, invite } = invData;
        message = message.replace(/{inviter}/g, invite.inviter.toString())
            .replace(/{inviter.tag}/g, invite.inviter.tag)
            .replace(/{inviter.name}/g, invite.inviter.username)
            .replace(/{inviter.id}/g, invite.inviter.id)
            .replace(/{inviter.invites}/g, inviterData.regular + inviterData.bonus - inviterData.fake - inviterData.leaves)
            .replace(/{invite.code}/g, invite.code)
            .replace(/{invite.uses}/g, invite.uses)
            .replace(/{invite.url}/g, invite.url)
            .replace(/{invite.channel}/g, invite.channel)
            .replace(/{invite.channel.name}/g, invite.channel.name)
    }

    return message;

};

function duration(mss) {
    const sec = Math.floor((mss / 1000) % 60).toString()
    const min = Math.floor((mss / (1000 * 60)) % 60).toString()
    const hrs = Math.floor((mss / (1000 * 60 * 60)) % 60).toString()
    return `${hrs.padStart(2, '') == "0" ? "" : `**${hrs.padStart(2, '')}** heures, `}${min.padStart(2, '') == "0" ? "" : `**${min.padStart(2, '')}** minutes et `}**${sec.padStart(2, '')}** secondes.`
}

function numAverage(a) {
    var b = a.length,
        c = 0, i;
    for (i = 0; i < b; i++) {
        c += Number(a[i]);
    }
    return c / b;
}

let status = {
    'online': '<:online:761980233519464458>',
    'idle': '<:idle:761980404881948673>',
    'offline': '<:invisible:761980539359592508>',
    'dnd': '<:dnd:761980584452292608>',
}

let activity = {
    'PLAYING': 'Joue à',
    'STREAMING': 'Streame',
    'LISTENING': 'Écoute',
    'WATCHING': 'Regarde',
}

module.exports = {
    message: {
        join: {
            oauth: `{user} a rejoint en utilisant le flux OAuth2, ajouté par {inviter.tag}.`,
            vanity: `{user} a rejoint en utilisant le lien personnalisé du serveur.`,
            unknow: `Impossible de récuperer la manière dont le membre {user} a rejoint.`,
            unknowOauth: `Impossible de récuperer la manière dont le robot {user} a rejoint.`
        },
        leave: {
            oauth: `{user} a quitté le serveur, il avait rejoint en utilisant le flux OAuth2 ajouté par {inviter.tag}.`,
            vanity: `{user} a quitté le serveur, il avait rejoint en utilisant le lien personnalisé du serveur.`,
            unknow: `{user} a quitté le serveur, impossible de récuperer la manière dont le membre {user} avait rejoint.`,
            unknowOauth: `{user} a quitté le serveur, impossible de récuperer la manière dont le robot {user} avait rejoint.`
        }
    },
    local: "fr_FR",
    placeholders: `__**Variable de message**__
    \`\`\`
    {user} : Mentionne le membre qui vient de rejoindre votre serveur.
    {user.name} : Le pseudo du membre qui vient de rejoindre votre serveur.
    {user.tag} : Le tag du membre qui vient de rejoindre votre serveur.
    {user.createdat} : L'âge du compte du membre.
    
    {guild} : Nom du serveur.
    {guild.count} : Nombre de membres que votre serveur a maintenant.
    
    {inviter} : Mentionne l'inviteur.
    {inviter.name} : Le nom de l'inviteur.
    {inviter.tag} : Le tag de l'inviteur.
    {inviter.invites} : Le nombre total d'invitations de l'inviteur.
    
    {invite.code} : Le code d'invitation utilisé.
    {invite.url} : L'url d'invitation utilisée.
    {invite.uses} : Nombre d'utilisations du code d'invitation.
    \`\`\``,
    formatPermission: (p) => {
        return p.replace("CREATE_INSTANT_INVITE", `Créer un invitations`)
            .replace("ADMINISTRATOR", `Administrateur`)
            .replace("KICK_MEMBERS", `Expulser des membres`)
            .replace("BAN_MEMBERS", `Bannir des membres`)
            .replace("MANAGE_CHANNELS", `Gérer les salons`)
            .replace("MANAGE_GUILD", `Gérer le serveur`)
            .replace("ADD_REACTIONS", `Ajouter des réactions`)
            .replace("VIEW_AUDIT_LOG", `Voir les logs du serveur`)
            .replace("PRIORITY_SPEAKER", `Voix prioritaire`)
            .replace("STREAM", `Lancer un stream`)
            .replace("VIEW_CHANNEL", `Lire les salons textuels & voir les salons vocaux`)
            .replace("SEND_MESSAGES", `Envoyer des messages`)
            .replace("SEND_TTS_MESSAGES", `Envoyer des messages TTS`)
            .replace("MANAGE_MESSAGES", `Gérer les messages`)
            .replace("EMBED_LINKS", `Intégrer des liens`)
            .replace("ATTACH_FILES", `Joindre des fichiers`)
            .replace("READ_MESSAGE_HISTORY", `Voir les anciens messages`)
            .replace("MENTION_EVERYONE", `Mentionner @everyone, @here et tous les rôles`)
            .replace("USE_EXTERNAL_EMOJIS", `$Utiliser des émojis externe`)
            .replace("VIEW_GUILD_INSIGHTS", `Voir les analyses du serveur`)
            .replace("CONNECT", `Se connecter`)
            .replace("SPEAK", `Parler`)
            .replace("MUTE_MEMBERS", `Couper les micros de membres`)
            .replace("DEAFEN_MEMBERS", `Mettre en sourdine des membres`)
            .replace("MOVE_MEMBERS", `Déplacer des membres`)
            .replace("USE_VAD", `Utiliser la détection de la voix`)
            .replace("CHANGE_NICKNAME", `Changer le pseudo`)
            .replace("MANAGE_NICKNAMES", `Gérer les pseudos`)
            .replace("MANAGE_ROLES", `Gérer les rôles`)
            .replace("MANAGE_WEBHOOKS", `Gérer les webhooks`)
            .replace("MANAGE_EMOJIS", `Gérer les émojis`)
    },
    error: (cmd, error, options) => {
        if (error == "args") {
            return `:x: | Usage incorrect !\nDescription: ${client.translator("fr_FR")[client.commands.get(cmd.name).class][cmd.name].description}\nUsage: \`${options ? options.prefix : client.config.prefix}${cmd.name} ${client.translator("fr_FR")[client.commands.get(cmd.name).class][cmd.name].usage}\`\nExemple: \`${options ? options.prefix : client.config.prefix}${cmd.name} ${client.translator("fr_FR")[client.commands.get(cmd.name).class][cmd.name].example}\``
        }
        if (error == "userPermissions") {
            return `:x: | Vous n'avez pas les permissions suffisantes pour faire cette commande. (${options.permissions.map(p => `\`${p}\``).join("")})`
        }
        if (error == "botPermissions") {
            return `:x: | Je n'ai pas les permissions suffisantes pour faire cette commande. (${options.permissions.map(p => `\`${p}\``).join("")})`
        }
        if (error == "ownerOnly") {
            return `:x: | Seulement ${options.owners.length > 1 ? options.owners.map(o => client.users.cache.get(o).tag).slice(0, -1).join(', ') + ' et ' + options.owners.map(o => client.users.cache.get(o).tag).slice(-1) : client.users.cache.get(options.owners[0]).tag} ${options.owners.length > 1 ? 'peuvent' : 'peut'} faire cette commande !`
        }
        if (error == "notInVoiceChannel") {
            if (options && options.mentionUser) return `${options.user}, vous n'êtes pas dans un salon vocal.`
            return `:x: | Vous n'êtes pas dans un salon vocal.`
        }
        if (error == "cooldown") {
            return `:x: | Vous devez attendre ${Math.ceil(options.cooldown)} seconde${options.cooldown > 1 ? 's' : ''} avant de refaire cette commande.`
        }
        if (error == "notEnoughPermissions") {
            return `:x: | Je n'ai plus les permissions administrateur, mon travail peut ne pas être complet ! Action: ${options.action}`
        }
        if (error == "cannotFindChannel") {
            return `:x: | Je ne trouve aucun salon correspondant à \`${options.channel}\``
        }
        if (error == "cannotFindUser") {
            return `:x: | Je ne trouve aucun utilisateur correspondant à \`${options.user}\``
        }
        if (error == "NaN") {
            return `:x: | \`${options.number}\` n'est pas un nombre valide.`
        }
    },
    utils: (type, options) => {
        if (type == "tag") {
            return `Hey ${options.user}, besoin d'aide ? Mon préfix est \`${options.prefix}\``
        }
    },
    get credits() {
        return `[GitHub](https://github.com/D0wzy/Feedback)・[Support](${client.config.support.invitation})・[Invitation](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=-1)`
    },
    owner: {
        reload: {
            usage: "<commande>",
            example: 'help',
            description: "Permet de recharger une commande",
            success: (cmd) => `:white_check_mark: | La commande \`${cmd}\` a été reload !`,
            cantFind: (cmd) => `:x: | Je ne trouve aucune commande nommée \`${cmd}\``
        }
    },
    admin: {
        setprefix: {
            usage: "<préfix>",
            example: '!',
            description: "Permet de définir un nouveau préfix.",
            invalid: (list) => `:x: | Veuillez utiliser les prefixes suivants: ${list}`,
            success: (prefix) => `:white_check_mark: | Nouveau préfix: \`${prefix}\``
        },
        setcolor: {
            usage: "<couleur hexadécimale>",
            example: '#FFFFF',
            description: "Permet de définir une nouvelle couleur aux embeds.",
            success: (prefix) => `:white_check_mark: | Nouvelle couleur d'embed définie: \`${prefix}\``
        },
        setfooter: {
            usage: "<footer>",
            example: 'Grosse dédicace à ChoufProno',
            description: "Permet de définir un footer aux embeds.",
            success: (prefix) => `:white_check_mark: | Nouveau footer d'embed définie: \`${prefix}\``
        },
        setprofile: {
            example: '',
            description: "Permet de changer les paramètres du bot",
            title: '**__» Paramètres du profile__**',
            get description() {
                return `🇦・Changer le nom d'utilisateur\nActuel: ${client.user.username}\n\n🇧・Changer l'avatar\nActuel: [Clique ici](${client.user.displayAvatarURL()})\n\n🇨・Changer l'activitée\nActuel: ${client.user.presence.activities[0] ? `${activity[client.user.presence.activities[0].type]} ${client.user.presence.activities[0].name}` : `:x:`}`
            },
            loading: 'Chargement...',
            question: [{
                question: "Quel nom voulez-vous attribuez au bot ?",
                error: ":x: | Je n'ai pas pu changer mon pseudo :/"
            }, {
                question: "Quel avatar voulez-vous attribuez au bot ?",
                error: ":x: | Je n'ai pas pu changer mon avatar car le lien est invalide :/"
            }, {
                question: "Quel type d'activité voulez-vous attribuez au bot (\`play\`, \`stream\`, \`watch\`, \`listen\`)",
                error: ":x: | Type d'activité invalide"
            }, {
                question: "Quel nom voulez-vous attribuez à l'activité du bot ?"
            }]
        },
        setlogs: {
            usage: "<mention / id / nom>",
            example: '#salon-de-log',
            description: "Permet de définir un nouveau salon de log",
            success: (channel) => `:white_check_mark: | Nouveau salon de log: ${channel}`
        },
        whitelist: {
            usage: "<add / remove / list> <mention / id / tag>",
            example: 'add Clyde#0000',
            description: "Permet de d'ajouter un utilisateur à la whitelist",
            add: (user) => `:white_check_mark: | ${user} a désormais accès à la whitelist et bypass toute les permissions.`,
            remove: (user) => `:white_check_mark: | ${user} n'a désormais plus accès à la whitelist et ne bypass plus toute les permissions.`,
            list: {
                loading: `Chargement...`,
                title: (length) => `__**» Liste blanche (${length})**__`
            }
        },
        setup: {
            usage: "[detection] <alertes avant sanction> <intervale d'alerte (y, d, h, m, s)> <sanction (ban, kick, unrank)>",
            example: 'ROLE_CREATE 5 2m ban',
            description: "Affiche les paramètres de détections de raid.",
            title: (l) => `**__» Configuration des détections (${l})__**`,
            cannotFindDetection: (a) => `:x: | Je ne trouve aucun type de détection correspondant à \`${a}\``,
            success: (max, type, sanctions, time) => `:white_check_mark: | Un utilisateur non-whitelist qui fera ${max} alertes de ${type} en moins de ${time} se fera ${sanctions}`,
            list: (dms, dmss, e, i) => `${i + 1}・**${e.name}**\n   Activé: ${dmss.find(x => x.type === e.name).enabled ? ':white_check_mark:' : ':x:'}\n   **Détecté en ${Math.ceil(numAverage(dms.filter(x => x.type === e.name).map(x => x.timeout)))}ms**\n   Nombre d'alertes maximums: **${dmss.find(x => x.type === e.name).max}**\n   Temps d'intervale: **${ms(dmss.find(x => x.type === e.name).time, { long: true })}**\n   Sanctions: **${dmss.find(x => x.type === e.name).sanctions}**\n\n`
        },
        export: {
            usage: "",
            example: '',
            description: "Exporter les données de la configuration du serveur.",
            get success() {
                return `Vos données du ${date.format(new Date, date.compile('MMM D YYYY h:m:s A'))}.`
            }
        },
        setjoinchannel: {
            usage: "<channel>",
            example: '#welcome',
            description: "Permet de définir le salon des messages lorsqu'une personne rejoint le serveur.",
            success: (channel) => `:white_check_mark: | Nouveau salon de message de join: ${channel}`
        },
        setleavechannel: {
            usage: "<channel>",
            example: '#welcome',
            description: "Permet de définir le salon des messages lorsqu'une personne quitte le serveur.",
            success: (channel) => `:white_check_mark: | Nouveau salon de message de leave: ${channel}`
        },
        setjoinmessage: {
            usage: "<message>",
            example: '{user} a rejoint le serveur invité(e) par {inviter.tag} ({inviter.invites} invitation(s)}.',
            description: "Permet de définir le salon des messages lorsqu'une personne rejoint le serveur.",
            success: async (message, guildData, msg, userData) => {
                let invite = await msg.guild.channels.cache.filter(c => c.permissionsFor(client.user.id).has('CREATE_INSTANT_INVITE')).first().createInvite()
                const embed = new client.Embed(guildData, client)
                embed.addField(`Salon du message`, client.guilds.cache.get(guildData.guildID).channels.cache.get(guildData.leaveChannel) || 'Désactivé')
                embed.addField(`Message`, message)
                embed.addField(`Exemple`, formatMessage(guildData.joinMessage, msg.member, "fr_FR", {
                    invite: invite,
                    inviterData: userData
                }))
                return embed.setTitle(`**__» Message de bienvenue__**`)
            }
        },
        setleavemessage: {
            usage: "<message>",
            example: '{user} a quitté le serveur, il a été invité(e) par {inviter.tag} ({inviter.invites} invitation(s)}.',
            description: "Permet de définir le salon des messages lorsqu'une personne quitte le serveur.",
            success: async (message, guildData, msg, userData) => {
                let invite = await msg.guild.channels.cache.filter(c => c.permissionsFor(client.user.id).has('CREATE_INSTANT_INVITE')).first().createInvite()
                const embed = new client.Embed(guildData, client)
                embed.addField(`Salon du message`, client.guilds.cache.get(guildData.guildID).channels.cache.get(guildData.leaveChannel) || 'Désactivé')
                embed.addField(`Message`, message)
                embed.addField(`Exemple`, formatMessage(guildData.joinMessage, msg.member, "fr_FR", {
                    invite: invite,
                    inviterData: userData
                }))
                return embed.setTitle(`**__» Message de aurevoir__**`)
            }
        },
    },
    giveaway: {
        gstart: {
            usage: "<temps (y, d, h, m, s)> <nombre de vainqueurs> <lot>",
            example: '30m 1 T-Shirt Wumpus',
            description: "Permet de créer un giveaway",
            messages(winnerCount, footer, color) {
                return {
                    giveaway: "",
                    giveawayEnded: "",
                    timeRemaining: "Temps restant: **{duration}**!",
                    inviteToParticipate: "Réagissez par 🎉 pour participer!",
                    winMessage: "Bravo, {winners}! tu remportes **{prize}**!",
                    embedFooter: footer,
                    noWinner: "Giveaway annulé, aucune participation valide.",
                    hostedBy: "Démarré par: {user}",
                    winners: `gagnant${parseInt(winnerCount) > 1 ? 's' : ''}`,
                    endedAt: "Fin",
                    embedColor: color,
                    units: {
                        seconds: "secondes",
                        minutes: "minutes",
                        hours: "heures",
                        days: "jours",
                        pluralS: false
                    }
                }
            }
        },
        greroll: {
            usage: "<id du giveaway>",
            example: '764884458481647686',
            description: "Permet de relancer un giveaway",
            messages() {
                return {
                    congrat: "Bravo, {winners}! tu remportes **{prize}**!",
                    error: "Giveaway annulé, aucune participation valide.",
                }
            }
        },
        gstop: {
            usage: "<id du giveaway>",
            example: '764884458481647686',
            description: "Permet de stopper un giveaway",
            success: `:white_check_mark: | Giveaway supprimé`
        },
    },
    general: {
        help: {
            title: `**__» Page d'aide__**`,
            categories: {
                'admin': `:desktop_computer:・Administration`,
                'general': ':pushpin:・Général',
                'owner': '👑・Créateur',
                'music': `:musical_note:・Musique`,
                'giveaway': ':tada:・Concours',
                'mod': '🛠️・Modération'
            },
            cannotFindCommand: (s) => `:x: | Je ne trouve aucune commande possédant comme nom \`${s}\``,
            command: {
                title: (c) => `**__» Informations de la commande ${c} __**`,
                description: `Description`,
                usage: `Utilisation`,
                example: `Exemple`,
                permission: `Permissions requises`,
            },
            description: (prefix, guild) => `Préfix du bot sur ${guild.name}: \`${prefix}\`\nNombre de commande: **${client.commands.size}**`
        },
        ping: {
            example: "",
            usage: "",
            description: "Permet de connaître le temps de réponse du bot et de l'API OAuth2",
            title: `**__» Temps de réponse__**`,
            websocket: `Temps de réponse du WebSocket`,
            loading: `Chargement...`,
            bot: `Temps de réponse du Bot`,
            api: `Temps de réponse de l'API`
        },
        invite: {
            example: "@Clyde#0000",
            usage: "<membre>",
            description: "Permet de connaître les statistiques des invitations d'un membre du serveur",
            invites: (member, memberData, guildData, message) => {
                const embed = new client.Embed(guildData, client)

                embed.setAuthor(member.user.tag, member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
                return embed.setDescription(`${member.user.id === message.author.id ? 'Vous avez actuellement' : `${member.user.toString()} a actuellement`} ${memberData.regular + memberData.bonus - memberData.fake - memberData.leaves} invitation${memberData.regular + memberData.bonus - memberData.fake - memberData.leaves > 1 ? 's' : ''} (${memberData.regular} normal, ${memberData.bonus} bonus, ${memberData.fake} fake, ${memberData.leaves} leaves)`)
            }
        }
    },
    mod: {
        nuke: {
            description: `Permet de récréer un salon.`,
            usage: ``,
            example: ``,
        }
    },
    report: {
        form: [{
            question: "Quel est l'ID de l'utilisateur vous ayant arnaqué",
            error: ":x: | ID utilisateur invalide"
        }, {
            question: (user) => `Qu'est ce qui vous a été volé par ${user} ?`
        }, {
            question: `Envoyez des preuves ci-jointe`
        }]
    }
}
