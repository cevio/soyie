/**
 * Created by evio on 15/9/14.
 */
require('./test.html');
var soyie = require('../src/index');


soyie.component('child', {
    props: ['msg'],
    events: {
        init(){
            console.log('+1')
        }
    }
});

soyie.component('task', {
    props: {
        tasks: {
            type: ['Array'],
            required: true
        },
        news:{}
    },
    events: {
        init: function(){
            //console.log(1)
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
function c1(){
    alert(1);
}
function c2(){
    alert(2)
}
soyie.ready(() => {
    soyie.bootstrap('app', function(){
        this.list = [
            { a:1, b:2, c: ['a', 'b'], d:c1  },
            { a:3, b:4, c: ['c', 'd'], d:c1 },
            { a:5, b:6, c: ['e', 'f'], d:c1 },
            { a:7, b:8, c: ['g', 'h'], d:c1 },
            { a:9, b:10, c: ['i', 'j'], d:c1 }
        ];
        this.title = "evio";
        this.change = function(){
            alert(1);
        };
        this.name = 'molly';
        this.tasks = [
            { name: "今天要将soyie一期完成", state: 0 },
            { name: "今天要将soyie二期完成", state: 0 },
            { name: "今天要将soyie三期完成", state: 0 },
            { name: "今天要将soyie四期完成", state: 0 }
        ];
        this.aaa = [1,2,3,4,5,6];
        setTimeout(() => {
            this.list = [
                { a:16, b:26, c: ['ccc', 'ccdfaf'],d:c2 },
                { a:4, b:46, c: ['dsaf', 'adfadsf'],d:c2 },
                { a:56, b:66, c: ['esadf', 'fdas'],d:c2 },
                { a:76, b:8, c: ['gdsaf', 'hadsf'],d:c2 },
                { a:96, b:610, c: ['isadf', 'jdsaf'], d:c2 }
            ];
            setTimeout(() =>{
                this.list[0].c = ['dafasfadfa','sadfsdfa'];
            }, 2000);
        }, 2000);
    });
    //var vm = soyie.app('app');
    //vm.init(scope);
    //scope.list = [
    //    { a:1, b:2, c: ['a', 'b'] },
    //    { a:3, b:4, c: ['c', 'd'] },
    //    { a:5, b:6, c: ['e', 'f'] },
    //    { a:7, b:8, c: ['g', 'h'] },
    //    { a:9, b:10, c: ['i', 'j'] }
    //];
    //setTimeout(() => {
    //    scope.tasks = [
    //        { name: "今天要将soyie一期完成", state: 0 }
    //    ];
    //    setTimeout(function(){
    //        scope.tasks.push({ name: "今天要将soyie二期完成", state: 0 })
    //    }, 1000)
    //}, 1000);
});