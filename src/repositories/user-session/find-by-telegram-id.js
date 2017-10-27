/**
 * UserSessionRepository.findByTelegramId()
 */
'use strict';

const NError = require('nerror');

/**
 * Find a model by Telegram ID
 * @instance
 * @method findByToken
 * @memberOf module:repositories/user-session~UserSessionRepository
 * @param {string} id                       ID to search by
 * @param {MongoClient|string} [mongo]      Will reuse the Mongo client provided, or if it is a string then will
 *                                          connect to this instance of Mongo.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = async function (id, mongo) {
    let client;

    try {
        client = typeof mongo === 'object' ? mongo : await this._mongo.connect(mongo || this.constructor.instance);
        let coll = client.collection(this.constructor.table);
        let data = coll.find({ telegram_id: id }).sort({ updated_at: -1 });
        let rows = await data.toArray();

        if (typeof mongo !== 'object')
            client.done();

        return rows ? this.getModel(rows) : [];
    } catch (error) {
        if (client && typeof mongo !== 'object')
            client.done();

        throw new NError(error, { id }, 'UserSessionRepository.findByTelegramId()');
    }
};
