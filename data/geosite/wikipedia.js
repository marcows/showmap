/*
 * Part of content script {@link module:data/geosite}.
 */

/*
 * Scanner for Wikipedia.
 *
 * Prototype see {@link scanGeosite}.
 */
function scanGeosite_Wikipedia()
{
	var geoinfo;
	var link;

	/*
	 * At first search for the widespread GeoHack link
	 *
	 * In websites:
	 * https://en.wikipedia.org/wiki/Burj_Khalifa
	 * https://en.m.wikipedia.org/wiki/Burj_Khalifa
	 * https://ru.wikipedia.org/wiki/%D0%91%D1%83%D1%80%D0%B4%D0%B6-%D0%A5%D0%B0%D0%BB%D0%B8%D1%84%D0%B0
	 */
	link = document.querySelector("a.external.text[href*='geohack']");

	if (link) {
		geoinfo = {};
		geoinfo.url = link.href;
	}

	/*
	 * Then search for MediaWiki Kartographer maplink
	 *
	 * In websites:
	 * https://fr.wikipedia.org/wiki/Burj_Khalifa
	 * https://ru.wikipedia.org/wiki/%D0%91%D1%83%D1%80%D0%B4%D0%B6-%D0%A5%D0%B0%D0%BB%D0%B8%D1%84%D0%B0
	 */
	if (!geoinfo) {
		link = document.querySelector("a.mw-kartographer-maplink");

		if (link && link.hasAttribute("data-lat") && link.hasAttribute("data-lon")) {
			geoinfo = {};
			geoinfo.coords = {
				latdegdec: parseFloat(link.getAttribute("data-lat")),
				londegdec: parseFloat(link.getAttribute("data-lon"))
			};

			if (link.hasAttribute("data-zoom"))
				geoinfo.coords.osmzoom = parseInt(link.getAttribute("data-zoom"));
		}
	}

	return geoinfo;
}
