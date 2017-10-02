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
     * Command name
     * @type {string}
     */
    get name() {
        return 'start';
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
            if (!match && !commander.hasAll(ctx.session.locale, ctx.message.text, 'главное меню'))
                return false;

            if (scene.name !== 'start')
                await ctx.flow.enter('start');
            else
                await scene.sendMenu(ctx);
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
        server.commander.add(this);
    }
}

module.exports = StartCommand;
