let bg, segDisp, eliza, inSession, cnv;

function setup() {
    cnv = createCanvas(window.innerWidth * .4, window.innerWidth * .214);
    cnv.parent('thetty');

    bg = loadImage("images/ttydisp.jpg");
    segDisp = new Display(width*.123,width*.09);
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

function windowResized() {
  resizeCanvas(window.innerWidth * .4, window.innerWidth * .214);
  segDisp.setdims(width*.123,width*.09);
}
