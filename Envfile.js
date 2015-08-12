module.exports = function(task){
	task.js("compress-js", "./index.js", "./dist/minify.js");
	task.js('demo-js-normal', './test/res/js/compent.js', './test/res/js/dist.js');
	task.css("demo-css-normal", { "./test/res/css/dist.css": [
		"./test/res/css/bootstrap.css",
		"./test/res/css/font-awesome.css"
	] });
	task.registTask("default", ["compress-js"]);
	task.registTask('demo', ['demo-css-normal', 'demo-js-normal']);
};