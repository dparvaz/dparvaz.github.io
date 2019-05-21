const books = ["Genesis|בראשית|01|50", "Exodus|שמות|02|40", "Leviticus|ויקרא|03|27", "Numbers|במדבר|04|36", "Deuteronomy|דברים|05|34", "Joshua|יהושוע|06|24", "Judges|שופטים|07|21", "I Samuel|שמואל א|08a|31", "II Samuel|שמואל ב|08b|24", "I Kings|מלכים א|09a|22", "II Kings|מלכים ב|09b|25", "Isaiah|ישעיהו|10|66", "Jeremiah|ירמיהו|11|52", "Ezekiel|יחזקאל|12|48", "Hosea|הושע|13|14", "Joel|יואל|14|3", "Amos|עמוס|15|9", "Obadiah|עובדיה|16|1", "Jonah|יונה|17|4", "Micah|מיכה|18|7", "Nahum|נחום|19|3", "Habakkuk|חבקוק|20|3", "Zephaniah|צפניה|21|3", "Haggai|חגיי|22|2", "Zechariah|זכריה|23|14", "Malachi|מלאכי|24|4", "I Chronicles|דברי הימים א|25a|29", "II Chronicles|דברי הימים ב|25b|36", "Psalms|תהילים|26|150", "Job|איוב|27|42", "Proverbs|משלי|28|31", "Ruth|רות|29|4", "Song of Songs|שיר השירים|30|8", "Ecclesiastes|קוהלת|31|12", "Lamentations|איכה|32|5", "Esther|אסתר|33|10", "Daniel|דנייאל|34|12", "Ezra|עזרא|35a|10", "Nehemiah|נחמיה|35b|13"];

let book = 0;
let chap = 1;
let style = 'plain';
let paragraph = false;
let nopunct = false;
let hebrew = true;

// let MicroModal = require('micromodal');
MicroModal.init({
	onClose: modal => {
		const styles = ['plain', 'stam', 'isaiah', 'rashi', 'paleo', 'proto'];

		const punctbox = document.getElementById('punct');
		const heebox = document.getElementById('hebrew');
		const parabox = document.getElementById('parayes');
		const styleidx = document.getElementById('style').selectedIndex;
		const bookidx = document.getElementById('book').selectedIndex;
		const chapsidx = document.getElementById('chap').selectedIndex;

		nopunct = !punctbox.checked;
		hebrew = heebox.checked;
		paragraph = parabox.checked;
		style = styles[styleidx];
		book = bookidx;
		chap = chapsidx + 1;

		getchapter(book, chap, style, paragraph, nopunct, hebrew);
	},
	disableFocus: true,
	debugMode: true
});

function getchapter(book=0, chap=1, style='plain', paragraph=true, nopunct=true, hebrew=false) {
	let display  = document.getElementById("main");
	let chapter =[];

	const record = books[book].split("|");
	const filename = 'x' + record[2] + chapfix(chap);

	fetch('./x/' + filename + '.txt')
	.then(res => res.text())
	.then(out => {
	  let outstring = `<h1>${record[1]} פרק ${shownum(chap, true)}</h1>\n\n`;
	  let versenum = 0;
	  chapter = out.split(/\n/);
	  if ( paragraph ) { outstring += `<p class='${style}'>`; }
	  for (let verse of chapter) {
	  	verse = verse.trim()
	  	if (verse) {
	  		versenum++;
	  		if ( paragraph ) {
	  			outstring += `<b>${shownum(versenum, hebrew)}</b>${cleanverse(verse, nopunct)} `;
	  			if ( verse.endsWith("}") ) {
	  				outstring += `</p>\n<p class='${style}'>`;
	  			}
	  		} else {
	  			let numstyle = hebrew ? 'hebverse' : 'latverse';

		  		outstring += `<p class='${numstyle} ${style}'>${cleanverse(verse, nopunct)}</p>\n`;
		    }
		}
	  }
	  outstring += '<p><br><br><br><br></p>\n';
	  display.innerHTML = outstring;
	})
	.catch(err => { throw err });
}

function cleanverse(str = '', nopunct = false) {
	let stringout = str;
	if (stringout.endsWith('<br>')) {
		stringout = stringout.slice(0, -4);
	}

	if (nopunct) {
		stringout = stringout.replace(/\-{2}/g, ' ');
		stringout = stringout.replace(/\-/g, '־');
		stringout = stringout.replace(/{.}/g, "");
		stringout = stringout.replace(/[\.,#!\$%\^&\*;:=_`~()]/g,"");
		stringout += " ׃";

	}
	return stringout;
}

function shownum(x, hebrew = false ) {
	if ( hebrew ) {
		let bigout = '' // hundreds
		let lilout = '' // everything else

		const ones = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
		const tens = ['י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
		const hundreds = ['ק', 'ר', 'ש', 'ת'];

		const hundigit = Math.floor(x / 100)
		const tendigit = Math.floor(x % 100 / 10)
		const onedigit = x % 10
		if (hundigit > 0) { bigout = hundreds [ hundigit - 1 ]; }
		if (tendigit > 0 ) { lilout += tens [ tendigit - 1 ]; }
		if (onedigit > 0 ) { lilout += ones [ onedigit - 1 ]; }

		// check for illegal combinations

		if ( lilout === 'יה') { lilout = 'טו'; }
		if ( lilout === 'יו') { lilout = 'טז'; }

		return bigout + lilout;
	}

	return x;
}

function chapfix(num) {
    const u = "" + num % 10; // units
    const t = "0123456789abcdef"[Math.floor(num/10)];

    return t+u;
}

function settingsdialog() {
	setvalues();
	MicroModal.show('modal-1');
	// MicroModal.close('modal-2');
}

function bookdialog() {
	setvalues();
	// MicroModal.close('modal-1');
	MicroModal.show('modal-2');
}

function questiondialog() {
	// MicroModal.close('modal-1');
	MicroModal.show('modal-3');
}

function setvalues() {
	setchapters(book);
	document.getElementById('chap').selectedIndex = chap-1;
}

function setchapters(n) {
	const chaps = document.getElementById('chap')
	const record = books[n].split("|");

	while (chaps.firstChild) {
  		chaps.removeChild(chaps.firstChild);
	}

	for (let i=1; i <= record[3]; i++) {
		let tag = "" + i;
		opt = document.createElement("option");
		opt.textContent = tag;
		chaps.appendChild(opt);
	}
}

function advance(dir) {
	const record = books[book].split("|");
	limit = Number(record[3]);

	chap += dir;
	if (chap < 1) { chap = 1 };
	if (chap > limit) { chap = limit; }

	getchapter(book, chap, style, paragraph, nopunct, hebrew);
}

window.addEventListener('keydown', function (e) {
    if (e.keyCode == 37) {
        advance(1);
    }
    if (e.keyCode == 39) {
        advance(-1);
    }    
});

getchapter(book, chap, style, paragraph, nopunct, hebrew);