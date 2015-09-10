/**
 * Created by evio on 15/8/28.
 */
var soyie = require('../../src/index');

var initData = {
    //img:'https://www.baidu.com/img/bd_logo1.png',
    stitle: '诗意如画2'
};


soyie.invoke('demo-repeat-example', initData, function($scope, $element){
    $scope.title = "复杂的循环绑定";
    $scope.lv = 2;
    $scope.stitle = '诗意如画';
    $scope.view = true;
    $scope.html = '<h1>evio is a good man.</h1>';
    $scope.hk = function(){
        alert(1);
    };
    $scope.use = function(){
        return this.dist.a;
    };
    $scope.mmm = function(){
        return Number($scope.dist.a) + 10;
    };
    $scope.dist = {
        a: 1,
        b: { c: { d: { e: 'x man' } } }
    };
    $scope.data = [
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
    ];
    setTimeout(function(){
        window.log = true;
        /**
         * 测试区域开始
         */
        // 对象 添加 pass
        $scope.img = 'https://www.baidu.com/img/bd_logo1.png';
        // 对象 修改 pass
        //$scope.stitle = '对象修改';
        // 对象 删除 pass
        //delete $scope.stitle;
        // 多级对象 添加 pass
        //$scope.dist.b = { c: { d: { e: 'x man' } } };
        // 多级对象 修改 pass
        //$scope.dist.b.c.d.e = 'evios'; // pass
        //$scope.dist.b.c.d = { e: 'dist' }; // pass
        //$scope.dist.b.c = { d: {e: 'values'} }; // pass
        // 多级对象 删除 pass
        //delete $scope.dist.b.c.d; // pass
        //delete $scope.dist.b; // pass
        // 数组 添加 pass
        /*$scope.data.push({ "name": "evio", "time": "2015-01-01", "content": "文字很美，再接再厉。", "reply": [
            { "name": "jack", "time": "2015-01-02", "content": "确实不错的文字", click: click },
            { "name": "molear", "time": "2015-01-03", "content": "感觉像郭敬明的文字", click: click },
            { "name": "joyo", "time": "2015-01-04", "content": "如果能更感人一些就更好了。不过还是希望楼主加油！", click: click }
        ]});*/ // pass
        /*$scope.data[0].reply.push({ "name": "Where are you!", "time": "2015-01-12", "content": "美文美文！好像雨水溅落在玻璃杯上的清澈。", click: click })*/ // pass
        // 数组 修改 pass
        //$scope.data[0].reply[2].name = '222'; // pass
        //$scope.data[0].reply[1] = { "name": "monitor Lee2", "time": "2015-01-28", "content": "有点复古，有点忧伤，把我们都待会到了那个曾经属于我们的时代。事实证明，美好是存在的。", click: click }; // pass
        /*$scope.data[0] = { "name": "Kissoo", "time": "2015-01-09", "content": "有种想哭的冲动，越来越强烈，你把自己关在城外，我们在烽火台上缄默凝望。习惯了你的文字，同时也习惯了你的忧伤！", "reply": [
            { "name": "VERTO", "time": "2015-01-10", "content": "兵荒马乱的时候，我只能想起你。", click: click },
            { "name": "DISTENCE", "time": "2015-01-11", "content": "落英缤纷啊！", click: click },
            { "name": "Where are you!", "time": "2015-01-12", "content": "美文美文！好像雨水溅落在玻璃杯上的清澈。", click: click }
        ]};*/ // pass
        // 数组 删除 pass
        //$scope.data.splice(1, 1) // pass
        //$scope.data[0].reply.splice(1,1); // pass
        /**
         * 测试区域结束
         */
    }, 1000);
});

function click(){
    console.log(this);
    console.log(arguments);
}