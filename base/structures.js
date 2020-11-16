const { Client, Collection, MessageEmbed } = require('discord.js');
const fs = require('fs');
const readdir = require("util").promisify(fs.readdir);
const chalk = require('chalk');
const SelfReloadJSON = require('self-reload-json');
const Sequelize = require('sequelize');
const logs = require('discord-logs')
const moment = require('moment')

Array.prototype.move = function (x, y) {
    this.splice(y, 0, this.splice(x, 1)[0]);
    return this;
};

module.exports = {
    Client: class Dick extends Client {
        constructor(options) {
            super(options);

            this.commands = new Collection();
            this.languages = new Collection();
            this.events = new Collection();
            this.config = new SelfReloadJSON(`${__dirname}/../config.json`);
            this.cooldown = new Array();

            this.commandsRan = 0;
            this.invitations = {};


            this.database = new Sequelize(this.config.database.db, this.config.database.user, this.config.database.pass, {
                host: this.config.database.host,
                dialect: "mysql",
                define: {
                    charset: "utf8",
                    collate: "utf8_general_ci",
                    timestamps: false
                },
                pool: {
                    max: 200,
                    min: 0,
                    acquire: 60000,
                    idle: 10000
                },
                logging: false
            });

            logs(this);
        };


        translator(lang) {
            return require(`../languages/${lang.split("_")[0]}/${lang.split("_")[1]}.js`);
        };

        async asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        };

        async init(...args) {

            if (args.includes("language")) {
                const directories = await readdir("./languages/");
                directories.filter(d => !d.endsWith("disabled")).forEach(async (dir) => {
                    const commands = await readdir(`./languages/${dir}/`);
                    commands.filter(f => f.endsWith(".js")).forEach((f, i) => {
                        try {
                            this.loadLanguage(dir, f);
                        } catch (error) {
                            console.log(error);
                        }
                    });
                });
            }
            if (args.includes("events")) {
                const evtFiles = await readdir(`./events/`);
                if (!evtFiles) throw Error("No event was found, without the message event, command cannot be loaded")
                evtFiles.filter(x => !x.endsWith(".disabled")).forEach((file) => {
                    const eventName = file.split(".")[0];
                    const event = new (require(`../events/${file}`))(this);
                    this.events.set(event.name, {
                        name: event.name,
                        filename: file.split('.').shift()
                    })

                    console.log(chalk.yellow(`» ${chalk.underline("Event loaded !")} ${chalk.bold(file)}.`));
                    this.on(eventName, (...args) => event.run(...args));
                    delete require.cache[require.resolve(`../events/${file}`)];
                });
            };
            if (args.includes("commands")) {
                const directories = await readdir("./commands/");
                directories.filter(d => !d.endsWith("disabled")).forEach(async (dir) => {
                    const commands = await readdir("./commands/" + dir + "/");
                    commands.filter(f => f.endsWith(".js")).forEach((f, i) => {
                        try {
                            this.loadCommand(dir, f);
                        } catch (error) {
                            console.log(error);
                        }
                    });
                });
            };

            if (args.includes("models")) {
                const mdlFiles = await readdir(`${__dirname}/../models`);
                if (!mdlFiles) throw Error("No models was found, without the models, command cannot be loaded and database cannot be sync");

                this.database.authenticate().then(async () => {
                    this.asyncForEach(mdlFiles.filter(x => !x.endsWith(".disabled")), async (file) => {
                        await require(`../models/${file}`)(Sequelize, this);
                        console.log(chalk.yellow(`» ${chalk.underline("Model loaded !")} ${chalk.bold(file)}.`));
                        await this.database.sync({
                            alter: true,
                            force: false
                        });
                    })


                }).catch(async (err) => {
                    console.log(err);
                });
            };
        };

        formatMessage(message, member, locale, invData = {}) {
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
                const { inviterData, invite, inviter } = invData;
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

        async loadCommand(commandClass, commandName) {
            try {
                delete require.cache[require.resolve(`../commands/${commandClass}/${commandName}`)];
                let props = require(`../commands/${commandClass}/${commandName}`);
                props.class = commandClass;

                this.commands.set(props.name, props);
                console.log(chalk.yellow(`» ${chalk.underline("Command loaded !")} ${chalk.bold(commandName)} in the category ${chalk.bold(commandClass)}.`));
                return;
            } catch (e) {
                console.log(e);
                return `Unable to load command ${commandName}: ${e}`;
            }
        };
        async loadLanguage(local, l) {
            try {
                delete require.cache[require.resolve(`../languages/${local}/${l}`)];
                let props = require(`../languages/${local}/${l}`);

                this.languages.set(props.local, props);
                console.log(chalk.yellow(`» ${chalk.underline("Language loaded !")} ${chalk.bold(`${local}_${l}`)}.`));
                return;
            } catch (e) {
                console.log(e);
                return `Unable to load language ${local}_${l}: ${e}`;
            }
        }
    },
    Embed: class Embed extends MessageEmbed {
        constructor(data = {
            color: '2f3136',
            footer: 'InviteScanner',
            language: 'fr_FR'
        }, client, message, options = {}) {
            super(options);

            this.setColor(data.color)
            this.setFooter(data.footer)
            this.setThumbnail(client.guilds.cache.get(data.guildID).iconURL())
            if (message) {
                this.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
            }
            this.setTimestamp()
        }
    }
}