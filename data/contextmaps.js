/*
 * Content script for the context menu with the destination maps.
 */

/*
 * Handle the event when the context menu is about to be shown.
 *
 * Since the geourl lib is not available in this content script (would be
 * possible with duplicating the source during build time, however), the return
 * value cannot be used to control showing/hiding our context menu.
 * So now always true is returned to show the context menu and additionally the
 * URL is sent to the main Add-On script, where changing the ShowMap context
 * menu icon can be done as an indicator whether this is a supported URL.
 */
self.on("context", function (node) {
	var link = node.closest("a[href]");
	if (link)
		self.postMessage({"url": link.href});

	return true;
});

/*
 * Handle the event when a context menu item has been clicked.
 */
self.on("click", function (node, data) {
	// Because of the SelectorContext "a[href]", node is always <a>
	self.postMessage({"url": node.href, "templateurl": data});
});
