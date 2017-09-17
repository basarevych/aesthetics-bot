/**
 * Yesterday calls scene
 * @module bot/scenes/yesterday
 */
const TodayScence = require('./today');

/**
 * Yesterday calls scene class
 */
class YesterdayScene extends TodayScence {
    /**
     * Service name is 'modules.bot.scenes.yesterday'
     * @type {string}
     */
    static get provides() {
        return 'modules.bot.scenes.yesterday';
    }

    /**
     * Scene name
     * @type {string}
     */
    get name() {
        return 'yesterday';
    }

    /**
     * How many days ago
     * @type {number}
     */
    get daysAgo() {
        return 1;
    }

    /**
     * Message if zero calls
     * @type {string}
     */
    get noCallsMessage() {
        return 'Вчера не было звонков';
    }
}

module.exports = YesterdayScene;
