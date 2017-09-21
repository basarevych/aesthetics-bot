/**
 * CDRRepository.getMissedCalls()
 */
'use strict';

const moment = require('moment-timezone');
const NError = require('nerror');

/**
 * Find missed calls
 * @instance
 * @method getMissedCalls
 * @memberOf module:repositories/cdr~CDRRepository
 * @param {MySQLClient|string} [mysql]      Will reuse the MySQL client provided, or if it is a string then will
 *                                          connect to this instance of MySQL.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = async function (mysql) {
    let client;

    try {
        let date = moment();
        client = typeof mysql === 'object' ? mysql : await this._mysql.connect(mysql);
        let rows = await client.query(
            `SELECT * 
               FROM ${this.constructor.table} 
              WHERE calldate >= ? AND calldate <= ? AND disposition != ?
           ORDER BY calldate`,
            [
                date.tz('UTC').format('YYYY-MM-DD') + ' 00:00:00',
                date.tz('UTC').format('YYYY-MM-DD') + ' 23:59:59',
                'ANSWERED'
            ]
        );
//        rows = await client.query(`SELECT * FROM ${this.constructor.table} WHERE disposition != 'ANSWERED' ORDER BY calldate`);

        if (typeof mysql !== 'object')
            client.done();

        return this.getModel(rows);
    } catch (error) {
        if (client && typeof mysql !== 'object')
            client.done();

        throw new NError(error, 'CDRRepository.getMissedCalls()');
    }
};
