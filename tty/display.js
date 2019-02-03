function Display(x, y) {	
     this.x = x;
	 this.y = y;
     this.cells = [];
     this.input = "";
	 this.ouput = "";
	 this.takingKeys = true;

     frameRate(30);

	 for (var i=0; i<16; i++) {
		 this.cells[i] = loadImage("./images/spc.gif");
	 }

	 this.show = function() {
		 fill(0);
		 rect(this.x, this.y, 440, 40);
         
		 if (!this.takingKeys) {
			 var c = this.output.charAt(0);
			 this.output = this.output.slice(1);
			 this.append(c);
			 
			 if(this.output == "") {
				 frameRate(30);
				 this.takingKeys = true;
				 this.input = "";
		     }
		 }

		 for(var i=0; i<16; i++) {
			 image(this.cells[i], this.x+i*25+5, this.y+ 2, 25, 33);
		 }
	 }

     this.over = function() {
		 var s = this.input;
		 if ((s.length > 1) && (s.length > 3) && (s.substr(s.length-4, s.length-1) == " ga ")) {
			 return true;
	     } else { 
			 return false;
		 }
	 }

	 this.done = function() {
		 var s = this.input;
		 if ((s.length > 4) && (s.substr(s.length-4, s.length-1) == " sk ") || (s.substr(s.length-5, s.length-1) ==" sksk"))
	         return true;
		 else 
			 return false;
		 }

     this.readOut = function(s) {
	    this.takingKeys = false;
		this.output = s;
		frameRate(10);
	 }

	 this.getInput = function() {
		 var s = this.input;
		 this.input = "";
		 return s;
	 }

     this.append = function(c) {
        for (var i=1; i<16; i++) {
		   this.cells[i-1] = this.cells[i];
		}
		if (c != ' ') {
		       this.cells[15] = loadImage("images/"+c+".gif");
		    } else {
			   this.cells[15] = loadImage("images/spc.gif");
		    }
            this.input += c;
	 }

	 this.add = function(code) {
		 if (code != BACKSPACE) {
			 this.append(String.fromCharCode(code).toLowerCase());
		 } else {
			 for (var i=14; i>=0; i--) {
				 this.cells[i+1] = this.cells[i];
			 }
			 if (this.input.length > 0) {
				 this.input = this.input.slice(0, this.input.length-1);
			 }
			 if (this.input.length > 15) {
				 var restore = this.input.charAt(this.input.length-16);
				 if (restore == ' ') restore = "spc"
				 this.cells[0] = loadImage("images/"+restore+".gif");
			 } else {
				 this.cells[0] = loadImage("images/spc.gif");
			 }
        }
	 }
}
