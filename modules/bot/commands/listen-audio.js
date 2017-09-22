/**
 * /listen_audio_N
 * @module bot/commands/listen-audio
 */
const path = require('path');
const NError = require('nerror');
const { Markup } = require('arpen-telegram').Telegraf;

/**
 * Listen audio command class
 */
class ListenAudioCommand {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     * @param {Logger} logger                               Logger service
     * @param {Filer} filer                                 Filer service
     */
    constructor(app, config, logger, filer) {
        this._app = app;
        this._config = config;
        this._logger = logger;
        this._filer = filer;
    }

    /**
     * Service name is 'bot.commands.listenAudio'
     * @type {string}
     */
    static get provides() {
        return 'bot.commands.listenAudio';
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
            'filer',
        ];
    }

    /**
     * Command name
     * @type {string}
     */
    get name() {
        return 'listen-audio';
    }

    get syntax() {
        return [
            [/^\/listen_audio_(\d+)$/i],
        ];
    }

    async process(ctx, match, scene) {
        try {
            this._logger.debug(this.name, 'Processing');

            if (!ctx.session.authorized || !ctx.session.files)
                return false;

            let index = match[0][0][1];
            let file = ctx.session.files[index];
            if (!file)
                return false;

            let buffer = null;
            await this._filer.process(
                this._config.get('servers.bot.records_path'),
                async filename => {
                    if (path.basename(filename) === file.name)
                        buffer = await this._filer.lockReadBuffer(filename);
                    return !buffer;
                },
                async () => {
                    return !buffer;
                }
            );
            if (!buffer)
                await ctx.reply('Файл не найден');
            else
                await ctx.replyWithAudio({ source: buffer }, { performer: file.performer, title: file.title });
            await scene.sendMenu(ctx);
        } catch (error) {
            await this.onError(ctx, 'ListenAudioCommand.process()', error);
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

module.exports = ListenAudioCommand;
