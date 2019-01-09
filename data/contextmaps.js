/*
 * Content script for the context menu with the destination maps.
 */

"use strict";

/*
 * Handle the event when a context menu item has been clicked.
 */
self.on("click", function (node, data) {
	var link = node.closest("a[href]");
	if (link)
		self.postMessage({"url": link.href, "templateurl": data});
});
