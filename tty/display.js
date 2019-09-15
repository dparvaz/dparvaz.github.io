class Display{
	constructor(x,y) {
		this.setdims(x,y);
		this.cells = [];
		this.input = "";
		this.ouput = "";
		this.takingKeys = true;

		frameRate(30);

		for (let i=0; i<16; i++) {
			this.cells[i] = loadImage("./images/spc.gif");
		}
	}

	setdims(x,y) {
		this.x = x;
		this.y = y;
		this.w = width*.048;
		this.h = width*.07;		
	}

	show() {
		 fill(0);
		 rect(this.x, this.y, width*.775, width*.07);
         
		 if (!this.takingKeys) {
			 let c = this.output.charAt(0);
			 this.output = this.output.slice(1);
			 this.append(c);
			 
			 if(this.output == "") {
				 frameRate(30);
				 this.takingKeys = true;
				 this.input = "";
		     }
		 }

		 for(let i=0; i<16; i++) {
			 image(this.cells[i], this.x+i*this.w+5, this.y+ 2, this.w, this.h);
		 }
	 }

     over(){
		 const s = this.input;
		 if (s.endsWith(" ga ")) {
			 return true;
	     } else { 
			 return false;
		 }
	 }

	 done() {
		 const s = this.input;
		 if (s.endsWith(" sk ") || s.endsWith("sksk"))
	         return true;
		 else 
			 return false;
		 }

     readOut(s) {
	    this.takingKeys = false;
		this.output = s;
		frameRate(10);
	 }

	 getInput() {
		 const s = this.input;
		 this.input = "";
		 return s;
	 }

     append(c) {
        for (let i=1; i<16; i++) {
		   this.cells[i-1] = this.cells[i];
		}
		if (c != ' ') {
		       this.cells[15] = loadImage("images/"+c+".gif");
		    } else {
			   this.cells[15] = loadImage("images/spc.gif");
		    }
            this.input += c;
	 }

	 add(code) {
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
