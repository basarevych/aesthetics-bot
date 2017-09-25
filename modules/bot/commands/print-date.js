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
            let result = [];

            for (let i = 0; i < rows.length; i++) {
                if (processed.has(i) || (rows[i].src.length <= 3 && rows[i].dst.length <= 3))
                    continue;

                let calls = [];

                let call = this._getCall(rows, i);
                calls.push(call);
                processed.add(i);

                if (rows[i].src.length > 3 && !this._config.get('servers.bot.self').includes(rows[i].src)) {
                    for (let j = i + 1; j < rows.length; j++) {
                        if (rows[j].src === rows[i].src || rows[j].dst === rows[i].src) {
                            let call = this._getCall(rows, j);
                            calls.push(call);
                            processed.add(j);
                        }
                    }
                }

                result.push(calls);
            }

            if (result.length) {
                for (let i = 0; i < result.length; i++) {
                    if (!result[i].length)
                        continue;

                    let reply = '';
                    let highlight = result[i][0].src;
                    for (let j = 0; j < result[i].length; j++) {
                        reply += result[i][j].time;
                        reply += ': ';
                        if (result[i][j].src === highlight)
                            reply += '<b>';
                        reply += result[i][j].src;
                        if (result[i][j].src === highlight)
                            reply += '</b>';
                        reply += ' → ';
                        if (result[i][j].dst === highlight)
                            reply += '<b>';
                        reply += result[i][j].dst;
                        if (result[i][j].dst === highlight)
                            reply += '</b>';
                        reply += ', ';
                        reply += result[i][j].disp === 'ANSWERED'
                            ? `${result[i][j].dur} сек.`
                            : result[i][j].disp.toLowerCase();
                        reply += ' ';
                        if (result[i][j].disp === 'ANSWERED')
                            reply += `/listen_${result[i][j].id.replace('.', '_')}`;
                        reply += '\n';
                    }
                    await ctx.replyWithHTML(reply.trim());
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
        return {
            index: index + 1,
            id: calls[index].id,
            time: calls[index].calldate.format('HH:mm'),
            disp: calls[index].disposition,
            src: calls[index].src,
            dst: calls[index].dst,
            dur: calls[index].duration,
        };
    }
}

module.exports = PrintDateCommand;
