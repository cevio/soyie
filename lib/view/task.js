/**
 * Created by evio on 15/7/22.
 */
var utils = require('../utils');
var Promise = require('../promise');
var slice = Array.prototype.slice;

var taskWaterLine = module.exports = function(){
    this.namespace = 'ENVIRS-TASK-WORKER';
    this.storages = {};
    this.waters = {};
};

taskWaterLine.prototype.task = function(name, fn){
    this.storages[name] = fn;
    return this;
};

taskWaterLine.prototype.registTask = function(){
    var args = arguments.length;
    var name, tasks = [];

    for ( var i = 0 ; i < args ; i++ ){
        if ( utils.type(arguments[i], 'Array') ){
            tasks = tasks.concat(arguments[i]);
        }
        else if ( utils.type(arguments[i], 'String') ){
            name = arguments[i];
        }
        else if ( typeof arguments[i] === 'function' ){
            tasks.push(arguments[i]);
        }
        else if ( utils.type(arguments[i], 'Object') ){
            for ( var j in arguments[i] ){
                this.registTask(i, arguments[i][j]);
            }
            return;
        }
        else{
            console.error('regist task error.');
        }
    }

    if ( !name ) name = 'default';

    this.waters[name] = tasks;
    return this;
};

taskWaterLine.prototype.run = function(name, fn, scope){
    var tasks = this.waters[name];
    var arr = [];
    var that = this;

    tasks.forEach(function(task){
        if ( that.storages[task] ){
            arr.push(Promise.queue(scope, that.storages[task]));
        }else{
            arr.push(Promise.queue.resolve());
        }
    });

    Promise.order(arr).then(function(arg){ fn(null, arg); })['catch'](function(err){ fn(err); });

    return this;
};