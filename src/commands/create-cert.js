/**
 * CreateCert command
 * @module commands/create-cert
 */
const path = require('path');
const fs = require('fs');
const argvParser = require('argv');

/**
 * Command to create self-signed SSL certificates
 */
class CreateCert {
    /**
     * Create the service
     * @param {App} app                 The application
     * @param {object} config           Configuration
     * @param {Runner} runner           Runner service
     * @param {Help} help               Help command
     */
    constructor(app, config, runner, help) {
        this._app = app;
        this._config = config;
        this._runner = runner;
        this._help = help;
    }

    /**
     * Service name is 'commands.createCert'
     * @type {string}
     */
    static get provides() {
        return 'commands.createCert';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'runner', 'commands.help' ];
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
            .run(argv);

        if (args.targets.length < 2)
            return this._help.helpCreateCert(argv);

        let hostname = args.targets[1];

        try {
            await this._app.debug('Creating temporary openssl config');
            let type = (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) ? 'IP' : 'DNS');
            let sslConfig = fs.readFileSync('/etc/ssl/openssl.cnf', {encoding: 'utf8'});
            sslConfig += `\n[SAN]\nsubjectAltName=${type}:${hostname}\n`;
            fs.writeFileSync('/tmp/arpen.openssl.cnf', sslConfig, {mode: 0o644});

            await this._app.debug('Creating self-signed certificate');
            let result = await this._runner.exec(
                'openssl',
                [
                    'req',
                    '-new',
                    '-newkey', 'rsa:2048',
                    '-days', '3650',
                    '-nodes',
                    '-x509',
                    '-subj', '/C=/ST=/L=/O=/CN=' + hostname,
                    '-reqexts', 'SAN',
                    '-extensions', 'SAN',
                    '-config', '/tmp/arpen.openssl.cnf',
                    '-keyout', path.join(__dirname, '..', 'certs', hostname + '.key'),
                    '-out', path.join(__dirname, '..', 'certs', hostname + '.cert')
                ]
            );

            try {
                fs.unlinkSync('/tmp/arpen.openssl.cnf');
                fs.unlinkSync('.rnd');
            } catch (error) {
                // do nothing
            }

            if (result.code !== 0)
                throw new Error('Could not create self-signed certificate');

            await this._app.debug('done');
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

module.exports = CreateCert;
