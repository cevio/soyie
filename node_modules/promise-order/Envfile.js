module.exports = function(task){
	task.js("compress-js", "./index.js", "./dist/minify.js");
	task.registTask("default", ["compress-js"]);
};