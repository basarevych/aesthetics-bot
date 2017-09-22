/**
 * /start
 * @module bot/commands/start
 */
const NError = require('nerror');
const { Markup } = require('arpen-telegram').Telegraf;

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

    get syntax() {
        return [
            [/^\/start$/i],
            [/главное/i, /меню/i]
        ];
    }

    async process(ctx, match, scene) {
        try {
            this._logger.debug(this.name, 'Processing');

            if (scene.name !== 'start')
                await ctx.flow.enter('start');
            else
                await scene.sendMenu(ctx);
        } catch (error) {
            await this.onError(ctx, 'StartCommand.process()', error);
        }
        return true;
    }

    /**
     * Register with the bot server
     * @param {Telegram} server                             Telegram server
     * @return {Promise}
     */
    async register(server) {
        server.commander.add(this);
    }

    /**
     * Log error
     * @param {object} ctx                                  Context object
     * @param {string} where                                Error location
     * @param {Error} error                                 The error
     * @return {Promise}
     */
    async onError(ctx, where, error) {
        try {
            this._logger.error(new NError(error, where));
            await ctx.replyWithHTML(
                `<i>Произошла ошибка. Пожалуйста, попробуйте повторить позднее.</i>`,
                Markup.removeKeyboard().extra()
            );
        } catch (error) {
            // do nothing
        }
    }
}

module.exports = StartCommand;
