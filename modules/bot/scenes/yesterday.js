/**
 * Yesterday calls scene
 * @module bot/scenes/yesterday
 */

/**
 * Yesterday calls scene class
 */
class YesterdayScene {
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
     * Service name is 'modules.bot.scenes.yesterday'
     * @type {string}
     */
    static get provides() {
        return 'modules.bot.scenes.yesterday';
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
        return 'yesterday';
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

module.exports = YesterdayScene;
