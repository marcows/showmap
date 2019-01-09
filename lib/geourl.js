/**
 * Parser for map URIs.
 *
 * @module
 */

"use strict";

var parsers = [
	parseGeoURL_GeoURI,
	parseGeoURL_OSMnewstyle,
	parseGeoURL_GoogleMaps,
	parseGeoURL_OSMoldstyle,
	parseGeoURL_OSRM,
	parseGeoURL_GeoHack,
];

/*
 * Parser for Geo URI scheme.
 *
 * Specification see:
 * http://geouri.org/
 * http://tools.ietf.org/rfc/rfc5870
 *
 * Prototype see {@link parseGeoURL}.
 *
 * Examples:
 * geo:-54.0253,-68.6165
 */
function parseGeoURL_GeoURI(uri)
{
	var latlon;

	latlon = uri.match(/^geo:(-?[0-9.]+),(-?[0-9.]+)/);

	if (latlon) {
		return {
			latdegdec: parseFloat(latlon[1]),
			londegdec: parseFloat(latlon[2])
		};
	}

	return null;
}

/*
 * Parser for new style OpenStreetMap URL.
 *
 * Prototype see {@link parseGeoURL}.
 *
 * Examples:
 * http://www.openstreetmap.org/#map=5/51.500/-0.100
 * http://tools.geofabrik.de/mc/#5/19.2325/40.6165&num=2&mt0=mapnik&mt1=google-map
 * https://hiking.waymarkedtrails.org/#?map=8!49.054!9.6736
 */
function parseGeoURL_OSMnewstyle(uri)
{
	var latlonzoom;

	latlonzoom = uri.match(/#(\??map=)?([0-9]+)[/!](-?[0-9.]+)[/!](-?[0-9.]+)/);

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
 * https://maps.openrouteservice.org/directions?n1=49.409445&n2=8.692953&n3=13&b=0&k1=en-US&k2=km
 * https://www.flickr.com/map/?fLat=41.360536&fLon=2.027299&zl=13&everyone_nearby=1
 */
function parseGeoURL_OSMoldstyle(uri)
{
	var lat, lon, zoom;

	zoom = uri.match(/[?&](zoom|z|n3|zl)=([0-9]+)/);
	lat = uri.match(/[?&](lat|y|n1|fLat)=(-?[0-9.]+)/);
	lon = uri.match(/[?&](lon|x|n2|fLon)=(-?[0-9.]+)/);

	if (zoom && lat && lon) {
		return {
			osmzoom:   parseInt(zoom[2], 10),
			latdegdec: parseFloat(lat[2]),
			londegdec: parseFloat(lon[2])
		};
	}

	return null;
}

/*
 * Parser for OSRM style URL.
 *
 * Prototype see {@link parseGeoURL}.
 *
 * Examples:
 * http://map.project-osrm.org/?z=14&center=2.162977%2C117.512856&hl=en&alt=0
 * https://www.bing.com/maps?cp=-54.23653~-36.675849&lvl=10&style=h
 */
function parseGeoURL_OSRM(uri)
{
	var decuri;
	var latlon, zoom;

	decuri = decodeURIComponent(uri);

	zoom = decuri.match(/[?&](?:z|lvl)=([0-9]+)/);
	latlon = decuri.match(/[?&](?:center|cp)=(-?[0-9.]+)[,~](-?[0-9.]+)/);

	if (zoom && latlon) {
		return {
			osmzoom:   parseInt(zoom[1], 10),
			latdegdec: parseFloat(latlon[1]),
			londegdec: parseFloat(latlon[2])
		};
	}

	return null;
}

/*
 * Parser for GeoHack URL
 *
 * Partly derived from "Replacement script" released into the Public Domain:
 * https://www.mediawiki.org/wiki/GeoHack/Replacement_script
 *
 * Prototype see {@link parseGeoURL}.
 *
 * Examples:
 * https://tools.wmflabs.org/geohack/geohack.php?params=48.858222_N_2.2945_E_dim:250_region:FR-75_type:landmark&pagename=Eiffelturm&language=de
 * https://tools.wmflabs.org/geohack/geohack.php?pagename=Puerto_Montt&params=41_28_S_72_56_W_region:CL-LL_type:city(245902)
 * https://de.wikivoyage.org/w/index.php?title=Spezial:Kartenherkunft&params=35.68_N_139.76_E_scale%3A70000_dim%3A10000_globe%3Aearth_region%3AJP&locname=Tokio
 */
function parseGeoURL_GeoHack(uri)
{
	var latlon;

	latlon = decodeURIComponent(uri).match(/[?&]params=(-?[0-9.]+)_([0-9.]*)_?([0-9.]*)_?([NS])_(-?[0-9.]+)_([0-9.]*)_?([0-9.]*)_?([EWO])([^&]*)/);

	if (latlon) {
		var details, result;
		var lat, lon, scale;

		// more details: globe, type, dim, scale
		details = latlon[9];

		// abort if not on earth
		if(/_globe:(?!(earth|)(_|$))/i.test(details))
			return null;

		lat = (Math.abs(parseFloat(latlon[1])) + (latlon[2] || 0) / 60.0 + (latlon[3] || 0) / 3600.0) * Math.sign(parseFloat(latlon[1]));
		lon = (Math.abs(parseFloat(latlon[5])) + (latlon[6] || 0) / 60.0 + (latlon[7] || 0) / 3600.0) * Math.sign(parseFloat(latlon[5]));

		// North/South
		if (latlon[4] === "S")
			lat *= -1;

		// East/West
		if (latlon[8] === "W")
			lon *= -1;

		// type
		if (/_type:(country|satellite)(_|$)/.test(details))
			scale = 10000000; // 10 million
		else if (/_type:(state)(_|$)/.test(details))
			scale = 3000000; // 3 million
		else if (/_type:(adm1st)(_|$)/.test(details))
			scale = 1000000; // 1 million
		else if (/_type:(adm2nd)(_|$)/.test(details))
			scale = 300000; // 300 thousand
		// for city and isle there is an optional "(population)"
		else if (/_type:(adm3rd|city(\([0-9]+\))?|mountain|isle(\([0-9]+\))?|river|waterbody)(_|$)/.test(details))
			scale = 100000; // 100 thousand
		else if (/_type:(event|forest|glacier)(_|$)/.test(details))
			scale = 50000; // 50 thousand
		else if (/_type:(airport)(_|$)/.test(details))
			scale = 30000; // 30 thousand
		else if (/_type:(camera|edu|pass|landmark|railwaystation)(_|$)/.test(details))
			scale = 10000; // 10 thousand
		// do not adopt the default GeoHack scale
		//else
		//	scale = 300000; // 300 thousand

		// dim (size of object)
		result = details.match(/_dim:([0-9.]+)(km|m)?/);
		if (result)
			scale = result[1] * (result[2] === "km" ? 10000 : 10);

		// scale (map scale)
		result = details.match(/_scale:([0-9]+)/);
		if (result)
			scale = parseInt(result[1]);

		if (scale === undefined) {
			return {
				latdegdec: lat,
				londegdec: lon
			};
		} else {
			return {
				latdegdec: lat,
				londegdec: lon,
				scale:     scale
			};
		}
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
