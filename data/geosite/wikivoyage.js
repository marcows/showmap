/*
 * Part of content script {@link module:data/geosite}.
 */

"use strict";

/*
 * Scanner for Wikivoyage.
 *
 * Prototype see {@link scanGeosite}.
 */
function scanGeosite_Wikivoyage()
{
	var geoinfo;
	var selector, element;

	/*
	 * At first search for Wikivoyage mapframe
	 *
	 * In websites:
	 * https://nl.wikivoyage.org/wiki/Rome
	 * https://it.wikivoyage.org/wiki/Roma
	 */
	selector = "#mapdiv";
	element = document.querySelector(selector);

	if (element && element.hasAttribute("data-lat") && element.hasAttribute("data-long")) {
		geoinfo = {};
		geoinfo.coords = {
			latdegdec: parseFloat(element.getAttribute("data-lat")),
			londegdec: parseFloat(element.getAttribute("data-long"))
		};

		if (element.hasAttribute("data-zoom"))
			geoinfo.coords.osmzoom = parseInt(element.getAttribute("data-zoom"));
	}

	/*
	 * Then search for a GeoHack or Wikivoyage Map (PoiMap2) link
	 *
	 * In websites:
	 * https://de.wikivoyage.org/wiki/Rom
	 * https://sv.wikivoyage.org/wiki/Rom
	 * https://fa.wikivoyage.org/wiki/%D8%B1%D9%85
	 */
	if (!geoinfo) {
		selector = "#mw-indicator-i3-geo a[href]"
			+ ", #mw-indicator-coordinates a[href]"
			+ ", #geoCoord a[href]";
		element = document.querySelector(selector);

		if (element) {
			geoinfo = {};
			geoinfo.url = element.href;
		}
	}

	/*
	 * Then search for MediaWiki Kartographer mapframe/maplink
	 *
	 * Caution: maplinks can also be used in the text to point to POIs in a
	 * city article for example.
	 *
	 * In websites:
	 * https://fi.wikivoyage.org/wiki/Rooma
	 * https://ru.wikivoyage.org/wiki/%D0%A0%D0%B8%D0%BC
	 */
	if (!geoinfo) {
		selector = ".mw-kartographer-container a.mw-kartographer-map"
			+ ", #mw-indicator-geo a.mw-kartographer-maplink";
		element = document.querySelector(selector);

		if (element && element.hasAttribute("data-lat") && element.hasAttribute("data-lon")) {
			geoinfo = {};
			geoinfo.coords = {
				latdegdec: parseFloat(element.getAttribute("data-lat")),
				londegdec: parseFloat(element.getAttribute("data-lon"))
			};

			if (element.hasAttribute("data-zoom"))
				geoinfo.coords.osmzoom = parseInt(element.getAttribute("data-zoom"));
		}
	}

	return geoinfo;
}
