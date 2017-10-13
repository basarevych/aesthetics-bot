/**
 * Start scene
 * @module bot/scenes/start
 */
const BaseScene = require('./base');
const NError = require('nerror');
const { Markup, Extra } = require('telegraf');

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
     * Scene name [_a-z0-9]
     * @type {string}
     */
    get name() {
        return 'start';
    }

    /**
     * Bottom keyboard
     * @param {object} ctx
     * @return {object}
     */
    getBottomKeyboard(ctx) {
        return Markup
            .keyboard([
                [ctx.i18n('show_menu')],
            ])
            .resize()
            .extra();
    }

    /**
     * Inline keyboard
     * @param {object} ctx
     * @return {object}
     */
    getInlineKeyboard(ctx) {
        return Extra.HTML().markup((m) => {
            return m.inlineKeyboard([
                [m.callbackButton(ctx.i18n('missed_calls'), `commander-missed_calls-today`)],
                [m.callbackButton(ctx.i18n('today_calls'), `commander-all_calls-today`)],
                [m.callbackButton(ctx.i18n('yesterday_calls'), `commander-all_calls-yesterday`)],
                [m.callbackButton(ctx.i18n('date_calls'), `commander-all_calls-date`)],
            ]);
        });
    }

    /**
     * Entering the scene
     * @param {object} ctx                                  Context object
     * @return {Promise}
     */
    async onEnter(ctx) {
        try {
            if (!ctx.user.authorized)
                await ctx.reply(ctx.i18n('enter_pin_code'), Markup.removeKeyboard().extra());
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

                return await ctx.reply(ctx.i18n('command_invalid'), this.getBottomKeyboard(ctx));
            }

            let pinCode = ctx.message.text.replace(/\s+/g, '');
            if (pinCode !== this._config.get('servers.bot.pin_code'))
                return await ctx.reply(ctx.i18n('wrong_pin_code'), Markup.removeKeyboard().extra());

            ctx.session.authorized = true;
            await ctx.user.load();
            await ctx.reply(ctx.i18n('greeting', { name: ctx.from.first_name }));
            await ctx.reply(ctx.i18n('choose_menu'), this.getBottomKeyboard(ctx));
        } catch (error) {
            this._logger.error(new NError(error, { ctx }, 'StartScene.onMessage()'));
        }
    }
}

module.exports = StartScene;
