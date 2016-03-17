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
var browserWindows = require("sdk/windows").browserWindows;
var tabs = require("sdk/tabs");

var geourl = require("./lib/geourl.js");

var iconsDisabled = {
	"16": "./icon-disabled-16.png",
	"32": "./icon-disabled-32.png",
	"64": "./icon-disabled-64.png"
};

var iconsEnabled = {
	"16": "./icon-16.png",
	"32": "./icon-32.png",
	"64": "./icon-64.png"
};

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
		tabs.removeListener("deactivate", hideEditmapsPanel);
		tabs.removeListener("close", hideEditmapsPanel);

		editmapsPanel.destroy();
	});

	editmapsPanel.port.on("destmaps", function(newDestMaps) {
		preferences.prefs.destmaps = JSON.stringify(newDestMaps);
	});

	function hideEditmapsPanel()
	{
		// Already remove the listeners here to avoid triggering the
		// second event ("deactivate" and "close" both occur when
		// closing a window) before the "hide" event handler and risk
		// accessing the destroyed panel.
		tabs.removeListener("deactivate", hideEditmapsPanel);
		tabs.removeListener("close", hideEditmapsPanel);

		editmapsPanel.hide();
	}

	// The panel should vanish when leaving the about:addon page via key shortcut.
	tabs.on("deactivate", hideEditmapsPanel);
	tabs.on("close", hideEditmapsPanel);

	editmapsPanel.show();
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
		disabled: true,
		icon: iconsDisabled
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
		usemapsPanel.resize(w, h);
	});
}

function updateShowmapButtonState()
{
	if (geourl.parse(tabs.activeTab.url)) {
		showmapButton.disabled = false;
		showmapButton.icon = iconsEnabled;
	} else {
		showmapButton.disabled = true;
		showmapButton.icon = iconsDisabled;
		usemapsPanel.hide();
	}
}

/*
 * Setup of tab related events to control the showmap toggle button
 * enabled/disabled state.
 */
function setupShowmapButtonTabEvents()
{
	// to detect tab or window switch
	tabs.on("activate", function(tab) {
		if (tab.readyState === "interactive" || tab.readyState === "complete") {
			updateShowmapButtonState();
		}
	});

	// to detect DOM is ready after navigation
	tabs.on("ready", function(tab) {
		if (tab === tabs.activeTab) {
			updateShowmapButtonState();
		}
	});

	// to detect page loaded from cache
	tabs.on("pageshow", function(tab) {
		if (tab === tabs.activeTab) {
			updateShowmapButtonState();
		}
	});

	// to detect address/location bar change
	const {modelFor} = require("sdk/model/core");
	const {viewFor} = require("sdk/view/core");
	const {getBrowserForTab, getTabForContentWindow} = require("sdk/tabs/utils");
	const {Ci, Cu} = require("chrome");
	Cu.import("resource://gre/modules/XPCOMUtils.jsm", this);

	var progressListener = {
		QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener", "nsISupportsWeakReference"]),
		// Do not use aURI because this will not be the URI of the tab
		// when clicked on an #anchor link inside a frame.
		onLocationChange: function(aProgress, aRequest, aURI, aFlags) {
			if (aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT) {
				if (modelFor(getTabForContentWindow(aProgress.DOMWindow)) === tabs.activeTab) {
					updateShowmapButtonState();
				}
			}
		}
	};

	function addProgressListenerToTab(tab)
	{
		var lowLevel = viewFor(tab);
		var browser = getBrowserForTab(lowLevel);
		browser.addProgressListener(progressListener);
	}

	addProgressListenerToTab(tabs.activeTab);

	tabs.on("open", function(newTab) {
		addProgressListenerToTab(newTab);
	});

	browserWindows.on("open", function(newWindow) {
		addProgressListenerToTab(newWindow.tabs[0]);
	});
}

function main(options, callbacks)
{
	initDestMaps();

	preferences.on("editmaps", createAndShowEditmaps);

	createShowmapButton();
	createUsemapsPanel();
	setupShowmapButtonTabEvents();
}

exports.main = main;
