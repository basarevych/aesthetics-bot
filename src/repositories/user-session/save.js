/**
 * UserSessionRepository.save()
 */
'use strict';

let mongodb;
try {
    mongodb = require('mongodb');
} catch (error) {
    // do nothing
}
const NError = require('nerror');

/**
 * Save model
 * @instance
 * @method save
 * @memberOf module:repositories/user-session~UserSessionRepository
 * @param {MongoModel} model                The model
 * @param {MongoClient|string} [mongo]      Will reuse the Mongo client provided, or if it is a string then will
 *                                          connect to this instance of Mongo.
 * @return {Promise}                        Resolves to record ID
 */
module.exports = async function (model, mongo) {
    if (!mongodb)
        throw new Error('mongodb module is required for Mongo service');
    const { ObjectId } = mongodb;

    let client;

    try {
        if (model.id && !model._dirty)
            return model.id;

        client = typeof mongo === 'object' ? mongo : await this._mongo.connect(mongo || this.constructor.instance);
        let coll = client.collection(this.constructor.table);

        let data = model._serialize({ timeZone: this.constructor.timeZone });
        let id = typeof model === 'object' ? model.id : model;
        if (id)
            await coll.findOneAndReplace({ _id: new ObjectId(id), updated_at: { $lt: data.updated_at } }, { $set: data });
        else
            model.id = (await coll.insertOne(data)).insertedId;

        model._dirty = false;

        if (typeof mongo !== 'object')
            client.done();

        return model.id;
    } catch (error) {
        if (client && typeof mongo !== 'object')
            client.done();

        throw new NError(error, { model }, 'UserSessionRepository.save()');
    }
};
