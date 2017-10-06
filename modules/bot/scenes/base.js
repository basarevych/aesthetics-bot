/**
 * Base scene
 * @module bot/scenes/base
 */
const NError = require('nerror');
const { Scene } = require('telegraf-flow');

/**
 * Base scene class
 */
class BaseScene {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     * @param {Logger} logger                               Logger service
     */
    constructor(app, config, logger) {
        this._app = app;
        this._config = config;
        this._logger = logger;
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'app',
            'config',
            'logger',
        ];
    }

    /**
     * Scene name
     * @type {string}
     */
    get name() {
        throw new Error('Not defined');
    }

    /**
     * Required ACL key
     * @type {string}
     */
    get acl() {
        throw new Error('Not defined');
    }

    /**
     * Register with the bot server
     * @param {Telegram} server                             Telegram server
     * @return {Promise}
     */
    async register(server) {
        let scene = new Scene(this.name);
        scene.enter(this.onEnter.bind(this));
        scene.on('message', this.onMessage.bind(this));
        server.flow.register(scene);
    }

    /**
     * Entering the scene
     * @param {object} ctx                                  Context object
     * @return {Promise}
     */
    async onEnter(ctx) {
        try {
            this._logger.debug(this.name, `Entered by ${ctx.from.id}`);

            if (!ctx.user.authorized || !ctx.user.isAllowed(this._app.get('acl').get(this.acl)))
                return await ctx.flow.enter('start');

            await this.sendMenu(ctx);
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'BaseScene.onEnter()'));
        }
    }

    /**
     * Generic message
     * @param {object} ctx                                  Context object
     * @return {Promise}
     */
    async onMessage(ctx) {
        try {
            this._logger.debug(this.name, `Message from ${ctx.from.id}`);

            if (!ctx.user.authorized || !ctx.user.isAllowed(this._app.get('acl').get(this.acl)))
                return await ctx.flow.enter('start');

            if (await ctx.commander.process(this))
                return;

            await this.sendMenu(ctx, ctx.i18n('command_invalid'));
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'BaseScene.onMessage()'));
        }
    }

    /**
     * Send menu
     * @param {object} ctx                                  Context object
     * @param {string} [message]                            Prepend message
     * @return {Promise}
     */
    async sendMenu(ctx, message) {
        throw new Error('Not defined');
    }
}

module.exports = BaseScene;
