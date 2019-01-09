"use strict";

var main = require("../");
var preferences = require("sdk/simple-prefs");

exports["test main"] = function(assert) {
	assert.pass("Unit test running!");
};

exports["test main async"] = function(assert, done) {
	assert.pass("async Unit test running!");
	done();
};

exports["test main preferences keep"] = function(assert) {
	preferences.prefs.destmaps = "[]";
	main.main();
	assert.strictEqual(preferences.prefs.destmaps,
			"[]",
			"Do not overwrite user destination maps");
};

require("sdk/test").run(exports);
