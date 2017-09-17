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

    /**
     * Scene name
     * @type {string}
     */
    get name() {
        return 'missed';
    }

    /**
     * Register with the bot server
     * @param {Telegram} server                             Telegram server
     * @return {Promise}
     */
    async register(server) {
        let scene = new server.constructor.Scene(this.name);
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
            try {
                this._logger.error(error, 'MissedScene.onMessage()');
                await ctx.replyWithHTML(`<i>${error.messages || error.message}</i>`);
            } catch (error) {
                // do nothing
            }
        }
        await ctx.flow.enter('start');
    }

    /**
     * Generic message
     * @param {object} ctx                                  Context object
     * @return {Promise}
     */
    async onMessage(ctx) {
        await ctx.flow.enter('start');
    }
}

module.exports = MissedScene;
