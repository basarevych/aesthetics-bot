/**
 * Bot module
 * @module bot/module
 */
const TgCalendar = require('telegraf-calendar-telegram');

/**
 * Module main class
 */
class Bot {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     */
    constructor(app, config) {
        this._app = app;
        this._config = config;
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
        ];
    }

    /**
     * Bootstrap module
     * @return {Promise}
     */
    async bootstrap() {
        this.scenes = this._app.get(/^bot.scenes.[^.]+$/);
        this.commands = this._app.get(/^bot.commands.[^.]+$/);
    }

    /**
     * Register module with the server
     * @param {object} server                                       Server instance
     * @return {Promise}
     */
    async register(server) {
        if (server.constructor.provides !== 'servers.telegram')
            return;

        server.calendar = new TgCalendar(
            server.bot,
            {
                startWeekDay: 1,
                weekDayNames: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                monthNames: [
                    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
                    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дес'
                ]
            }
        );

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
