/*
 * doColumnStats(comm,args) -- execute column stat operation in comm and
 * optionally store it in a second column or constant. Return true if
 * error.
 */
function doColumnStats(comm, args) {
	const comms = ["COUN", "SUM", "NOCOMM", "AVER", "MEDI", 
		             "STAN", "MAXI", "MINI"];
  const out = ["Number of values",
						   "Sum", "Sum of squares", "Average", "Median",
							 "Standard deviation", "Maximum value", "Minimum value"];

	let op = comms.indexOf(comm);
	let c = Columns[args[0][1]];

	if (c === null) {
		throwError(ERR_NULL_COL);
		return true;
	}

	if (c.length == 0) {
	  throwError(ERR_ZERO_COL);
		return true;
	}

	let ans = columnOps(c)[op];

	feedback(out[op] + " = " + round(ans, Rounding));
	
	if (args.length == 2) {     // storing result
		if (args[1][0] == "C") {
			Columns[args[1][1]] = ans;
		} else {
			Konstants[args[1][1]] = ans;
		}
	}
	return false;
}

/*
 * columnOps(arr) -- given an array arr, no error-checking done at this
 * stage, return an array containing [n, Σx, Σx^2, μ, median, σ, max, min]
 */
function columnOps(arr) { 
	let c = [...arr]; // duplicate array for sorting. 
	c.sort((a, b) => a-b);
	let n, sum, sumsq, mean, median, sd, max, min, q1, q3, SSxx;
	if (typeof(c) == "number") {
		max = c;
		min = c;
		n = Infinity;
		sum = NaN;
		sumsq = NaN;
		mean = c;
		median = c;
		q1 = c;
		q3 = c;
		sd = 0;
		SSxx = 0;
	} else {
		max = c[c.length-1];
		min = c[0];
		n = c.length;
		sum = c.reduce((a, x) => a+x, 0);
		sumsq = c.reduce((a, x) => a+x*x, 0);
		mean = sum/n;
		SSxx = c.reduce((a, x) => a + (mean-x)*(mean-x));

		median = getMedian(c);
		if (n % 2 == 0) {
			q1 = getMedian(c.slice(0, Math.floor(n/2)));
			q3 = getMedian(c.slice(Math.floor(n/2)));
		} else {
			q1 = getMedian(c.slice(0, Math.floor(n/2)));
			q3 = getMedian(c.slice(Math.floor(n/2)+1));
		}

		sd = Math.sqrt(sumsq/(n-1) - (n/(n-1))*mean*mean);
	}
	return [n, sum, sumsq, mean, median, sd, max, min, sd/Math.sqrt(n), q1, q3, SSxx];
}

/*
 * getMedian(arr) -- find the median for a sorted array
 */
function getMedian(arr) {
	const n = arr.length;
	if (n % 2  == 0) {
		return (arr[n/2] + arr[n/2 - 1]) /2;
	} else {
		return arr[Math.floor(n/2)];
	}
}

/*
 * rand(args) -- assign random number to a column in uniform, Bernoulli,
 * or normal distributions
 */
function rand(args, comm="IRAN") {
	let putIn = args.pop();
	args = derefArgs(args);

	if (args === true) { return true; }

	let n = args[0][1];
  let a = (args.length != 1) ? args[1][1] : null;
	let b = (args.length == 3) ? args[2][1] : null;
	let width;

	if (n != Integer(n)) {
		throwError(ERR_NON_INT);
		return true;
	}

  if (n < 1) {
    throwError(ERR_RANG_VAL);
    return true;
  }

	switch (comm) {
		case "IRAN":
			if (a != Math.floor(a) || b != Math.floor(b)) {
				throwError(ERR_NON_INT);
				return true;
			}
			if (b <= a) {
				throwError(ERR_BAD_RAN);
				return true;
			}
			width = Math.max(a.toString().length, b.toString().length) + 2;
			break;
		case "BTRI":
			if (a <= 0 || a >= 1 ) {
				throwError(ERR_RANG_VAL);
				return true;
			}
			width = 4;
		case "NRAN":
			width = Math.max(Math.floor(a+3.2*b).toString.length,
				               Math.floor(a-3.2*b).toString.length)+3+Rounding;
			break;
		case "URAN":
			width = Rounding + 3;
			break;
		default:
			break;
	}

	if (PrintFlag) {
		switch (comm) {
			case "URAN":
				feedback(n.toString()+" random numbers  between 0 and 1");
				break;
			case "IRAN":
				feedback(n.toString()+" random integers between "+a+" and "+b);
				break;
			case "BTRI":
				feedback(n.toString()+" Bernoulli trials with p = "
						     +round(a, Rounding));
				break;
			case "NRAN":
				feedback(n.toString()
					       +" random samples from a normal population with "
							   + LtrMu + " = " + round(a, Rounding) 
					       + " " + LtrSigma + " = " + round(b, Rounding));
				break;
			default:
				break;
		}
	}
 
	let tally = Array(2).fill(0);
	let s = "";
	Columns[putIn[1]] = [];
	for (let i = 0; i < n; i++) {
		let x, xs;
		switch (comm) {
			case "URAN":
				x = Math.random();
				xs = formatNumberLength(x, width, Rounding);
				break;
			case "IRAN":
				x =	Math.floor(Math.random()*(b-a+1)) + a;
				xs = formatNumberLength(x, width, 0);
				break;
			case "BTRI":
				x =	(Math.random() <= a) ? 1 : 0;
				xs = formatNumberLength(x, width, 0);
				tally[x]++;
				break;
			case "NRAN":    // Box-Muller transform
				let u = 0, v = 0;
				while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
				while(v === 0) v = Math.random();
				let z = Math.sqrt(-2.0*Math.log(u)) * Math.cos(2.0*Math.PI*v);
			  x = z * b + a;
				xs = formatNumberLength(x, width, Rounding);
				break;
			default:
				break;
		}
		Columns[putIn[1]].push(x);
		s += xs;
		if (s.length > PlotWidth && PrintFlag) {
			feedback(s);
			s = "";
		}
	}

	if ( PrintFlag && s != "" ) { feedback(s) ; }
	if ( PrintFlag && comm == "BTRI") {
		feedback("Summary");
		feedback("Value   Frequency");
		for (let i = 0; i < 2; i++) {
			feedback(formatNumberLength(i,3,0)+formatNumberLength(tally[i],8,0));
		}
	}
}

/*
 * describe(args) -- output descriptive stats on columns
 */
function describe(args) {
	const out = {"n": 0, "Mean": 3, "Median": 4, "StdDev": 5,
		           "SE Mean": 8, "Max": 6, "Min":7, "Q1":9, "Q3": 10};
	const colWidth = 8;
	
	let results = [];
	let s= "          ";
	
	for (let arg of args) {
		if (getColLength(arg[1]) < 1) {
			throwError(ERR_NOAR_COL);
			return true;
		}
		let label = "C"+(arg[1]+1)
		s += label.padStart(colWidth, " ");
		results.push(columnOps(Columns[arg[1]]));
	}

	feedback(s);
	feedback();

	for (let stat in out) {
		s = stat.padEnd(10, " ");
		for (let rez of results) {
			let x = rez[out[stat]]
			let dp = Rounding;
			s += formatNumberLength(x, colWidth, dp);
		}
		feedback(s);
	}
  feedback();
	return false;
}

	

/*
 * sample(args) -- choose (non-replaceable) K items from a column. random
 * numbers follow a uniform distribution. 
 */
function sample(args) {
	const colWidth = 8;

	let n = derefArgs(args.shift());
	if (n === true) { return true; }
	n = n[1];

	let putIn = []
	const len = args.length / 2;
  
	while (args.length > len) {
		putIn.unshift(args.pop());
	}

	args = derefArgs(args);
	if (args === true) { return true; }

	if (n != Math.floor(n) || n < 1) { 
		throwError(ERR_RANG_VAL);
		return true;
	}
 
	for (let i = 0; i < len; i++) {
		if (args[i][0] == "N") {
			throwError(ERR_SCAL_COL);
			return true
		}
	}
 
	const colLen = Columns[args[0][1]].length;

	for (let i = 0; i < len; i++) {
		Columns[putIn[i][1]] = null;
		if (Columns[args[i][1]].length != colLen) {
			throwError(ERR_COLS_NE);
			return true
		}
	}
  
	if (n > colLen) {
		throwError(ERR_TOO_SAMP);
		return true;
	}
	if (PrintFlag) {
		feedback(n.toString() + " rows selected out of " + colLen);
		feedback("The rows selected from Column C"+(args[0][1]+1)+" contain:");
	}

  let s="";

	let row = [...Array(colLen).keys()]; // array of indices

	for	(let i = colLen - 1; i > 0; i--) { // Fisher-Yates shuffle
		const j = Math.floor(Math.random() * i);
		[ row[i], row[j] ] = [ row[j], row[i] ];
	}

	for (let j = 0; j < len; j++) {
		for (let i = 0; i < n; i++) {
			let r = Columns[args[j][1]][row[i]];
			if (Columns[putIn[j][1]] === null) {
				Columns[putIn[j][1]] = [r];
			} else {
				Columns[putIn[j][1]].push(r);
			}
			if (j == 0) {
				let R = (r == Integer(r)) ? 0 : Rounding;
				s += formatNumberLength(r, colWidth, R);
				if (s.length > PlotWidth && PrintFlag) {
					feedback(s); 
					s = "";
				}
			}
		}
	}
	if (s != "" && PrintFlag) { feedback(s); }

}


/*
 * dsample(args) -- choose (with replacement) K items from a column at 
 * random following the probability distribution in another column.
 * 
 */
function dSample(args) {
	let putIn = args.pop();
	args = derefArgs(args);
	if (args === true) { return true; }

	n = args[0][1];

	if (n != Math.floor(n) || n < 1) { 
		throwError(ERR_RANG_VAL);
		return true;
	}

	if (args[1][0] == "N" || args[2][0] == "N") {
		throwError(ERR_SCAL_COL);
		return true
	}

	let pop = Columns[args[1][1]];
  let prob = Columns[args[2][1]];

	if (pop.length != prob.length) {
		throwError(ERR_COLS_NE);
		return true;
	}

	let sum = columnOps(prob)[1];

	if (Math.abs(1-sum) > 0.0001) {
		throwError(ERR_PROB_ON);
		return true;
	}

	// create cumulative probability array
	
	let c = pop.map((e, i) => [e, prob[i]]);
	c.sort((a, b) => b[1]-a[1]);

	for (let i = 1; i<c.length; i++) { 
		c[i] = [c[i][0], c[i][1]+c[i-1][1]];
	}
	results = []

	for (let i = 0; i < n; i++) {
		let r = Math.random();
		for ([val, p] of c) {
			if (r < p) {
				results.push(val);
				break;
			}
		}
	}
	Columns[putIn[1]] = results;
}

/*
 * binomial(args) -- calculate binomial distribution table for N and 
 * some probaility P. Store in a column optionally.
 */
function binomial(args) {
	let putIn = args.pop();
	
	if (putIn[0] != "C") {
		args.push(putIn);
		putIn = null;
	}

	args = derefArgs(args);
	if ( args === true ) { return true; } 

	let n = args[0][1];
	let p = args[1][1];

	if ( n != Math.floor(n) ) { 
		throwError(ERR_NON_INT);
		return true;
	}

	if ( p <= 0 || p >= 1 || n <= 0) {
		throwError(ERR_RANG_VAL);
		return true;
	}

	const q = 1 - p;
	
	let results = Array(n+1).fill(0);

	if (PrintFlag) {
		feedback("Binomial probabilities for n = " + n + " and p = " + p);
		feedback("  k       p(x = k)      p(x "+LtrLE+" k)");
	}

	let sum = 0;
	for (let i = 0; i < n+1; i++) {
		let x = combinations(n, i) * (p**i) * (q**(n-i));
		sum += x;
		if (PrintFlag && round(sum,Rounding)>0 && round(x,Rounding)>0) {
			feedback(formatNumberLength(i, 3, 0) 
				       + formatNumberLength(x, 14, Rounding)
				       + formatNumberLength(sum, 15, Rounding));
		}
		results[i] = x;
	}

	if (putIn) {
		Columns[putIn[1]] = results;
	}

	return false;
}

/*
 * bRandom(args) -- conducts K random bernoulli trials (N times, with 
 * some probaility p of success) and keeps track of successes
 */
function bRandom(args) {
	let putIn = args.pop();
	
	args = derefArgs(args);
	if ( args === true )  return true;  

	const k = args[0][1];
	const n = args[1][1];
	const p = args[2][1];

	if ( n != Math.floor(n) || k != Math.floor(k)) { 
		throwError(ERR_NON_INT);
		return true;
	}

	if ( p <= 0 || p >= 1 || n < 1 || k < 1) {
		throwError(ERR_RANG_VAL);
		return true;
	}

	let results = [];
	let freqs = {};
  let maxFreq = 0;
	let s = ""; 

	if (PrintFlag) {
		feedback( k.toString() + " binomial experiments with n = " + n
			        + " and p = " + p);
	}

	for (let i = 0; i < k; i++) {
		let success = 0;
		
		for (let j = 0; j < n; j++) {
			success += (Math.random() <= p) ? 1 : 0;
		}

		results.push(success);
		
		if (freqs[success] === undefined) {
			freqs[success] = 1;
		} else {
			freqs[success]++;
		}

    if (freqs[success] > maxFreq) maxFreq = freqs[success];

		if (PrintFlag) {
			s += formatNumberLength(success, 5, 0);
			if (s.length > PlotWidth) {
				feedback(s);
				s = "";
			}
		}
	}

	if (PrintFlag) { 
    const barChar = (Unicode) ? "█" : "*";
    const scale = (maxFreq > PlotWidth) ? PlotWidth/maxFreq  : 1;

		if (s != "") { feedback(s); }
		feedback("Summary");
		feedback("Value  Frequency");
		for (key in freqs) {
      const bar = barChar.repeat(Math.round(freqs[key]*scale));
			feedback(formatNumberLength(parseInt(key), 4, 0) + 
				       formatNumberLength(parseInt(freqs[key]), 8, 0) +
               "  " + bar);
		}
	}

	Columns[putIn[1]] = results;
}

/*
 * poissonTable(args) -- prints out a table of Poisson probabilities for 
 * some given mean
 */
function poissonTable(args) {
	args = derefArgs(args);
	if (args === true) { return true; }
	
	let lam = args[0][1];

	if (lam > 100) {
		throwError(ERR_RANG_VAL);
		return true;
	}

	feedback("Poisson probabilities for " 
		       + LtrLambda + " = " + lam);
	feedback("  k       p(x = k)     p(x " + LtrLE + " k)");

	results = poisson(lam);

	let sum = 0;
	for (let x = 0; x < results.length; x++) {
		f = results[x];
		sum += f;
		feedback(formatNumberLength(x, 3, 0) 
			       + formatNumberLength(f, 14, Rounding)
			       + formatNumberLength(sum, 12, Rounding));
	}
	return false;
}

/*
 * poisson -- return an array of a Poisson distribution given a mean
 */
function poisson(lam) {
	let results = [];
	let fact = 1;
	let f = 1;
	let x = 0;
	while (f > Error) {
		fact *= (x == 0) ? 1 : x;
		f = Math.exp(-lam) * (lam**x) / fact;
		results.push(f);
		x++;
	}
	return results;
}


/*
 * pRandom(args) -- random sample from the Poisson distribution
 */
function pRandom(args) {
	const putIn = args.pop();
	args = derefArgs(args);
	if (args === true) { return true; }

	const n = args[0][1];
	const lam = args[1][1];

	if (n != Integer(n) || n < 1 || lam > 100) {
		throwError(ERR_RANG_VAL)
		return true;
	}

	let dist = poisson(lam);

	//cumulative probabilities
	dist = dist.map((e, i) => [i, e]);
	dist.sort((a, b) => b[1] - a[1]);

	for (let i = 1;  i < dist.length; i++) {
		dist[i] = [ dist[i][0] , dist[i][1] + dist[i-1][1] ];
	}
	
	if (PrintFlag) {
		feedback(n.toString() + " samples from the Poisson distribution, with "
			       + LtrLambda + " = " + lam);
	}

	// generate random sample 
	let results = [];
	let s = "";

	for (let i = 0; i < n; i++) {
		let r = Math.random();
		for ([val, p] of dist) {
			if (r < p) {
				results.push(val);
				if (PrintFlag) {
					s += formatNumberLength(val, 5, 0);
					if (s.length > PlotWidth) {
						feedback(s);
						s = "";
					}
				}
				break;
			}
		}
	}
	if (PrintFlag && s != "") { feedback(s); }

	Columns[putIn[1]] = results;
	return false;
}

function nScores(args) {
	const putIn = args.pop();
	args = derefArgs(args);
	if (args === true) { return true; }

	let data = Columns[args[0][1]];
	if (data === null || typeof(data) == "number") {
		throwError(ERR_NOAR_COL);
		return true;
	}

	let uniq = {};
	for (let item of data) {
		if (uniq[item] === undefined) { uniq[item] = 1; }
	}
	
	let k = Object.keys(uniq).sort((a, b) => parseFloat(a) - parseFloat(b));
	let n = k.length;
	
	for (let i = 0; i < n; i++) {
    q = ((i+1) - 3/8) / (n + .25);
    uniq[k[i]] = critz(q);
	}

	results = Array(data.length);

	for (let i = 0; i < data.length; i++) {
		results[i] = uniq[data[i]];
	}

	Columns[putIn[1]] = results;

	return false;

}

function hypTest(args, comm) {
	const col = args.pop()[1];
	
	const len = getColLength(col);
	if (len < 1) {
		throwError(ERR_NOAR_COL);
		return true;
	}

	const stats = columnOps(Columns[col]);
	const xbar = stats[3];
	const sd = stats[5];
	
	args = derefArgs(args);
	if (args === true) { return true; }
	
	let sigma, test;
  let mu = args[0][1];

	if (comm == "ZTES") {
		sigma = (args.length == 2) ? args[1][1] : args[2][1];
		test = (args.length == 2) ? 0 : args[1][1];
	} else {   // t-test
		sigma = sd;
		test = (args.length == 1) ? 0 : args[1][1];
	}

	const ts = (xbar - mu) / (sigma / Math.sqrt(len));
  let pVal;
	const	cdf = (comm == "ZTES" ) ? poz(ts) : tProb(ts, len-1);
	const	acdf = (comm == "ZTES" ) ? poz(Math.abs(ts)) : tProb(Math.abs(ts), len-1);
	if ( test == 1 ) {
		pVal = 1 - cdf;
	} else if ( test == -1 ) {
		pVal = cdf;
	} else {
		pVal = 2*(1-acdf);
	}
	const can = (pVal >= Alpha) ? "cannot" : "can";
	const is = (pVal >= Alpha) ? "is" : "is not";
	 
	feedback("C" + (col+1) + "   n = " + len + "   " + LtrXbar + " = " 
		       + round(xbar, Rounding+2) + "   " 
		       +((Unicode) ? "σₙ₋₁" : "Std. dev.") + " = " 
		       + round(sd, Rounding+2));
	
	switch (test) {
		case -1:
			feedback("Test of "+ LtrMu +" = " + mu + " vs. "+ LtrMu +" < " + mu);
			break;
		case 1:
			feedback("Test of "+ LtrMu +" = " + mu + " vs. "+ LtrMu +" > " + mu);
			break;
		default:
			feedback("Test of "+ LtrMu +" = " + mu 
				        + " vs. "+ LtrMu +" "+ LtrNE +" " + mu);
	}
	
	if (comm == "ZTES") {
		feedback("The assumed " + ((Unicode) ? "σₙ" : "Pop. Std. dev.") 
			       + " = " + sigma);
	}
	feedback(comm[0].toLowerCase() + " = " + round(ts, Rounding));
	feedback("The test "+is+" significant at " + round(pVal, Rounding));
	feedback(can + " reject at "+ LtrAlpha +" = " + Alpha);
	

	return false;
}

/*
 * runsTest(args) -- perform a two-sided runs test on observations 
 * in C > K r <= K.
 */

function runsTest(args) {
	const data = args.pop()[1];
	const n = getColLength(data);

	if (n < 1) {
		throwError(ERR_NOAR_COL);
		return true;
	}

	args = derefArgs(args);
	if (args === true) return true;
	
	let k = args[0][1];
	let runs = 0,
		  over = 0,
		  under = 0;
	let last  = null;
	for (let item of Columns[data]) {
		if (item > k) 
			over++;
		else
			under++;
		if (last === null) {
			last = item > k;
			runs = 1;
		}
		const state = item > k;
		if (state !== last) {
			last = state;
			runs++;
		}
	}

	const e  = 1 + 2*over*under/n;
	const s2 = 2*over*under*(2*over*under - n)/(n*n*(n-1));
	const z  = (runs - e) / Math.sqrt(s2);
	const threshold = round(critz(1-(Alpha/2)), Rounding)

	feedback("Number of runs: "+runs);
	feedback("Expected number of runs: "+e);
	feedback("Std. dev. of expectation: "+round(Math.sqrt(s2), Rounding));
	feedback("test statistic z = "+round(z,Rounding));
	feedback("At "+ LtrAlpha +" = "+ Alpha +", reject H₀ if |z| > " 
		       + threshold+"\n");

	return false;
}

/*
 * unpaired(args, comm) -- conduct a pooled or two-sample t-test on 
 * data in two columns
 */
function unpaired (args, comm) {
	const c2 = args.pop()[1];
	const c1 = args.pop()[1];
	let conf = 95;   // default confidence
	let test = 0;    // default alternative hypothesis

	const n1 = getColLength(c1);
	const n2 = getColLength(c2);

	if (n1 < 1 || n2 < 1) {
		throwError(ERR_NOAR_COL);
		return true;
	}

	if (args.length > 0) {
		args = derefArgs(args);
		if (args === true) { return true; }
		for ([type, val] of args) {
			if (val > 1 && val < 100) {
				conf = val;
			} else if ([-1, 0, 1].includes(val)) {
				test = val;
			} else {
				throwError(ERR_RANG_VAL);
				return true;
			}
		}
	}

	const alpha = (100-conf) / 100;
	const stat1= columnOps(Columns[c1]);
	const stat2= columnOps(Columns[c2]);
	const x1   = stat1[3];
	const x2   = stat2[3];
	const xDiff= x1 - x2;
	const s1   = stat1[5];
	const s2   = stat2[5];
	
	let df;
	if (comm == "POOL") {
		df   = n1 + n2 - 2;
	} else {
		df = ((s1**2/n1)+(s2**2/n2))**2 
			   / (((s1**2/n1)**2/(n1-1)) + ((s2**2/n2)**2/(n2-1)));
		df = Math.round(df);
	}

	const sp   = Math.sqrt(((n1-1)*s1*s1 + (n2-1)*s2*s2)/df);
	
	let f;
	if (comm == "POOL") {
		f = sp*Math.sqrt((1/n1) + (1/n2));
	} else {
		f = Math.sqrt(s1*s1/n1 + s2*s2/n2);
	}

	const t    = xDiff / f;
	const	cdf  = tVal(1-alpha, df);
	const	acdf =  tVal((1-alpha/2), df);

	let tStar, tail;
	if ( test == 1 ) {
		tStar = 1 - cdf;
		tail = tProb(t, df)
	} else if ( test == -1 ) {
		tStar = cdf;
		tail = tProb(t, df)
	} else {
		tStar = 2*(1-acdf);
		tail = 2*tProb(t, df);
	}

	const high = xDiff - tStar * f;
	const low  = xDiff + tStar * f
	const sdLbl = (Unicode) ? "σₙ₋₁" : "StDev";
	const m1Lbl = LtrMu + subscript(1);
	const m2Lbl = LtrMu + subscript(2);

	feedback("C" + (c1+1) + "   n = " + n1 + "   "+ LtrXbar+" = " 
		       + round(x1,Rounding) + "   "+sdLbl+" = " + round(s1, Rounding));
	feedback("C" + (c2+1) + "   n = " + n2 + "   "+LtrXbar+" = " 
		       + round(x2,Rounding) + "   "+sdLbl+" = " + round(s2, Rounding));
	let degs = (comm=="POOL") ? "Degrees" : "Approximate degrees";
	feedback(degs + " of freedom = " + df);
	feedback("A " + conf + "% C.I. for "+m1Lbl+" - "+m2Lbl+" is (" 
		       + round(low, Rounding) + ", " + round(high, Rounding) + ")");
	switch (test) {
		case -1:
			feedback("Test of "+m1Lbl+" "+LtrGE+" "+m2Lbl
				       +" vs. "+m1Lbl+" < "+m2Lbl+"");
			break;
		case 1:
			feedback("Test of "+m1Lbl+" "+LtrLE+" "+m2Lbl
				       +" vs. "+m1Lbl+" > "+m2Lbl+"");
			break;
		default:
			feedback("Test of "+m1Lbl+" = "+m2Lbl
				       +" vs. "+m1Lbl+" "+LtrNE+" "+m2Lbl+"");
	}
	feedback("t = " + round(t, Rounding));
	feedback("The test is significant at " + round(tail, Rounding));
	return false;
}

/*
 * pearson(args) calculate the Pearson correlation coefficient for
 * two columns, already validted.
 */
function pearson(x, y) {
	const xBar = columnOps(x)[3]; 
	const yBar = columnOps(y)[3];
	let sumXY = sumX2 = sumY2 = 0;
	for (let i = 0; i < x.length; i++) {
		sumX2 += (x[i] - xBar) * (x[i] - xBar);
		sumY2 += (y[i] - yBar) * (y[i] - yBar);
		sumXY += (x[i] - xBar) * (y[i] - yBar);
	}
  const r =  sumXY / Math.sqrt(sumX2 * sumY2);
	return { "Sxx": sumX2, "Syy": sumY2, "Sxy": sumXY, "r": r };
}

/*
 * correlation(args) -- pairwise correlation coefficients for a
 * set of columns
 */
function correlation(args) {
	const len = getColsLength(args);
	if (len === true) { return true; }

	let pairs = [];

	for(let i = 0; i < args.length-1; i++) {
		for(let j = i+1; j < args.length; j++) {
			pairs.push([args[i], args[j]]);
		}
	}

	for ([x, y] of pairs) {
		const r = pearson(Columns[x[1]], Columns[y[1]])['r'];
		feedback("Pearson's r for C" + (x[1]+1) + " and C"
			       + (y[1]+1) + " = " + round(r,Rounding));
	}
	return false;
}

/*
 * interval(args, comm) -- calculate confidence intervals for data in a
 * column for a certain percentage confidence. For a Z interval, a 
 * population standard devaition is given
 */
function interval(args, comm) {
	const col = args.pop()[1];
	const pct = derefKonst(args[0]);
	let sigma = (comm == "TINT") ? null : derefKonst(args[1]);

	if (pct === true || sigma === true) {
		throwError(ERR_NULL_KON);
		return true;
	}
	
	conf = pct / 100;
	conf += (1 - conf) / 2;

	if (conf <= 0 || conf >= 1) {
		throwError(ERR_RANG_VAL);
		return true;
	}
	
	const len = getColLength(col);

	if (len < 1) {
		throwError(ERR_NOAR_COL);
		return true;
	}
	
	const stats = columnOps(Columns[col]);
	const mean = stats[3];
  const sd = stats[5];

	const lookup = ( comm == "ZINT" ) ? critz(conf) : tVal(conf, len-1);
	if (sigma === null) { sigma = sd; }

	const low   = mean - lookup*sigma/Math.sqrt(len);
	const high  = mean + lookup*sigma/Math.sqrt(len);
	const popSD  = (Unicode) ? "σₙ"   : "Std. Dev.";
	const sampSD = (Unicode) ? "σₙ₋₁" : "Std. Dev.";
	
	feedback("C" + (col+1) + "   n = " + len + "   "+ LtrXbar +" = " 
		       + round(mean, Rounding+2) + "   "+ sampSD +" = " 
		       + round(sd, Rounding+2));
	if (comm == "ZINT") {
		feedback("The assumed population "+ popSD +" = " + sigma);
	}

	feedback("A " + pct + "% C.I. for "+ LtrMu +" is (" + round(low, Rounding)
		        + ", " + round(high, Rounding)  + ")");

	return false;

}
/*
 * linearRegression(args) -- calculate regression equation for single
 * or multiple regression, with ot without weights, and associated 
 * statistics
 */
function linearRegression(args) { 
	let k, arglen, out, hasWeights;

	// find where our k (number of X arguments) is
	if (args[1][0] != "C") { // no weights
		k = derefKonst(args[1]);
		if (k === true) return true;
		args = [...args.slice(0,1), ...args.slice(2)];
		arglen = 1;
		hasWeights = false;
	} else { // weighted regression!
		k = derefKonst(args[2]);
		if (k === true) return true;
		args = [...args.slice(0,2), ...args.slice(3)];
		hasWeights = true;
		arglen = 2;
	}
	
	//validate k, the right number of args, our columns, etc.
	if (k != Math.floor(k)) { throwError(ERR_NON_INT); return true; } 
	if (k < 1) { throwError(ERR_RANG_VAL); return true; } 
	arglen += k;
	if (args.length<arglen) { 
		throwError(ERR_NUM_ARGS); 
		return true; 
	} else if (args.length > arglen) {
		out = args.slice(arglen);
		args = args.slice(0, arglen);
	} else {
		out = [];
	}

	const n = getColsLength(args);
	if (n === true) return true;

	// set up our matrices
	const yCol = args.shift()[1];
	const wCol = (hasWeights) ? args.shift()[1] : null;
	const xCols = Array(k).fill(null).map((e, i) => args[i][1]);

	const y = Array(n).fill(null).map((e, i) => [Columns[yCol][i]]);

	const x = Array(n).fill(null).map((e, i) => (NoIntercept) ? []:[1]);
	for (let col of xCols)
		x.map((e, i) => e.push(Columns[col][i]));

	const t  = matrixTranspose(x);
	const w = (hasWeights) ? Columns[wCol] : Array(n).fill(1);
	const wm = diag(w);
	const df = n - k - 1;

	// this product/inverse gets used more than once (X'X)^-1
  const ker = matrixInverse(matrixMultiply( matrixMultiply(t, wm), x ));

	// this factor is common both to calculating coeffs and hat
	const fac = matrixMultiply(matrixMultiply(ker, t), wm);

	// hat, such that hat*y = yHat (vector of estimates)
	const hat = matrixMultiply(x, fac);

	const id  = diag(Array(n).fill(1));   // identity matrix
	const on  = ones(n);                  // matrix of all ones


	const b = matrixMultiply(fac, y);     // coefficients

	// output regression equation
	let eq = "y = " + ((NoIntercept) ? "" : round(b[0], Rounding));
	const startIndex = (NoIntercept) ? 0 : 1;
	const addOne = (NoIntercept) ? 1 : 0;

	for (let i=startIndex; i<b.length; i++) {
		if (i > startIndex || !NoIntercept) {
			eq += (b[i] < 0) ? " - " : " + ";
		} else if (NoIntercept && i == startIndex && b[i] < 0) {
			eq += " - ";
		}
		eq+= round(Math.abs(b[i]), Rounding) + " x" +subscript(i+addOne);
	}

	feedback("The regression equation is:");
	feedback(eq + "\n");
	
	// matrix calculations needed for regression stats, ANOVA etc.
	const yHat = matrixMultiply(hat, y);
	const SSe = matrixMultiply(            // error sum of squares
							 matrixTranspose(y),
							  matrixMultiply(
							    matrixSubtract(id, hat), y))[0][0];
	const SSr = matrixMultiply(           // regression sum of squares
							 matrixMultiply(
								matrixTranspose(y),
									matrixSubtract(hat, scalarMultiply(on, 1/n))), y)[0][0];
	const SSt = matrixMultiply(           // total sum of squares
							 matrixMultiply(
								matrixTranspose(y),
									matrixSubtract(id, scalarMultiply(on, 1/n))), y)[0][0];
	
	// r-squared
	const r2    = SSr/SSt;
	const r2adj = 1 - ((1 - r2) * (n - 1) / df);

	// standard error for coeffs
	const MSe = SSe / df; // variance 
	const c = scalarMultiply(ker, MSe);

	// coefficient table
  feedback("                                Std. Err.       T-Ratio");	
	feedback("                 Coefficient     of Coeff      Coeff/SE");
	for (let i = startIndex; i < k+startIndex; i++) {
		let s;
		if (NoIntercept) {
			s = "x"+subscript(i+addOne) + "       ";
		} else {
			s = (i==0) ? "          " : "x"+subscript(i) + "       ";
		}
		if (i>0 && i<10) s += " ";
		if (NoIntercept) {
			s += "C"+(xCols[i]+1) + "     ";
		} else {
		s += (i==0) ? "--      " : "C"+(xCols[i-1]+1) + "     ";
		}
		if (i>0 && i<10) s += " ";
		const se = Math.sqrt(c[i][i]);
		s += formatNumberLength(b[i],10, Rounding);
		s += formatNumberLength(se, 13, Rounding);
		s += formatNumberLength(b[i]/se, 13, Rounding);
		feedback(s);
	}

	// basic stats
	feedback("The Std. Err. of y about the regression line is:");
	feedback(LtrSigma+" =    " + round(Math.sqrt(MSe), Rounding));
	feedback("With (" + n + " - " + (n-df) 
		        + ") = " + df + " degrees of freedom");
	feedback("r"+ LtrSq +" =   " + round(r2*100, 1) +"%");								  
	feedback("r"+ LtrSq +" =   " + round(r2adj*100, 1) +"% adjusted for DF \n");
	
	// ANOVA
	feedback("Analysis of Variance");
	feedback("Due to         DF                  SS          MS = SS/DF");
	feedback("Regression    " + formatNumberLength(k,3,0) +
		        formatNumberLength(SSr, 20, Rounding) +
	          formatNumberLength(SSr/k, 20, Rounding));
	feedback("Residual      " + formatNumberLength(df,3,0) +
		        formatNumberLength(SSe, 20, Rounding) +
	          formatNumberLength(SSe/df, 20, Rounding));
	feedback("Total         " + formatNumberLength(df+k,3,0) +
		        formatNumberLength(SSt, 20, Rounding) + "\n");


	// detailed ANOVA
	if (k > 1) { 
		feedback("Detailed Analysis of Variance");
		feedback("SS Explained by each variable when entered in the order given\n");
		feedback("Due to         DF                  SS");
		feedback("Regression    " + formatNumberLength(k,3,0) +
			        formatNumberLength(SSr, 20, Rounding));
		
		let prev = 0;
		for (let i = 0; i < k; i++) {
			const xPart = Array(n).fill(null).map((e, j) => x[j].slice(0, i+2));
			const tPart = matrixTranspose(xPart);
			const hPart = matrixMultiply( 
										  matrixMultiply(xPart,
				                matrixInverse(matrixMultiply(tPart, xPart))) , 
												 tPart);
			const sPart=matrixMultiply(           
									 matrixMultiply(
										matrixTranspose(y),
											matrixSubtract(hPart, 
												scalarMultiply(on, 1/n))), y)[0][0] - prev;
			feedback("C" + (xCols[i]+1) + ((xCols[i]<9) ? " " : "") +
			         "             1" +
					     formatNumberLength(sPart, 20, Rounding));
			prev = sPart;
		}
		feedback("");
	}


	// calculating values for row-by-row report
	let res = [],
		  se  = [],
		  sres= [];
	for (let i = 0; i < n; i++) {
		const temp = y[i][0]-yHat[i][0];
		res.push(temp);
		se.push( Math.sqrt(MSe * 
		          matrixMultiply(
							 matrixMultiply([x[i]], ker), 
		  				   matrixTranspose([x[i]]))[0][0]));
    sres.push(temp/Math.sqrt(MSe*(1-hat[i][i]))) 
	}
	// sending output to cols (optional)
	if (out.length > 0) {
		const srCol = out.shift()[1];
		Columns[srCol] = sres;
  }
	if (out.length > 0) {
		const yhCol = out.shift()[1];
		Columns[yhCol] = yHat.flat();
  }
	if (out.length > 0) {
		const bCol = out.shift()[1];
		Columns[bCol] = b.flat();
  }
  if ( Brief ) return false;

	// print table
	feedback("  Row      x"+subscript(1)+"            y        Pred. y    Std. Err");
	feedback("           C" + (xCols[0]+1) + ((xCols[0]>8) ? "" : " ") +
		       "          C" + (yCol+1) + ((yCol>8) ? "" : " ") +
 		       "         Value     Pred. y   Residual St. Res.");
	for (let i = 0; i < n; i++) {
		feedback(formatNumberLength(i+1, 5, 0) + 
			       formatNumberLength(x[i][startIndex], 12, Rounding) +
			       formatNumberLength(y[i][0], 12, Rounding) +
			       formatNumberLength(yHat[i][0], 12, Rounding) +
			       formatNumberLength(se[i], 12, Rounding) +
			       formatNumberLength(res[i], 11, Rounding) +
			       formatNumberLength(sres[i], 9, Rounding));
	}
	return false;
}

/*
 * prepOneWay(args, comm) -- prepare data for passing to oneWayAnova()
 */
function prepOneWay(args, comm) {
	args = derefArgs(args);
	if (args === true) return true;
	for (let arg of args) {
		if (arg[0] != "C") {
			throwError(ERR_NOAR_COL);
			return true;
		}
	}
	
	let data, labels;

	if (comm == "ONEW") {
		const theData = args[0][1];
		const theLevel = args[1][1];
		const levels = [...new Set(Columns[theLevel])];
		data = Array(levels.length).fill(null);
		for (let i = 0; i < Columns[theData].length; i++) {
			const item = Columns[theData][i];
			const lvl = Columns[theLevel][i];
			const idx = levels.indexOf(lvl);
			if (data[idx] === null) data[idx] = [];
			data[idx].push(item);
		}
		labels = levels.map(x => x.toString());
	} else {  // AOVONEWAY, with the data alreqady separated into columns
		data = [];
		labels = Array(args.length).fill("").map((e, i) => "C"+(args[i][1]+1));
		for ([type, val] of args) 
			data.push([...Columns[val]]);
	}

	oneWayAnova(data, labels);

	return false;
}

/*
 * oneWayAnova(data, labels) -- given a 2d array, print out an ANOVA table
 */
function oneWayAnova(data, labels) {
	const k = data.length;
	const total = data.flat();
	const totalStats = columnOps(total);
	let stats = [];
	for (let dataSet of data) 
		stats.push(columnOps(dataSet));
	
	//correction for the mean
	const cm  = totalStats[1] * totalStats[1] / totalStats[0];

	//total sum of squares
	const SS = totalStats[2] - cm;
	
	//factor (treatment) sum of squares
	let SSt = 0;
	for (let i = 0; i < k; i++)
		SSt += stats[i][1] * stats[i][1] / stats[i][0];
	SSt -= cm;
	
	//error sum of squares
	const SSe = SS - SSt;
	
	//now all the means
	MSt = SSt / (k - 1);
	MSe = SSe / (totalStats[0] - k);

	//F ratio
	f = MSt / MSe;

	const temp = PlotHeight;
	PlotHeight = 15;
	binPlot(data, labels);
	PlotHeight = temp;

	// ANOVA table
	feedback("Analysis of Variance");
	feedback("Due to         DF          SS      MS = SS/DF     F-ratio");
	feedback("Factor        " + formatNumberLength(k-1,3,0) +
		        formatNumberLength(SSt, 12, Rounding) +
	          formatNumberLength(MSt, 16, Rounding) +
	          formatNumberLength(f, 12, Rounding));
	feedback("Error         " + formatNumberLength(totalStats[0]-k,3,0) +
		        formatNumberLength(SSe, 12, Rounding) +
	          formatNumberLength(MSe, 16, Rounding));
	feedback("Total         " + formatNumberLength(totalStats[0]-1,3,0) +
		        formatNumberLength(SS, 12, Rounding) + "\n");

	// print out the Stats on the levels
	const pooledSD = Math.sqrt(MSe);
	const t = tVal(1-(Alpha/2), totalStats[0]-k);
	let conRange = [];

	feedback("Level       N      Mean     St. Dev.");
	for (let  i = 0; i < k; i++) {
		feedback(labels[i].padEnd(10, " ") + 
			       formatNumberLength(stats[i][0], 3, 0) + 
             formatNumberLength(stats[i][3], 10, Rounding) +
			       formatNumberLength(stats[i][5], 13, Rounding));

		const half = pooledSD * t / Math.sqrt(stats[i][0]);
		conRange.push([stats[i][3]-half, stats[i][3], stats[i][3]+half]);
	}
	//pooledSD = Math.sqrt(pooledSD / (totalStats[0] - k));
	feedback("Pooled St. Dev. = " + round(pooledSD, Rounding));
	
	//Confidence Interval plot
	feedback()
	feedback("Individual " + (100-Alpha*100) + "% C.I. for level means");
	feedback("(based on pooled standard deviation)");
	feedback();
	rangePlot(conRange, labels);
}

/*
 * twoWayAnova(args) -- perform a two-way ANOVA analysis on data in one 
 * column with rows and column defined in two other columns.
 */
function twoWayAnova(args) {

	const sum = (a, b) => a + b;
	const ss  = (a, b) => a + b * b;

	//validate arguments

	args = derefArgs(args);
	if (args === true) return true;
	
	let len = null;
	for ([type, val] of args) {
		if (type == "N") {
			throwError(ERR_NOAR_COL);
			return true;
		}

		if (len === null) {
			len = Columns[val].length;
		} else if (Columns[val].length < len) {
				throwError(ERR_COLS_NE);
				return true;
		}
	}

	const dataCol = args[0][1];
	const rowCol = args[1][1];
	const colCol = args[2][1];
	const labels = ["C" + (args[1][1]+1), "C" + (args[2][1]+1)];
	
	
	//set up data
	const rowLevels = [...new Set(Columns[rowCol])];
	const colLevels = [...new Set(Columns[colCol])];
	const	rowLabels = rowLevels.map(x => x.toString());
	const	colLabels = colLevels.map(x => x.toString());
	const a  = rowLevels.length;
	const b  = colLevels.length;
	let data = [];
	for(let i = 0; i < a; i++) {
    let col = []
    for(let j = 0; j < b; j++)
        col.push([]);
    data.push(col);
	}
	
	let r = 0; //number of trials per cell
	//populate the matrix
	for (let i = 0; i<Columns[dataCol].length; i++) {
    const rowVal = rowLevels.indexOf(Columns[rowCol][i]);
    const colVal = colLevels.indexOf(Columns[colCol][i]);
    data[rowVal][colVal].push(Columns[dataCol][i]);
		r = Math.max(r, data[rowVal][colVal].length);
	}
	
	for (let i = 0; i < a; i++) {
		for (let j = 0; j < b; j++) {
			if (data[i][j].length != r) {
				throwError(ERR_UNEVEN_R);
				return true;
			}
		}
	}
	
	//compute sums
	let SSab = 0;
	const totalStats = columnOps(Columns[dataCol]);
	const cm = totalStats[1] * totalStats[1] / totalStats[0];
	const SS = totalStats[2] - cm;
	const A  = Array(a).fill(0);
	const B  = Array(b).fill(0);
	for (let i = 0; i < a; i++) {
    for (let j = 0; j < b; j++) {
        const temp = data[i][j].reduce(sum, 0);
        A[i] += temp;
        B[j] += temp;
        SSab += temp*temp;
    }
	}
	const SSa = A.reduce(ss, 0) / (b*r)  - cm;
	const SSb = B.reduce(ss, 0) / (a*r)  - cm;
	SSab = SSab/r - SSa - SSb - cm;
	const SSe = SS - SSa - SSb - ((r == 1) ? 0 : SSab);
	const DFa = a - 1;
	const DFb = b - 1;
	const DFab= DFa * DFb;
	const DF  = totalStats[0] - 1;
	const DFe = DF - DFa - DFb - ((r == 1) ? 0 : DFab);
	const MSa = SSa / DFa;
	const MSb = SSb / DFb;
	const MSab= SSab / DFab;
	const MSe = SSe / DFe;

	// ANOVA table
	feedback("Analysis of Variance");
	feedback("Due to         DF          SS      MS = SS/DF     F-ratio");
	feedback(labels[0].padEnd(14, " ") + formatNumberLength(DFa,3,0) +
		        formatNumberLength(SSa, 12, Rounding) +
	          formatNumberLength(MSa, 16, Rounding) +
	          formatNumberLength(MSa / MSe, 12, Rounding));
	feedback(labels[1].padEnd(14, " ") + formatNumberLength(DFb,3,0) +
		        formatNumberLength(SSb, 12, Rounding) +
	          formatNumberLength(MSb, 16, Rounding) +
	          formatNumberLength(MSb / MSe, 12, Rounding));
	if (r > 1) {
		feedback((labels[0] + " * " + labels[1]).padEnd(14, " ") + 
			      formatNumberLength(DFab,3,0) +
		        formatNumberLength(SSab, 12, Rounding) +
	          formatNumberLength(MSab, 16, Rounding) +
	          formatNumberLength(MSab / MSe, 12, Rounding));
	}
	feedback("Error         " + formatNumberLength(DFe,3,0) +
		        formatNumberLength(SSe, 12, Rounding) +
	          formatNumberLength(MSe, 16, Rounding));
	feedback("Total         " + formatNumberLength(DF,3,0) +
		        formatNumberLength(SS, 12, Rounding) + "\n");

	const pooledSD = Math.sqrt(MSe);
	const t = tVal(1-(Alpha/2), DFe);

	const aRanges = Array(a).fill(null);
	const bRanges = Array(b).fill(null);
	const aHalf = t * pooledSD / Math.sqrt(r*b);
	const bHalf = t * pooledSD / Math.sqrt(r*a);
	

	//means table
	
	if (r == 1) {
		feedback("Observations");
	} else {
		feedback("Cell means");
	}

	feedback("Rows are levels of " + labels[0] + 
		       "               Cols are levels of "+labels[1]);
	feedback(" ".repeat(8+12*colLabels.length) + "        Row");
	feedback(colLabels.reduce((x, y) => x + y.padStart(12," "), "        ")+
	         "       Means");

	for (let i = 0; i < a; i++) {
		const aMean = A[i] / (r*b);
		aRanges[i] = [aMean - aHalf, aMean, aMean + aHalf];
		let s = rowLabels[i].padEnd(8, " ");
		for (let j = 0; j < b; j++) { 
			if (bRanges[j] === null) {
				const bMean = B[j] / (r*a);
				bRanges[j] = [bMean - bHalf, bMean, bMean + bHalf];
			}
			s += formatNumberLength(data[i][j].reduce(sum, 0)/r, 12, Rounding);
		}
		s += formatNumberLength(aMean, 12, Rounding);
		feedback(s);
	}
	
	feedback("Col");
	feedback(B.reduce((x, y) => x + formatNumberLength(y/(r*a), 12, Rounding)
	            , "Means   ") +
	          formatNumberLength(totalStats[3], 12, Rounding ) + "\n");
	if (r > 1) {
		feedback("Cell Standard Deviations");
		feedback("Rows are levels of " + labels[0] + 
						 "               Cols are levels of "+labels[1]);
		feedback(colLabels.reduce((x, y) => x + y.padStart(12," "), "        "));

		for (let i = 0; i < a; i++) {
			let s = rowLabels[i].padEnd(8, " ");
			for (let j = 0; j < b; j++) { 
				const cellSD = columnOps(data[i][j])[5];
				s += formatNumberLength(cellSD, 12, Rounding);
			}
			feedback(s);
		}
		feedback();
	}


	feedback("Pooled St. Dev. = " + round(pooledSD, Rounding));

	//range plots
	feedback()
	feedback("Individual " + (100-Alpha*100) + "% C.I. for level means of "+labels[0]);
	feedback("(based on pooled standard deviation)");
	feedback();
	rangePlot(aRanges, rowLabels);

	feedback()
	feedback("Individual " + (100-Alpha*100) + "% C.I. for level means of "+labels[1]);
	feedback("(based on pooled standard deviation)");
	feedback();
	rangePlot(bRanges, colLabels);

	return false;
}

/*
 * chiSquare(args) -- build a table from a series of columns and
 * perform a chi square test
 */
function chiSquare(args) {
	const colLbls = args.map(e => "C"+(e[1] + 1));
	args = derefArgs(args);
	if (args === true) return true;
	const len = minColLength(args);
	if(!isFinite(len)) {
		throwError(ERR_NOAR_COL);
		return true;
	}

	let data = [];
	const rowLbls = range(1, len+1).map(e => e.toString());
	
	for (let i = 0; i < len; i++) {
		let row = [];
		for ([type, val] of args) {
			if (type == "N") {
				row.push(val);
			} else {
				row.push(Columns[val][i]);
			}
		}
		data.push(row);
	}

	feedback("Expected frequencies are shown below observed frequencies");
	feedback();
	
	conTable(data, rowLbls, colLbls);
	return false;
}


/*
 * conTable(data, rowLabels, colLabels) -- print out a table of the kind
 * used in Chi Square computations
 */
function conTable(data, rowLabels, colLabels, doCS = true) {
	const rowN = rowLabels.length;
	const colN = colLabels.length
	const rowTotals = Array(rowN).fill(0);
	const colTotals = Array(colN).fill(0);
	const width = 8;

	const horiz = (Unicode) ? "─" : "_";
	const vert  = (Unicode) ? "│" : "|";
	const cross = (Unicode) ? "┼" : "|";
	let total = 0;

	for (let i = 0; i < rowN; i++) {
		for (let j = 0; j < colN; j++) {
			rowTotals[i] += data[i][j];
			colTotals[j] += data[i][j];
			total += data[i][j];
		}
	}

	const dp = Math.min(maxDP(data.flat()), Rounding);

	const crossBar = horiz.repeat(width) + 
		               (cross + horiz.repeat(width)).repeat(colN+1);

	let s = " ".repeat(width) + vert;
	for (let j = 0; j < colN; j++) {
		s += centerString(colLabels[j], width) + vert;
	}
	feedback(s+"Totals".padStart(width, " "));
	feedback(crossBar);
	

	const chiSquare = [];
	for (let i = 0; i < rowN; i++) {
		let csRow = [];
		s = centerString(rowLabels[i], width) + vert;
		for (let j = 0; j < colN; j++) {
			s += centerString(round(data[i][j], dp), width) + vert;
		}
		feedback(s + formatNumberLength(rowTotals[i], width, dp));
		if (doCS) {
			s = " ".repeat(width) + vert;
			for (let j = 0; j < colN; j++) {
				const e = rowTotals[i] * colTotals[j] / total;
				s += centerString(round(e, (dp+1)), width) + vert;
				csRow.push((data[i][j] - e)**2/e);
			}
			feedback(s);
			chiSquare.push(csRow);
		}
		feedback(crossBar);
	}
	
	s = "Totals".padEnd(width, " ") + vert;
	for (let j = 0; j < colN; j++) {
		s += centerString(round(colTotals[j], dp), width) + vert;
	}
	feedback(s + formatNumberLength(total, width, dp));

	if (doCS) {
		feedback();
		feedback("Total " + LtrChi + LtrSq + " =\n");
		let totalCS = 0;
		for (let i = 0; i < rowN; i++) {
			s = " ".repeat(width + 1);
			for (let j = 0; j < colN; j++) {
				s += centerString(round(chiSquare[i][j], Rounding), width) + "+";
				totalCS += chiSquare[i][j]; 
			}
			feedback(s);
		}
		feedback(" ".repeat((width + 1)*Math.round(colN / 2)) + "  = " + 
			       round(totalCS, Rounding));
		feedback();
		feedback("Degrees of freedom = ("+rowN+" - 1) x ("+colN+" - 1) = " +
			       (rowN - 1) * (colN - 1));
	}
}

/*
 * makeTable(rows, cols) -- make a 2d frequency table with the rows and
 * columns in separate arrays\
 */
function makeTable(rows, cols) {
	const rowElems = [...new Set(rows)];
	const colElems = [...new Set(cols)];
	rowElems.sort((a, b) => a-b);
	colElems.sort((a, b) => a-b);
	const rowLabels = rowElems.map(e => e.toString());
	const colLabels = colElems.map(e => e.toString());
	
	let data = [];
	for (let i = 0; i < rowElems.length; i++)
		data.push(new Array(colElems.length).fill(0));

	for (let i = 0; i < rows.length; i++) {
		const r = rowElems.indexOf(rows[i]);
		const c = colElems.indexOf(cols[i]);
		data[r][c]++;
	}

	return [data, rowLabels, colLabels];
}

/*
 * table(args, comm) --  implement the TABLE and CONTINGENCY commands
 */

function table(args, comm) {
	args = derefArgs(args);
	if (args === true) return true;

	if (!isFinite(minColLength(args))) {
		throwError(ERR_NOAR_COL);
		return true;
	}

	const rows = [...Columns[args[0][1]]];
	const cols = [...Columns[args[1][1]]];

	if (rows.length != cols.length) {
		throwError(ERR_COLS_NE);
		return true;
	}

	const [d, r, c] = makeTable(rows, cols);
	chiFlag = (comm == "CONT") ? true : false;

	if (comm == "CONT") {
		feedback("Expected frequencies are shown below observed frequencies");
	}
	feedback("Row classification: C"+(args[0][1]+1) + "         "
				 + "Column classification: C"+(args[1][1]+1));
	feedback();
	conTable(d, r, c, chiFlag);
}


/*  The following JavaScript functions for calculating normal and
		01879.  Both the original C code and this JavaScript edition
		are in the public domain.  */

/*  POZ  --  probability of normal z value

		Adapted from a polynomial approximation in:
						Ibbetson D, Algorithm 209
						Collected Algorithms of the CACM 1963 p. 616
		Note:
						This routine has six digit accuracy, so it is only useful for absolute
						z values <= 6.  For z values > to 6.0, poz() returns 0.0.
*/

const Z_MAX = 6;

function poz(z) {
		let y, x, w;
		
		if (z == 0.0) {
				x = 0.0;
		} else {
				y = 0.5 * Math.abs(z);
				if (y > (Z_MAX * 0.5)) {
						x = 1.0;
				} else if (y < 1.0) {
						w = y * y;
						x = ((((((((0.000124818987 * w
										 - 0.001075204047) * w + 0.005198775019) * w
										 - 0.019198292004) * w + 0.059054035642) * w
										 - 0.151968751364) * w + 0.319152932694) * w
										 - 0.531923007300) * w + 0.797884560593) * y * 2.0;
				} else {
						y -= 2.0;
						x = (((((((((((((-0.000045255659 * y
													 + 0.000152529290) * y - 0.000019538132) * y
													 - 0.000676904986) * y + 0.001390604284) * y
													 - 0.000794620820) * y - 0.002034254874) * y
													 + 0.006549791214) * y - 0.010557625006) * y
													 + 0.011630447319) * y - 0.009279453341) * y
													 + 0.005353579108) * y - 0.002141268741) * y
													 + 0.000535310849) * y + 0.999936657524;
				}
		}
		return z > 0.0 ? ((x + 1.0) * 0.5) : ((1.0 - x) * 0.5);
}


/*  CRITZ  --  Compute critical normal z value to
							 produce given p.  We just do a bisection
							 search for a value within CHI_EPSILON,
							 relying on the monotonicity of pochisq().  */

function critz(p) {
		const Z_EPSILON = 0.000001;     /* Accuracy of z approximation */
		let minz = -Z_MAX;
		let maxz = Z_MAX;
		let zval = 0.0;
		let pval;
		
		while ((maxz - minz) > Z_EPSILON) {
				pval = poz(zval);
				if (pval > p) {
						maxz = zval;
				} else {
						minz = zval;
				}
				zval = (maxz + minz) * 0.5;
		}
		return(zval);
}


/*
 * functions for calculating values and probabilities under the
 * Student t-test. Adopted by code written by Tom Ferguson at UCLA
 * (https://www.math.ucla.edu/~tom/)
 */


function LogGamma(Z) {
	const S=1+76.18009173/Z-86.50532033/(Z+1)+24.01409822/(Z+2)-1.231739516/(Z+3)+.00120858003/(Z+4)-.00000536382/(Z+5);
	const LG= (Z-.5)*Math.log(Z+4.5)-(Z+4.5)+Math.log(S*2.50662827465);
	return LG;
}

function Betinc(X,A,B) {
	let A0=0;
	let B0=1;
	let A1=1;
	let B1=1;
	let M9=0;
	let A2=0;
	let C9;
	while (Math.abs((A1-A2)/A1)>.00001) {
		A2=A1;
		C9=-(A+M9)*(A+B+M9)*X/(A+2*M9)/(A+2*M9+1);
		A0=A1+C9*A0;
		B0=B1+C9*B0;
		M9=M9+1;
		C9=M9*(B-M9)*X/(A+2*M9-1)/(A+2*M9);
		A1=A0+C9*A1;
		B1=B0+C9*B1;
		A0=A0/B1;
		B0=B0/B1;
		A1=A1/B1;
		B1=1;
	}
	return A1/A;
}

function tProb(X, df) {
	const A=df/2;
	const S=A+.5;
	const Z=df/(df+X*X);
	const BT=Math.exp(LogGamma(S)-LogGamma(.5)-LogGamma(A)+A*Math.log(Z)+.5*Math.log(1-Z));
let betacdf, tcdf;
	if (Z<(A+1)/(S+2)) {
		betacdf=BT*Betinc(Z,A,.5)
	} else {
		betacdf=1-BT*Betinc(1-Z,.5,A)
	}
	if (X<0) {
		tcdf=betacdf/2
	} else {
		tcdf=1-betacdf/2
	}
	tcdf=round(tcdf, 5);
    return tcdf;
}

function tVal(p, df) {
	const T_EPSILON = 0.000001;     /* Accuracy of t approximation */
	let mint = -1000;
	let maxt = 1000;
	let tval = 0.0;
	let pval;
	
	while ((maxt - mint) > T_EPSILON) {
		pval = tProb(tval, df);
		if (pval > p) {
				maxt = tval;
		} else {
				mint = tval;
		}
		tval = (maxt + mint) * 0.5;
	}
	return(round(tval, 5));
}
