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
     */
    constructor(app, config, startScene) {
        this._app = app;
        this._config = config;
        this._startScene = startScene;
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
            'modules.bot.scenes.start',
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
    }
}

module.exports = Bot;
