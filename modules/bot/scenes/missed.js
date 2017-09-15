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
     * @param {CDRRepository} cdrRepo                       CDR repository
     */
    constructor(app, config, cdrRepo) {
        this._app = app;
        this._config = config;
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
            'repositories.cdr',
        ];
    }

    get name() {
        return 'missed';
    }

    register(server) {
        let scene = new server.constructor.Scene(this.name);
        scene.enter(this.onEnter.bind(this));
        server.flow.register(scene);
    }

    async onEnter(ctx) {
        let calls = await this._cdrRepo.getMissedCalls();
        let result;
        if (calls.length) {
            result = 'Пропущенные сегодня:\n';
            for (let i = 0; i < calls.length; i++) {
                result += i + 1;
                result += ' ';
                result += calls[i].calldate.format('YYYY-MM-DD HH:mm');
                result += '\n';
            }
        } else {
            result = 'Сегодня еще не было пропущенных звонков';
        }
        ctx.reply(result.trim());
        setTimeout(() => ctx.flow.enter('start'), 1000);
    }
}

module.exports = MissedScene;
