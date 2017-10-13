/**
 * /start
 * @module bot/commands/start
 */
const NError = require('nerror');

/**
 * Start command class
 */
class StartCommand {
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
     * Service name is 'bot.commands.start'
     * @type {string}
     */
    static get provides() {
        return 'bot.commands.start';
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
     * Command name [_a-z0-9]
     * @type {string}
     */
    get name() {
        return 'start';
    }

    /**
     * Command priority
     * @type {number}
     */
    get priority() {
        return 0;
    }

    /**
     * Syntax getter
     * @type {object}
     */
    get syntax() {
        return {
            start: {
                main: /^\/start$/i,
            }
        };
    }

    /**
     * Menu action
     * @param {Commander} commander
     * @param {object} ctx
     * @param {object} scene
     * @return {Promise}
     */
    async action(commander, ctx, scene) {
        try {
            let extra = ctx.match[2];
            if (!extra)
                return;

            this._logger.debug(this.name, `Action ${extra}`);

            let scene = commander.getScene(extra);
            if (!scene)
                return;

            if (!ctx.user.isAllowed(this._app.get('acl').get(scene.acl)))
                return;

            await ctx.flow.enter(extra);
            await ctx.editMessageText(ctx.i18n(`${scene.name}_menu`), scene.getInlineKeyboard(ctx));
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'StartCommand.action()'));
        }
    }

    /**
     * Process command
     * @param {Commander} commander
     * @param {object} ctx
     * @param {object} scene
     * @return {Promise}
     */
    async process(commander, ctx, scene) {
        try {
            this._logger.debug(this.name, 'Processing');

            let match = commander.match(ctx.message.text, this.syntax);
            if (!match && !commander.hasAll(ctx.session.locale, ctx.message.text, 'меню'))
                return false;

            if (!ctx.user.isAllowed(this._app.get('acl').get(scene.acl)))
                return false;

            await ctx.reply(ctx.i18n(`${scene.name}_menu`), scene.getInlineKeyboard(ctx));
            return true;
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'StartCommand.process()'));
        }
        return false;
    }

    /**
     * Register with the bot server
     * @param {Telegram} server                             Telegram server
     * @return {Promise}
     */
    async register(server) {
        server.commander.addCommand(this);
    }
}

module.exports = StartCommand;
