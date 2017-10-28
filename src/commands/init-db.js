/**
 * Init DB command
 * @module commands/init-db
 */
const argvParser = require('argv');

/**
 * Command class
 */
class InitDb {
    /**
     * Create the service
     * @param {App} app                 The application
     * @param {object} config           Configuration
     * @param {Util} util               Util service
     * @param {Filer} filer             Filer service
     * @param {MySQL} mysql             Mysql service
     */
    constructor(app, config, util, filer, mysql) {
        this._app = app;
        this._config = config;
        this._util = util;
        this._filer = filer;
        this._mysql = mysql;
    }

    /**
     * Service name is 'commands.initDb'
     * @type {string}
     */
    static get provides() {
        return 'commands.initDb';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'util', 'filer', 'mysql' ];
    }

    /**
     * Run the command
     * @param {string[]} argv           Arguments
     * @return {Promise}
     */
    async run(argv) {
        let args = argvParser
            .option({
                name: 'help',
                short: 'h',
                type: 'boolean',
            })
            .option({
                name: 'password',
                short: 'p',
                type: 'string',
            })
            .run(argv);

        let password = args.options.password || false;
        let instance = 'cdr';

        try {
            let filename = '/tmp/arpen.db.' + this._util.getRandomString(16);
            let sql =
`create user '${this._config.get(`mysql.${instance}.user`)}'@'${this._config.get(`mysql.${instance}.host`)}'
    identified by '${this._config.get(`mysql.${instance}.password`)}';
grant select on ${this._config.get(`mysql.${instance}.database`)}.cdr
    to '${this._config.get(`mysql.${instance}.user`)}'@'${this._config.get(`mysql.${instance}.host`)}';
flush privileges;`;
            await this._filer.lockWrite(filename, sql);

            await this._mysql.exec(
                filename,
                {
                    host: this._config.get(`postgres.${instance}.host`),
                    port: this._config.get(`postgres.${instance}.port`),
                    user: 'root',
                    password: password,
                }
            );

            await this._filer.remove(filename);
            return 0;
        } catch (error) {
            await this.error(error);
        }
    }

    /**
     * Log error and terminate
     * @param {...*} args
     * @return {Promise}
     */
    async error(...args) {
        try {
            await args.reduce(
                async (prev, cur) => {
                    await prev;
                    return this._app.error(cur.fullStack || cur.stack || cur.message || cur);
                },
                Promise.resolve()
            );
        } catch (error) {
            // do nothing
        }
        process.exit(1);
    }
}

module.exports = InitDb;
