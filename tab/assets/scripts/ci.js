/*  subroutine to find the point estimate and confidence interval 
    related to the two-sample rank test (mann-whitney, wilcoxon), 
    for the parameter d = mu(y) - mu(x), where mu is a measure of 
    location. 
    the statistical assumptions are that x and y are random samples 
    taken independently from two different populations, and that 
    the populations have the same distribution except for location. 
    in particuar, it is assumed that the scale parameters (variances, 
    if they exist) are equal. 
    this routine finds the point estimate for d as that value dpoint 
    such that the mann-whitney u statistic achieves its expected 
    value for the test of the null hypothesis  d = dpoint (the middle 
    such value if it is not unique). 
    the confidence interval is found as those values of dd such that 
    the null hypothesis d = dd is not rejected by the two sample rank 
    test. 
    the method of calculating the test statistic u is the original 
    method of mann and whitney, modified to take advantage of having 
    the data in order.  this speeds calculations considerably, which 
    is important since the methods used must evaluate the statistic 
    repeatedly. 
    the point and confidence intervals are found by iteration, using 
    trimmed means as starting points.  the basic iteration procedure 
    is a modification of the regula falsi (linear interpolation) 
    method, (dowell + jarratt, 1971,bit) which converges quickly 
    because of the asymtotic linearity of the u statistic as a 
    function of d (jureckova, 1971, ann. math. stat.).  {
    the percentage of the confidence interval is obtained by a normal 
    approximation, using continuity correction. 
    input is as follows 
         x - array of data of dimension m in non-decreasing order 
         y - array of data of dimension n in non-decreasing order 
         (x and y are unchanged) 
    output is as follows 
         perc -   actual (approx.) confidence of the interval 
         dpoint - point estimate of d 
         dlow -   lower confidence limit for d 
         ilow -   the order of the difference dlow 
         dhigh -  upper confidence limit for d 
         ihigh -  the order of the difference dhigh 
    written june 1975 by t. ryan and j. mckean
		rewritte in javascript (with minimal changes) by dan parvaz*/

function rankci(x, y) {
	// initialize 
	let dpoint = 0.0;
	let dlow = 0.0;
	let dhigh = 0.0;
	const m = x.length;
	const n = y.length;


	// preliminary estimate 
	[xbar, varxb] =  tmean(x);
	[ybar, varyb] =  tmean(y);
	let d = ybar - xbar;
	const v = varxb + varyb;
	let sd = Math.sqrt(v);
	sd = Math.max(sd, 1.0e-20);
	let t = 2;
	if (m < 10  ||  n < 10  ||  perc > 96) t = 3;
	let dl = d - t*sd;
	let dh = d + t*sd;

						/* define tolerances eps1 and eps2. these 
							 tolerances were selected for ibm 360-370 
							 accuracy, approximately 6.5 decimal places. 
							 depending on machine being used and whether 
							 data warrants such precision, the tolerance 
							 may be lowered. 
							 base tolerance on range of data */
	let z = x[m - 1] - x[0];
	let zz = y[n - 1] - y[0];
	let eps1 = (1.0e-7) * Math.max(z, zz);
						/* base tolerance on the magnitude of the data */
	z = x[Integer(m / 2)];
	zz = y[Integer(n / 2)];
	let eps2 = (1.0e-6) * Math.max(z, -z, zz, -zz);
	eps1 = Math.max(eps1, eps2);

						/* base tolerance on width of confidence interval 
							 (based on preliminary estimates).  the point 
							 estimate should be accurate to 4 sig. digits in 
							 the width (approx.). */

	eps2 = sd * 4.0e-4;
	eps1 = Math.max(eps1, eps2);
                      /* maximum accuracy set to 1.e-20 */
      eps1 = Math.max(eps1, 1.0e-20);
						/* one less significant digit in end points of 
							 the confidence interval than the point estimate. */
	eps2 = 10 * eps1;

						/* get critical values of the u statistic 
							 odd or even m*n determines how point estimate 
							 is calculated */
	let odd = true;
	let umed1, umed2;
	if ((m*n) % 2 != 0) {
		umed1 = m * n / 2;
	} else {
		umed1 = m*n/2 - 0.5;
		umed2 = umed1 + 1;
		odd = false;
	}
						/* p is one-tailed prob. */
	let p = Alpha / 2;
						/* find mean and variance of the u-statistic 
							 for use in a normal approximation. */
	const umu =  m * n / 2;
	const uvar = m * n * (m + n + 1) / 12;

      const usigma = Math.sqrt(uvar);
	
						/* normal approx. (with continuity correction) is 
							 p = phi ( (ulow +.5 -umu)/usigma ) 
							 (where phi is standard normal dist. function, 
							 and phinv is its inverse). */

	let ulow = usigma * Math.abs(critz(p)) + umu - 0.5;

						/* round critical value down to integer 
							 (this gives conservative bounds), and find p. */
	ulow = (ulow < 0) ? 0 : Integer(ulow);
	z = (ulow + 0.5 - umu) / usigma;
	p = poz(z);
	const perc = 100 * (1 - 2*p);
						// want to invert function u at a half integer 
	ulow += 0.5;
						// uhigh 
	uhigh = m * n - ulow;
	ilow = Math.round(ulow);
	ihigh = Math.round(uhigh);

						 /* ilow  and ihigh  give the ordered differences 
							which form the confidence interval. 
							an estimate of the slope of the linear 
							approximation to fmann. */
  
	let slope = (Math.abs(z) * Math.sqrt(m * n * (m + n))) / ((dh - dl) * Math.sqrt(3));
					 /* x1 and x2 bracket the lower confidence limit. 
							then by calling the routine ill the lower confi- 
							dence limit within eps2 is returned via dlow. */
	console.log(dl, ulow, slope);
	[x1, x2, fx1, fx2] = brack(dl, ulow, slope, x, y); 
	[dlow, x1, x2, fx1, fx2] = ill(dlow, ulow, x1, fx1, x2, fx2, x, y, eps2);
					 // same for upper end via dhigh.
	[x1, x2, fx1, fx2] = brack(dh, uhigh, slope, x, y);
	[dhigh, x1, x2, fx1, fx2] = ill(uhigh, x1, fx1, x2, fx2, x, y, eps2);
					 /* a new estimate of slope based on the confidence 
							interval (dlow,dhigh), unless the length of 
							the interval is smaller than eps2. */
	if (dhigh > dlow+eps2) 
		slope = ((dh - dl) / (dhigh - dlow)) * slope;
					 /* the same routines are used for the estimate 
							dpoint except eps1 is used. the midpoint 
							of the confidence interval will be the initial 
							estimate of dpoint. */
	d = (dlow + dhigh) / 2;
	[x1, x2, fx1, fx2] = brack(d, umed1, slope, x, y);
	[dpoint, x1, x2, fx1, fx2] = ill(umed1, x1, fx1, x2, fx2, x, y, eps1)
					 /* if m*n is odd the estimate is dpoint, */
	if (!odd) {
					 /* if even then the value dpoint is the lower 
							center estimate. the upper center estimate is d2, 
							and the final estimate is the average of the two. */
		[x1, x2, fx1, fx2] =  brack(dpoint, umed2, slope, x, y);
		[d2, x1, x2, fx1, fx2] = ill(umed2, x1, fx1, x2, fx2, x, y, eps1);
		dpoint = (dpoint+d2)/2;
	}
	return [perc, dpoint, dlow, ilow, dhigh, ihigh];
}

/*  given data z[0], z[1], ..., z[n-1] in non-decreasing order, 
    this routine finds the alpha-trimmed mean zbar, and the 
    estimated variance of zbar, varzb. 
    written june 1975 by t. ryan */

function tmean(z, alpha = .10)  {
      const n = z.length; 
                      /* nt is number trimmed from each end 
                         n1 is number of lowest observation not trimmed 
                         n2 is number of highest observation not trimmed */
      const nt = Integer(alpha*n);
      const n1 = nt;
      const n2 = z.length - nt - 1;

                      // trimmed mean 
      let sum = 0;
			for (let i = n1; i <= n2; i++) {
        sum += z[i];
			}
	
      const x = n - 2*nt;
      const zbar = sum / x;

                      // winsorized sum of squares
      sum = 0;
			for (let i = n1; i <= n2; i++) {
        sum += (z[i] - zbar) * (z[i] - zbar);
			}
	
      if (nt != 0) {
				sum += nt * (z[n1-1] - zbar) * (z[n1-1] - zbar) 
					     + nt * (z[n2+1] - zbar) * (z[n2+1] - zbar);
			}
      const varzb = sum/(n*n)
      return [zbar, varzb];
}

/*  this routine solves the equation 
 *                        f(t)-fval=0 
 *  for a monotone function f, in this instance fmann. the method 
 *  used is the illinois method as described by dowell and jarratt 
 *  (1971,bit), except for a modification when close to the root. 
 *  then if the root was not trapped on the last iteration the rou- 
 *  tine switches to the bisection method. 
 *  input - 
 *            fval = the value of the function at the root. 
 *            x1 and x2 are values which bracket the root, that is 
 *            either 
 *                          f(x1)  <  fval  <  f(x2) 
 *            or 
 *                          f(x2)  <  fval  <  f(x1) 
 *            fx1 = f(x1) 
 *            fx2 = f(x2) 
 *            x, m, y, and n are quantities used by the function fmann 
 *            eps = the accuracy of the solution. 
 *  x1, x2, and their functional values are changed throughout the 
 *  routine. 
 *  output - 
 *           xval = the root within eps. */
  
function ill(fval, x1, f1, x2, f2, x, y, eps)  {
	let f3, x3;
  f1 = f1 - fval;
  f2 = f2 - fval;
  ibisec = false;
   
  while (Math.abs(x2-x1) > eps) {
                 /* x3 is the intersection of the secant line 
                    formed by (x1,f1), (x2,f2) and the x-axis. */
		x3 = x2 - (f2*(x2-x1))/(f2-f1);
		if (ibisec) x3 = (x1+x2)/2;
		ibisec = false;
		f3 = fmann(x3, x, y) - fval;
		if (f3*f2 <= 0) {
                 // root was trapped, so use regula falsi
			x1 = x2;
			f1 = f2;
			x2 = x3;
			f2 = f3;
		} else {
                 /* root was not trapped, so use illinois mod- 
                    ification. */
			x2 = x3;
			f2 = f3;
			f1 = f1/2;
			if (Math.abs(f2) > Math.abs(f1)) { 
                 /* if illinois modification is more radical 
                    than bisection, then use bisection. */
				f1 = 2.0*f1
				ibisec = true;
			}
		}
	}
	const xval = (x1+x2)/2;
  return [xval, x1, x2, f1, f2];
}

/*  suppose the function f is monotone and it is desired to solve 
    the equation 
                     f(t) - fval = 0. 
    this routine returns two values which bracket the root. 
    input - 
               xinit = initial estimate of the root. 
               fval = the value of the function at the root. 
               slope = approximate slope of the function in a 
                       neighborhood of the root. 
               x, m, y, and n are quantities used by the function which 
                              in this instance is fmann. 
    none of the above quantities is changed throughout this routine 
    output - 
               x1 and x2 bracket the root, that is either 
                          f(x1)  <  fval  <  f(x2) 
               or 
                          f(x2)  <  fval  <  f(x1) 
              fx1 = f(x1) 
               fx2 = f(x2) */

function brack(xinit, fval, slope, x, y) {
	let x1 = xinit;
  let fx1 = fmann(x1, x, y);
  const delta = 1.5 * ((fval - fx1) / slope);

	while (true) {
		let x2 = x1 + delta;
		let fx2 = fmann(x2, x, y);
		if ((fx1 - fval) * (fx2 - fval) < 0) return [x1, x2, fx1, fx2];
		x1 = x2;
		fx1 = fx2; 
	}	
}


/*  routine to calculate the mann-whitney statistic u. 
    u differs only by a constant from the wilcoxon 2-sample rank 
    statistic w. 
    input - 
              d = null hypothesis value of the shift of the y 
                  population from the x population (i.e. the null 
                  hypothesis being tested is  mu(y) = mu(x) + d). 
              x = array containing the sample from one population, 
                  which must be in non-decreasing order. 
              y = array containing the sample from the other population, 
                  which must be in non-decreasing order. 
    output - 
              u = mann-whitney test statistic. 
    this routine is intended to be used in an iteration routine for 
    estimation only, since no checks or adjustments are made for ties. 
    this routine is designed to be very fast, since it is to be used 
    in an iteration procedure, so no checks are made to insure that 
    m and n are positive, or that x and y are non-decreasing. 
    all checking should be done in calling program. 
    u= sum (no. of y(j) less than (or equal) to x(i)+delta) where 
    the sum is over i. 
    since arrays x and y are ordered, if x(i) is greater than y(j), 
    x(i+1) must also be. 
    written 3/75 by t. ryan.  last updated 6/75 by t. ryan */

function fmann(d, x, y)  {
 
	const n = y.length;
  const m = x.length;

                /* jle is the number of y values less than or 
                   equal to x(i). 
                   iu is accumulated as the value of the u 
                   statistic. */
  let jle = 0;
  let u = 0;
                /* main loop */
	for(let i=0; i < m; i++) { 
    const xi = x[i] + d;
 		while (xi >= y[jle] && jle < n) jle++;
                /* x[i] is greater than (or equal) to all y[j]. 
                   therefore x(i+1), ..., x(m) are all greater 
                   than all y(j). */
		if (jle >= n) { 
			u += (m - i) * n;
			break;
		}
		u += jle
	}
	return u; 
}

