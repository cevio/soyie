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
        alert('fn2');
    },
    ko: {
        a:4,b:3,
        x: {
            k:{
                z: 'evio'
            }
        }
    },
    list: [
        { a:1, b:2, c: ['a', 'b'] },
        { a:3, b:4, c: ['c', 'd'] },
        { a:5, b:6, c: ['e', 'f'] },
        { a:7, b:8, c: ['g', 'h'] },
        { a:9, b:10, c: ['i', 'j'] }
    ],
    text: 'evio',
    t:1
};

soyie.component('child', {
    props: ['msg']
});
window.delog = false;
soyie.ready(() => {
    var vm = soyie.app('app');
    vm.init(scope);
    //console.log(vm);
    setTimeout(() => {
        window.delog = true;

        //scope.p = 'mmmm';
        //scope.ko.a = 'test';
        //scope.p = scope.ko.a;

        scope.list[0] = { a:197, b:23425, c: ['ewrew', 'ewr'] };

        scope.list[0].c = ['657','6fgh'];
        //scope.img = 'https://assets.servedby-buysellads.com/p/manage/asset/id/15119';
        scope.html = '<h1 style="color:purple">hello world!</h1>';

        //scope.list[0].a = 1000;
        //scope.list[1].c[0] = '1111111111';
        //scope.list[0].c[0] = 'list';
        //setTimeout(()=>delete scope.p, 1000)
        //scope.title = '123';
        //scope.list.push({ a: 11, b:12, c: ['k', 'l'] });
        setTimeout(function(){
            scope.list[5] = { a:197, b:23425, c: ['ewrew', 'ewr'] };
            scope.title = '3242432534';
            scope.list[0].c.$remove(0)
        }, 1000);
        //console.log(scope.list[0].c)
        //scope.list[0].c.$remove(0)
        //scope.list[2].a = 100;
    }, 1000);

});


// 一个简单的对象可以作为一个模块来使用
//var todoModel = {
//    label: 'Default',
//    completed: false
//};
// 我们观察这个对象
//Object.observe(todoModel, function(changes) {
//    changes.forEach(function(change, i) {
//        console.log(change);
//        /*
//         哪个属性被改变了? change.name
//         改变类型是什么? change.type
//         新的属性值是什么? change.object[change.name]
//         */
//    });
//});
// 使用时:
//todoModel.label = 'Buy some more milk';
/*
 label属性被改变了
 改变类型是属性值更新
 当前属性值为'Buy some more milk'
 */
//todoModel.completeBy = '01/01/2013';
/*
 completeBy属性被改变了
 改变类型是属性被添加
 当前属性值为'01/01/2013'
 */
//delete todoModel.completed;
/*
 completed属性被改变了
 改变类型是属性被删除
 当前属性值为undefined
 */