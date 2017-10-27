/**
 * UserSessionRepository.deleteExpired()
 */
'use strict';

const moment = require('moment-timezone');
const NError = require('nerror');

/**
 * Delete expired models
 * @instance
 * @method deleteExpired
 * @memberOf module:repositories/user-session~UserSessionRepository
 * @param {number} expiration               Number of seconds
 * @param {MongoClient|string} [mongo]      Will reuse the Mongo client provided, or if it is a string then will
 *                                          connect to this instance of Mongo.
 * @return {Promise}                        Resolves to number of deleted records
 */
module.exports = async function (expiration, mongo) {
    let client;

    try {
        let exp = this.getModel();
        exp.updatedAt = moment().subtract(expiration, 'seconds');

        client = typeof mongo === 'object' ? mongo : await this._mongo.connect(mongo || this.constructor.instance);
        let coll = client.collection(this.constructor.table);
        let result = await coll.deleteMany({ updated_at: { $lt: exp._serialize({ timeZone: this.constructor.timeZone }).updated_at } });

        if (typeof mongo !== 'object')
            client.done();

        return result.deletedCount;
    } catch (error) {
        if (client && typeof mongo !== 'object')
            client.done();

        throw new NError(error, { expiration }, 'UserSessionRepository.deleteExpired()');
    }
};
