/**
 * Start scene
 * @module bot/scenes/start
 */
const NError = require('nerror');
const { Markup } = require('telegraf');
const { Scene } = require('telegraf-flow');

/**
 * Start scene class
 */
class StartScene {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     * @param {Logger} logger                               Logger service
     */
    constructor(app, config, logger) {
        this._app = app;
        this._config = config;
        this._logger = logger;
    }

    /**
     * Service name is 'bot.scenes.start'
     * @type {string}
     */
    static get provides() {
        return 'bot.scenes.start';
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
        let scene = new Scene(this.name);
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
            if (ctx.user.authorized) {
                await this.sendMenu(ctx);
            } else {
                if (!ctx.session.greeted) {
                    await ctx.reply(`Привет, ${ctx.from.first_name}!`);
                    ctx.session.greeted = true;
                }
                await ctx.reply(
                    'Пожалуйста, введите пинкод',
                    Markup.removeKeyboard().extra()
                );
            }
        } catch (error) {
            await this.onError(ctx, 'StartScene.onEnter()', error);
        }
    }

    /**
     * Generic message
     * @param {object} ctx                                  Context object
     * @return {Promise}
     */
    async onMessage(ctx) {
        try {
            if (ctx.user.authorized) {
                if (await ctx.commander.process(this))
                    return;

                return await this.sendMenu(ctx, 'Неправильная команда');
            }

            let pinCode = ctx.message.text.replace(/\s+/g, '');
            if (pinCode !== this._config.get('servers.bot.pin_code')) {
                return await ctx.reply(
                    'Неправильный пин-код, попробуйте еще раз',
                    Markup.removeKeyboard().extra()
                );
            }

            ctx.session.authorized = true;
            await ctx.user.load();
            await this.sendMenu(ctx);
        } catch (error) {
            await this.onError(ctx, 'StartScene.onMessage()', error);
        }
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
     * Send menu
     * @param {object} ctx                                  Context object
     * @param {string} [message]                            Prepend message
     * @return {Promise}
     */
    async sendMenu(ctx, message) {
        try {
            let msg = `Пожалуйста, выберите действие`;
            if (message)
                msg = message + '\n\n' + msg;

            let keyboard = Markup
                .keyboard([
                    ['Пропущенные сегодня звонки'],
                    ['Все звонки за сегодня'],
                    ['Все звонки за вчера'],
                    ['Все звонки за дату'],
                ])
                .resize()
                .extra();

            await ctx.reply(msg, keyboard);
        } catch (error) {
            await this.onError(ctx, 'StartScene.sendMenu()', error);
        }
    }
}

module.exports = StartScene;
