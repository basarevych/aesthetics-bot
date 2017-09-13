/**
 * User session service
 * @module services/session
 */
const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');

/**
 * Connected user sessions registry service
 */
class Session {
    /**
     * Create the service
     * @param {App} app                         The application
     * @param {object} config                   Configuration
     * @param {Logger} logger                   Logger service
     * @param {Util} util                       Util service
     */
    constructor(app, config, logger, util) {
        this.sessions = new Map();

        this._app = app;
        this._config = config;
        this._logger = logger;
        this._util = util;
        this._timer = setInterval(this.onTimer.bind(this), 1000);
    }

    /**
     * Service name is 'session'
     * @type {string}
     */
    static get provides() {
        return 'session';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'logger', 'util' ];
    }

    /**
     * This service is a singleton
     * @type {string}
     */
    static get lifecycle() {
        return 'singleton';
    }

    /**
     * Start session of a user
     * @param {number} id                       User ID
     * @param {object} info                     User info
     * @return {Promise}                        Resolves to session object
     */
    async start(id, info) {
        let session = {
            id: id,
            user: info,
            payload: {},
            updatedAt: moment(),
        };
        this.sessions.set(id, session);

        return session;
    }

    /**
     * Load session by id
     * @param {number} id                       User ID
     * @return {Promise}                        Resolves to session object
     */
    async load(id) {
        let session = this.sessions.get(id);
        if (!session)
            return null;

        this.update(session);
        return session;
    }

    /**
     * Update session
     * @param {object} session                  The session
     */
    update(session) {
        session.updatedAt = moment();
    }

    /**
     * Timer tick
     */
    onTimer() {
        let expiration = moment().subtract(parseInt(this._config.get('session.expire_timeout')), 'seconds');
        for (let [ token, session ] of this.sessions) {
            if (session.updatedAt.isBefore(expiration))
                this.sessions.delete(token);
        }
    }
}

module.exports = Session;
