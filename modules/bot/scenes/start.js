/**
 * Start scene
 * @module bot/scenes/start
 */
const BaseScene = require('./base');
const NError = require('nerror');
const { Markup } = require('telegraf');

/**
 * Start scene class
 */
class StartScene extends BaseScene {
    /**
     * Service name is 'bot.scenes.start'
     * @type {string}
     */
    static get provides() {
        return 'bot.scenes.start';
    }

    /**
     * Scene name
     * @type {string}
     */
    get name() {
        return 'start';
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
                    await ctx.reply(ctx.i18n('greeting', { name: ctx.from.first_name }));
                    ctx.session.greeted = true;
                }
                await ctx.reply(ctx.i18n('enter_pin_code'), Markup.removeKeyboard().extra());
            }
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'StartScene.onEnter()'));
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

                return await this.sendMenu(ctx, ctx.i18n('command_invalid'));
            }

            let pinCode = ctx.message.text.replace(/\s+/g, '');
            if (pinCode !== this._config.get('servers.bot.pin_code'))
                return await ctx.reply(ctx.i18n('wrong_pin_code'), Markup.removeKeyboard().extra());

            ctx.session.authorized = true;
            await ctx.user.load();
            await this.sendMenu(ctx);
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'StartScene.onMessage()'));
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
            let keyboard = Markup
                .keyboard([
                    [ctx.i18n('missed_calls_menu')],
                    [ctx.i18n('today_calls_menu')],
                    [ctx.i18n('yesterday_calls_menu')],
                    [ctx.i18n('date_calls_menu')],
                ])
                .resize()
                .extra();

            await ctx.reply(message || ctx.i18n('choose_menu'), keyboard);
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'StartScene.sendMenu()'));
        }
    }
}

module.exports = StartScene;
