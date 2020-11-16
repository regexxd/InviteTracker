const chalk = require('chalk');

module.exports = async (Sequelize, volt) => {
    try {
        volt.database.define('guilds', {

            // CONFIGURATION
            guildID: {
                type: Sequelize.STRING(25),
                allowNull: false
            },
            prefix: {
                type: Sequelize.STRING(2),
                defaultValue: volt.config.prefix,
                allowNull: false
            },
            language: {
                type: Sequelize.TEXT,
                defaultValue: "fr_FR"
            },
            commandsMade: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            premium: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            footer: {
                type: Sequelize.TEXT,
                defaultValue: `InviteScanner`,
                allowNull: false
            },
            color: {
                type: Sequelize.TEXT,
                defaultValue: `2f3136`,
            },
            leave: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            join: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            leaveChannel: {
                type: Sequelize.STRING(25),
                allowNull: true
            },
            leaveMessage: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            joinChannel: {
                type: Sequelize.STRING(25),
                allowNull: true
            },
            joinMessage: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            botBlacklisted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
        }, {
            timestamps: true
        });
        return volt.database.models;
    } catch (error) {
        console.log(error)
    }
}