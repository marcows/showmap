/*
 * UI panel associated to the whole site.
 * It consists of links to the destination maps.
 */

/**
 * Event to pass GeoHack compatible template URI to the Add-On.
 *
 * @event linkpress
 * @type {String}
 */

/**
 * Event to pass the required panel size to the Add-On.
 * Takes 2 parameters: width, height
 *
 * @event pagesize
 */

"use strict";

/**
 * Handle a click on a panel link.
 *
 * @param {Event} ev - click event
 *
 * @fires linkpress
 */
function handleLinkClick(ev)
{
	ev.preventDefault();
	self.port.emit("linkpress", this.href);
}

/**
 * Add a link to the panel.
 *
 * @param {String} name - link name
 * @param {String} uri - link URI
 */
function addLink(name, uri)
{
	var item = document.createElement("li");
	var link = document.createElement("a");

	link.textContent = name;
	link.href = uri;
	link.className = "maplink";
	link.addEventListener("click", handleLinkClick, false);

	item.appendChild(link);
	document.getElementById("listcontainer").appendChild(item);
}

/**
 * Add links for all enabled destination maps to the panel.
 *
 * @param {DestinationMaps} destMaps - destination maps
 *
 * @fires pagesize
 */
function createLinks(destMaps)
{
	var listcontainer = document.getElementById("listcontainer");

	// Empty the link list first
	while (listcontainer.firstChild) {
		listcontainer.firstChild.remove();
	}

	// Recreate the link list
	for (var i = 0; i < destMaps.length; i++) {
		if (destMaps[i].enabled)
			addLink(destMaps[i].name, destMaps[i].templateurl);
	}

	// Post new size
	self.port.emit("pagesize", listcontainer.scrollWidth, listcontainer.scrollHeight);
}

self.port.on("destmaps", createLinks);
