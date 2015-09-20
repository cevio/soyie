### Soyie Component Framework ###

`soyie`是一套针对移动端开发的高性能MVVM前端框架，类似`angular` `vue` `reactjs` `avalon` 。soyie集合来这些框架的优势，具有全组件，高性能的有点。特别是组件的制作（component）非常方便，您可以通过JSON化配置组件，也可以使用`class extends`来继承基本组件类扩展您的组件。

除此之外，她兼容最新的IOS9。非常方便的如同`搭积木`一样拼装您的项目。

### Installtion ###

** NPM 安装 **
> $ npm install soyie

** 内部安装 **
> $ so install soyie

### Useage ###

``` javascript
var Soyie = require('soyie');
Soyie.ready(function(){
    var vm = Soyie.app('example');
    vm.init(scope);
    scop.baz = 'foo';
    ......
});
```

### API ###

文档教程正在整理中，敬请期待！

### components 演示 ###

我们在`angular`官网常见一个任务系统，我们将演示如果使用`soyie`来创建这个component系统。

``` javascript
Soyie.component('task', {
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
        }
    },
    template: '<p>你还有{{remind()}}个任务没完成</p>'
    +           '<ul>'
    +               '<repeat source="{{tasks}}" up-notify>'
    +                   '<li>'
    +                       '<input type="checkbox" so-binding="source.state" so-unchecked="0" value="1">'
    +                       '<span class="{{source.state == \'1\' ? \'line\': \'\'}}">{{source.name}}</span>'
    +                   '</li>'
    +               '</repeat>'
    +           '</ul>'
    +           '<input type="text" so-binding="newtask" placeholder="input your task..." />'
    +           '<button so-on="click:addtask">add</button>'
});
```

对应的HTML代码如下：

``` html
<task tasks="{{tasks}}" />
```

我们只要传入tasks对应的数据参数标签（表单式）即可得到与`angular`一样的任务系统。