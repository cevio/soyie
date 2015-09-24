/**
 * Created by evio on 15/9/14.
 */
require('./test.html');
var visitor = require('../src/scope/watcher');
var soyie = require('../src/index');
var scope = {
    dist: 'my dist',
    most: 'your most',
    title: 'this title',
    img: 'http://vuejs.org/images/logo.png',
    html: '<h1 style="color:green">hello world!</h1>',
    fn1: function(){
        alert('fn1');
    },
    fn2: function(){
        return this.t + '-' + this.title;
    },
    ko: {
        a:4,b:3,
        x: {
            k:{
                z: 'evio'
            }
        }
    },
    text: 'evio',
    t:1
};

soyie.component('child', {
    props: ['msg']
});


soyie.component('task', {
    props: {
        tasks: {
            type: ['Array'],
            required: true
        }
    },
    events: {
        init: function(){
            console.log(1)
        }
    },
    handle: function(scope){
        scope.remind = function(){
            var i = scope.tasks.length, j = i;
            while (i--){
                if ( scope.tasks[i].state == '1' ){
                    j--;
                }
            }
            return j;
        };
        scope.newtask = '';
        scope.addtask = function(){
            scope.tasks.push({
                name: scope.newtask,
                state: 0
            });
            scope.newtask = '';
        }
    },
    template: '<p>你还有{{remind()}}个任务没完成</p>'
    +           '<ul>'
    +                   '<li so-repeat="{{tasks}}">'
    +                       '<input type="checkbox" so-binding="state" so-unchecked="0" value="1">'
    +                       '<span class="{{state == \'1\' ? \'line\': \'\'}}">{{name}}</span>'
    +                   '</li>'
    +           '</ul>'
    +           '<input type="text" so-binding="newtask" placeholder="input your task..." />'
    +           '<button so-on="click:addtask">add</button>'
});

soyie.component('test', {
    props: {
        d: {
            type: ['String'],
            required: true,
            default: 'none is set'
        }
    },

    onCheckPropsError(err){
        console.log(err)
    }
});


soyie.ready(() => {
    var vm = soyie.app('app');
    vm.init(scope);
    scope.list = [
        { a:1, b:2, c: ['a', 'b'] },
        { a:3, b:4, c: ['c', 'd'] },
        { a:5, b:6, c: ['e', 'f'] },
        { a:7, b:8, c: ['g', 'h'] },
        { a:9, b:10, c: ['i', 'j'] }
    ];
    setTimeout(() => {
        scope.tasks = [
            { name: "今天要将soyie一期完成", state: 0 }
        ];
        setTimeout(function(){
            scope.tasks.push({ name: "今天要将soyie二期完成", state: 0 })
        }, 1000)
    }, 1000);
});