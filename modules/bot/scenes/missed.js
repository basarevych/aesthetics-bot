/**
 * Missed calls scene
 * @module bot/scenes/missed
 */

/**
 * Missed calls scene class
 */
class MissedScene {
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
     * Service name is 'modules.bot.scenes.missed'
     * @type {string}
     */
    static get provides() {
        return 'modules.bot.scenes.missed';
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
        return 'missed';
    }

    register(server) {
        let scene = new server.constructor.Scene(this.name);
        scene.enter(this.onEnter.bind(this));
        scene.on('message', this.onMessage.bind(this));
        server.flow.register(scene);
    }

    async onEnter(ctx) {
        try {
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
                    if (result.split('\n').length >= 20 && i < calls.length - 1) {
                        ctx.reply(result.trim());
                        result = '';
                        await new Promise(resolve => {
                            setTimeout(resolve, parseInt(this._config.get('servers.bot.msg_pause')));
                        });
                    }
                    result += '\n';
                }
            } else {
                result = 'Сегодня еще не было пропущенных звонков';
            }
            ctx.replyWithHTML(result.trim());
        } catch (error) {
            this._logger.error(error, 'MissedScene.onEnter()');
            ctx.replyWithHTML(`<i>${error.messages || error.message}</i>`);
        }
        setTimeout(() => ctx.flow.enter('start'), parseInt(this._config.get('servers.bot.msg_pause')));
    }

    async onMessage(ctx) {
        ctx.flow.enter('start');
    }
}

module.exports = MissedScene;
