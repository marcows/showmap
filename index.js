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

var preferences = require("sdk/simple-prefs");
var tabs = require("sdk/tabs");
var contextMenu = require("sdk/context-menu");

var geourl = require("./lib/geourl.js");

/**
 * Set default destination maps in the preferences if not yet defined or empty.
 *
 * The defaults will be set on Add-On loading
 * - after first installation
 * - after manual deletion in about:config
 *
 * This function is needed because preferences of type "object" are not
 * supported by the simple-prefs system and using the stringified
 * representation in packages.json would be pretty ugly.
 */
function initDestMaps()
{
	if (!preferences.prefs.destmaps) {
		preferences.prefs.destmaps = JSON.stringify(require("./destmaps.json"));
	}
}

/* items always visible for simplicity */

function createContextMenu()
{
	var destinationUrls = JSON.parse(preferences.prefs.destmaps);

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
	initDestMaps();

	createContextMenu();
}

exports.main = main;
