/**
 * /yesterday
 * @module bot/commands/yesterday
 */
const NError = require('nerror');
const { Markup } = require('arpen-telegram').Telegraf;

/**
 * Yesterday command class
 */
class YesterdayCommand {
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
     * Service name is 'bot.commands.yesterday'
     * @type {string}
     */
    static get provides() {
        return 'bot.commands.yesterday';
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
        return 'yesterday';
    }

    get syntax() {
        return [
            [/^\/today/i],
            [/все/i, /звонки/i, /за +вчера/i]
        ];
    }

    async process(ctx, match, scene) {
        try {
            this._logger.debug(this.name, 'Processing');

            if (!ctx.session.authorized) {
                await ctx.reply('В доступе отказано');
                return scene.sendMenu(ctx);
            }

            if (scene.name !== 'yesterday')
                return ctx.flow.enter('yesterday');
        } catch (error) {
            await this.onError(ctx, 'YesterdayCommand.process()', error);
        }
        return scene.sendMenu(ctx);
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

module.exports = YesterdayCommand;
