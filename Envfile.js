module.exports = function(task){
	task.js("compress-js", "./index.js", "./dist/soyie.min.js");
	task.js('demo-js-normal', './test/res/js/compent.js', './test/res/js/dist.js');
	task.css("demo-css-normal", { "./test/res/css/dist.css": [
		"./test/res/css/bootstrap.css",
		"./test/res/css/font-awesome.css",
		"./test/res/css/style.css"
	] });
	task.js('demo-js-lib', './test/res/js/index.js', './test/res/js/action.js');
	task.js('loader', './loader.js', './dist/loader.min.js');
	task.registTask("default", ["compress-js"]);
	task.registTask('demo', ['demo-css-normal', 'demo-js-normal', 'demo-js-lib']);
	task.registTask('loader', ['loader']);
};