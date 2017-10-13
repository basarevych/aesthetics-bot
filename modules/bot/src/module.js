/**
 * Bot module
 * @module bot/module
 */

/**
 * Module main class
 */
class Bot {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     * @param {I18n} i18n                                   I18n service
     */
    constructor(app, config, i18n) {
        this._app = app;
        this._config = config;
        this._i18n = i18n;
    }

    /**
     * Service name is 'modules.bot'
     * @type {string}
     */
    static get provides() {
        return 'modules.bot';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'app',
            'config',
            'i18n',
        ];
    }

    /**
     * Bootstrap module
     * @return {Promise}
     */
    async bootstrap() {
        this._i18n.defaultLocale = 'ru';

        let acl = new Map();
        acl.set('default', 1);
        acl.set('cdr', 0);
        this._app.registerInstance(acl, 'acl');

        this.scenes = this._app.get(/^(cdr)?bot.scenes.[^.]+$/);
        this.commands = this._app.get(/^(cdr)?bot.commands.[^.]+$/);
    }

    /**
     * Register module with the server
     * @param {object} server                                       Server instance
     * @return {Promise}
     */
    async register(server) {
        if (server.constructor.provides !== 'servers.telegram')
            return;

        await Array.from(this.scenes.values()).reduce(
            async (prev, cur) => {
                await prev;
                return cur.register(server);
            },
            Promise.resolve()
        );

        await Array.from(this.commands.values()).reduce(
            async (prev, cur) => {
                await prev;
                return cur.register(server);
            },
            Promise.resolve()
        );
    }
}

module.exports = Bot;
