"use strict";

var mapcoords = require("../lib/mapcoords.js");

var testdata = require("./testcoords.json");

exports["test complete coords"] = function(assert) {
	for (var i = 0; i < testdata.length; i++) {
		assert.deepEqual(mapcoords.complete(testdata[i].partial), testdata[i].completed);
	}
};

require("sdk/test").run(exports);
