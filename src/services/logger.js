/**
 * Logger service override
 * @module services/logger
 */
const BaseLogger = require('arpen/src/services/logger');
const { Markup } = require('telegraf');

/**
 * Logger service class
 */
class Logger extends BaseLogger {
    /**
     * Log error
     * @param {...*} messages       Messages
     */
    error(...messages) {
        for (let error of messages) {
            if (error instanceof Error && error.info && error.info.ctx) {
                error.info.ctx.replyWithHTML(
                    `<i>Произошла ошибка. Пожалуйста, попробуйте повторить позднее.</i>`,
                    Markup.removeKeyboard().extra()
                );
            }
        }
        super.error(...messages);
    }
}

module.exports = Logger;
