/**
 * Today calls scene
 * @module bot/scenes/missed
 */
const moment = require('moment-timezone');

/**
 * Today calls scene class
 */
class TodayScene {
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
     * Service name is 'modules.bot.scenes.today'
     * @type {string}
     */
    static get provides() {
        return 'modules.bot.scenes.today';
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

    get name() {
        return 'today';
    }

    register(server) {
        let scene = new server.constructor.Scene(this.name);
        scene.enter(this.onEnter.bind(this));
        scene.on('message', this.onMessage.bind(this));
        server.flow.register(scene);
    }

    async onEnter(ctx) {
        try {
            let rows = await this._cdrRepo.getAllCalls();
            let processed = new Set();
            ctx.session.calls = [];

            for (let i = 0; i < rows.length; i++) {
                if (processed.has(i) || (rows[i].src.length <= 3 && rows[i].dst.length <= 3))
                    continue;

                processed.add(i);

                let calls = [];
                calls.push(this._getCall(rows, i));
                if (rows[i].src.length > 3 || !this._config.get('servers.bot.self').includes(rows[i].src)) {
                    for (let j = i + 1; j < rows.length; j++) {
                        if (rows[j].src === rows[i].src || rows[j].dst === rows[i].src) {
                            calls.push(this._getCall(rows, j));
                            processed.add(j);
                        }
                    }
                }
                ctx.session.calls.push(calls);
            }

            await this.sendMenu(ctx);
        } catch (error) {
            this._logger.error(error, 'TodayScene.onEnter()');
            ctx.replyWithHTML(`<i>${error.messages || error.message}</i>`);
        }
        setTimeout(() => ctx.flow.enter('start'), parseInt(this._config.get('servers.bot.msg_pause')));
    }

    async onMessage(ctx) {
        ctx.flow.enter('start');
    }

    async sendMenu(ctx) {
        let result;
        if (ctx.session.calls && ctx.session.calls.length) {
            ctx.reply(moment().format('YYYY-MM-DD') + ' Начало');
            await new Promise(resolve => {
                setTimeout(resolve, parseInt(this._config.get('servers.bot.msg_pause')));
            });
            for (let i = 0; i < ctx.session.calls.length; i++) {
                result = '';
                for (let call of ctx.session.calls[i]) {
                    result += call.time;
                    result += ': ';
                    result += call.src;
                    result += ' → ';
                    result += call.dst;
                    result += ', ';
                    result += call.disp === 'ANSWERED' ? `${call.dur} сек.` : call.disp.toLowerCase();
                    result += ' ';
                    if (call.disp === 'ANSWERED')
                        result += `/${call.index}`;
                    result += '\n';
                }
                ctx.replyWithHTML(result.trim());
                await new Promise(resolve => {
                    setTimeout(resolve, parseInt(this._config.get('servers.bot.msg_pause')));
                });
            }
            result = moment().format('YYYY-MM-DD') + ' Конец';
        } else {
            result = 'Сегодня еще не было звонков';
        }
        ctx.replyWithHTML(result.trim());
    }

    _getCall(calls, index) {
        return {
            index: index + 1,
            time: calls[index].calldate.format('HH:mm'),
            disp: calls[index].disposition,
            src: calls[index].src,
            dst: calls[index].dst,
            dur: calls[index].duration,
            file: calls[index].recordingfile,
        };
    }
}

module.exports = TodayScene;
