/**
 * Authentication middleware
 * @module bot/middleware/auth
 */

/**
 * Auth
 */
class Auth {
    /**
     * Create the service
     * @param {object} config                               Configuration
     */
    constructor(config) {
        this._config = config;
    }

    /**
     * Service name is 'telegram.auth'
     * @type {string}
     */
    static get provides() {
        return 'telegram.auth';
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
            ctx.calendar = server.calendar;
            if (!ctx.session.authorized && ctx.session._flow && ctx.session._flow.id && ctx.session._flow.id !== 'start')
                delete ctx.session._flow;

            return next(ctx);
        });
    }
}

module.exports = Auth;
