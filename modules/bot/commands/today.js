/**
 * /today
 * @module bot/commands/today
 */
const NError = require('nerror');
const { Markup } = require('arpen-telegram').Telegraf;

/**
 * Today command class
 */
class TodayCommand {
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
     * Service name is 'bot.commands.today'
     * @type {string}
     */
    static get provides() {
        return 'bot.commands.today';
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
        return 'today';
    }

    get syntax() {
        return [
            [/^\/today/i],
            [/все/i, /звонки/i, /за +сегодня/i]
        ];
    }

    async process(ctx, match, scene) {
        try {
            this._logger.debug(this.name, 'Processing');

            if (!ctx.session.authorized)
                return false;

            if (scene.name !== 'today')
                await ctx.flow.enter('today');
            else
                await scene.sendMenu(ctx);
        } catch (error) {
            await this.onError(ctx, 'TodayCommand.process()', error);
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

module.exports = TodayCommand;
