/**
 * CDR model
 * @module models/cdr
 */
const moment = require('moment-timezone');
const BaseModel = require('arpen/src/models/base');

/**
 * CDR model class
 */
class CDRModel extends BaseModel {
    /**
     * Create model
     * @param {MySQL} mysql             MySQL service
     * @param {Util} util               Util service
     */
    constructor(mysql, util) {
        super(mysql, util);
        this.calldate = undefined;
        this.src = undefined;
        this.dst = undefined;
        this.duration = undefined;
        this.disposition = undefined;
        this.recordingfile = undefined;
    }

    /**
     * Service name is 'models.cdr'
     * @type {string}
     */
    static get provides() {
        return 'models.cdr';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'mysql', 'util' ];
    }

    /**
     * Call date setter
     * @type {undefined|object|null}
     */
    set calldate(calldate) {
        return this._setField('calldate', calldate && moment(calldate));
    }

    /**
     * Call date getter
     * @type {undefined|object|null}
     */
    get calldate() {
        return this._getField('calldate');
    }

    /**
     * Source setter
     * @type {undefined|string}
     */
    set src(src) {
        return this._setField('src', src);
    }

    /**
     * Source getter
     * @type {undefined|string}
     */
    get src() {
        return this._getField('src');
    }

    /**
     * Destination setter
     * @type {undefined|string}
     */
    set dst(dst) {
        return this._setField('dst', dst);
    }

    /**
     * Destination getter
     * @type {undefined|string}
     */
    get dst() {
        return this._getField('dst');
    }

    /**
     * Duration setter
     * @type {undefined|number}
     */
    set duration(duration) {
        return this._setField('duration', duration);
    }

    /**
     * Duration getter
     * @type {undefined|number}
     */
    get duration() {
        return this._getField('duration');
    }

    /**
     * Disposition setter
     * @type {undefined|string}
     */
    set disposition(disposition) {
        return this._setField('disposition', disposition);
    }

    /**
     * Disposition getter
     * @type {undefined|string}
     */
    get disposition() {
        return this._getField('disposition');
    }

    /**
     * Recording file setter
     * @type {undefined|string}
     */
    set recordingfile(recordingfile) {
        return this._setField('recordingfile', recordingfile);
    }

    /**
     * Recording file getter
     * @type {undefined|string}
     */
    get recordingfile() {
        return this._getField('recordingfile');
    }
}

module.exports = CDRModel;
