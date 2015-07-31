module.exports = function(task){
	task.js("compress-js", "./res/js/index.js", "./res/js/minify.js");
	task.css("compress-css", { "./res/css/minify.css": ["./res/css/style.css"] });
	task.registTask("default", ["compress-css", "compress-js"]);
};