(function(global){
    /**
     * VM module - vmodel factory.
     * @type {*|exports|module.exports}
     */
    var VM = require('./lib/modules/vmodel');

    /**
     * soyie contrcutor.
     * global Soyie factory.
     * @param controller
     * @param scope
     * @returns {*}
     */
    var soyie = function(controller, scope){
        return soyie.define(controller, scope).watch();
    };

    /**
     * Soyie.define
     * define a ast contructor.
     * except watch factory.
     * @param controller
     * @param scope
     */
    soyie.define = function(controller, scope){
        var DOM = document.querySelector("[es-controller='" + controller + "']");
        if ( !DOM ){
            console.error('can not find controller:' + controller);
            return;
        }
        var vm = new VM(DOM, scope);
        return vm.find();
    };

    /**
     * observe to global
     * @type {observe|exports|module.exports}
     */
    soyie.observe = require('./lib/modules/observe');

    /**
     * Promise to global
     * @type {*|exports|module.exports}
     */
    soyie.Promise = require('promise-order');

    /**
     * make cmd factory.
     * and amd factory.
     */
    if (typeof module != 'undefined' && module.exports) { module.exports = soyie }
    else if (typeof define === 'function' && define.amd) { define(soyie); };

    /**
     * push Soyie to global.
     * @type {Function}
     */
    global.Soyie = soyie;
})(Function('return this;')());