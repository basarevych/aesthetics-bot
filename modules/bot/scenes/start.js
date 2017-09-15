/**
 * Start scene
 * @module bot/scenes/start
 */

/**
 * Start scene class
 */
class StartScene {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     */
    constructor(app, config) {
        this._app = app;
        this._config = config;
    }

    /**
     * Service name is 'modules.bot.scenes.start'
     * @type {string}
     */
    static get provides() {
        return 'modules.bot.scenes.start';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'app',
            'config',
        ];
    }

    get name() {
        return 'start';
    }

    onEnter(ctx) {
        ctx.reply('hello!');
    }
}

module.exports = StartScene;
