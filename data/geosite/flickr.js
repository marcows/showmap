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
	var geoinfo;
	var link;

	link = document.querySelector(".map-container a[href]");

	if (link) {
		geoinfo = {};
		geoinfo.url = link.href;
	}

	return geoinfo;
}
