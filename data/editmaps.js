/*
 * UI for configuring and selecting the used destination maps.
 */

var draggedEl;

function handleDragStart(ev)
{
	this.classList.add("dragsrc");

	draggedEl = this;

	ev.dataTransfer.effectAllowed = "move";
	ev.dataTransfer.setData("text/html", null);
}

function handleDragEnd(ev)
{
	this.classList.remove("dragsrc");
}

function handleDragOver(ev)
{
	ev.preventDefault();
	ev.dataTransfer.dropEffect = "move";
}

function handleDrop(ev)
{
	ev.preventDefault();

	if (draggedEl != this) {
		// move the drag row into the drop row
	        var tablebody = document.getElementById("tablebody");

		if (draggedEl.parentNode.compareDocumentPosition(this.parentNode) & Node.DOCUMENT_POSITION_FOLLOWING) {
			// move down
			tablebody.insertBefore(draggedEl.parentNode, this.parentNode.nextSibling);
		} else {
			// move up
			tablebody.insertBefore(draggedEl.parentNode, this.parentNode);
		}
		updatePrefs();
	}
}

function updatePrefs()
{
	var newDestMaps = [];
	var i = 0;
	var tablebody = document.getElementById("tablebody");
	var tablerows = tablebody.getElementsByTagName("tr");
	[].forEach.call(tablerows, function(tablerow) {
		var e = tablerow.getElementsByClassName("enable")[0].checked;
		var n = tablerow.getElementsByClassName("name")[0].value;
		var u = tablerow.getElementsByClassName("url")[0].value;

		if (n && u) {
			newDestMaps[i++] = {
				name: n,
				templateurl: u,
				enabled: e
			};
		}
	});
	self.port.emit("destmaps", newDestMaps);
}

function deleteRow(el)
{
	el.remove();
	updatePrefs();
}

function addRow(name, url, enabled)
{
	var tablebody = document.getElementById("tablebody");

	var tablerow = document.createElement("tr");
	var input, cell;

	// enable/disable
	input = document.createElement("input");
	input.className = "enable";
	input.type = "checkbox";
	input.checked = enabled;
	input.addEventListener("click", updatePrefs, false);
	cell = document.createElement("td");
	cell.appendChild(input);
	tablerow.appendChild(cell);

	// name
	input = document.createElement("input");
	input.className = "name";
	input.value = name;
	input.addEventListener("input", updatePrefs, false);
	cell = document.createElement("td");
	cell.appendChild(input);
	cell.draggable = true;
	cell.addEventListener("dragstart", handleDragStart, false);
	cell.addEventListener("dragend", handleDragEnd, false);
	cell.addEventListener("dragover", handleDragOver, false);
	cell.addEventListener("drop", handleDrop, false);
	tablerow.appendChild(cell);

	// url
	input = document.createElement("input");
	input.className = "url";
	input.value = url;
	input.size = 35;
	input.addEventListener("input", updatePrefs, false);
	cell = document.createElement("td");
	cell.appendChild(input);
	tablerow.appendChild(cell);

	// delete
	input = document.createElement("input");
	input.className = "delete";
	input.type = "button";
	input.value = "x";
	input.addEventListener("click", function() { deleteRow(tablerow); }, false);
	cell = document.createElement("td");
	cell.appendChild(input);
	tablerow.appendChild(cell);

	tablebody.appendChild(tablerow);
}

function addEmptyRow()
{
	addRow("", "", true);
}

function createTableContent(destMaps)
{
	var tablebody = document.getElementById("tablebody");

	while (tablebody.firstChild) {
		tablebody.firstChild.remove();
	}

	for (var i = 0; i < destMaps.length; i++) {
		addRow(destMaps[i].name, destMaps[i].templateurl, destMaps[i].enabled);
	}
}

document.getElementById("add").addEventListener("click", addEmptyRow, false);
self.port.on("destmaps", createTableContent);
