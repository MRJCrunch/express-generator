'use strict';

const _ = require('lodash'),
    moment = require('moment'),
    logger = require('utils/logger').utils,
    //it was made in order to avoid the loop (errors module needs lodash-ext)
    InternalServerError = require('errors/InternalServerError');

/**
 * Creates a new object with the same values as original one but with the keys from a map
 * @param object coroutine to execute
 * @param map coroutine params
 * @returns {object}
 */
function mapObjectExt(object, map) {

    return _.mapKeys(object, (val, key) => map[key] !== undefined ? map[key] : key);
}

/**
 * Creates an object composed of the picked object properties
 * @param object initial object
 * @param properties array of result object properties
 * @returns {object}
 */
function pickExt(object, properties) {
    object = Object(object);
    return _.reduce(properties, (result, key)=> {
        if (typeof(key) === 'string') {
            if (key.includes(':')) {
                key = key.split(':');
                if (_.hasIn(object, key[1])) {
                    _.set(result, key[0], _.get(object, key[1]));
                }
            }
            else {
                if (_.hasIn(object, key)) {
                    _.set(result, key, _.get(object, key));
                }
            }
        }
        else if (typeof(key) === 'object') {
            _.each(key, (oldKey, newKey)=> {
                if (typeof(oldKey) === 'string') {
                    if (_.hasIn(object, oldKey)) {
                        _.set(result, newKey, _.get(object, oldKey));
                    }
                }
                else if (typeof(oldKey) === 'function') {
                    _.set(result, newKey, oldKey(object));
                }
                else {
                    throw new InternalServerError();
                }
            });
        }
        else {
            throw new InternalServerError();
        }
        return result;
    }, {});
}

/**
 * Creates an array of objects composed of the picked object properties
 * @param array initial array of objects
 * @param properties array of result object properties
 * @returns {Array}
 */
function pickArrayExt(array, properties) {
    return _.map(array, item => _.pick(item, properties));
}

/**
 * Creates an array of keys with different values
 * @param oldObj old objects
 * @param newObj new object
 * @returns {Array}
 */
function differentFields(oldObj, newObj) {

    let [targetObject, checkObject] = _.isEmpty(newObj) ? [oldObj, newObj] : [newObj, oldObj];

    return _.reduce(targetObject,
        (result, value, key) => {
            if (moment(value, moment.ISO_8601, true).isValid()) {
                if (_.isEqual(new Date(value), checkObject[key])) {
                    return result;
                }
                else {
                    return result.concat(key);
                }
            }
            else if (_.isEqual(value, checkObject[key])) {
                return result;
            }
            else {
                return result.concat(key);
            }
        }, []);
}

function isJsonExt(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Change object's filed's value from empty to undefined
 * @param obj object
 * @param fields array of fields
 * @returns {Obj}
 */
function filterEmptyFieldsExt(obj, fields) {
    return _.forEach(fields, function (field) {
        if (_.get(obj, field) === '') {
            _.set(obj, field, undefined)
        }
    })
}

function toPascalCase(string) {
    let str = _.camelCase(string);

    str = str.charAt(0).toUpperCase() + str.slice(1, str.length);
    return str;
}

function randomInt(range = 1000000) {
    return Math.trunc(Math.random() * range);
}

function randomChoice(list) {
    return Math.trunc(Math.random() * list.length);
}

_.mixin({
    differentFields: differentFields,
    pickExt: pickExt,
    pickArrayExt: pickArrayExt,
    toPascalCase: toPascalCase,
    randomInt: randomInt,
    randomChoice: randomChoice,
    mapObjectExt: mapObjectExt,
    isJsonExt: isJsonExt,
    filterEmptyFieldsExt: filterEmptyFieldsExt
});

module.exports = _;