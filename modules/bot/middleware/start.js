/**
 * Start middleware
 * @module bit/middleware/start
 */

/**
 * Start
 */
class Start {
    /**
     * Create the service
     * @param {object} config                               Configuration
     */
    constructor(config) {
        this._config = config;
    }

    /**
     * Service name is 'telegram.start'
     * @type {string}
     */
    static get provides() {
        return 'telegram.start';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'config' ];
    }

    /**
     * Register middleware
     * @param {Telegram} server         The server
     * @return {Promise}
     */
    async register(server) {
        server.bot.use(async (ctx, next) => {
            if (!ctx.session._flow || !ctx.session._flow.id || (!ctx.session.authorized && ctx.session._flow.id !== 'start'))
                await ctx.flow.enter('start');

            return next(ctx);
        });
    }
}

module.exports = Start;
