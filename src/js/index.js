(function(global){
    /**
     * VM module - vmodel factory.
     * @type {*|exports|module.exports}
     */
    var VM = require('../lib/modules/vmodel');
    var cmd = require('../lib/attr-node/plugins');

    /**
     * soyie contrcutor.
     * global Soyie factory.
     * @param controller
     * @param scope
     * @returns {*}
     */
    var soyie = module.exports = function(controller, scope){
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
    soyie.observe = require('../lib/modules/observe');

    /**
     * Promise to global
     * @type {*|exports|module.exports}
     */
    soyie.Promise = require('promise-order');
    soyie.EventEmitter = require('events').EventEmitter;
    soyie.Cmd = cmd;

    /**
     * push Soyie to global.
     * @type {Function}
     */
    global.Soyie = soyie;

/*
var click = function(obj){
    alert(obj.getAttribute('data-id'));
};


    var scopeData = {
        "title": "复杂的循环绑定",
        "lv": 2,
        "subject": "我的评论列表",
        "stitle": "诗意如画",
        "data": [
            { "name": "evio", "time": "2015-01-01", "content": "文字很美，再接再厉。", "reply": [
                { "name": "jack", "time": "2015-01-02", "content": "确实不错的文字", click: click },
                { "name": "molear", "time": "2015-01-03", "content": "感觉像郭敬明的文字", click: click },
                { "name": "joyo", "time": "2015-01-04", "content": "如果能更感人一些就更好了。不过还是希望楼主加油！", click: click }
            ]},
            { "name": "Tommy", "time": "2015-01-05", "content": "这样的文字只应天上有，哈哈，给你点个赞！", "reply": [
                { "name": "Roop", "time": "2015-01-06", "content": "是的，让我想起来，曾经的美好，感慨万千啊。", click: click },
                { "name": "Jitsition", "time": "2015-01-07", "content": "冥冥之中自由安排吧，我相信，我也相信的文字。", click: click },
                { "name": "monitor Lee", "time": "2015-01-08", "content": "有点复古，有点忧伤，把我们都待会到了那个曾经属于我们的时代。事实证明，美好是存在的。", click: click }
            ]},
            { "name": "Kissoo", "time": "2015-01-09", "content": "有种想哭的冲动，越来越强烈，你把自己关在城外，我们在烽火台上缄默凝望。习惯了你的文字，同时也习惯了你的忧伤！", "reply": [
                { "name": "VERTO", "time": "2015-01-10", "content": "兵荒马乱的时候，我只能想起你。", click: click },
                { "name": "DISTENCE", "time": "2015-01-11", "content": "落英缤纷啊！", click: click },
                { "name": "Where are you!", "time": "2015-01-12", "content": "美文美文！好像雨水溅落在玻璃杯上的清澈。", click: click }
            ]}
        ]
    };


    var vm = soyie('demo-repeat-example', scopeData);
    vm.on('change', function(){
       //console.log(arguments);
    });

    vm.property('#-data-0-name', function(value){
       //alert('change:#-data-0-name:' + value);
    });

    vm.search('#-data', function(){
        // TODO
       this.$remove(1);
    });

    setTimeout(function(){
        vm.scope.stitle = '诗意如画';
        vm.scope.lv = 3;
        vm.scope.data[0].name = '沈赟杰';
    }, 1000);
    var d = function(){
        alert(1)
    }

    var taxi = {
        s: 'tv',
        list: [
            {a:1, b:[1,2,3,4,5,6,7,8], c:d},
            {a:2, b:[9,10,11,12,13,14], c:d},
            {a:3, b:[15,16,171,81], c:d},
            {a:4, b:[4334,345,435,3534,34], c:d}
        ]
    };

    var tvm = soyie('tvm', taxi);
    tvm.search('#-list-3-b', function(){
        this.$replace(99999, 1);
    });
*/

})(Function('return this;')());