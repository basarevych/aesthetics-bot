/**
 * Init the bot middleware
 * @module bot/middleware/init
 */

/**
 * Init
 */
class Init {
    /**
     * Create the service
     * @param {object} config                               Configuration
     */
    constructor(config) {
        this._config = config;
    }

    /**
     * Service name is 'telegram.init'
     * @type {string}
     */
    static get provides() {
        return 'telegram.init';
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
            ctx.user = {
                authorized: false,
                acl: -1,
                isAllowed: acl => {
                    return acl === 0 ? (ctx.user.acl === 0) : (ctx.user.acl === 0 || ctx.user.acl >= acl);
                },
                load: async () => {
                    if (ctx.session.authorized) {
                        ctx.user.authorized = true;
                        ctx.user.acl = 0;
                    } else {
                        ctx.user.authorized = false;
                        ctx.user.acl = -1;
                    }
                },
            };

            await ctx.user.load();

            if (!ctx.user.authorized && ctx.session._flow && ctx.session._flow.id && ctx.session._flow.id !== 'start')
                delete ctx.session._flow;

            ctx.calendar = server.calendar;

            return next(ctx);
        });
    }
}

module.exports = Init;
