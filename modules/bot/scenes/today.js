/**
 * Today calls scene
 * @module bot/scenes/missed
 */
const path = require('path');
const moment = require('moment-timezone');
const NError = require('nerror');
const { Markup } = require('arpen-telegram').Telegraf;
const { Scene } = require('arpen-telegram').Flow;

/**
 * Today calls scene class
 */
class TodayScene {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     * @param {Logger} logger                               Logger service
     * @param {Filer} filer                                 Filer service
     * @param {CDRRepository} cdrRepo                       CDR repository
     */
    constructor(app, config, logger, filer, cdrRepo) {
        this._app = app;
        this._config = config;
        this._logger = logger;
        this._filer = filer;
        this._cdrRepo = cdrRepo;
    }

    /**
     * Service name is 'bot.scenes.today'
     * @type {string}
     */
    static get provides() {
        return 'bot.scenes.today';
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
            'repositories.cdr',
        ];
    }

    /**
     * Scene name
     * @type {string}
     */
    get name() {
        return 'today';
    }

    /**
     * How many days ago
     * @type {number}
     */
    get daysAgo() {
        return 0;
    }

    /**
     * Message if zero calls
     * @type {string}
     */
    get noCallsMessage() {
        return 'Сегодня еще не было звонков';
    }

    /**
     * Menu message
     * @type {string}
     */
    get menuEntry() {
        return 'все звонки за сегодня';
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
            if (!ctx.session.authorized)
                return ctx.flow.enter('start');

            let rows = await this._cdrRepo.getAllCalls(this.daysAgo);
            let processed = new Set();
            ctx.session.calls = [];
            ctx.session.files = {};

            for (let i = 0; i < rows.length; i++) {
                if (processed.has(i) || (rows[i].src.length <= 3 && rows[i].dst.length <= 3))
                    continue;

                let calls = [];

                let { call, file } = this._getCall(rows, i);
                calls.push(call);
                if (file)
                    ctx.session.files[call.index.toString()] = file;
                processed.add(i);

                if (rows[i].src.length > 3 && !this._config.get('servers.bot.self').includes(rows[i].src)) {
                    for (let j = i + 1; j < rows.length; j++) {
                        if (rows[j].src === rows[i].src || rows[j].dst === rows[i].src) {
                            let { call, file } = this._getCall(rows, j);
                            calls.push(call);
                            if (file)
                                ctx.session.files[call.index.toString()] = file;
                            processed.add(j);
                        }
                    }
                }

                ctx.session.calls.push(calls);
            }
        } catch (error) {
            await this.onError(ctx, 'TodayScene.onEnter()', error);
        }
        return this.sendMenu(ctx);
    }

    /**
     * Generic message
     * @param {object} ctx                                  Context object
     * @return {Promise}
     */
    async onMessage(ctx) {
        try {
            if (!ctx.session.authorized)
                await ctx.flow.enter('start');

            if (await ctx.commander.process(this))
                return;

            let match = /^\/(\d+)$/.exec(ctx.message.text);
            if (match && ctx.session.files[match[1]]) {
                let file = ctx.session.files[match[1]];
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
                    throw new NError({ file }, 'Файл не найден');
                await ctx.replyWithAudio({ source: buffer }, { performer: file.performer, title: file.title });
            } else {
                return this.sendMenu(ctx, 'Неправильная команда');
            }
        } catch (error) {
            await this.onError(ctx, 'TodayScene.onMessage()', error);
        }
        return this.sendMenu(ctx);
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

    /**
     * Send menu
     * @param {object} ctx                                  Context object
     * @param {string} [message]                            Prepend message
     * @return {Promise}
     */
    async sendMenu(ctx, message) {
        try {
            let result;
            let date = moment();
            if (this.daysAgo)
                date.subtract(this.daysAgo, 'days');

            if (ctx.session.calls && ctx.session.calls.length) {
                await ctx.reply('[Начало] ' + date.format('YYYY-MM-DD'));
                for (let i = 0; i < ctx.session.calls.length; i++) {
                    if (!ctx.session.calls[i].length)
                        continue;

                    result = '';
                    let highlight = ctx.session.calls[i][0].src;
                    for (let j = 0; j < ctx.session.calls[i].length; j++) {
                        result += ctx.session.calls[i][j].time;
                        result += ': ';
                        if (ctx.session.calls[i][j].src === highlight)
                            result += '<b>';
                        result += ctx.session.calls[i][j].src;
                        if (ctx.session.calls[i][j].src === highlight)
                            result += '</b>';
                        result += ' → ';
                        if (ctx.session.calls[i][j].dst === highlight)
                            result += '<b>';
                        result += ctx.session.calls[i][j].dst;
                        if (ctx.session.calls[i][j].dst === highlight)
                            result += '</b>';
                        result += ', ';
                        result += ctx.session.calls[i][j].disp === 'ANSWERED'
                            ? `${ctx.session.calls[i][j].dur} сек.`
                            : ctx.session.calls[i][j].disp.toLowerCase();
                        result += ' ';
                        if (ctx.session.calls[i][j].disp === 'ANSWERED' && ctx.session.files[ctx.session.calls[i][j].index.toString()])
                            result += `/${ctx.session.calls[i][j].index}`;
                        result += '\n';
                    }
                    await ctx.replyWithHTML(result.trim());
                }
                await ctx.reply('[Конец] ' + date.format('YYYY-MM-DD'));
            } else {
                await ctx.reply(this.noCallsMessage);
            }

            let msg = `Пожалуйста, выберите действие`;
            if (message)
                msg = message + '\n\n' + msg;

            let keyboard = Markup
                .keyboard([
                    [`Повторить ${this.menuEntry}`],
                    ['Главное меню']
                ])
                .resize()
                .extra();

            await ctx.reply(msg, keyboard);
        } catch (error) {
            await this.onError(ctx, 'TodayScene.sendMenu()', error);
        }
    }

    /**
     * Serialize call model
     * @param {CDRModel[]} calls                            Array of models
     * @param {number} index                                Target index in the array
     * @return {object}
     */
    _getCall(calls, index) {
        let call = {
            index: index + 1,
            time: calls[index].calldate.format('HH:mm'),
            disp: calls[index].disposition,
            src: calls[index].src,
            dst: calls[index].dst,
            dur: calls[index].duration,
        };
        let file = null;
        if (calls[index].recordingfile.trim()) {
            file = {
                name: calls[index].recordingfile,
                performer: calls[index].src,
                title: calls[index].calldate.format('YYYY-MM-DD HH:mm:ss'),
            };
        }
        return { call, file };
    }
}

module.exports = TodayScene;
