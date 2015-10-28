/*
 * Main Add-On script
 *
 * Initialization of preferences and UI including the appropriate events.
 */

/**
 * Configured destination maps.
 *
 * @typedef {Object[]} DestinationsMaps
 *
 * @property {String} name - name of the map
 * @property {String} templateurl - template URL with variables
 */

var tabs = require("sdk/tabs");
var contextMenu = require("sdk/context-menu");

var geourl = require("./lib/geourl.js");

/* items always visible for simplicity */

function createContextMenu()
{
	var destinationUrls = require("./destmaps.json");

	for (var i = 0; i < destinationUrls.length; i++) {
		contextMenu.Item({
			label: destinationUrls[i].name,
			data: destinationUrls[i].templateurl,
			contentScript: 'self.on("click", function (node, data) {' +
					'  self.postMessage(data);' +
					'});',
			onMessage: function (geohackurl) {
				var coords = geourl.parse(tabs.activeTab.url);
				if (coords) {
					tabs.open(geourl.decode(geohackurl, coords));
				}
			}
		});
	}
}

function main(options, callbacks)
{
	createContextMenu();
}

exports.main = main;
