let face;
let side;
let time;

function setup() {
  
  const dimension = floor(min (windowWidth, windowHeight) * .7);
  
  
  createCanvas(dimension, dimension);
  
  face = [ 'עשריםרבעו', 
           'חמישהעשרה',
           'לאחתשתיים',
           'עשרהששלוש',
           'ארבעסחמשל',
           'כשבעשמונה',
           'תשהפוחציק',
           'ורבעשריםו',
           'חמישהעשרה' ];
  
  side = floor (dimension/9);
  
  colorMode (HSB, 100);
}

function draw() {
   
  let m = round(minute() / 5) * 5;
  let h = ( hour() + (m > 31) ) % 12;
  let hrs, mins;
  
  
  switch (h) {
    case 0:
      hrs = [31, 32, 33, 34, 35, 46, 47, 48, 49];
      break;
    case 1: 
      hrs = [36, 37, 38];
      break;
    case 2: 
      hrs = [31, 32, 33, 34, 35];
      break;
    case 3:
      hrs = [41, 42, 43, 44];
      break;
    case 4:
      hrs = [56, 57, 58, 59];
      break;
    case 5:
      hrs = [52, 53, 54];
      break;
    case 6:
      hrs = [44, 45];
      break;
    case 7:
      hrs = [66, 67, 68];
      break;
    case 8:
      hrs = [61, 62, 63, 64, 65];
      break;
    case 9:
      hrs = [77, 78, 79];
      break;
    case 10:
      hrs = [47, 48, 49];
      break;
    case 11:
      hrs = [36, 37, 38, 46, 47, 48, 49];
      break;
    default:
      hrs = [];
  }
  
  switch(m) {
    case 5:
      mins = [95, 96, 97, 98, 99, 89];
      break;
    case 10:
      mins = [91, 92, 93, 94, 89];
      break;
    case 15:
      mins = [86, 87, 88, 89];
      break;
    case 20:
      mins = [82, 83, 84, 85, 86, 89] ;
      break;
    case 25:
      mins = [81, 82, 83, 84, 85, 86, 89, 95, 96, 97, 98, 99];
      break;
    case 30:
      mins = [72, 73, 74, 75];
      break;
    case 35:
      mins = [15, 16, 17, 18, 19, 11, 25, 26, 27, 28, 29, 39];
      break;
    case 40:
      mins = [15, 16, 17, 18, 19, 39];
      break;
    case 45:
      mins = [12, 13, 14, 39];
      break;
    case 50:
      mins = [21, 22, 23, 24, 39];
      break;
    case 55:
      mins = [25, 26, 27, 28, 29, 39];
      break;
    default:
      mins = [];
  }
  
  time = hrs.concat(mins);
  
  background(0);
  textAlign(CENTER);
  textSize(side * .9);
  textFont('Secular One');
  for (let j=0; j < face.length; j++) {
    let line = face[j].split("").reverse();
    for (let i=0; i < line.length; i++) {
      let key = (j+1) * 10 + (i + 1);
      if (time.indexOf(key) > -1) {
        fill(i*7, 30+ j*15, 100);
      } else {
        fill(0, 0, 40);
      }
      text(line[i], (i+.5) * side, (j+.8) * side);
    }
  }
}


function windowResized() {
  setup();
}
