/*
 * supportsES6() -- returns true if the browser does, false if it doesn't
 */
function supportsES6() {
  try {
    new Function("(a = 0) => a");
    return true;
  }
  catch (err) {
    return false;
  }
} 

/*
 * isEven(n) return true if n is even
 */
const isEven = num => num % 2 === 0;

/*
 * setGreeking() -- set reprentatation of mathematical and Greek symbols
 * based on the value of the Unicode flag
 */
function setGreeking() {
	LtrAlpha  = (Unicode) ? "α" : "alpha";
	LtrMu     = (Unicode) ? "μ" : "mu";
	LtrLambda = (Unicode) ? "λ" : "lambda";
	LtrSigma  = (Unicode) ? "σ" : "sigma";
	LtrChi    = (Unicode) ? "χ" : "chi";
	LtrLE     = (Unicode) ? "≤" : "le";
	LtrGE     = (Unicode) ? "≥" : "ge";
	LtrNE     = (Unicode) ? "≠" : "ne";
	LtrXbar   = (Unicode) ? "x̄" : "mean";
	LtrYhat   = (Unicode) ? "ŷ" : "y'";
	LtrSq     = (Unicode) ? "²" : "-squared";	
  LtrInf    = (Unicode) ? "∞" : "Inf";
}

/*
 * arrayRemove(arr, idx) -- return arr with item idx removed
 */
function arrayRemove(arr, idx) { 
    return arr.filter((e, i) => i != idx);
}

/*
 * writeln(s, device) -- write() but with a newline at the end
 */
function writeln(s="", device=6) {
	write(s + "\n", device);
}

/*
 * write(s, device) -- sends the string s to the output designated by
 *  device. Device 6 is the screen
 * 
 */
function write(s="", device=6) {
	if (device == 6) {
		document.getElementById("output").innerHTML += s;
	} else {
		const idx = findNode(document.getElementById("dev"+device))[0];
		DeviceFiles[idx].setValue(DeviceFiles[idx].getValue()+s);
	}
}

/*
 * feedback(s) -- properly justified output from comamnds
 */
function feedback(s="") {
	writeln("   " + s, OutUnit);
}

/*
 * round(x, n) -- round number x to n decimal places
 */
function round(x, n) {
	if (n >= 0) {
		return Math.round(x * ( 10 ** n ) ) / ( 10 ** n );
	}

	return x
}

/*
 * DPs(n) -- find how many numbers are after the decimal
 * point for n, or 0 if none
 */
function DPs(n) {
    const s = n.toString();
    const point = s.indexOf(".");
    return (point == -1) ? 0 : s.slice(point).length - 1;
}

/*
 * maxDp(arr) -- find the maximum number of decimal places for all
 * the numbers in an array
 */
function maxDP(arr) {
	if (arr === null) return 0;
	if (typeof(arr) == "number") return DPs(arr); 
	let max = 0;
	for (let item of arr) {
		const dp = DPs(item);
		if (dp > max) max = dp;
	}
	return max;
}

/*
 * formatNumber(n, width, dp) -- format n to width spaces wide and pad
 * the decimal places up to dp
 */
function formatNumberLength(num, width, dp) {
	let z;
	if (isNaN(num)) {
		return "NaN".padStart(width, " ");
	}

	if (!isFinite(num)) {
		z = (num < 0) ? "-∞" : "∞";
		return z.padStart(width, " ");
	}

	if (num == Integer(num)) {
		z = num.toString() + " ".repeat(dp);
	} else {
		z = round(num, dp).toString();
	}
		
	return z.padStart(width, " ");
}


/*
 * subscript(n) -- return a 1- or 2-digit number as a unicode subscript
 */
function subscript(n) {
	const DIGITS = (Unicode) ? "₀₁₂₃₄₅₆₇₈₉" : "0123456789";
	if (n > 99 || n != Math.floor(n)) return true;
	const digits = n % 10;
	const tens = (n - digits) / 10;
  
	let s = (tens > 0) ? DIGITS.charAt(tens) : "";
	s += DIGITS.charAt(digits);

	return s;
}
 
/*
 * resolveArgs(args) -- resolve the string of arguments (constants,
 * columns) into a an array of tuples either returning column numbers 
 * or constants for use by commands. returns true if there is an error
 *
 */
function resolveArgs(args) {
	const colsRE = /C\d+/;
	const konstRE = /K\d+/;
	const numRE = /-?\d+(\.\d+)?/;

	resolved = [];
	if (args.trim() == "") {
		return resolved;
	}

	for (let item of args.split(" ")) {
		if (colsRE.test(item)) {
			let c = parseInt(item.substr(1)) - 1;
			if (c < 0 || c >= MaxCols) {
				throwError(ERR_RANG_COL);
				return true;
			} else {
				resolved.push( ["C", c] );
			}
		} else if (konstRE.test(item)) {
			let k = parseInt(item.substr(1)) - 1;
			if (k < 0 || k >= MaxKonsts) {
				throwError(ERR_RANG_KON);
				return true;
			} else {
				resolved.push( ["K", k] );
			}
		} else if (numRE.test(item)) {
			let n = parseFloat(item);
			resolved.push( ["N", n] );
		} /* else {
			throwError(ERR_RANG_VAL);
			return true;
		} */
	}
	return resolved;
}

/*
 * derefArgs(args) -- takes an array of args and dereferences them
 * where possible, leaves full columns as they are. Returns true if
 * null references are found.
 */
function derefArgs(args) {
	for (let i=0; i < args.length; i++) {
			let type = args[i][0];
			let val = args[i][1];

			if (type == "K") { 
				if (Konstants[val] === null) {
					throwError(ERR_NULL_KON);
					return true;
				}

				args[i] = ["N", Konstants[val]];
			}

			if (type == "C") {
				if (Columns[val] === null) {
					throwError(ERR_NULL_COL);
					return true;
				} 

				if ( typeof(Columns[val]) == "number" ) {
					args[i] = ["N", Columns[val]];
				}
			}
	}
	return args
}

/*
 * setPrintCols(args) -- set the maximum number of colunms printed out
 * on any one line
 */

function setPrintCols(args) {
	args = derefArgs(args);
	if (args === true) return true;
	
	const cols = args[0][1];

	if (cols != Integer(cols)) {
		throwError(ERR_NON_INT);
		return true;
	}
	if (cols < 1) {
		throwError(ERR_RANG_VAL);
		return true;
	}
	
  MaxColsPrinted = cols;
  return false;
}

/*
 * joinVals(args) -- join scalars and arrays into one array, and 
 * place them in the column noted in the final arg.
 */
function joinVals(args) {
	let result = [];
	let putIn = args.pop();

	args = derefArgs(args);
	if (args === true) return true;
  
  args.reverse();  // to match semantics of JOIN
	for (let arg of args)  {
		if (arg[0] == "N") {
			result.push(arg[1]);
		} else {
			result = result.concat(Columns[arg[1]]);
		}
	}
	Columns[putIn[1]] = result;
}

/*
 * convert(args) -- using a conversion table of two columns (from, to),
 * convert the values of one table into another
 */
function convert(args) {
  const putIn = args.pop();

  args = derefArgs(args);
  if (args === true) return true;

  const fromCol = args[0][1];
  const toCol = args[1][1];
  const values = args[2][1];
  
  if (!(getColLength(fromCol)==getColLength(toCol)&&getColLength(toCol)>0)) {
    throwError(ERR_COLS_NE);
  }
 
  let outArray = [];

  if (getColLength(values) == 0) throwError(ERR_NULL_COL);
  if (getColLength(values) == -1) {
    const singleTerm = Columns[values];
    Columns[putIn[1]] = singleTerm;
    let search = Columns[fromCol].indexOf(singleTerm);
    if (search > -1) Columns[putIn[1]] = Columns[toCol][search];
    return false;
  }

  for (let val of Columns[values]) {
    let out = val;
    let search = Columns[fromCol].indexOf(val);
    if (search > -1) out = Columns[toCol][search];
    outArray.push(out);
  }
  
  Columns[putIn[1]] = outArray;
  return false;
}

/*
 * setDevice(args,comm) -- set the input or output device for reading and
 * printing
 */

function setDevice(args, comm) {
	args = derefArgs(args);
	if (args === true) return true;
	
	const dev = args[0][1];

	if (dev != Integer(dev)) {
		throwError(ERR_NON_INT);
		return true;
	}
	if (dev < 1 || dev > 9) {
		throwError(ERR_RANG_VAL);
		return true;
	}
	if (dev == 5 && comm == "OUTU") {
		throwError(ERR_OUT_FIVE);
		return true;
	}
	if (dev == 6 && comm == "INUN") {
		throwError(ERR_IN_SIX);
		return true;
	}

	if (comm == "INUN") {
		InUnit = dev;
	} else {
		OutUnit = dev;
	}
	
	if (InUnit == OutUnit) {
		throwError(ERR_INOUT_EQ);
		return true;
	}

	return false;
}

/*
 * pick(args) -- pick rows K to K of of a column, place them in antoher column
 */
function pick(args) {
	let putIn  = args.pop();

	args = derefArgs(args);
	if (args === true) { return true; }

	let from = args[0][1];
	let to = args[1][1];

	if (to < from || to != Math.floor(to) || from != Math.floor(from)) {
		throwError(ERR_BAD_RAN);
		return true;
	}

	if (args[2][0] == "N") {
		Columns[putIn[1]] = args[2][1];
	} else {
		Columns[putIn[1]] = Columns[args[2][1]].slice(from-1, to);
	}

	return false;	
}

/*
 * isSingleAnswer(args) -- look at a dereferenced args set to see if 
 * there are any multi-row columns left. If so, returns false, true 
 * otherwise
 */
function isSingleAnswer(args) {
	for (arg of args) {
		if (arg[0] == "C") {
			return false;
		}
	}
	return true;
}

/*
 * minColLength(args) -- find the length of the shortest column. Args has
 * already been dereferenced.
 */
function minColLength(args) {
	let result = Infinity;
	for (arg of args) {
		if (arg[0] == "C" && Columns[arg[1]].length < result) {
			result = Columns[arg[1]].length;
		}
	}
	return result;
}

/*
 * derefKonst(arg) - if the argument holds a constant, dereference it 
 * if needed, then return the number. Otherwise, return true
 */
function derefKonst(arg) {
    let type = arg[0];
    let val = arg[1];

    if (type == "N") {
        return val;
    } else if (type == "K") {
        if (Konstants[val] === null) {
            throwErrow(ERR_NULL_KON); 
            return true;
        } else {
            return Konstants[val];
        }
    } else {
        if (Columns[val] === null) {
            throwError(ERR_NULL_COL);
            return true;
        } else if (typeof(Columns[val]) == "number") {
            return Columns[val];
        } else {
            throwError(ERR_ARRA_COL);
            return true;
        }
    }
}

/*
 * readValues(data) -- read all the data provided into the appropriate 
 * columns. The data[0] has the columns designated
 */
function readValues(data) {
	let comm = data[0]; // either (F)SET or (F)READ
	let cols = data[1];
	let rows = data[3];
	//reset the columns
	for ([type, val] of cols) {
		Columns[val] = null;
	}

  const totalNums = (comm == "READ" || comm == "FREA") ? rows.length 
                    : rows.length * rows[0].length;

  if (Countdown === null) { 
    Countdown = totalNums;
  } else {
    if (Countdown > totalNums) {
      throwError(ERR_TOO_FEW);
      return true;
    }
  }

	for (let nums of rows) {
		if ((comm == "READ" || comm == "FREA") && nums.length < cols.length) {
			throwError(ERR_TOO_FEW);
			return true;
		}
	  if (Countdown) {	
      if (comm == "READ" || comm == "FREA") {
        for (let i=0; i < cols.length; i++){
          result = addToColumn(nums[i][1], cols[i][1]);
          if (result === true) {
            return true;
          }
        }
        Countdown--;
      } else {
        for (let i=0; i < nums.length; i++){
          if (Countdown) {
            result = addToColumn(nums[i][1], cols[0][1]);
            if (result === true) {
              return true;
            }
            Countdown--;
          }
        }
      }
    }
	}
	if (PrintFlag) {
		let flag = (comm == "SET") ? true : null;
		printCols(cols, 4, flag);
	}
  Countdown = null;
}

/*
 * formatPrint(args, fmts) -- print out the columns in args
 * according to the parsed format (array returned by parseFormat())
 */
function formatPrint(args, fmts) {
	let max = getColLength(args[0][1]) ;
	for ([type, val] of args) {
		const l = getColLength(val) 
		if (l != max && l != -1) {
			throwError(ERR_COLS_NE);
			return true;
		}
	}
	if (max == -1) max = 1;

	for (let i = 0; i < max; i++) {
		let s = "";
		let idx = 0;
		for ([type, val] of args) {
			const l = getColLength(val);
			const n = (l == -1) ? Columns[val] : Columns[val][i];
			while(idx < fmts.length && fmts[idx][0] == "X") {
				s += fmts[idx][2];
				idx++;
			}
			if (idx >= fmts.length) {
				throwError(ERR_FORM_NUM);
				return true;
			}
			s += formatNumberLength(n, fmts[idx][1], fmts[idx][2]);
			idx++;
		}
		// go thru the rest of the format
		while (idx < fmts.length) {
			if (fmts[idx][0] != "X") {
				throwError(ERR_FORM_NUM);
				return true;
			}
			s += fmts[idx][2];
			idx++;
		}

		feedback(s);
	}
	return false;	
}

/*
 * columnsHeaders (args, width) -- print out the standard column headers
 * for the columns in args, each columns [width] chars long
 */
function columnHeaders(args, width) {
	let title = "Column ";
	for ([type, col] of args) {
		let colName = type+(col+1)
		title += "  " + centerString(colName, width); 
	}
	feedback(title);
	title = "Count  ";
	for([type, col] of args) { 
		let l = getColLength(col);
		if (l == -1) l = LtrInf;
		title += "  " + centerString(String(l), width);
	}
	feedback(title);
  
}

/*
 * printCols(args) -- print out the Columns designated in args
 */
function printCols(args, maxLimit=null, singleCol=null) {
	if (args.length == 0) {
		PrintFlag = true;
		return false;
	}

	if (args.length == 1) {
		singleCol = true;
	}

	const colWidth = 10;

	if (singleCol) {                            // for SET
    columnHeaders(args, colWidth);
		let col = args[0][1];
		let limit;
    const len = getColLength(col);
    if (len == 0) return false;

		const theDP = Math.min(Rounding, maxDP(Columns[col]));
		limit = (maxLimit) ?  Math.min(len, maxLimit) : len;
    if (limit == -1) limit = 1;
		let s = "  ";
		for (let i=0; i < limit; i++) {
			let n = (len == -1) ? Columns[col] : Columns[col][i];
			let dp = (n == Integer(n)) ? 0 : theDP;
			s += formatNumberLength(n, colWidth, dp);
			if ((i+1) % 5 == 0) {
				feedback(s);
				s = "  ";
			}
		}
		if (s != "") { 
			if (limit < theCol.length) s += " . . . "; 
			feedback(s);
		}
	} else {                                    // for READ and PRINT
    
    for (let startCol=0;startCol<args.length;startCol+=MaxColsPrinted) {
    const endCol = startCol + MaxColsPrinted;
    const theSlice = args.slice(startCol, endCol);

    columnHeaders(theSlice, colWidth);
    
    let DPs = [];
    let max = -1;
    for ([type, col] of theSlice) {
      let l = getColLength(col);
      if (l == -1) l = 1;
      if (l > max) max = l;
      // while we're here, calculate maximum # of decimal places
      const temp = maxDP(Columns[col]);
      DPs.push( Math.min(temp, Rounding) );
    }

		feedback();
		let title = "Row ";
		if (maxLimit != null) {
			if (max > maxLimit) { max = maxLimit; }
		}

		if (max == -1)  max = 1; 
		
		for(let i=0; i<max; i++) {
			title += formatNumberLength(i+1, 4, 0);
			let n
			for(let j=0; j < theSlice.length; j++) {
				const [type, col] = theSlice[j];
				const l = getColLength(col);
				if (l == 0 || (l < i+1 && l > 0)){ 
					n = " ".repeat(colWidth);
				} else if (l == -1) {
					n = Columns[col];
				} else {
					n = Columns[col][i];
				}
				if (typeof(n) == "number") {
					if (n == Integer(n)) {
						n = formatNumberLength(n, colWidth, 0);
					} else {
						n = formatNumberLength(n, colWidth, DPs[j]);
					}
				} 
				title += "  " + n;
			}
			feedback(title);
			title = "    ";
		}
		if (maxLimit != null) { feedback("   . . ."); }
	  }
  }
}

/*
 * centerString(s, n) -- center string s, padded by spaces on 
 * either side to a width of n
 */
function centerString(s, n) {
	s = s.toString();
	let startPad = ~~((n-s.length) / 2);  // integer division hack
	let endPad = n - startPad - s.length;
	return " ".repeat(startPad) + s + " ".repeat(endPad);
}

/*
 * getColLength(c) -- get the number of items in column 
 * designated by c. return 0 if empty
 * or -1 if artifically holding a constant. Returns false if 
 * there's a syntax error. Column index is the internal number
 * (zero-based, not one-based like MiniTAB)
 */
function getColLength(c) {
	theCol = Columns[c];
	if (theCol === null) {
		return 0;
	} else if (typeof(theCol) == "number") {
		return -1;
	} else {
		return theCol.length;
	}
}

/*
 * getColsLength(args) -- returns the length of a series of columns.
 * if they are uneven, or are storing scalar values or null, throw 
 * an error.
 */
function getColsLength(args) {
	let len = getColLength(args[0][1]);
	if (len < 1) {
		throwError(ERR_NOAR_COL);
		return true;
	}
	for ([type, c] of args) {
		let temp = getColLength(c);
		if (temp == 0) {
			throwError(ERR_NULL_COL);
			return true;
		} else if (temp == -1) {
			throwError(ERR_NOAR_COL);
			return true;
		} else if (temp != len) {
			throwError(ERR_COLS_NE);
			return true;
		}
	}
	return len;
}

/*
 * addToColumn(x, c) -- add number x to column c (a string like "C21")
 * returns false if completed, true if there's an error
 */
function addToColumn(x, c) {
	theCol = Columns[c];
	if (theCol === null) {  // unused? make a new column
		Columns[c] = [x]; 
	} else if (typeof(theCol) == 'number') {
		throwError(ERR_NOAR_COL);
		return true;  // can't add a number to a column containing a constant
	} else { 
		Columns[c].push(x);
	}
	return false;
}


/*
 * rankCol(args) -- rank the items in args[0], place ranks in args[1]
 */
function rankCol(args)
{	
	const arg = args[0][1];
	const out = args[1][1];

	if (getColLength(arg) == -1) {
		Columns[out] = 1;
		return false;
	}

	if (getColLength(arg) == 0) {
		throwError(ERR_NULL_COL);
		return true;
	}

	Columns[out] = rank(Columns[arg]);

	return false;
}

/*
 * rank(arr) -- return the array containing the ranks for arr
 */

function rank(arr) {
	let c = [...arr].map((e, i) => [e, i]);
	c.sort((a, b) => a[0] - b[0]);

	let temp = Array(c.length).fill(0);

	let tot = 0,
		  last = null,
			idx  = 0;

	for (let i = 0; i<c.length; i++) {
    if(c[i][0] == last) {
        tot += i+1;
    } else {
        for(let j=idx; j<i; j++)
            temp[c[j][1]] = tot/(i-idx);
        tot = i+1; last=c[i][0]; idx=i;
    }
	}
  for(let j=idx; j<c.length; j++)
      temp[c[j][1]] = tot/(c.length-idx);

	return temp
}

/*
 * sortCol(args) -- sort the column in args[0], order the first half
 * accordingly, then place the results in the second half
 */
function sortCol(args) {
	const n = args.length;
	let out = [];

	for (let i=0; i<n/2; i++) 
		out.unshift(args.pop());
	
	const l = getColLength(args[0][1]);
	if (l == 0) {
		throwError(ERR_NULL_COL);
		return true;
	}
	
	let c = (l == -1) ? c : Columns[args[0][1]].map((e, i) => [e, i]);
	if (l > 0) c.sort((a, b) => a[0] - b[0]);

	for ([type, val] of args) {
		if (getColLength(val) != l) {
			throwError(ERR_COLS_NE);
			return true;
		}
		if (l == -1) {
			Columns[out.shift()[1]] = Columns[val];
		} else {
			let temp = [];
			const outCol = out.shift()[1];
			for ([num, place] of c) 
				temp.push(Columns[val][place]);

			Columns[outCol] = temp;
		}
	}
	return false;
}

/*
 * orderCol(args) -- independently sort the columns in the first half
 * and place them in the second half.
 */
function orderCol(args) {
	const n = args.length;
	let out = [];

	for (let i=0; i<n/2; i++) 
		out.unshift(args.pop());

	for ([type, val] of args) {
	if (getColLength(val) == 1) {
		throwError(ERR_NULL_COL);
		return true;
	}
		const c = Columns[val]
		if (typeof(c) == "number") {
			Columns[out.shift()[1]] = c;
		} else {
			let a = [...c];
			a.sort((a, b) => a - b);
			Columns[out.shift()[1]] = a;
		}
	}
	return false;
}
/*
 * recode(args) -- recode a value or a range of values in a column 
 * to a particular value, put the changed column into a new column
 */
function recode(args) {
	const outCol = args.pop()[1];
	args = derefArgs(args);
	if (args === true) return true;

	const target = args.pop()[1]; 
	const [type, inCol] = args.pop();

	if (type == "N") {
		throwError(ERR_NOAR_COL);
		return true;
	}
	
	let start, end;
	if (args.length == 1) {
		start = end = args[0][1];
	} else {
		start = args[0][1];
		end = args[1][1];
	}

	result = [];
	for (let item of Columns[inCol]) {
		if (item >= start && item <= end) {
			result.push(target);
		} else {
			result.push(item)
		}
	}

	Columns[outCol] = result;
	return false;
}
/*
 *  chooseOmit(args, choose) -- choose or omit rows by a key (or range of
 *  keys) in a column, and duplicated those rows in another set of columns. 
 *  set choose to false to omit
 */
function chooseOmit(args, choose=true) {
	let start = derefKonst(args.shift());
	let end;

	if (args[0][0] != "C") {
		end = derefKonst(args.shift());
	} else {
		end = (start === true) ? true : start;
	}

	if (start === true || end === true) {
		throwError(ERR_NULL_KON);
		return true;
	}

	const ref = args.shift()[1];
	const idx = Integer(args.length / 2);
	let source = args.slice(0, idx);
	let tarRef = args[idx][1];
	let target = args.slice(idx+1);
	let refLen = getColLength(ref);

	// make sure the reference column isn't empty or holding a constant 
	if (refLen < 1) {
		throwError(ERR_TOO_FEW);
		return true
	}

	// make sure the other columns have at least as many numbers
	for ([type, val] of source) {
		if (getColLength(val) < refLen) {
			throwError(ERR_TOO_FEW);
			return true;
		}
	}


	let copied = Array(source.length).fill(null);
	let refArr = [];
	for (let i = 0; i < refLen; i++) {
		const temp = Columns[ref][i];
		if ((temp >= start && temp <= end) == choose) {
			refArr.push(temp);
			for (let j = 0; j < source.length; j++) {
				if (copied[j] === null) {
					copied[j] = [ Columns[source[j][1]][i] ];
				} else {
					copied[j].push( Columns[source[j][1]][i]);
				}
			}
		}
	}

  Columns[tarRef] = refArr;

	if (copied[0] != null) {
		for (let i = 0; i < target.length; i++) {
			Columns[target[i][1]] = copied[i];
		}
	}
	return false;
}

/*
 * generate(args) == generate a range of integers (the first K, or from
 * K to K) and place in a column. Return true if error.
 */
function generate(args) {
	const out = args.pop()[1];
	args = derefArgs(args);
	if (args === true) return true;

	const start = (args.length > 1) ? args[0][1] : 1;
	const jump  = (args.length == 3) ? args[1][1] : 1;
	const end   = args[args.length-1][1];
	
	const ints = range(start, end+jump, jump);
	Columns[out] = ints;
	return false;
}

/*
 * define(args) define a constant
 */
function define(args) {
	const out = args.pop();
	args = derefArgs(args);
	if (args === true) return true;
	let result;
	
	if (args.length == 1) {
		result = args[0][1];
	} else {
		const k = args[0][1];
		const c = args[1][1];
		const l = getColLength(c);
		if (l == -1) 
			result = Columns[c];
		else {
			if (k < 1 || k > l) {
				throwError(ERR_RANG_COL);
				return true;
			}
			if (k != Integer(k)) {
				throwError(ERR_NON_INT);
				return true;
			}
			result = Columns[c][k-1];
		}
	}
	if (out[0] == "C")
		Columns[out[1]] = result;
	else
		Konstants[out[1]] = result;

	return false;
}

/*
 * substitute(args) -- sub a constant, or row K of a column into  row K
 * of another column
 */
function substitute(args) {
	const out = args.pop()[1];
	args = derefArgs(args);
	if (args === true) return true;

	const idx = args.pop()[1];
	if (idx != Integer(idx)) {
		throwError(ERR_NON_INT);
		return true;
	}

	if (getColLength(out) < 1) {
		throwError(ERR_NOAR_COL);
		return true;
	}

	if (idx < 1 || idx > getColLength(out)) {
		throwError(ERR_RANG_COL);
		return true;
	}

	let value;
	if (args.length == 1) {
		value = args[0][1];
	} else {
		const k = args[0][1];
		const c = args[1][1];
		const l = getColLength(c);
		
		if (k != Integer(k)) {
			throwError(ERR_NON_INT);
			return true;
		}
		if (k < 1 || (k > l && l > 0)) {
			throwError(ERR_RANG_COL);
			return true;
		}

		if (l == -1) {
			value = Columns[c];
		} else {
			value = Columns[c][k-1];
		} 
	}
	Columns[out][idx-1] = value;
	return false;
}



/*
 * cumul(args, comm) -- provides cumulative sums or products to 
 * columns
 */
function cumul(args, comm="PARS") {
	let putIn = args.pop();
	args = derefArgs(args);
	if (args === true) { return true; }

	if (args[0][0] == "N") {
		Columns[putIn[1]] = args[0][1];
		return false;
	}

  let p = Columns[args[0][1]];
	let c = Array(p.length).fill(0);

	c[0] = p[0];

	for (let i=1; i<p.length; i++) {
		c[i] = (comm == "PARS") ? p[i] + c[i-1] : p[i] * c[i-1];
	}

	Columns[putIn[1]] = c;
	return false;
}


/*
 * adding the splice() method to strings
 */
String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

/*
 * stripCountdown(args) -- checks if FSET or FREAD have a argument
 * denoting the number of values/lines to be read
 */
function stripCountdown(args) {
	
  if (args[0][0] == "C") { return [null, args]; }
 
  const cd = derefKonst(args.shift());
  if (cd === true) { return [true, true]; }
  if (cd != Integer(cd)) {
    throwError(ERR_NON_INT);
    return [true, true];
  }

  if (cd < 1) {
    throwError(ERR_RANG_VAL);
    return [true, true];
  }

  return [cd, args];  
}

/*
 * decimalPlaces(args) -- set the rounding accuracy
 */
function decimalPlaces(args) {
	args = derefArgs(args);
	if (args === true) { return true; }

	let dp = args[0][1];

	if (dp != Math.floor(dp) || dp < 1 || dp > 8) {
		throwError(ERR_RANG_VAL);
		return true;
	}

	Rounding = dp;

	return false;
}

/*
 * setAlpha(args) -- set the Alpha level used in stats functions
 */
function setAlpha(args) {
  args = derefArgs(args);
  if (args === true) { return true; }

  const a = args[0][1];

   if (a <= 0 || a >= 1) {
     throwError(ERR_RANG_VAL);
     return true;
   }

   Alpha = a;

   return false;
}

