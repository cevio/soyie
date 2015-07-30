var envirs = Soyie;
window.onload = function(){
    var ts = envirs.module().controller('mvvm', {
        name: 'evio',
        age: 18,
        tel: '18506831190',
        qq: '8802430',
        des: 'test view render.',
        choose: 3,
        a: "5",
        b: "8",
        img: "http://app.webkits.cn/app/75f1b51ecb80de4f367c8ee79efcdc93f4dddcd3/logo.png",
        checkone: 'evio',
        tt: function(){
          alert(1);
        },
        yy: function(){
          alert(2);
        },
        list: [
            { name: 'evio2', age: 18, des: ['tt', 'rr'], img: 'http://app.webkits.cn/app/75f1b51ecb80de4f367c8ee79efcdc93f4dddcd3/logo.png' },
            { name: 'xybk', age: 32, des: ['daf', 'dafdasaf'], img: 'http://app.webkits.cn/app/fa92c091241bf6acdae6dae6c1a5768b53aebf44/logo.png' }
        ]
    });


    var mods = envirs.module().controller('tttttt', {
        a: 1,
        b: 2,
        c: 3
    });
    mods.task('name1', function(scope, resolve, reject){
        setTimeout(function(){
            scope.a = 2;
            console.log('scope.a = ' + scope.a);
            resolve();
        }, 1000);
    });
    mods.task('name2', function(scope, resolve, reject){
        setTimeout(function(){
            scope.b = 3;
            console.log('scope.b = ' + scope.b);
            resolve();
        }, 2000);
    });
    mods.task('name3', function(scope, resolve, reject){
        setTimeout(function(){
            scope.c = 4;
            console.log('scope.c = ' + scope.c);
            resolve();
        }, 3000);
    });
    mods.registTask('default', ['name1', 'name2']);
    mods.registTask('test', ['name1', 'name2', 'name3']);
    mods.run('test', function(err){
        if ( err ){
            console.error(err);
        }else{
            console.log('All is done!');
            ts.action(function($scope){
                $scope.list[1].name = 'evio is a good man!';
                $scope.img = 'http://app.webkits.cn/app/fa92c091241bf6acdae6dae6c1a5768b53aebf44/logo.png';
                $scope.yy = function(node){
                    alert(3);
                    console.log(this);
                }
                $scope.list[1].img = 'http://app.webkits.cn/app/75f1b51ecb80de4f367c8ee79efcdc93f4dddcd3/logo.png';
            });
        }
    });
};

/*window.x = {
    name: 'evio',
    age: 18,
    tel: '18506831190',
    qq: '8802430',
    des: 'test view render.',
    choose: 3,
    a: "5",
    b: "8",
    checkone: 'evio',
    list: [
        { name: 'evio2', age: 18, des: ['tt', 'rr'] },
        { name: 'xybk', age: 32, des: ['daf', 'dafdasaf'] }
    ]
};
window.onload = function(){
    var c = new soyie();
    c.search(document.getElementById('asp'), window.x);
    c.fetchDependencies(window.x);
    c.watch(window.x);
    console.log(c);
};
*/