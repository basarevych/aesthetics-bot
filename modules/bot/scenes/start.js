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
     * @param {MissedScene} missedScene                     Missed scene
     * @param {TodayScene} todayScene                       Today scene
     * @param {YesterdayScene} yesterdayScene               Yesterday scene
     */
    constructor(app, config, missedScene, todayScene, yesterdayScene) {
        this._app = app;
        this._config = config;
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
            'modules.bot.scenes.missed',
            'modules.bot.scenes.today',
            'modules.bot.scenes.yesterday',
        ];
    }

    get name() {
        return 'start';
    }

    register(server) {
        server.bot.command(this.name, ctx => ctx.flow.enter(this.name));

        let scene = new server.constructor.Scene(this.name);
        scene.enter(this.onEnter.bind(this));
        scene.command(this._missedScene.name, ctx => ctx.flow.enter(this._missedScene.name));
        scene.command(this._todayScene.name, ctx => ctx.flow.enter(this._todayScene.name));
        scene.command(this._yesterdayScene.name, ctx => ctx.flow.enter(this._yesterdayScene.name));
        scene.on('message', this.onMessage.bind(this));
        server.flow.register(scene);
    }

    async onEnter(ctx) {
        if (!ctx.session.authorized) {
            if (!ctx.session.greeted) {
                ctx.reply(`Привет, ${ctx.from.first_name}!`);
                ctx.session.greeted = true;
            }
            return ctx.reply('Пожалуйста, введите пинкод');
        }

        return this.sendMenu(ctx);
    }

    async onMessage(ctx) {
        if (ctx.session.authorized) {
            await this.sendMenu(ctx, ctx.message.text === '/start' ? false : 'Неправильная команда');
        } else {
            if (ctx.message.text === this._config.get('servers.bot.pin_code')) {
                ctx.session.authorized = true;
                await this.sendMenu(ctx);
            } else {
                ctx.reply('Неправильный пинкод\nПожалуйста, введите пинкод');
            }
        }
    }

    async sendMenu(ctx, message) {
        let msg = `/${this._missedScene.name} - Пропущенные сегодня звонки
/${this._todayScene.name} - Все звонки за сегодня
/${this._yesterdayScene.name} - Все звонки за вчера`;
        if (message)
            msg = message + '\n\n' + msg;
        ctx.reply(msg);
    }
}

module.exports = StartScene;
