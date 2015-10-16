/**
 * Created by evio on 15/9/14.
 */
require('./test.html');
var soyie = require('../src/index');
var obs = require('../src/scope/observe2');

window.s = {
    a:1,
    b:2,
    c:[
        { a:3, b:4, c: [1,2,3,4,5] },
        { a:5, b:6, c: [6,7,8,9,1] },
        { a:7, b:8, c: [324,4543,657,86] }
    ],
    d: {
        k:1,
        p: {
            x: 9
        }
    },
    tasks: [
        {name:'dafsadf', state: 1},
        {name:'dafsadf', state: 0}
    ]
};

soyie.component('task', {
    props: {
        tasks: {
            type: ['Array'],
            required: true
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
            //scope.$notify();
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


soyie.ready(() => {
    soyie.bootstrap('app', s);
});