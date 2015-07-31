Soyie - MVVM
==================

一套轻量级的mvvm前端框架。目前正在完善中。

## installtion ##

> npm install Soyie

## Instruction ##

	* 双向绑定
	* 只需要用户关心数据，而不需要考虑视图

## Get Started ##

让我们开始吧！

你可以使用 `Soyie.config(key, value)` 的方式来操作基本设置：

  * defaultExpressionValue: 设置默认的文本替换文字
  * exceptTagNames: 添加你的过滤不分析的标签
  *  cmd: 指令前缀
  *  attr_controller: controller作用域关键字名
  *  attr_module: module作用域名关键字名
  *  attr_binding: 双向绑定关键字名
  *  attr_repeat: 循环作用域关键字名

### Soyie.config(key[, value]) ###

你可以这样设置：

``` javascript
Soyie.config('cmd', 'es-');
// 或者这样设置
Soyie.config({
	cmd: 'es-',
	defaultExpressionValue: '-'
});
```

### Soyie. ready(fn) ###

当domready的时候自动触发`Soyie.ready`定义的方法。

``` javascript
Soyie.ready(function(){
	var ctrl = Soyie.module('app').controller('myapp', {
		name: 'evio',
		age: 100
		address: '....',
		action: doMyTask
	});

	ctrl.task('mytask-1', function($scope, resolve, reject){
		setTimeout(function(){
			$scope.age = 99;
			resolve();
		}, 1000);
	});
	
	ctrl.task('mytask-2', function($scope, resolve, reject){
		setTimeout(function(){
			$scope.name = 'xybk';
			resolve();
		}, 2000);
	});

	ctrl.registTask('default', ['mytask-1', 'mytask-2']);

	function doMyTask(){
		ctrl.run(function(err){
			if ( err ){
				console.error(err);
			}else{
				console.log('All done.');
			}
		});
	}
});
```

### Soyie.module([module-name]) ###

定义一个module层作用域，这个作用域下将可以同时包含很多个controller层作用域。它的存在将在之后作为路由起到决定性作用。

``` javascript
var MODULE = Soyie.module('app');
// 如果没有参数，那么默认指向 `es-app`
var MODULE = Soyie.module()
```

之后我们将使用`[module]`表示该返回对象。

### [module].controller(name, data) ###

获取一个controller名为name的视图层对象，并且实例化。返回实例化对象。

``` javascript
MODULE.controller('app-name', {
	a: 1,
	b: 2
});
```

之后我们将使用`[controller]`表示该返回对象。

### [controller].task(name, fn) ###

定义一个任务。

  * name: 任务名
  * fn: 任务方法。每个任务方法都是一个`Promise`回调。

`fn`任务方法包含3个参数：

  * $scope: 作用域对象
  * resolve: Promise成功回调函数
  * reject: Promise失败回调函数

具体Promise说明请参见 [https://github.com/jakearchibald/es6-promise](https://github.com/jakearchibald/es6-promise)

``` javascript
[controller].task('name', function($scope, resolve, reject){
	// ...
});
```

###[controller].registTask(flow-name, tasks-array) ###

向`[controller]`注册一个任务流水线执行过程。

``` javascript
[controller].registTask('test', ['task-1', 'task-2', 'task-3'];
// or
[controller].registTask('test', 'task-1', 'task-2', 'task-3');
// or 
[controller].registTask('taks-1'); // 将被默认为default下的task-1任务流水。
```

### [controller].run(flow-name, callback) ###

执行一个任务流水线。同时在完毕所有任务后执行`callback`回调。

``` javascript
[controller].run('default', function(err){
	if ( err ){
		console.error(err);
	}else{
		console.log('All done.');
	}
});
// or
[controller].run(callback);
// 如果不存在流水线任务名，那么默认为default流水线任务名。
```

### [controller].action(callback) ###

对controller对象回调。

``` javascript
[controller].action(function($scope){
	// $scope.a = 1;
});
```

## Expressions ##

下面来介绍下表达式已经双向绑定

### 文本表达式 ###

表达式格式`{{....}}` 。它将可以使用一起具有返回值的js语法表达式。比如

``` html
{{a}} + {{b}} + {{c}} = {{ (a + b) / 2 * (a / b) + c * 2 }} - {{Math.ceil(a)}}
```

程序会自动匹配到表达式对象的数据依赖关系。只要你的表达式与`$scope`作用域下的数据具有依赖关系，那么它将在数据变化同时自动更新表达式的值。

我们来看一段简单的代码

``` html
<div id="dd" es-controller="tttttt">{{a}} + {{b}} + {{c}} = {{ (a + b) / 2 * (a / b) + c * 2 }} - {{Math.ceil(a)}}</div>
```
在这个controller名为`tttttt`的作用域名，改变数据，这里的所有依赖表达式都将自动更新

``` javascript
function update($scope){
	$scope.a = 55;
	$scope.b = 68;
	$scope.c = 99;
}
```

### 双向绑定表达式 ###

 格式:  `<input es-binding="name">` 这里的`name`就是`$scope`下的一个数据源。

``` html
<div style="width: 640px; margin: 0 auto; margin-top: 50px;" es-controller="mvvm" id="asp">
    <h1>Duplex binding example:</h1>
    <p>name: id=a</p>
    <input type="text" value="" es-binding="name" id="a" />
    <p>age: id=b</p>
    <input type="text" value="" es-binding="age" id="b" />
    <p>tel: id=c</p>
    <input type="text" value="" es-binding="tel" id="c" />
    <p>qq: id=d</p>
    <input type="text" value="" es-binding="qq" id="d" />
    <p>des: id=e</p>
    <textarea style="width: 500px; height: 80px;resize: none;" es-binding="des" id="e"></textarea><br />
</div>
```

### 指令表达式 ###

指令表达式能帮助你更快地实现数据地展示和行为的绑定。目前只支持以下几种指令表达式：

  * es-src 图片地址表达式
  * es-click 行为绑定表达式

``` html
<img es-src="img" es-click="yy.call(this)" />
```

## TODO LIST ##

  * `es-input`指令更新
  * `es-touch`指令更新
  * `$scope.$on`方法更新
  * `$scope.$listen`方法更新