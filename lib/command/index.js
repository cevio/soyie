/**
 * Created by evio on 15/7/28.
 */
var src = require('./src');
var click = require('./click');
var config = require('../config');

exports[config.cmd + 'src'] = src;
exports[config.cmd + 'click'] = click;