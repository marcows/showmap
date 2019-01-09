/**
 * Content script injected to a website to search for geo references containing
 * the geo position of the whole site.
 *
 * @module
 */

/**
 * Geo information belonging to a whole website.
 *
 * @typedef {Object} GeositeInfo
 *
 * @property {GeoHackCoords} coords - map coordinates
 * @property {String} url - Geo URL
 *
 * @global
 */

/**
 * Event to pass a website's geo information to the Add-On.
 *
 * @event geositeinfo
 * @type {GeositeInfo}
 */

"use strict";

var scanners = [
	{
		func: scanGeosite_Wikipedia,
		urlpattern: /^https:\/\/[a-z.]+\.wikipedia\.org\/wiki\//
	},{
		func: scanGeosite_Wikivoyage,
		urlpattern: /^https:\/\/[a-z.]+\.wikivoyage\.org\/wiki\//
	},{
		func: scanGeosite_Flickr,
		urlpattern: /^https:\/\/www\.flickr\.com\/photos\//
	},{
		func: scanGeosite_GeoTag,
		urlpattern: /^(https?|file):\/\//
	}
];

/**
 * Scan a website and return geo information (which might also be passed via
 * event if the DOM is not complete at first).
 *
 * @returns {GeositeInfo} Geo information, undefined if nothing found
 */
function scanGeosite()
{
	var geoinfo;

	// try all scanners matching the URL pattern till success
	for (var i = 0; i < scanners.length; i++) {
		if (scanners[i].urlpattern.test(window.location.href))
			geoinfo = scanners[i].func();

		if (geoinfo)
			break;
	}

	return geoinfo;
}
