/**
 * User session model
 * @module models/user-session
 */
const moment = require('moment-timezone');
const BaseModel = require('arpen/src/models/mongo');

/**
 * UserSession model class
 */
class UserSessionModel extends BaseModel {
    /**
     * Create model
     * @param {Mongo} mongo             Mongo service
     * @param {Util} util               Util service
     */
    constructor(mongo, util) {
        super(mongo, util);

        this._addField('telegram_id', 'telegramId');
        this._addField('user_id', 'userId');
        this._addField('payload', 'payload');
        this._addField('info', 'info');
        this._addField('created_at', 'createdAt');
        this._addField('updated_at', 'updatedAt');
    }

    /**
     * Service name is 'models.userSession'
     * @type {string}
     */
    static get provides() {
        return 'models.userSession';
    }

    /**
     * Telegram ID setter
     * @type {undefined|string}
     */
    set telegramId(id) {
        return this._setField('telegram_id', id);
    }

    /**
     * Telegram ID getter
     * @type {undefined|string}
     */
    get telegramId() {
        return this._getField('telegram_id');
    }

    /**
     * User ID setter
     * @type {undefined|string|null}
     */
    set userId(id) {
        return this._setField('user_id', id && id.toString());
    }

    /**
     * User ID getter
     * @type {undefined|string|null}
     */
    get userId() {
        return this._getField('user_id');
    }

    /**
     * Payload setter
     * @type {undefined|object}
     */
    set payload(payload) {
        return this._setField('payload', payload);
    }

    /**
     * Payload getter
     * @type {undefined|object}
     */
    get payload() {
        return this._getField('payload');
    }

    /**
     * Info setter
     * @type {undefined|object}
     */
    set info(info) {
        return this._setField('info', info);
    }

    /**
     * Info getter
     * @type {undefined|object}
     */
    get info() {
        return this._getField('info');
    }

    /**
     * Creation time setter
     * @type {undefined|object}
     */
    set createdAt(createdAt) {
        return this._setField('created_at', createdAt && moment(createdAt));
    }

    /**
     * Creation time getter
     * @type {undefined|object}
     */
    get createdAt() {
        return this._getField('created_at');
    }

    /**
     * Modification time setter
     * @type {undefined|object}
     */
    set updatedAt(updatedAt) {
        return this._setField('updated_at', updatedAt && moment(updatedAt));
    }

    /**
     * Modification time getter
     * @type {undefined|object}
     */
    get updatedAt() {
        return this._getField('updated_at');
    }
}

module.exports = UserSessionModel;
