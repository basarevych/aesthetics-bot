/**
 * /print_date
 * @module bot/commands/print-date
 */
const moment = require('moment-timezone');
const NError = require('nerror');
const { Markup } = require('telegraf');

/**
 * PrintDate command class
 */
class PrintDateCommand {
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
     * Service name is 'bot.commands.printDate'
     * @type {string}
     */
    static get provides() {
        return 'bot.commands.printDate';
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
        return 'print_date';
    }

    get syntax() {
        return [
            [/^\/print_date(.*)$/i],
            [/все/i, /звонки/i, /за +сегодня/i],
            [/все/i, /звонки/i, /за +вчера/i],
            [/все/i, /звонки/i, /за +дату/i]
        ];
    }

    async print(ctx, when, date) {
        try {
            let rows = await this._cdrRepo.getAllCalls(date);
            let processed = new Set();
            ctx.session.calls = [];
            ctx.session.files = {};

            for (let i = 0; i < rows.length; i++) {
                if (processed.has(i) || (rows[i].src.length <= 3 && rows[i].dst.length <= 3))
                    continue;

                let calls = [];

                let {call, file} = this._getCall(rows, i);
                calls.push(call);
                if (file)
                    ctx.session.files[call.index.toString()] = file;
                processed.add(i);

                if (rows[i].src.length > 3 && !this._config.get('servers.bot.self').includes(rows[i].src)) {
                    for (let j = i + 1; j < rows.length; j++) {
                        if (rows[j].src === rows[i].src || rows[j].dst === rows[i].src) {
                            let {call, file} = this._getCall(rows, j);
                            calls.push(call);
                            if (file)
                                ctx.session.files[call.index.toString()] = file;
                            processed.add(j);
                        }
                    }
                }

                ctx.session.calls.push(calls);
            }

            if (ctx.session.calls && ctx.session.calls.length) {
                for (let i = 0; i < ctx.session.calls.length; i++) {
                    if (!ctx.session.calls[i].length)
                        continue;

                    let result = '';
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
                            result += `/listen_audio_${ctx.session.calls[i][j].index}`;
                        result += '\n';
                    }
                    await ctx.replyWithHTML(result.trim());
                }
            } else {
                await ctx.reply(when + ' звонков не было');
            }
        } catch (error) {
            await this.onError(ctx, 'PrintDateCommand.print()', error);
        }
    }

    async process(ctx, match, scene) {
        try {
            this._logger.debug(this.name, 'Processing');

            if (!ctx.session.authorized)
                return false;

            let when, date;
            if ((match[0] && !match[0][0][1].trim()) || match[3]) {
                ctx.calendar.setDateListener(async (ctx, date) => {
                    when = date;
                    date = moment(date + ' 00:00:00');
                    if (moment.isMoment(date))
                        await this.print(ctx, when, date);
                });
                ctx.reply('Выберите дату', ctx.calendar.getCalendar());
            } else {
                if (match[0]) {
                    date = match[0][0][1].trim();
                    if (date === 'today') {
                        when = 'Сегодня';
                        date = moment();
                    } else if (date === 'yesterday') {
                        when = 'Вчера';
                        date = moment().subtract(1, 'days');
                    } else if (date.length) {
                        when = date;
                        date = moment(date + ' 00:00:00');
                        if (!moment.isMoment(date))
                            return false;
                    }
                } else if (match[1]) {
                    when = 'Сегодня';
                    date = moment();
                } else if (match[2]) {
                    when = 'Вчера';
                    date = moment().subtract(1, 'days');
                }
                await this.print(ctx, when, date);
            }
        } catch (error) {
            await this.onError(ctx, 'PrintDateCommand.process()', error);
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

module.exports = PrintDateCommand;
