/**
 * Calculations for GeoHack compatible map coordinates.
 *
 * @module
 */

/**
 * GeoHack compatible map coordinates.
 *
 * @see https://www.mediawiki.org/wiki/Toolserver:GeoHack
 *
 * @typedef {Object} GeoHackCoords
 *
 * @property {Number} latdegdec - latitude
 * @property {Number} londegdec - longitude
 * @property {Number} scale - map scale
 * @property {Number} osmzoom - zoom
 *
 * @global
 */

/**
 * Calculate missing elements of the GeoHack compatible map coordinates.
 *
 * @param {GeoHackCoords} coords - GeoHack compatible map coordinates, partial
 *
 * @returns {GeoHackCoords} GeoHack compatible map coordinates, completed
 */
function completeMapCoords(coords)
{
	/*
	 * For osmzoom=19, scale=1000 (for a map scale of 1:1000).
	 * For each subsequent level of osmzoom, scale will be doubled, i.e.
	 * for osmzoom=18, scale=2000.
	 *
	 * See also https://wiki.openstreetmap.org/wiki/Zoom_levels
	 */
	if (coords.osmzoom !== undefined) {
		// scale = 2 ^ (19 - osmzoom) * 1000
		coords.scale = Math.pow(2, 19 - coords.osmzoom) * 1000
	} else if (coords.scale !== undefined && coords.scale > 0) {
		// osmzoom = 19 - log2 (scale / 1000)
		coords.osmzoom = 19 - Math.round(Math.log(coords.scale / 1000) / Math.log(2));
	}

	return coords;
}

exports.complete = completeMapCoords;
