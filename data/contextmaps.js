/*
 * Content script for the context menu with the destination maps.
 */

/*
 * Handle the event when a context menu item has been clicked.
 */
self.on("click", function (node, data) {
	// Because of the SelectorContext "a[href]", node is always <a>
	self.postMessage({"url": node.href, "templateurl": data});
});
