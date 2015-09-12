### Soyie Doc ###

一套高性能的`MVVM`框架。一期功能已完成

### Installtion ###

** NPM 安装 **
> $ npm install soyie

** 内部安装 **
> $ so install soyie

### Useage ###

``` javascript
var Soyie = require('soyie');
...
```

### API ###

框架API简介。

#### Soyie.controller(control) ####

选择一个controller名或者节点对象

``` javascript
var VM = Soyie.controller('app');
```

之后的`VM`代表上面产生的VModel对象。

#### VM.init(data) ####

编译初始化数据，用于一些特殊的APP应用。可以将缓存数据优先预编译。这样，页面上就有数据了。

为了接近原生体验，建议这么做。

``` javascript
VM.init({
    a:1,
    b:2,
    c:['a', 'b']
});
```

#### VM.update(foo) ####

为VM更新数据。数据类型有2种：

  * `json` 直接将数据更新上去
  * `function` 通过Function来对数据源手动操作 (建议使用)
  
注意：function 类型的时候， 有2个参数：
  * `scope` 数据源对象 SCOPE对象
  * `element` 当前controller层的DOM对象，原生对象

``` javascript
VM.update(function(scope, element){
    console.log(element);
    $.get('/a/b/c', {a:1}, function(html){
        scope.html = html;
    });
})
```
#### Soyie.invoke(controller, initData, foo) ###

这个方法是上面方法的全部既可以，等价于：

``` javascript
Soyie.controller(controller).init(initData).update(foo);
```

请看调用方法:

``` javascript
Soyie.invoke('app',function(scope){
    scope.title = '我的评论列表';
    scope.list = arrays;
    scope.tasks = [
        { name: "第1个任务", check: 0, value: 1 },
        { name: "第2个任务", check: 0, value: 1 },
        { name: "第3个任务", check: 0, value: 1 },
        { name: "第4个任务", check: 0, value: 1 },
        { name: "第5个任务", check: 0, value: 1 }
    ];
    scope.newtask = '';
    scope.addtask = function(){
        scope.tasks.push({
            name: scope.newtask,
            check: 0,
            value: 1
        });
        scope.newtask = '';
    };
    scope.total = function(){
        var i = scope.tasks.length;
        scope.tasks.forEach(function(t){
            if ( t.check + '' === '1' ){
                i--;
            }
        });
        return i + '';
    }
});
```

#### Soyie.ready(foo) ####

当DOMREADY时候执行foo方法。

``` javascript
Soyie.ready(function(){
    // your code here
});
```