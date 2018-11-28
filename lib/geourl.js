/**
 * Parser for map URIs.
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
 * @property {Number} osmzoom - zoom
 *
 * @global
 */

var parsers = [
	parseGeoURL_OSMnewstyle,
	parseGeoURL_GoogleMaps,
	parseGeoURL_OSMoldstyle,
];

/*
 * Parser for new style OpenStreetMap URL.
 *
 * Prototype see {@link parseGeoURL}.
 *
 * Examples:
 * http://www.openstreetmap.org/#map=5/51.500/-0.100
 * http://tools.geofabrik.de/mc/#5/19.2325/40.6165&num=2&mt0=mapnik&mt1=google-map
 */
function parseGeoURL_OSMnewstyle(uri)
{
	var latlonzoom;

	latlonzoom = uri.match(/#(map=)?([0-9]+)\/(-?[0-9.]+)\/(-?[0-9.]+)/);

	if (latlonzoom) {
		return {
			osmzoom:   parseInt(latlonzoom[2], 10),
			latdegdec: parseFloat(latlonzoom[3]),
			londegdec: parseFloat(latlonzoom[4])
		};
	}

	return null;
}

/*
 * Parser for Google Maps URL.
 *
 * Prototype see {@link parseGeoURL}.
 *
 * Examples:
 * https://www.google.com/maps/@37.0625,-95.677068,4.25z
 * http://maps.skobbler.com/@65.8926803,128.2324219,4/categorySearch
 */
function parseGeoURL_GoogleMaps(uri)
{
	var latlonzoom;

	latlonzoom = uri.match(/@(-?[0-9.]+),(-?[0-9.]+),([0-9.]+)z?\b/);

	if (latlonzoom) {
		return {
			latdegdec: parseFloat(latlonzoom[1]),
			londegdec: parseFloat(latlonzoom[2]),
			// Google allows zooming via mousewheel in 0.25 step resolution,
			// but only natural numbers can be used for opening the site.
			// Round down .25 and .5, round up .75
			osmzoom:   parseInt(parseFloat(latlonzoom[3]) + 0.4, 10)
		};
	}

	return null;
}

/*
 * Parser for old style OpenStreetMap permalink URL.
 *
 * Prototype see {@link parseGeoURL}.
 *
 * Examples:
 * http://keepright.at/report_map.php?zoom=14&lat=47.6941&lon=9.0695
 * http://mc.bbbike.org/mc/?lon=24.893338&lat=67.874522&zoom=15
 * http://mapy.cz/zakladni?x=15.6252330&y=49.8022514&z=8
 * http://wikimapia.org/#lang=de&lat=48.777913&lon=8.081818&z=10&m=w
 */
function parseGeoURL_OSMoldstyle(uri)
{
	var lat, lon, zoom;

	zoom = uri.match(/[?&](zoom|z)=([0-9]+)/);
	lat = uri.match(/[?&](lat|y)=(-?[0-9.]+)/);
	lon = uri.match(/[?&](lon|x)=(-?[0-9.]+)/);

	if (zoom && lat && lon) {
		return {
			osmzoom:   parseInt(zoom[2], 10),
			latdegdec: parseFloat(lat[2]),
			londegdec: parseFloat(lon[2])
		};
	}

	return null;
}

/**
 * Parse an URI and return map coordinates (latitude, longitude, scale/zoom).
 *
 * @param {String} uri - valid URI
 *
 * @returns {GeoHackCoords} GeoHack compatible map coordinates, null on failure
 */
function parseGeoURL(uri)
{
	var coords;

	if (!uri)
		return null;

	// try all parsers till success
	for (var i = 0; i < parsers.length; i++) {
		coords = parsers[i](uri);
		if (coords)
			break;
	}

	return coords;
}

/**
 * Decode the GeoHack compatible template URI using the given coordinates.
 *
 * @param {String} geohackuri - GeoHack compatible template URI
 * @param {GeoHackCoords} coords - GeoHack compatible map coordinates
 *
 * @returns {String} valid URI
 */
function decodeGeoTemplateURI(geohackuri, coords)
{
	function getKeyValue(match, p1)
	{
		return coords[p1];
	}

	// replace {key} by the corresponding value, allowing escaped ASCII
	var decodeduri = decodeURI(geohackuri).replace(/{([a-zA-Z0-9_]+)}/g, getKeyValue);

	return decodeduri;
}

exports.parse = parseGeoURL;
exports.decode = decodeGeoTemplateURI;
