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

var showmapButton;
var usemapsPanel;

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

/**
 * Create the toggle button for opening destination maps from the current
 * website.
 *
 * The button is visible all the time, in disabled or enabled state depending
 * on whether the website is detected as a supported source.
 */
function createShowmapButton()
{
	var { ToggleButton } = require("sdk/ui/button/toggle");

	showmapButton = ToggleButton({
		id: "showmapButton",
		label: "Show map",
		icon: {
			"16": "./icon-16.png",
			"32": "./icon-32.png",
			"64": "./icon-64.png"
		}
	});

	// Show or hide the panel when clicking the button.
	showmapButton.on("click", function(state) {
		if (state.checked) {
			usemapsPanel.show();
		} else {
			usemapsPanel.hide();
		}
	});
}

/**
 * Create the panel with the list of links for opening destination maps from
 * the current website.
 *
 * The panel is shown on click of the toggle button.
 *
 * @fires destmaps
 * @listens linkpress
 * @listens pagesize
 */
function createUsemapsPanel()
{
	usemapsPanel = require("sdk/panel").Panel({
		contentURL: "./usemaps.html",
		contentScriptFile: "./usemaps.js",
		position: showmapButton
	});

	// Send the current destination maps to the panel script when showing
	// the panel.
	usemapsPanel.on("show", function() {
		usemapsPanel.port.emit("destmaps", JSON.parse(preferences.prefs.destmaps));
	});

	// Update the button state when hiding the panel.
	usemapsPanel.on("hide", function() {
		showmapButton.state("window", {checked: false});
	});

	usemapsPanel.port.on("linkpress", function(url) {
		var coords = geourl.parse(tabs.activeTab.url);
		if (coords) {
			tabs.open(geourl.decode(url, coords));
		}
		usemapsPanel.hide();
	});

	usemapsPanel.port.on("pagesize", function(w, h) {
		// The width was reduced by 16 px on each change, so keep the default.
		usemapsPanel.resize(usemapsPanel.width, h + 30);
	});
}

function main(options, callbacks)
{
	initDestMaps();

	preferences.on("editmaps", createAndShowEditmaps);

	createContextMenu();

	createShowmapButton();
	createUsemapsPanel();
}

exports.main = main;
