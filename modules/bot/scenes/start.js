/**
 * Start scene
 * @module bot/scenes/start
 */

/**
 * Start scene class
 */
class StartScene {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     * @param {Logger} logger                               Logger service
     * @param {MissedScene} missedScene                     Missed scene
     * @param {TodayScene} todayScene                       Today scene
     * @param {YesterdayScene} yesterdayScene               Yesterday scene
     */
    constructor(app, config, logger, missedScene, todayScene, yesterdayScene) {
        this._app = app;
        this._config = config;
        this._logger = logger;
        this._missedScene = missedScene;
        this._todayScene = todayScene;
        this._yesterdayScene = yesterdayScene;
    }

    /**
     * Service name is 'modules.bot.scenes.start'
     * @type {string}
     */
    static get provides() {
        return 'modules.bot.scenes.start';
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
            'modules.bot.scenes.missed',
            'modules.bot.scenes.today',
            'modules.bot.scenes.yesterday',
        ];
    }

    /**
     * Scene name
     * @type {string}
     */
    get name() {
        return 'start';
    }

    /**
     * Register with the bot server
     * @param {Telegram} server                             Telegram server
     * @return {Promise}
     */
    async register(server) {
        server.bot.use((ctx, next) => {
            if (!ctx.session.authorized && ctx.session._flow.id !== 'start')
                ctx.flow.enter('start');
            next(ctx);
        });

        let scene = new server.constructor.Scene(this.name);
        scene.enter(this.onEnter.bind(this));
        scene.command(this._missedScene.name, ctx => {
            return ctx.session.authorized ? ctx.flow.enter(this._missedScene.name) : this.onMessage(ctx);
        });
        scene.command(this._todayScene.name, ctx => {
            return ctx.session.authorized ? ctx.flow.enter(this._todayScene.name) : this.onMessage(ctx);
        });
        scene.command(this._yesterdayScene.name, ctx => {
            return ctx.session.authorized ? ctx.flow.enter(this._yesterdayScene.name) : this.onMessage(ctx);
        });
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
            if (ctx.session.authorized) {
                await this.sendMenu(ctx);
            } else {
                if (!ctx.session.greeted) {
                    await ctx.reply(`Привет, ${ctx.from.first_name}!`);
                    ctx.session.greeted = true;
                }
                await ctx.reply('Пожалуйста, введите пинкод');
            }
        } catch (error) {
            try {
                this._logger.error(error, 'StartScene.onEnter()');
                await ctx.replyWithHTML(`<i>${error.messages || error.message}</i>`);
            } catch (error) {
                // do nothing
            }
        }
    }

    /**
     * Generic message
     * @param {object} ctx                                  Context object
     * @return {Promise}
     */
    async onMessage(ctx) {
        try {
            if (ctx.session.authorized) {
                await this.sendMenu(ctx, ctx.message.text === '/start' ? false : 'Неправильная команда');
            } else {
                if (ctx.message.text === this._config.get('servers.bot.pin_code')) {
                    ctx.session.authorized = true;
                    await this.sendMenu(ctx);
                } else {
                    await ctx.reply('Неправильный пинкод\nПожалуйста, введите пинкод');
                }
            }
        } catch (error) {
            try {
                this._logger.error(error, 'StartScene.onMessage()');
                await ctx.replyWithHTML(`<i>${error.messages || error.message}</i>`);
            } catch (error) {
                // do nothing
            }
        }
    }

    /**
     * Send menu
     * @param {object} ctx                                  Context object
     * @param {string} [message]                            Prepend message
     * @return {Promise}
     */
    async sendMenu(ctx, message) {
        let msg = `Пожалуйста, выберите:

/${this._missedScene.name} - Пропущенные сегодня звонки
/${this._todayScene.name} - Все звонки за сегодня
/${this._yesterdayScene.name} - Все звонки за вчера`;
        if (message)
            msg = message + '\n\n' + msg;
        return ctx.reply(msg);
    }
}

module.exports = StartScene;
