var bg;
var segDisp;
var eliza;
var inSession;
var cnv;

function setup() {
    cnv = createCanvas(568, 304);
    cnv.parent('thetty');

    bg = loadImage("images/ttydisp.jpg");
    segDisp = new Display(70,51);
    eliza = new Shrink();
    inSession = false;

}

function draw() {
 
  background(bg);
  segDisp.show();
}  

function keyPressed() {
   if (inSession) {
      if (((keyCode >= 65) && (keyCode <= 90)) || (keyCode == 32) || (keyCode == BACKSPACE))  {
	      segDisp.add(keyCode);
      } 
      if (segDisp.over()) {
	      segDisp.readOut(eliza.reply(segDisp.getInput()));
      } else if (segDisp.done()) {
	      segDisp.readOut(eliza.wrap());
	      inSession = false;
      }
   }
   return false;
}

function mousePressed() {
	if (!inSession &&  (mouseX > 0) && (mouseY < height)) {
       segDisp.readOut(eliza.intro());
	   inSession = true;
	}
}

