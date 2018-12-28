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

var scanners = [
	{
		func: scanGeosite_GeoTag,
		urlpattern: /.*/
	}
];

/**
 * Scan a website and return geo information.
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
