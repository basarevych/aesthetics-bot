/**
 * /missed
 * @module bot/commands/missed
 */
const NError = require('nerror');
const { Markup } = require('arpen-telegram').Telegraf;

/**
 * Missed command class
 */
class MissedCommand {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     * @param {Logger} logger                               Logger service
     * @param {CDRRepository} cdrRepo                       CDR repository
     */
    constructor(app, config, logger, cdrRepo) {
        this._app = app;
        this._config = config;
        this._logger = logger;
        this._cdrRepo = cdrRepo;
    }

    /**
     * Service name is 'bot.commands.missed'
     * @type {string}
     */
    static get provides() {
        return 'bot.commands.missed';
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
            'repositories.cdr',
        ];
    }

    /**
     * Command name
     * @type {string}
     */
    get name() {
        return 'missed';
    }

    get syntax() {
        return [
            [/^\/missed$/i],
            [/пропущенные/i, /звонки/i],
        ];
    }

    async process(ctx, match, scene) {
        try {
            this._logger.debug(this.name, 'Processing');

            if (!ctx.session.authorized) {
                await ctx.reply('В доступе отказано');
                return scene.sendMenu(ctx);
            }

            let calls = await this._cdrRepo.getMissedCalls();
            let result;
            if (calls.length) {
                result = 'Пропущенные сегодня:\n\n';
                for (let i = 0; i < calls.length; i++) {
                    result += '<pre>';
                    result += String(i + 1).padStart(3, ' ');
                    result += ': ';
                    result += calls[i].calldate.format('HH:mm');
                    result += ', ';
                    result += calls[i].src;
                    result += ' → ';
                    result += calls[i].dst;
                    result += ', ';
                    result += calls[i].disposition.toLowerCase();
                    result += '</pre>';
                    if (result.split('\n').length >= 30 && i < calls.length - 1) {
                        await ctx.replyWithHTML(result.trim());
                        result = '';
                    }
                    result += '\n';
                }
            } else {
                result = 'Сегодня еще не было пропущенных звонков';
            }
            await ctx.replyWithHTML(result.trim());
        } catch (error) {
            await this.onError(ctx, 'MissedCommand.process()', error);
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

module.exports = MissedCommand;
