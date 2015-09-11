var Soyie = require('../src/index');
Soyie.ready(function(){
    var arrays = [
        {
            "id": 1,
            "name": "evio",
            "time": "2015-01-01",
            "content": "文字很美，再接再厉。",
            "avatar": "http://tp2.sinaimg.cn/5174068425/50/5734587490/1",
            "reply": [
                {
                    "id": 4,
                    "name": "jack",
                    "time": "2015-01-02",
                    "content": "确实不错的文字",
                    "avatar": "http://tp3.sinaimg.cn/1230663070/50/5605258041/0"
                },
                {
                    "id": 5,
                    "name": "molear",
                    "time": "2015-01-03",
                    "content": "感觉像郭敬明的文字",
                    "avatar": "http://tp1.sinaimg.cn/1618051664/50/5735009977/0"
                },
                {
                    "id": 6,
                    "name": "joyo",
                    "time": "2015-01-04",
                    "content": "如果能更感人一些就更好了。不过还是希望楼主加油！",
                    "avatar": "http://tp3.sinaimg.cn/1192329374/50/5732418223/0"
                }
            ]
        },
        {
            "id": 2,
            "name": "Tommy",
            "time": "2015-01-05",
            "content": "这样的文字只应天上有，哈哈，给你点个赞！",
            "avatar": "http://tp4.sinaimg.cn/1763582395/50/5717162405/1",
            "reply": [
                {
                    "id": 7,
                    "name": "Roop",
                    "time": "2015-01-06",
                    "content": "是的，让我想起来，曾经的美好，感慨万千啊。",
                    "avatar": "http://tp2.sinaimg.cn/1847798401/50/5723529552/0"
                },
                {
                    "id": 8,
                    "name": "Jitsition",
                    "time": "2015-01-07",
                    "content": "冥冥之中自由安排吧，我相信，我也相信的文字。",
                    "avatar": "http://tp1.sinaimg.cn/1223179064/50/1279875625/1"
                },
                {
                    "id": 9,
                    "name": "monitor Lee",
                    "time": "2015-01-08",
                    "content": "有点复古，有点忧伤，把我们都待会到了那个曾经属于我们的时代。事实证明，美好是存在的。",
                    "avatar": "http://tp4.sinaimg.cn/2047613403/50/5736580418/0"
                }
            ]
        },
        {
            "id": 3,
            "name": "Kissoo",
            "time": "2015-01-09",
            "content": "有种想哭的冲动，越来越强烈，你把自己关在城外，我们在烽火台上缄默凝望。习惯了你的文字，同时也习惯了你的忧伤！",
            "avatar": "http://tp2.sinaimg.cn/1266321801/50/5728452071/0",
            "reply": [
                {
                    "id": 10,
                    "name": "VERTO",
                    "time": "2015-01-10",
                    "content": "兵荒马乱的时候，我只能想起你。",
                    "avatar": "http://tp4.sinaimg.cn/5101863971/50/40059758226/1"
                },
                {
                    "id": 11,
                    "name": "DISTENCE",
                    "time": "2015-01-11",
                    "content": "落英缤纷啊！",
                    "avatar": "http://tp2.sinaimg.cn/2283406765/50/5735895070/1"
                },
                {
                    "id": 12,
                    "name": "Where are you!",
                    "time": "2015-01-12",
                    "content": "美文美文！好像雨水溅落在玻璃杯上的清澈。",
                    "avatar": "http://tp4.sinaimg.cn/2834256503/50/5661561218/1"
                }
            ]
        }
    ];

    arrays.forEach(function(array, index){
        array.checked = 0;
        array.add = function(){
            array.reply.push({
                "id": parseInt(Math.random() * 1000),
                "name": "NEW NAME",
                "time": "2015-01-56",
                "content": "NEW CONTENT",
                "avatar": array.reply[Math.floor(Math.random() * array.reply.length)].avatar
            })
        };
        array.remove = function(){
            if ( window.confirm('确定删除？') ){
                arrays.splice(index, 1);
            }
        };
        array.reply.forEach(function(o, z){
            o.checked = 0;
            o.remove = function(){
                arrays[index].reply.splice(z,1);
            }
        })
    });

    Soyie.invoke('app', function(scope){
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

});