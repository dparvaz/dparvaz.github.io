/*
 * getCommand(line) -- given a cleaned line, retrieve the 
 * first token (the command)... otherwise an empty string 
 */
function getCommand(line) {
	if (line !== "") {
		let toks = line.split(" ");
		return toks[0].trim();
	}
	return "";
}

/*
 * getArgs(line) -- given a cleaned line, retrieve the 
 * argument... otherwise an empty string 
 */
function getArgs(line) {
	const commRE = /[A-Z]+/;
	if (line !== "") {
		let toks = line.split(" ");
		if (commRE.test(toks[0])) {   // does this line start with a command?
			toks.shift();
		}
		return toks.join(" ");
	}
	return "";
}
/* 
 * cleanLine(str) -- removes all the exreaneous material 
 * from the string str, leaving the abbreviated  command
 * and the arguments
 */
function cleanLine(str) {
    const re = /\s([A-Z]+-)?[A-Z]+\s/g;  // 
		
		
		if (/^\(.+\)$/.test(str.trim())) {
			formatFound = true;
			return str;
		}

	  str = " " + str.toUpperCase() + " ";
    str = str.replace(/[^ A-Z0-9\.\-]/g, " ");  // clean extaneous chars
    str = str.replace(/ (\.[0-9]+ )/g, " 0$1");  // catch decimals w/o a zero
    str = str.replace(/(\s[A-Z]*)\./g, "$1");   //remove periods as punctuation
    str = str.trim() + " ";
    str = str.replace(/(^[A-Z]{4})[A-Z]+/, "$1"); // abbreviate commands 
    while (re.test(str)) {
  		str = str.replace(re, " ");             // remove extraneous tokens
  	}

		// Handle ranges, e.g. C3-C7
	  matches = str.match(/C\d+-C\d+/g);
		if (matches) {
			for ( r of matches) {
				let [start, end] = r.match(/\d+/g).map(x => parseInt(x));
				let expanded = range(start, end+1).map(x => "C"+x).join(" ");
				str = str.replace(r, expanded);
			}
		}

	  str = str.replace(/\s+/g, " ");
  	str = str.trim();
  
    return str;
}


/*
 * range(start, end) -- approximates  the Python range() function
 */
const range = (start, end, jump=1) => {
    const length = Math.ceil((end - start)/jump);
    return Array.from({ length }, (_, i) => start + i*jump);
}

/*
 * parseLine(line) --takes a line previously cleaned using
 * cleanline() and returnd the syntax, e.g.:
 * 
 * raw line: add c1 to c3, put the results in C3
 * cleaned:  ADD C1 C2 C3
 * parsed:   ADD C C C
 *
 * The parse can then be checked against syntactic rules 
 * (regular expressions)
 */
function parseLine(line) {
	const colsRE = /C[0-9]+/;
	const konstRE = /K[0-9]+/;
	const numRE = /-?[0-9]+(\.[0-9]+)?/;
	
	let output = [];
 	let tokens = line.split(" ");
	
	for (tok of tokens) {
		if (colsRE.test(tok)) { output.push("C"); }
		else if (konstRE.test(tok)) { output.push("K"); }
		else if (numRE.test(tok)) { output.push("N"); }
		else { output.push(tok); }
	}

	return output.join(" ");
}

/*
 * checkParse()  -- returns true if the command is 
 * syntactically okay. False otherwise
 */
function checkParse(parsed, commOnly=false) {
	let status = false;

	const goodComms = [["READ", "( C)+"],
										 ["SET", " C"],
										 ["FREA", "( [NK])?( C)+"],
										 ["FSET", "( [NK])? C"],
										 ["DEFI", " [NK]( C)? [KC]"],
										 ["SUBS", " [NK]( C)? [NK] C"],
										 ["SIGN", " [CKN]( [CK])?"],
										 ["ABSO", " [CKN] [CK]"],
										 ["ROUN", " [CKN] [CK]"],
										 ["SQRT", " [CKN] [CK]"],
										 ["LOGE", " [CKN] [CK]"],
										 ["LOGT", " [CKN] [CK]"],
										 ["EXPO", " [CKN] [CK]"],
										 ["ANTI", " [CKN] [CK]"],
										 ["NSCO", " [CKN] [CK]"],
										 ["SIN", " [CKN] [CK]"],
										 ["COS", " [CKN] [CK]"],
										 ["TAN", " [CKN] [CK]"],
										 ["ASIN", " [CKN] [CK]"],
										 ["ACOS", " [CKN] [CK]"],
										 ["ATAN", " [CKN] [CK]"],
	                   ["SUBT", " ([CKN] ){2}[CK]"],
	                   ["DIVI", " ([CKN] ){2}[CK]"],
	                   ["RAIS", " ([CKN] ){2}[CK]"],
	                   ["ADD", " ([CKN] ){2,}[CK]"],
	                   ["MULT", " ([CKN] ){2,}[CK]"],
	                   ["RMAX", " ([CKN] ){2,}[CK]"],
	                   ["RMIN", " ([CKN] ){2,}[CK]"],
	                   ["AVER", " C( [CK])?"], 
	                   ["SUM", " C( [CK])?"], 
	                   ["STAN", " C( [CK])?"], 
	                   ["MEDI", " C( [CK])?"], 
	                   ["MAXI", " C( [CK])?"], 
	                   ["MINI", " C( [CK])?"], 
	                   ["COUN", " C( [CK])?"], 
										 ["FPRI", "( C)*"],
										 ["PRIN", "( C)*"],
										 ["DESC", "( C)+"],
										 ["ORDE", "( C C)+"],
										 ["SORT", "( C C)+"],
										 ["RANK", " C C"],
										 ["CHOO", "( [KN]){1,2}( C C)+"],
										 ["OMIT", "( [KN]){1,2}( C C)+"],
										 ["CONV", " C C C C"],
										 ["RECO", "( [KN]){1,2} C [KN] C"], 
										 ["GENE", "( [KN]){1,3} C"], 
										 ["JOIN", "( [KNC]){2,} C"],
										 ["PICK", "( [KN]){2}( C){2}"],
										 ["WIDT", "( [KN]){1,2}"],
										 ["NOPR", ".*"],
										 ["BRIE", ".*"],
										 ["NOBR", ".*"],
	                   ["HIST", " C( [KN] [KN])?"],
										 ["PLOT", " C C"],
										 ["PLOT", " C [KN] [KN] C [KN] [KN]"],
										 ["MPLO", "( C C)+"],
										 ["LPLO", " C C C"],
										 ["IRAN", "( [NK]){3} C"],
										 ["NRAN", "( [NK]){3} C"],
										 ["PRAN", "( [NK]){2} C"],
										 ["BTRI", "( [NK]){2} C"],
										 ["URAN", " [NK] C"],
										 ["BASE", " [NK]"],
										 ["SAMP", " [NK]( C C)+"],
										 ["DRAN", " [NK]( C){3}"],
										 ["BINO", "( [NK]){2}( C)?"],
										 ["BRAN", "( [NK]){3} C"],
										 ["PARS", " C C"],
										 ["PARP", " C C"],
										 ["NSCO", " C C"],
										 ["POIS", " [NK]"],
										 ["ZINT", "( [NK]){2} C"],
										 ["TINT", " [NK] C"],
										 ["ZTES", "( [NK]){2,3} C"],
										 ["TTES", "( [NK]){1,2} C"],
										 ["POOL", "( [NK]){0,2} C C"],
										 ["TWOS", "( [NK]){0,2} C C"],
										 ["CORR", "( C){2,}"],
										 ["CONS", ".*"],
										 ["NOCO", ".*"],
										 ["REGR", "( C){1,2} [NK]( C)+"],
										 ["AOVO", "( C)+"],
										 ["CHIS", "( C)+"],
										 ["TABL", " C C"],
										 ["CONT", " C C"],
										 ["ONEW", " C C"],
										 ["TWOW", " C C C"],
										 ["RUNS", " [NK] C"],
										 ["DECI", " [NK]"],
										 ["ALPH", " [NK]"],
										 ["INUN", " [NK]"],
										 ["OUTU", " [NK]"],
										 ["COLU", " [NK]"],
	                   ["NOTE", ".*"],
	                   ["NEWP", ".*"],
										 ["UNIC", ".*"],
										 ["NOUN", ".*"],
	                   ["STOP", ".*"],
										 ["END", ""]];

	for ([comm, args] of goodComms) {
		const re = (commOnly) ? RegExp("^"+comm) : RegExp("^"+comm+args+"$");
		if (re.test(parsed)) {
			status = true;
		}
	}
	return status;
}

/*
 * routines for parsing FORTRAN FORMAT specifications
 */

function parseFormat(s) {
	s = s.trim();
  if (!/^\(.+\)$/.test(s)) {
		throwError(ERR_BAD_FMT);
		return true;
	}

	s = s.slice(1,s.length-1); // remove parentheses
	
	//expand groups, e.g. 3(2X, F5.2)
	//expand repeated formats, e.g. 3F5.2, 2I4
	const groups = [ /(\d+)\(([^)]+)\)/, /(\d+)([FI][0-9.]+)/i ];
	for ( let group of groups ) {
		while ((a = group.exec(s)) !== null) {
			const reps = parseInt(a[1]);
			s = s.slice(0, a.index) 
					+ Array(reps).fill(a[2])
					+ s.slice(a.index+a[0].length);
		}
	}

	// fancy regex to make sure we don't catch "commas, in quotes"
	let subs = s.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
		             .map((e,i)=>e.trim());
	let fmts = [];
	
	for (let f of subs) {
		if ((a = /^F(\d+)\.(\d+)$/i.exec(f)) !== null) {
			const width = parseInt(a[1]);
			const dp = parseInt(a[2]);
			if (dp>=width || width == 0) {
				throwError(ERR_BAD_FMT);
				return true;
			}
			fmts.push(["N", width, dp]);
		} else if ((a = /^I(\d+)$/i.exec(f)) !== null) {
			const width = parseInt(a[1]);
			if (width == 0) {
				throwError(ERR_BAD_FMT);
				return true;
			}
			fmts.push(["N", width, 0]);
		} else if ((a = /^(\d+)X$/i.exec(f)) !== null) {
			const width = parseInt(a[1]);
			if (width == 0) {
				throwError(ERR_BAD_FMT);
				return true;
			}
			fmts.push(["X", width, " ".repeat(width)]);
		} else if ((a = /^['\"]([^'\"]+)['\"]$/.exec(f)) !== null) {
			const string = a[1];
			const width = string.length;
			if (width == 0) {
				throwError(ERR_BAD_FMT);
				return true;
			}
			fmts.push(["X", width, string]);
		} else {
			throwError(ERR_BAD_FMT);
			return true;
		}
	}

	return fmts;
}

/*
 * formatArgs -- take an array of formats (the output of parseFormats())
 * and applies them to a line of data, extracting the numbers
 */
function formatArgs(line, fmts) {
	let out = [];
	let idx = 0;
	
	if (fmts.length == 0) {
		throwError(ERR_NO_FORMT);
		return true;
	}

	for ([type, width, op] of fmts) {
		if (idx > line.length-1 || idx+width > line.length) {
			throwError(ERR_FORM_LNG);
			return true;
		}
		const s = line.slice(idx, idx+width);
		switch(type) {
			case "X":
				break;
			case "N":
				if (!isNaN(s)) {
					let n = parseFloat(s);
					if (n == Integer(n))  n /= 10**op;
					out.push(["N", n]);
				} else {
					throwError(ERR_FORM_NUM);
					return true;
				}
				break;
			default:
				throwError(ERR_BAD_FMT);
				return true;
				break;
		}
		idx += width;
	}
  return out;

}

