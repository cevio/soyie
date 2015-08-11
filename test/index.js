function test(){
    var x = Soyie('test', {
        title: '测试',
        image: 'https://www.baidu.com/img/baidu_jgylogo3.gif',
        cls: 'most',
        name: 'test name',
        word: 'Soyie Mvvm Frame Worker coming!',
        choose: '3',
        checkbox: 'evio',
        cc: '2',
        jump: function(){
            console.log(this);
        },
        arrs: [
            {
                a: '第一层数据a',
                b: '第一层数据b',
                c: [
                    '第一层数据c的数据中第一层数据',
                    '第一层数据c的数据中第二层数据'
                ]
            },
            {
                a: '第二层数据a',
                b: '第二层数据b',
                c: [
                    '第二层数据c的数据中第一层数据',
                    '第二层数据c的数据中第二层数据'
                ]
            }
        ],
        p: 0
    });

    x.property('p', function(newValue, oldValue, pools){
        var el = document.getElementById('pc');
        if ( newValue < 30 ){
            el.innerHTML = '很慢都开始';
        }
        else if ( newValue < 60 ){
            el.innerHTML = '速度渐渐变快';
        }
        else if ( newValue < 100 ){
            el.innerHTML = '马上就要完成了';
        }
        else{
            el.innerHTML = '好了，全部完成，你可以开始做别的事情了';
        }
    });

    x.task('t1', function($scope, resolve){
        setTimeout(function(){
            $scope.title = 'Soyie web mvvm framework';
            resolve();
        }, 1000);
    });
    x.task('t2', function($scope, resolve){
        setTimeout(function(){
            $scope.name = 'user soyie to build';
            resolve();
        }, 1000);
    });

    x.task('ps', function($scope, resolve, reject){
        if ( $scope.p >= 100 ){
            reject('done');
        }else{
            setTimeout(function(){
                $scope.p = $scope.p + 1;
                resolve();
            }, 300);
        }
    });

    x.registTask('me', ['t1', 't2']);
    x.registTask('pm', ['ps']);

    function runs(){
        x.run('pm', function(err){
            if ( !err ){
                runs();
            }else{
                console.log('process done');
            }
        });
    }

    x.run('me', function(){
        console.log('all done.')
        runs();
    });

}

test();