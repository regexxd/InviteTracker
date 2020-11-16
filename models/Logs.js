const chalk = require('chalk');

module.exports = async (Sequelize, volt) => {
    try {
        volt.database.define('logs', {

            // CONFIGURATION
            guildID: {
                type: Sequelize.STRING(25),
                allowNull: false
            },
            userID: {
                type: Sequelize.STRING(25),
                allowNull: false
            },
            inviterID: {
                type: Sequelize.STRING(25),
                allowNull: true
            },
            type: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            inviteType: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            date: {
                type: Sequelize.TEXT,
                allowNull: false
            }
        }, {
            timestamps: true
        });
        return volt.database.models;
    } catch (error) {
        console.log(error)
    }
}