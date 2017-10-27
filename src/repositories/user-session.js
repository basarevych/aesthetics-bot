/**
 * User session repository
 * @module repositories/user-session
 */
const path = require('path');
const BaseRepository = require('arpen/src/repositories/mongo');

/**
 * UserSession repository class
 */
class UserSessionRepository extends BaseRepository {
    /**
     * Create repository
     * @param {App} app                             The application
     * @param {Mongo} mongo                         Mongo service
     * @param {Util} util                           Util service
     */
    constructor(app, mongo, util) {
        super(app, mongo, util);
        this._loadMethods(path.join(__dirname, 'user-session'));
    }

    /**
     * Service name is 'repositories.userSession'
     * @type {string}
     */
    static get provides() {
        return 'repositories.userSession';
    }

    /**
     * DB table name
     * @type {string}
     */
    static get table() {
        return 'user_sessions';
    }

    /**
     * Model name
     * @type {string}
     */
    static get model() {
        return 'userSession';
    }
}

module.exports = UserSessionRepository;
