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
     * Scene name [_a-z0-9]
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
        return 'default';
    }

    /**
     * Bottom keyboard
     * @param {object} ctx
     * @return {object}
     */
    getBottomKeyboard(ctx) {
        throw new Error('Not defined');
    }

    /**
     * Inline keyboard
     * @param {object} ctx
     * @return {object}
     */
    getInlineKeyboard(ctx) {
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
        scene.leave(this.onLeave.bind(this));
        scene.on('message', this.onMessage.bind(this));
        scene.action(/^commander-([^-]+)-(.*)$/i, this.onAction.bind(this));
        server.flow.register(scene);

        server.commander.addScene(this);
    }

    /**
     * Entering the scene
     * @param {object} ctx                                  Context object
     * @return {Promise}
     */
    async onEnter(ctx) {
        try {
            this._logger.debug(this.name, `Entered by ${ctx.from.id}`);
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'BaseScene.onEnter()'));
        }
    }

    /**
     * Leaving the scene
     * @param {object} ctx                                  Context object
     * @return {Promise}
     */
    async onLeave(ctx) {
        try {
            this._logger.debug(this.name, `Left by ${ctx.from.id}`);
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'BaseScene.onLeave()'));
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

            if (!ctx.user.isAllowed(this._app.get('acl').get(this.acl))) {
                await ctx.flow.enter('start');
                return await ctx.reply(ctx.i18n('choose_menu'), ctx.commander.getScene('start').getBottomKeyboard(ctx));
            }

            if (await ctx.commander.process(this))
                return;

            await ctx.reply(ctx.i18n('command_invalid'), this.getBottomKeyboard(ctx));
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'BaseScene.onMessage()'));
        }
    }

    /**
     * Commander action
     * @param {object} ctx                                  Context object
     * @return {Promise}
     */
    async onAction(ctx) {
        try {
            this._logger.debug(this.name, `Action ${ctx.match[1]} - ${ctx.match[2]} from ${ctx.from.id}`);
            await ctx.commander.action(this);
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'BaseScene.onAction()'));
        }
    }
}

module.exports = BaseScene;
