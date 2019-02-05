function scramble() {
	var poemIn = document.getElementById("poem").innerHTML;
	var poemOut = "";
	var theWord = "";
	var inWord = false;

	for (var i = 0; i<poemIn.length; i++){
		var c = poemIn.charAt(i);
		if (inWord){
			if  (/\W/.test(c)) {
				theWord = jumble(theWord);
				poemOut += theWord + c;
				theWord = "";
				inWord = false; 
			} else {
				theWord += c;
			}
		} else {
			if (/\W/.test(c)) {
				poemOut += c;
			} else {
				theWord = c;
				inWord = true;
			}
		}
	}


	document.getElementById("poem").innerHTML = poemOut;
}

function jumble(w) {
	if (w.length > 3) {
		var beginning = w.charAt(0);
		var end = w.substr(-1);
		var middle = w.slice(1, w.length-1).split("");
		var checked = document.querySelector('input[name="action"]:checked').value;

		switch(checked) {
			case "random":
				for (var j = 0; j<middle.length; j++) {
					var first = Math.floor(Math.random() * middle.length);
					var second = Math.floor(Math.random() * middle.length);
					
					var temp = middle[first];
					middle[first] = middle[second];
					middle[second] = temp;
				}
				break;
			case "sorted":
				middle.sort();
				break;
			default:
				middle.reverse();
		}
		w = beginning + middle.join("") + end; 
	}

	return w;
}

function backtonormal() {
	var poem = "Remember me when I am gone away,\n" +  
	   "   Gone far away into the silent land; \n" +
	   "   When you can no more hold me by the hand, \n" +
	   "Nor I half turn to go yet turning stay. \n" +
	   "Remember me when no more day by day \n" +
	   "   You tell me of our future that you planned: \n" + 
	   "   Only remember me; you understand \n" + 
	   "It will be late to counsel then or pray. \n" +
	   "Yet if you should forget me for a while \n" + 
	   "   And afterwards remember, do not grieve: \n" + 
	   "   For if the darkness and corruption leave \n" + 
	   "   A vestige of the thoughts that once I had, \n" + 
	   "Better by far you should forget and smile \n" +
	   "   Than that you should remember and be sad."; 

		document.getElementById("poem").innerHTML = poem;
}
