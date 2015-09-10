/**
 * Created by evio on 15/9/5.
 */
var soyie = require('../../src/index');

var scope = {
    dist: 'evio',
    mose: {
        list: [
            { a: 1, b: 2, c: ['a', 'b'] },
            { a: 3, b: 4, c: ['c', 'd'] },
            { a: 5, b: 6, c: ['e', 'f'] }
        ]
    }
};

var vm = soyie.invoke(document.getElementById('test'), scope, function($scope, element){
    setTimeout(function(){
        $scope.mose.list.splice(1,1);
        //$scope.mose.list[1] = { a: 3, b: 9, c: ['c', 'd'] };
    }, 1000);

});

//console.log(vm.DM.find('#-dist'))

//var m = new scan();
//m.init();
//m.all(document.getElementById('test3'));


///////////////////////////////////////////
/*var x = {
    a: { b: 1, c: 2, d:[5,6] },
    b: { b: 3, c: 4, d:[7,8] }
};
var z = new RP(document.getElementById('test2'));
z.init();
z.render({ m: x });
console.log(z);*/