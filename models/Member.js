const chalk = require('chalk');

module.exports = async (Sequelize, volt) => {
    try {
        volt.database.define('members', {

            // CONFIGURATION
            userID: {
                type: Sequelize.STRING(25),
                allowNull: false
            },
            guildID: {
                type: Sequelize.STRING(25),
                allowNull: false
            },

            /*  INVITES COUNT*/
            fake: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            bonus: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            leaves: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            regular: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },

            /* OLD INVITES COUNT*/
            old_fake: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            old_bonus: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            old_leaves: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            old_regular: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },


            backuped: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },


            bot: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            },
            inviteType: {
                type: Sequelize.STRING
            },
            invitedBy: {
                type: Sequelize.STRING(25),
            },


            invited: {
                type: Sequelize.TEXT,
                defaultValue: "",
                get() {
                    return this.getDataValue('invited').split('==%;')
                },
                set(val) {
                    this.setDataValue('invited', val.join('==%;'));
                },
            },
            lefted: {
                type: Sequelize.TEXT,
                defaultValue: "",
                get() {
                    return this.getDataValue('lefted').split('==%;')
                },
                set(val) {
                    this.setDataValue('lefted', val.join('==%;'));
                },
            },

            commandsMade: {
                type: Sequelize.INTEGER,
                defaultValue: 0
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