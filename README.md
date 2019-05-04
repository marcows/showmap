ShowMap
=======

This is a [Mozilla Firefox](https://www.mozilla.org/firefox/) Add-On which
helps you to open another map from the current map view or from a georeferenced
website.

Exemplary use cases:

* You visit [OpenStreetMap](https://www.openstreetmap.org/) and want to know
  what this map area looks like in another map like *Google Maps*.
* You read the [Burj Khalifa](https://en.wikipedia.org/wiki/Burj_Khalifa)
  Wikipedia article and want to quickly see the location of this building on a
  map of your choice.
* You view a [photo on Flickr](https://www.flickr.com/photos/53970209@N07/45705700935/)
  and want to see where it was taken.

Now you can open that map with just two clicks using your personal list of maps
and without being limited to what the website offers you as map choice. Search
for the *ShowMap* toolbar icon ![in shape of a globe.](/data/icon-32.png)

It is also possible to use the context menu on a map link written somewhere in
the website text. The website as a whole does not have to be georeferenced, but
merely contain links to maps to make use of that feature.

This Add-On is developed with the *Jetpack Add-On SDK* and its *jpm* command line
tool. Unfortunately this SDK is no longer supported and does not work in
current Firefox versions (57 and newer). Mozilla has switched to
*WebExtensions* and dropped the legacy APIs. Of course some day this Add-On
should be converted to be usable with the latest Firefox version, but until
then [Waterfox](https://waterfoxproject.org/) can be used for it.
