"use strict";

import test from "ava";

const mapcoords = require("../lib/mapcoords.js");
const testdata = require("./testcoords.json");

for (const testitem of testdata) {
	test("complete coords " + JSON.stringify(testitem.partial), t => {
		t.deepEqual(mapcoords.complete(testitem.partial), testitem.completed);
	});
}
