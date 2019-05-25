const books = ["Genesis|בראשית|01|50", "Exodus|שמות|02|40", "Leviticus|ויקרא|03|27", "Numbers|במדבר|04|36", "Deuteronomy|דברים|05|34", "Joshua|יהושוע|06|24", "Judges|שופטים|07|21", "I Samuel|שמואל א|08a|31", "II Samuel|שמואל ב|08b|24", "I Kings|מלכים א|09a|22", "II Kings|מלכים ב|09b|25", "Isaiah|ישעיהו|10|66", "Jeremiah|ירמיהו|11|52", "Ezekiel|יחזקאל|12|48", "Hosea|הושע|13|14", "Joel|יואל|14|3", "Amos|עמוס|15|9", "Obadiah|עובדיה|16|1", "Jonah|יונה|17|4", "Micah|מיכה|18|7", "Nahum|נחום|19|3", "Habakkuk|חבקוק|20|3", "Zephaniah|צפניה|21|3", "Haggai|חגיי|22|2", "Zechariah|זכריה|23|14", "Malachi|מלאכי|24|4", "I Chronicles|דברי הימים א|25a|29", "II Chronicles|דברי הימים ב|25b|36", "Psalms|תהילים|26|150", "Job|איוב|27|42", "Proverbs|משלי|28|31", "Ruth|רות|29|4", "Song of Songs|שיר השירים|30|8", "Ecclesiastes|קוהלת|31|12", "Lamentations|איכה|32|5", "Esther|אסתר|33|10", "Daniel|דנייאל|34|12", "Ezra|עזרא|35a|10", "Nehemiah|נחמיה|35b|13"];

const helpscreen = `	        	<p>
	        		This is just a simple Bible reader that allows you to see the text of the Hebrew Bible in a number of scripts.
	        	</p>
	        	<p>
	        		Hebrew text with vowels courtesy of <a href="http://www.mechon-mamre.org">Mechon Mamre</a>.
	        	</p>
	        	<p> 
	        		Icons from <a href="https://www.flaticon.com">FlatIcon</a>.
	        	</p>
	        	<p>
	        		Design and coding can all be blamed on <a href="https://danparvaz.com">Dan Parvaz</a>.
	        	</p> `;

 const bookscreen = `<p>
	        		Book: 
	        		<select id="book" size="1" onchange="setchapters(this.selectedIndex);">
					  	<option>Genesis</option>
						<option>Exodus</option>
						<option>Leviticus</option>
						<option>Numbers</option>
						<option>Deuteronomy</option>
						<!-- <option>Joshua</option>
						<option>Judges</option>
						<option>I Samuel</option>
						<option>II Samuel</option>
						<option>I Kings</option>
						<option>II Kings</option>
						<option>Isaiah</option>
						<option>Jeremiah</option>
						<option>Ezekiel</option>
						<option>Hosea</option>
						<option>Joel</option>
						<option>Amos</option>
						<option>Obadiah</option>
						<option>Jonah</option>
						<option>Micah</option>
						<option>Nahum</option>
						<option>Habakkuk</option>
						<option>Zephaniah</option>
						<option>Haggai</option>
						<option>Zechariah</option>
						<option>Malachi</option>
						<option>I Chronicles</option>
						<option>II Chronicles</option>
						<option>Psalms</option>
						<option>Job</option>
						<option>Proverbs</option>
						<option>Ruth</option>
						<option>Song of Songs</option>
						<option>Ecclesiastes</option>
						<option>Lamentations</option>
						<option>Esther</option>
						<option>Daniel</option>
						<option>Ezra</option>
						<option>Nehemiah</option> -->
					</select>
					Chapter: 
					<select id="chap" size="1">
					</select>
  
	        	</p> `;

const settingscreen = `<p>
	        		Use modern punctuation: <input type="checkbox" id="punct" checked> <br>
	        		Number verses in Hebrew: <input type="checkbox" id="hebrew" checked> <br>
	        		Display nekudot: <input type="checkbox" id="nekudot" checked> <br>
	        		List verses <input type="radio" name="para" id="parano" checked>separately <input type="radio" name="para" id="parayes">by paragraph<br>
	        		Script style: 
	        		<select id="style" size="1">
					  <option>Plain</option>
					  <option>STaM</option>
					  <option>Cursive</option>
					  <option>Isaiah</option>
					  <option>Rashi</option>
					  <option>Paleo-Hebrew</option>
					  <option>Proto-Caananite</option>
					</select>
  
	        	</p>`;

let book = 0;
let chap = 1;
let style = 'plain';
let nekudot = true;
let paragraph = false;
let nopunct = false;
let hebrew = true;

function updatedisplay() {
	const styles = ['plain', 'stam', 'cursive', 'isaiah', 'rashi', 'paleo', 'proto'];

	const punctbox = document.getElementById('punct');
	const nekubox = document.getElementById('nekudot');
	const heebox = document.getElementById('hebrew');
	const parabox = document.getElementById('parayes');
	const styleidx = document.getElementById('style').selectedIndex;
	const bookidx = document.getElementById('book').selectedIndex;
	const chapsidx = document.getElementById('chap').selectedIndex;

	nopunct = !punctbox.checked;
	hebrew = heebox.checked;
	paragraph = parabox.checked;
	nekudot = nekubox.checked;
	style = styles[styleidx];
	book = bookidx;
	chap = chapsidx + 1;

	getchapter(book, chap, style, paragraph, nopunct, hebrew);
}

function getchapter(book=0, chap=1, style='plain', paragraph=true, nopunct=true, hebrew=false) {
	let display  = document.getElementById("content");
	let chapter =[];

	const record = books[book].split("|");
	const filename = 't' + record[2] + chapfix(chap);

	fetch('./t/' + filename + '.txt')
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
	const novowels = ['cursive', 'isaiah', 'paleo', 'proto'];

	let stringout = str;
	if (stringout.endsWith('<br>')) {
		stringout = stringout.slice(0, -4);
	}

	if (!nekudot || novowels.indexOf(style) >= 0) {
		stringout = devowel(stringout);
	}

	if (nopunct) {
		stringout = stringout.replace(/\-{2}/g, ' ');
		stringout = stringout.replace(/\-/g, '־');
		stringout = stringout.replace(/[\.,#!\$%\^\*;:=_`~()]/g,"");
		stringout += " ׃";
		stringout = stringout.replace(/ {(.)} ׃/g, ": {$1}");
		stringout = stringout.replace(/{ס}/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
		stringout = stringout.replace(/{ר}/g, "<br>");
		stringout = stringout.replace(/{.}/g, "");
	}
	return stringout;
}

function devowel(text) {
	// replace vowel characters
	text = text.replace(/[\u0591-\u05C7]/g,"");
	text = text.replace(/[בּבֿ]/g, "ב");
	// replace presentation forms
	text = text.replace(/[ﬡאּאַאָﭏ]/g, "א");
	text = text.replace(/ﬠ/g, "ע");
	text = text.replace(/בּבֿ]/g, "ב");
	text = text.replace(/[ﬢדּ]/g, "ד");
	text = text.replace(/ךּ/g, "ך");
	text = text.replace(/ﬦ/g, "ם");
	text = text.replace(/ףּ/g, "ף");
	text = text.replace(/גּ/g, "ג");
	text = text.replace(/[ﬣהּ]/g, "ה");
	text = text.replace(/[ﬤכּכֿ]/g, "כ");
	text = text.replace(/[ﬥלּ]/g, "ל");
	text = text.replace(/[מּ]/g, "מ");
	text = text.replace(/[נּ]/g, "נ");
	text = text.replace(/[פּפֿ]/g, "פ");
	text = text.replace(/קּ/g, "ק");
	text = text.replace(/[ﬧרּ]/g, "ר");
	text = text.replace(/סּ/g, "ס");
	text = text.replace(/[שּשּׁשּׂשׁשׂשׁ]/g, "ש");
	text = text.replace(/[ﬨתּ]/g, "ת");
	text = text.replace(/טּ/g, "ט");
	text = text.replace(/צּ/g, "צ");
	text = text.replace(/[וּוֹ]/g, "ו");
	text = text.replace(/[יּיִ]/g, "י");
	text = text.replace(/זּ/g, "ז");
	text = text.replace(/ײַ/g, "''");

	return text;
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
	closepanels();
	setvalues();
	if (ismobile()) {
		scroll(0,0);
		panelshow('settings-mobile');
	} else {
		MicroModal.show('settings-desktop');
	}
}

function bookdialog() {
	closepanels();
	setvalues();
	if (ismobile()) {
		scroll(0,0);
		panelshow('book-mobile');
	} else {
		MicroModal.show('book-desktop');
	}
}

function questiondialog() {
	closepanels();
	if (ismobile()) {
		scroll(0,0);
		panelshow('help-mobile');
	} else {
		MicroModal.show('help-desktop');
	}
}

function panelshow(dlgname) {
	const panel = document.getElementById(dlgname);
    panel.style.maxHeight = panel.scrollHeight + "px";
}

function closepanels(update=false, id='') {
	const panels = document.getElementsByClassName('panel');
	const panelnames = ['settings', 'book', 'help'];

	if (ismobile()) {
		for (let panel of panels){
			panel.style.maxHeight = null;
		}	
	} 
	// else {
	// 	for (let panel of panelnames) {
	// 		try {
	// 			if (!id.startsWith(panel)) {
	// 				MicroModal.close(panel + '-desktop');
	// 			}
	// 		} catch(err) {
	// 			console.log(err.message);
	// 		}
	// 	}
	// }

	if (update) {
		updatedisplay();
	}
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

function ismobile() {
	return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
	|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4)));
}

function desktopsetup() {
	let platform = ismobile()? 'mobile' : 'desktop';

	const settingsdlg = document.getElementById(`settings-${platform}-content`);
	const bookdlg = document.getElementById(`book-${platform}-content`);
	const helpdlg = document.getElementById(`help-${platform}-content`);

	settingsdlg.innerHTML = settingscreen;
	bookdlg.innerHTML = bookscreen;
	helpdlg.innerHTML = helpscreen;

	MicroModal.init({
		onClose: modal => { 
			closepanels(true, modal.id);
		},
		disableFocus: true,
		debugMode: true
	});
}

desktopsetup();

getchapter(book, chap, style, paragraph, nopunct, hebrew);