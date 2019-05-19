"use strict";

import test from "ava";

const geourl = require("../lib/geourl.js");
const testdata = require("./testurls.json");

function printDescription(key)
{
	return (key !== undefined ? " - " + key : "");
}

for (const testitem of testdata) {
	test("parse " + testitem.url + printDescription(testitem.urldesc), t => {
		t.deepEqual(geourl.parse(testitem.url), testitem.coords);
	});
}

for (const testitem of testdata) {
	if (testitem.templateurl !== undefined) {
		test("decode " + testitem.templateurl + printDescription(testitem.templateurldesc), t => {
			t.is(geourl.decode(testitem.templateurl, testitem.coords), testitem.url);
		});
	}
}
