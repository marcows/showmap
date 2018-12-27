/*
 * Part of content script {@link module:data/geosite}.
 */

/*
 * Scanner for geo tags.
 *
 * Prototype see {@link scanGeosite}.
 *
 * Examples:
 * <meta name="geo.position" content="47.4287259811;12.5417947769" />
 * <meta name="icbm" content="47.4287259811, 12.5417947769" />
 *
 * In websites:
 * http://de.locr.com/photo_detail.php?id=14122808
 */
function scanGeosite_GeoTag()
{
	var geoinfo;
	var geotag, latlon;

	geotag = document.querySelector("head > meta[name='geo.position' i], head > meta[name='icbm' i]");

	if (geotag && geotag.content) {
		latlon = geotag.content.match(/(-?[0-9.]+)[,;]\s*(-?[0-9.]+)/);

		if (latlon) {
			geoinfo = {};
			geoinfo.coords = {
				latdegdec: parseFloat(latlon[1]),
				londegdec: parseFloat(latlon[2])
			};
		}
	}

	return geoinfo;
}
