/* jshint node:true */
/**
 * PUSH Notification server
 * (c) Telefonica Digital, 2012 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela@tid.es>
 * Guillermo Lopez Leal <gll@tid.es>
 */

'use strict';


var consts = require('../config.js').consts,
    DataStore = require('./DataStore.js'),
    events = require('events'),
    util = require('util'),
    Log = require('./Logger.js'),
    Helpers = require('./Helpers.js');

var MobileNetwork = function() {
    this.cache = {};
    this.ready = false;
    this.callbacks = [];
    this.isCacheEnabled = consts.MOBILENETWORK_CACHE;

    this.getIndex = function(mcc, mnc) {
        return Helpers.padNumber(mcc, 3) + '-' + Helpers.padNumber(mnc, 3);
    };

    this.callbackReady = function(callback) {
        if (this.ready) {
            callback(true);
            return;
        }
        this.callbacks.push(Helpers.checkCallback(callback));
    };

    this.start = function() {
        this.resetCache();

        DataStore.once('ready', (function() {
            Log.debug('MobileNetwork::start --> library loaded');
            this.ready = true;
            var callbacks = this.callbacks || [];
            callbacks.forEach(function(elem) {
                elem(true);
            });
            this.emit('ready');
        }).bind(this));
        DataStore.once('closed', (function() {
            this.ready = false;
            this.emit('closed');
        }).bind(this));

        process.nextTick(function() {
            DataStore.start();
        });
    };

    this.stop = function() {
        this.ready = false;
        DataStore.stop();
    };

    this.resetCache = function(callback) {
        this.cache = {};
        callback = Helpers.checkCallback(callback);
        callback();
        Log.debug('MobileNetwork::resetCache --> cache cleaned');
    };

    this.getNetwork = function(mcc, mnc, callback) {
        callback = Helpers.checkCallback(callback);

        var index = this.getIndex(mcc, mnc);
        var value;

        Log.debug('MobileNetwork::getNetwork --> looking for MCC-MNC: ' + index);
        // Check if the network is in the cache
        if (this.isCacheEnabled && (value = this.cache[index])) {
            Log.debug('MobileNetwork::getNetwork --> found on cache:', value);
            callback(null, value, 'cache');
            return;
        }

        // Check if the network if it's in the database and update cache
        var self = this;
        DataStore.getOperator(mcc, mnc, function(error, d) {
            if (error) {
                Log.error(Log.messages.ERROR_MOBILENETWORKERROR, {
                    'error': error
                });
                callback(error);
                return;
            }
            if (!d) {
                Log.debug('MobileNetwork::getNetwork --> Not found on database');
                callback(null, null, 'ddbb');
                return;
            }
            Log.debug('MobileNetwork::getNetwork --> found on database:', d);
            // Save to the cache the found value.
            if (self.isCacheEnabled) {
                self.cache[index] = d;
            }
            callback(null, d, 'ddbb');
        });
    };

    this.changeNetworkStatus = function(mcc, mnc, online) {
        var index = this.getIndex(mcc, mnc);
        Log.debug('MobileNetwork::changeNetworkStatus --> ' + index + ' is ' + online);
        DataStore.changeLocalServerStatus(index, online);
    };
};


///////////////////////////////////////////
// Singleton
///////////////////////////////////////////
util.inherits(MobileNetwork, events.EventEmitter);
var _mn = new MobileNetwork();

function getMobileNetwork() {
    return _mn;
}

module.exports = getMobileNetwork();
