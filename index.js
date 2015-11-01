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
 * @property {String} enabled - enabled or disabled in configuration
 */

/**
 * Event to pass destination maps around.
 *
 * @event destmaps
 * @type {DestinationsMaps}
 */

var preferences = require("sdk/simple-prefs");
var tabs = require("sdk/tabs");
var contextMenu = require("sdk/context-menu");
var contextMenuitems = [];

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

/**
 * Create and show the page for editing the destination maps.
 *
 * @fires destmaps
 * @listens destmaps
 */
function createAndShowEditmaps()
{
	var editmapsPanel = require("sdk/panel").Panel({
		width: 600,
		height: 400,
		contentURL: "./editmaps.html",
		contentScriptFile: "./editmaps.js",
		contextMenu: true
	});

	editmapsPanel.on("show", function() {
		editmapsPanel.port.emit("destmaps", JSON.parse(preferences.prefs.destmaps));
	});

	editmapsPanel.on("hide", function() {
		editmapsPanel.destroy();
	});

	editmapsPanel.port.on("destmaps", function(newDestMaps) {
		preferences.prefs.destmaps = JSON.stringify(newDestMaps);
	});

	editmapsPanel.show();
}

// recreate the context menu when preference of destination URLs changed
preferences.on("destmaps", function() {
	createContextMenu();
});

/* items always visible for simplicity */

function createContextMenu()
{
	var destinationUrls = JSON.parse(preferences.prefs.destmaps);

	// first clear existing context menu items
	contextMenuitems.forEach(function(element) {
		element.destroy();
	});

	for (var i = 0; i < destinationUrls.length; i++) {
		if (destinationUrls[i].enabled) {
			contextMenuitems[i] = contextMenu.Item({
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
}

function main(options, callbacks)
{
	initDestMaps();

	preferences.on("editmaps", createAndShowEditmaps);

	createContextMenu();
}

exports.main = main;
