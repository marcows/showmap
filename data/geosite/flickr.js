/*
 * Part of content script {@link module:data/geosite}.
 */

/*
 * Scanner for Flickr photo site.
 *
 * Prototype see {@link scanGeosite}.
 *
 * In websites:
 * https://www.flickr.com/photos/53970209@N07/45705700935/
 */
function scanGeosite_Flickr()
{
	/*
	 * Search for Flickr map link
	 *
	 * @returns {GeositeInfo} Geo information, undefined if nothing found
	 */
	function findGeoinfo()
	{
		var geoinfo;
		var link;

		link = document.querySelector(".map-container a[href]");

		if (link) {
			geoinfo = {};
			geoinfo.url = link.href;
		}

		return geoinfo;
	}

	/*
	 * Set up observer to search when the EXIF related DOM element has been
	 * created.
	 *
	 * @fires geositeinfo
	 */
	function observeGeoinfo()
	{
		var callback = function(mutationsList, observer) {
			for (var mutation of mutationsList) {
				if (mutation.type === "childList") {
					var geoinfo = findGeoinfo();
					if (geoinfo) {
						observer.disconnect();
						self.port.emit("geositeinfo", geoinfo);
					}
				}
			}
		};
		var observer = new MutationObserver(callback);
		var content = document.querySelector("div.photo-charm-exif-scrappy-view");
		var config = { childList: true };

		if (content)
			observer.observe(content, config);
	}

	var geoinfo = findGeoinfo();

	if (!geoinfo)
		observeGeoinfo();

	return geoinfo;
}
