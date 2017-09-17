/**
 * CDRRepository.getAllCalls()
 */
'use strict';

const NError = require('nerror');

/**
 * Find missed calls
 * @instance
 * @method getAllCalls
 * @memberOf module:repositories/cdr~CDRRepository
 * @param {number} [daysAgo=1]              Subtract number of days
 * @param {MySQLClient|string} [mysql]      Will reuse the MySQL client provided, or if it is a string then will
 *                                          connect to this instance of MySQL.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = async function (daysAgo = 1, mysql) {
    let client;

    let where = 'WHERE date(calldate) = date(now())';
    if (daysAgo)
        where = `date(date_sub(now(), INTERVAL ${daysAgo} DAY))`;

    try {
        client = typeof mysql === 'object' ? mysql : await this._mysql.connect(mysql);
        let rows = await client.query(
            `SELECT * 
               FROM ${this.constructor.table}
              WHERE ${where} 
           ORDER BY calldate`
        );

        if (typeof mysql !== 'object')
            client.done();

        return this.getModel(rows);
    } catch (error) {
        if (client && typeof mysql !== 'object')
            client.done();

        throw new NError(error, 'CDRRepository.getAllCalls()');
    }
};
