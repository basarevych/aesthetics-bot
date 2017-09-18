/**
 * Bot module
 * @module bot/module
 */

/**
 * Module main class
 */
class Bot {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     * @param {StartScene} startScene                       Start scene
     * @param {MissedScene} missedScene                     Missed scene
     * @param {TodayScene} todayScene                       Today scene
     * @param {YesterdayScene} yesterdayScene               Yesterday scene
     */
    constructor(app, config, startScene, missedScene, todayScene, yesterdayScene) {
        this._app = app;
        this._config = config;
        this._startScene = startScene;
        this._missedScene = missedScene;
        this._todayScene = todayScene;
        this._yesterdayScene = yesterdayScene;
    }

    /**
     * Service name is 'modules.bot'
     * @type {string}
     */
    static get provides() {
        return 'modules.bot';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'app',
            'config',
            'bot.scenes.start',
            'bot.scenes.missed',
            'bot.scenes.today',
            'bot.scenes.yesterday',
        ];
    }

    /**
     * Register module with the server
     * @param {object} server                                       Server instance
     * @return {Promise}
     */
    async register(server) {
        if (server.constructor.provides !== 'servers.telegram')
            return;

        server.registerScene(this._startScene);
        server.registerScene(this._missedScene);
        server.registerScene(this._todayScene);
        server.registerScene(this._yesterdayScene);
    }
}

module.exports = Bot;
