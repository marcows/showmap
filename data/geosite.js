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
 *
 * @global
 */

var scanners = [
	scanGeosite_GeoTag,
];

/**
 * Scan a website and return geo information.
 *
 * @returns {GeositeInfo} Geo information, undefined if nothing found
 */
function scanGeosite()
{
	var geoinfo;

	// try all scanners till success
	for (var i = 0; i < scanners.length; i++) {
		geoinfo = scanners[i]();
		if (geoinfo)
			break;
	}

	return geoinfo;
}
