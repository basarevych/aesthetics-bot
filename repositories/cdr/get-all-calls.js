/**
 * CDRRepository.getAllCalls()
 */
'use strict';

const moment = require('moment-timezone');
const NError = require('nerror');

/**
 * Find missed calls
 * @instance
 * @method getAllCalls
 * @memberOf module:repositories/cdr~CDRRepository
 * @param {number} [daysAgo=0]              Subtract number of days
 * @param {MySQLClient|string} [mysql]      Will reuse the MySQL client provided, or if it is a string then will
 *                                          connect to this instance of MySQL.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = async function (daysAgo = 0, mysql) {
    let client;

    try {
        let date = daysAgo ? moment().subtract(daysAgo, 'days') : moment();
        let start = moment(date.format('YYYY-MM-DD') + ' 00:00:00.000');
        let end = moment(date.format('YYYY-MM-DD') + ' 23:59:59.999');
        client = typeof mysql === 'object' ? mysql : await this._mysql.connect(mysql);
        let rows = await client.query(
            `SELECT * 
               FROM ${this.constructor.table}
              WHERE calldate >= ? AND calldate <= ? 
           ORDER BY calldate`,
            [
                start.tz('UTC').format(this._mysql.constructor.datetimeFormat),
                end.tz('UTC').format(this._mysql.constructor.datetimeFormat),
            ]
        );
//        rows = await client.query(`SELECT * FROM ${this.constructor.table} ORDER BY calldate`);

        if (typeof mysql !== 'object')
            client.done();

        return this.getModel(rows);
    } catch (error) {
        if (client && typeof mysql !== 'object')
            client.done();

        throw new NError(error, 'CDRRepository.getAllCalls()');
    }
};
