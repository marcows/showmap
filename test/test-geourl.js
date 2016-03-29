var geourl = require("../lib/geourl.js");

var testdata = require("./testdata.json");

function printDescription(key)
{
	return (key !== undefined ? " - " + key : "");
}

exports["test parse"] = function(assert) {
	for (var i = 0; i < testdata.length; i++) {
		assert.deepEqual(geourl.parse(testdata[i].url),
				testdata[i].coords,
				"Parse URL "
				+ testdata[i].url
				+ printDescription(testdata[i].urldesc));
	}
};

exports["test decode"] = function(assert) {
	for (var i = 0; i < testdata.length; i++) {
		if (testdata[i].templateurl !== undefined) {
			assert.strictEqual(geourl.decode(testdata[i].templateurl, testdata[i].coords),
					testdata[i].url,
					"Decode template URL "
					+ testdata[i].templateurl
					+ printDescription(testdata[i].templateurldesc));
		}
	}
};

require("sdk/test").run(exports);
