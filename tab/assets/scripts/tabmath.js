/*
 * doArithmetic(op, args) -- perform the operation in op ("ADD", "SUBT",
 * etc.) using the values in args (which can have columns, e.g. "C21", 
 * constants, e.g. "K5", or numbers, e.g. "-2.5"). the value is placed in
 * a column. 
 */
function doArithmetic(op, args) {
	const threeArgs = ["SUBT", "DIVI", "RAIS"];

	if ( threeArgs.includes(op) && args.length != 3) {
		throwError(ERR_NUM_ARGS);
		return true;
	}


	let out = args.pop();
	args = derefArgs(args);
	if (args === true) {
		return true;
	}
	let minColSize = minColLength(args);
	
	if (isSingleAnswer(args)) {
		let result = scalarMath(op, args);
		if (result == true) {
			return true;
		}
		if(out[0] == "C") {
			Columns[out[1]] = result;
		} else {
			Konstants[out[1]] = result;
		}
	} else {
		let results = [];
		for (let i = 0; i < minColSize; i++) {
			let result = scalarMath(op, args, i);
			if (result === true) {
				return true;
			}
			results.push(result);
		}
		if (out[0] == "C") {
			Columns[out[1]] = results;
		} else {
			throwError(ERR_ARRA_KON);
			return true;
		}
	}
	return false;
}

/*
 * alog(x) -- return the 10-base antilog of x
 */
function alog(x) {
	return 10**x;
}

/*
 * Integer(x) -- return the integer portion of x
 */
function Integer(x) {
	return (x > 0)?  Math.floor(x) : Math.ceil(x);
}

/*
 * doFunc(func, args) -- calculate the value in the first arg and place 
 * the result in the second arg. 
 */
function doFunc(func, args) {
	const tabf = ["SIGN", "ABSO", "ROUN", "SQRT", "LOGE", "LOGT", "EXPO",
		            "ANTI", "NSCO", "SIN", "COS", "TAN", "ASIN","ACOS","ATAN"];
	const jsf  = [Math.sign, Math.abs, Math.round, Math.sqrt, Math.log, 
		            Math.log10, Math.exp, alog, nScores, Math.sin, Math.cos,
	              Math.tan, Math.asin, Math.acos, Math.atan];

	let out = (args.length == 2) ? args.pop() : null;
	args = derefArgs(args);
	if (args === true) {
		return true;
	}
	let minColSize = minColLength(args);
	if (isSingleAnswer(args)) {
		const result = jsf[tabf.indexOf(func)](args[0][1]);
		if (out !== null && out[0] == "C") 
			Columns[out[1]] = result;
		else
			Konstants[out[1]] = result;
	} else {
		let zeros = negs = pozes = 0;
		let results = [];
		for (let i = 0; i < minColSize; i++) {
			const ans = jsf[tabf.indexOf(func)](Columns[args[0][1]][i]);
			if (func == "SIGN") {
				if (ans ==  1) { pozes++; }
				if (ans == -1) { negs++; }
				if (ans ==  0) { zeros++; }
			}
			results.push(ans);
		}
		if (func == "SIGN") {
			feedback(negs.toString()+ " negative values  " +
				       zeros + " zeros  " +
				       pozes + " positive values");
		}
		if (out !== null) {
			if (out[0] == "C") 
				Columns[out[1]] = results;
			else {
				throwError(ERR_ARRA_KON);
				return true;
			}
		}
	}
	return false;
}

/*
 * scalarMath(op, args, j-null) -- calculate an arithmetic
 * result across an entire row (specified by optional parameter j)
 * or for a bunch of scalars. Remember args[] nolonger has the final
 * argument, which is where the result is stored. 
 */
function scalarMath(op, args, j=null){
	let result = (args[0][0] == "C") ? Columns[args[0][1]][j] : args[0][1];

	for (let i=1; i < args.length; i++) {
		if (args[i][0] == "C"){
			result = doOperation(op, result, Columns[args[i][1]][j]);
		} else {
			result = doOperation(op, result, args[i][1]);
		}
		if (result === true) {
			throwError(ERR_DIV_ZERO);
			return true;
		}
	}
	return result;
}

/*
 * doOperation(op, x, y) -- perform operation op on numbers x and y
 * and return the result. Return true if there's an error
 */
function doOperation(op, x, y) {
  let result;
	switch (op) {
		case "ADD":
			result = x+y;
      break;
		case "SUBT":
			result = y-x; // SUBTract x from y
      break;
		case "MULT":
			result = x*y;
      break;
		case "DIVI":
			if (y != 0) result = x/y;
      break;
		case "RAIS":
			result = x ** y;
      break;
		case "RMAX":
			result = Math.max(x, y);
      break;
		case "RMIN":
			result = Math.min(x, y);
      break;
		default:
			result = true;
	}
  // round() removes floating point error in the 16th decimal place
  return (result === true) ? true : round(result, 15);
}

/*
 * productRange(a,b) -- get the product of all integers between a and b
 * inclusive
 */
function productRange(a, b) {
  let prd = a,i = a;
 
  while (i++ < b) {
    prd *= i;
  }
  return prd;
}

/*
 * combinations(n, r) -- calculate n choose r
 */
function combinations(n, r) 
{
  if (n==r || r == 0) 
  {
    return 1;
  } 
  else 
  {
    r = (r < n-r) ? n-r : r;
    return productRange( r+1, n ) / productRange( 1, n-r );
  }
}

/*
 * getMagnitiude(n) -- returns the order of magnitude (power of 10)
 * for a given number, with rounding for numbers closer to the next order
 */
function getMagnitude(n) {
    const sci = n.toExponential();
    const pt  = sci.indexOf("e");
    const man = parseFloat(sci.slice(0, pt));
    const exp = parseInt(sci.slice(pt+1));
    return (man <= 4) ? exp : exp+1;
}

/* Gabriel Giordano's implementation from C to JavaScript with some 
 * modifications on the research "An Efficient and Simple Algorithm 
 * for Matrix Inversion" by Ahmad Farooq and Khan Hamid
 *
 * regression(x, y) -- takes two matrices (2D arrays) x (indepdendent 
 * variables) and y (depdendent), and returns an array of linear 
 * coefficients for the least-squares regression line
 */


/*
 * Matrix functions needed in regression calculations
 */

function dotProduct(a, b) {
	return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n); 
}

function matrixInverse(a) {
	const EPSILON = 0.000001;
	let pivot = 0;

	for (let p = a.length; p-- > 0;) {
		pivot = a[p][p];

		if (Math.abs(pivot) < EPSILON)
			return 0;

		for (let i = a.length; i-- > 0;)
			a[i][p] /= -pivot;

		for (let i = a.length; i-- > 0;)
			if (i != p)
				for (let j = a.length; j-- > 0;)
					if (j != p)
						a[i][j] += a[p][j] * a[i][p]; 

		for (let j = a.length; j-- > 0;)
			a[p][j] /= pivot; 

		a[p][p] = 1 / pivot; 
	}

	return a; 
}

function matrixTranspose(a) {
	return Object.keys(a[0]).map((c) => a.map((r) => r[c]));
}

function matrixSubtract(a, b) {
	return a.map((x, i) => a.map((y, j) => a[i][j] - b[i][j]));
}

function scalarMultiply(a, s) {
	return a.map((x, i) => a.map((y, j) => a[i][j] * s));
}

function matrixMultiply(a, b) { 
	return a.map(x => matrixTranspose(b).map(y => dotProduct(x, y)));
}

function diag(arr) { 
	let a = Array.apply(null, new Array(arr.length)); 
	return a.map((x, i) => a.map((y, k) => i === k ? arr[i] : 0));
}

// return an n x n matrix of ones
function ones(n) {
	let a = Array(n).fill(null);
	return a.map(x => Array(n).fill(1));
}

function regression(x, y, w=null) {

	if (w === null) {
		w = Array(y.length).fill(1);
	}

	let t  = matrixTranspose(x),
		  wm = im(w),
		  b  = matrixMultiply(
				    matrixMultiply(
				     matrixMultiply(
							 matrixInverse(
								 matrixMultiply(
									 matrixMultiply(t, wm), x)), t), wm), y);
	
	return b;
}
