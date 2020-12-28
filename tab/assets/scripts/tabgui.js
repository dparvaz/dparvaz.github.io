const editor = ace.edit("tab");
const EditSession = ace.require("ace/edit_session").EditSession;
const SourceNode = document.getElementById("source");
const DeviceNode = document.getElementById("dev");
const NEWSOURCE = "note enter your tab source here";
const modal = document.getElementById("myModal");
const btn = document.getElementById("infoBtn");
const span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function() {
  modal.style.display = "flex";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
  console.log(event.target);
}

let ItemSelection;
let SelectedNode = SourceNode.children[0];
let SourceFiles = Array(SourceNode.children.length).fill(null);
let DeviceFiles = Array(DeviceNode.children.length).fill(null);

for (let i = 0; i < SourceFiles.length; i++) {
	SourceFiles[i] = ace.createEditSession(NEWSOURCE);
	SourceFiles[i].setMode("ace/mode/minitab");
}
for (let i = 0; i < DeviceFiles.length; i++) {
	DeviceFiles[i] = ace.createEditSession("");
	DeviceFiles[i].setMode("ace/mode/text");
}

editor.setTheme("ace/theme/solarized_dark");

for (let child of SourceNode.children) {
	child.addEventListener('click', pickThis);
	child.addEventListener('contextmenu', itemMenu);
}
for (let child of DeviceNode.children) {
	child.addEventListener('click', pickThis);
	child.addEventListener('contextmenu', itemMenu);
}

document.getElementById('tab').style.fontSize='1rem';

editor.setSession(SourceFiles[0]);
editor.gotoLine(0,0);
editor.focus();

editor.commands.removeCommand("showSettingsMenu");

editor.commands.addCommand({
		name: "showKeyboardShortcuts",
		bindKey: {win: "Ctrl-Alt-h", mac: "Command-Alt-h"},
		exec: function(editor) {
				ace.config.loadModule("ace/ext/keybinding_menu", function(module) {
						module.init(editor);
						editor.showKeyboardShortcuts()
				})
		}
})

window.onclick = function(event) {
	var dropdowns = document.getElementsByClassName("dropdown-content");
	var i;
	for (i = 0; i < dropdowns.length; i++) {
		var openDropdown = dropdowns[i];
		if (openDropdown.classList.contains('show')) {
			openDropdown.classList.remove('show');
		}
	}
}


/*
 * addSource() -- add a source file to the list
 */
function addSource() {
	let node;
	let found = false;
	for (node of SourceNode.children) {
		if (node.classList.contains("off")) {
			found = true;
			break;
		}
	}
	if (found) {
		const i =getNodeIndex(node)
		node.classList.remove("off");
	}
}

/*
 * getNodeIndex(mommy, daughter) -- find which one of mommy's children
 * daughter is and return it. return -1 if not found
 */
function getNodeIndex(mommy, daughter) {
	const kids = mommy.children;
	for (let idx = 0; idx < kids.length; idx++) {
		if (kids[idx] == daughter)
			return idx;
	}

	return -1;
}

/*
 * findNode(node) -- find  the index of the node and wheter or not it
 * is a source file
 */
function findNode(node) {
	let idx = getNodeIndex(SourceNode, node);
	if (idx > -1) return [idx, true];
	return [getNodeIndex(DeviceNode, node), false];
}

/*
 * function switchFile(mommy, fileList, oldBusted, newHotness) --
 * switch out files in the editor, saving the old state in fileList.
 * mommy is the DOM object olding the list of fileNames. 
 * newHotness is indexed to mommy's children and 
 * fileList
 */
function switchFiles(oldBusted, newHotness) {
	const [oldIdx, oldIsSource] = findNode(oldBusted);
	const [newIdx, newIsSource] = findNode(newHotness);
	if (oldIsSource) {
		SourceNode.children[oldIdx].classList.remove("selected");
		//SourceFiles[oldIdx] = editor.getValue();
	} else {
		DeviceNode.children[oldIdx].classList.remove("selected");
		//DeviceFiles[oldIdx] = editor.getValue();
	}
	if (newIsSource) {
		editor.setSession(SourceFiles[newIdx]);
		SourceNode.children[newIdx].classList.add("selected");
	} else {
		editor.setSession(DeviceFiles[newIdx]);
		DeviceNode.children[newIdx].classList.add("selected");
	}
	editor.gotoLine(0,0);
}

/*
 * pickThis() -- swap out source files in the editor with the
 * one clocked on
 */
function pickThis() {
	if (this == SelectedNode) return;
	switchFiles(SelectedNode, this);
	SelectedNode = this;
}

/*
 * deleteFile(mommy, fileList, deadFile) -- remove the file indexed
 * deadFile from the DOM and the stored list of files, returns the
 * updated fileList
 */
function deleteFile(mommy, fileList, deadFile) {
	for (let i = deadFile; i < fileList.length-1; i++) {
		fileList[i] = fileList[i + 1]
		mommy.children[i].innerHTML = mommy.children[i + 1].innerHTML;
		mommy.children[i].classList = mommy.children[i + 1].classList;
	}
	mommy.children[mommy.children.length - 1].innerHTML = "untitled";
	mommy.children[mommy.children.length - 1].classList.add("off");
	fileList[fileList.length -1 ] = ace.createEditSession(NEWSOURCE);
	fileList[fileList.length -1 ].setMode("ace/mode/minitab");
	return fileList;
}


/*
 * itemMenu(e) -- create a drop-down menu at this location
 */
function itemMenu(e) {
	e.preventDefault();
	ItemSelection = e.target;
	const[idx, isSource] = findNode(ItemSelection);
	const elemName = (isSource) ? "sourceDropdown" : "deviceDropdown";
	const menu = document.getElementById(elemName);
	menu.style.top = `${e.pageY}px`;
	menu.style.left = `2rem`;
	menu.classList.toggle("show");
}

function openFile (event) {
	const input = event.target;
	const [idx, isSource] = findNode(ItemSelection);
	const reader = new FileReader();
	reader.onload = function(){
		const text = reader.result;
		if (isSource) {
			SourceFiles[idx].setValue(text);
		} else {
			DeviceFiles[idx].setValue(text);
		}
		ItemSelection.innerText = (isSource) ? "" : ItemSelection.id.slice(-1) + "- ";
		ItemSelection.innerText += input.value.split(/(\\|\/)/g).pop();
		/*if (ItemSelection == SelectedNode) {
			editor.setValue(text);
			editor.gotoLine(0, 0);
		} */
	};
	reader.readAsText(input.files[0]);
}

/*
 * printText(printResults) -- if printResults is true, send the file in the 
 * output window to the printer, otherwise, send the contents of the
 * editor
 */
function printText(printResults=true) {
	let text;

	if (printResults) {
		text = document.getElementById("output").innerHTML;
	} else {
		text = editor.session.getValue();
	}

  const printWindow = window.open();
  printWindow.document.open()
  printWindow.document.write('<pre>' + text + '</pre>');
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

/*
 * myClick(o) -- reads to selecting an option from the dropdown
 * menu (from right-clicking on an item in the file list)
 */
function srcClick(o) {
	switch (o.innerText) {
		case "Rename":
			let input = prompt("Enter a new filename", "myprog.mtb");
			if (input === null) {
				input = "";
			} else {
				input = input.trim().substr(0,10);
			}

			if (input != "") {
				if (ItemSelection.classList.contains("device")) {
					input = ItemSelection.id.slice(-1) + "- " + input;
				}
				ItemSelection.innerText = input;
			}
			break;
		case "Delete":
			const name = ItemSelection.innerText
			const idx = getNodeIndex(SourceNode, ItemSelection);
			let sel = getNodeIndex(SourceNode, SelectedNode);
			if (SourceFiles.length == 1) break;
			if (confirm("Are you sure you want to delete " + name + "?")) {
				const isLast = idx == SourceFiles.length -1;
				const newIdx = (isLast) ? idx - 1 : idx + 1;
				if (idx == sel) {
					switchFiles(SelectedNode, SourceNode.children[newIdx]);
					SourceFiles = deleteFile(SourceNode, SourceFiles, idx);
					if (isLast) sel--;
				} else if (idx < sel) {
					SourceFiles = deleteFile(SourceNode, SourceFiles, idx)
					sel--;
				} else {
					SourceFiles = deleteFile(SourceNode, SourceFiles, idx);
				}
					SelectedNode = SourceNode.children[sel];
					SelectedNode.classList.add("selected");
					editor.setSession(SourceFiles[sel]);
					
			}
			break;
		case "Upload":
			document.getElementById("fileread").click();
			break;
		case "Open":
			const [index, isSource] = findNode(ItemSelection);
			const dir = "./assets/fs/" + (isSource) ? "src" : "data";
			const fs = require('fs');
			fs.readdir(dir, (err, files) => {
				files.forEach(file => {
					console.log(file);
				});
			})
			break;
		default:
			break;
	}
}
