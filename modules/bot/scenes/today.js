/**
 * Today calls scene
 * @module bot/scenes/today
 */

/**
 * Today calls scene class
 */
class TodayScene {
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
     * Service name is 'modules.bot.scenes.today'
     * @type {string}
     */
    static get provides() {
        return 'modules.bot.scenes.today';
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
        return 'today';
    }

    register(server) {
        let scene = new server.constructor.Scene(this.name);
        scene.enter(this.onEnter.bind(this));
        server.flow.register(scene);

        server.bot.command(this.name, ctx => ctx.flow.enter(this.name));
    }

    onEnter(ctx) {
        ctx.reply(
`

/start - Вернуться в главное меню`
        );
    }
}

module.exports = TodayScene;
