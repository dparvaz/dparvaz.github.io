/*
 * graphSize(args) change the width of the X axis to K spaces,
 * and optionally, the Y axis to K spaces. 
 */
function graphSize(args) {
	args = derefArgs(args);
	if (args === true) { return true; }

	let width = args[0][1];
	let height = (args.length == 1) ? width/2 : args[1][1];

	if (width % 10 != 0) { 
		throwError(ERR_WID_TEN);
		return true;
	}

	if (height % 5 != 0) { 
		throwError(ERR_HEI_FIV);
		return true;
	}
	PlotWidth = width;
	PlotHeight = height;

	return false;
}

/*
 * cleanEnds -- given the extents of a range of number, return a
 * "cleaned up" maximum and minimum, rounded to the nearest 5 of 
 * whatever magnitude makes sense. binCount is non-zero if you also want 
 * an optimal bin width
 */
function cleanEnds(max, min, binCount=0) {
	const factor = (10**getMagnitude(max - min))/20;
	const newMin = Math.floor(min / factor) * factor;
	const newMax  = Math.ceil(max / factor) * factor;
	
	if (binCount) {
		let width = Math.abs(newMax - newMin) / binCount;
		width = Math.round(width / factor) * factor;
		return [newMax, newMin, width];
	}

	return [newMax, newMin];
}


/*
 * histogram(args) -- plot a histogram of a column
 */
function histogram(args) {
	let width, firstMid, lastMid;
	const barChar = (Unicode) ? "█" : "*";

	let c = Columns[args[0][1]];
	if (c === null || typeof(c) == "number") {
		throwError(ERR_NOAR_COL);
		return true;
	}

	c = [...Columns[args[0][1]]];
	c.sort((a, b) => a - b);
	let min = c[0];
	let max = c[c.length-1];

	// First stab at bincount .. Rice Rule or 8, whichever is larger
	let binCount = Math.max(7, Math.ceil(2*Math.cbrt(c.length)));
	
	if (args.length == 1) {   // default width
		[lastMid, firstMid, width] = cleanEnds(max, min, binCount);
	} else {                 
		firstMid = derefKonst(args[1]);
		width = derefKonst(args[2]);

		if (width === true || firstMid === true) {
			return true;
		}
	}
	// no matter what, recalulate the binCount;
	binCount = Math.round(Math.abs(max - firstMid) / width) + 1;

	let maxCount = 0;
	let bins = Array(binCount).fill(0);
	let mids = Array(binCount);
	for (let i = 0; i < binCount; i++) {
		mids[i] = firstMid + i * width;
		let cutoff = width / 2 + mids[i];
		while (c[0] < cutoff) {
			c.shift();
			bins[i]++;
			if (bins[i] > maxCount) {
				maxCount = bins[i];
			}
		}
	}
	bins[binCount - 1] += c.length;
	if (bins[binCount - 1] > maxCount) { maxCount = bins[binCount-1]; }

	let scale = (maxCount > PlotWidth) ? PlotWidth/maxCount  : 1;
	let dp = Math.min(maxDP(mids), Rounding);
	feedback(" Middle of     Number of");
	feedback(" Interval     Observations");
	for (let i=0; i < binCount; i++) {
		const label = formatNumberLength(mids[i], 6, dp);
		const count = formatNumberLength(bins[i], 11, 0);
		const bar = barChar.repeat(Math.round(bins[i]*scale));
		feedback(label + count + "  " +  bar);
	}
	return false;
}

/*
 * yAxis(yMax, yMin) -- return an array with a yAxis all formatted and 
 * ready to attach to a graph
 */
function yAxis(yMax, yMin) {
	let axis = Array(PlotHeight).fill("");

	const tickSpace = (Unicode) ? "│" : "-";

	const yJump = (yMax - yMin) / (PlotHeight/5); 
	const yTicks = range(yMin, yMax + yJump/2, yJump);

	let maxDec = 0;
	let maxInt= 0;
	let tick;

	for (let i=0; i < yTicks.length; i++) {
		let s = yTicks[i].toString().split(".");
		let dp = (s.length == 1) ? 0 : s[1].length;
		maxDec = ( dp > maxDec ) ? dp : maxDec;
		maxInt = ( s[0].length > maxInt ) ? s[0].length : maxInt;
	}
	if (maxDec > 3) { maxDec = Rounding; }
	const yNumLen = maxInt + maxDec + 1;
	
	for (let i=PlotHeight; i >= 0; i--) {
		if (Unicode) {
			if (i == PlotHeight) {
				tick = "┘";
			} else if (i == 0) {
				tick = "┐";
			} else {
				tick = ((PlotHeight - i) % 5) ? tickSpace : "┤";
			}
		} else {
			tick = ((PlotHeight - i) % 5) ? tickSpace : "+";
		}
		let label;
		if (tick != tickSpace) {
			label = formatNumberLength(yTicks.shift(), yNumLen, maxDec);
		} else {
			label = " ".repeat(yNumLen);
		}
		axis[i] = label + " " + tick + " ";
	}
	return axis;
}

/*
 * xAxis(xMax, xMin, offset) -- returns an array with an x-axis formatted 
 * and ready to place under a graph. offset is the number of characters
 * from the left edge of the screen
 */
function xAxis(xMax, xMin, offset) {
	let xJump = (xMax - xMin) / (PlotWidth/10); 
	let xTicks = range(xMin, xMax + xJump/2, xJump);
	let axis = ["", "", ""];

	let maxInt = maxDec = 0;
	for (let i=0; i < xTicks.length; i++) {
		let s = xTicks[i].toString().split(".");
		let dp = (s.length == 1) ? 0 : s[1].length;
		maxDec = ( dp > maxDec ) ? dp : maxDec;
		maxInt = ( s[0].length > maxInt ) ? s[0].length : maxInt;
	}
	if (maxDec > 3) { maxDec = Rounding; }
	let xNumLen = maxInt + maxDec + 1;

	const margin = " ".repeat(offset);
	
	if (Unicode) {
		axis[0] = margin + "┌─────────" + "┬─────────".repeat(PlotWidth/10 - 1) 
						+ "┐";
	} else {
		axis[0] = margin + "+---------".repeat(PlotWidth/10) + "+";
	}
	axis[1] = formatNumberLength(xTicks[0], offset, maxDec);
	axis[2] = margin;
	let padIdx = 1, numIdx = 2;

	for (let i=1; i < xTicks.length; i++) {
		let sNum = round(xTicks[i], maxDec).toString()
		sNum = formatNumberLength(xTicks[i], 10, maxDec);
		sPad = " ".repeat(10);
		axis[padIdx] += sPad;
		axis[numIdx] += sNum;
		[padIdx, numIdx] = [numIdx, padIdx];
	}
	return axis;
}

/*
 * plotCols(args) -- 2D ASCII plot of data in two columns. Optionally,
 * the scale for the X and Y axes can be set. Returns true on error.
 */
function plotCols(args,comm) {
	let xMax = -Infinity; 
	let xMin = Infinity;
	let yMax = -Infinity;
	let yMin = Infinity;
  let legendCol;

	if (comm == "LPLO") {
		legendCol = args.pop()[1];
	}
	//validate arguments
	// if we have constants, validate them and get the max/mins
	
	if (args [1][0] != "C") {
		let y1 = derefKonst(args[1]);
		let y2 = derefKonst(args[2]);
		let x1 = derefKonst(args[4]);
		let x2 = derefKonst(args[5]);
		
		args.splice(1, 2); args.splice(2, 2);

		if (x1 === true || x2 === true || y1 === true || y2 === true) {
			throwErr(ERR_NULL_KON);
			return true;
		}

		xMax = Math.max(x1, x2);
		xMin = Math.min(x1, x2);
		yMax = Math.max(y1, y2);
		yMin = Math.min(y1, y2);

		if (xMax == xMin || yMax == yMin) {
			throwError(ERR_ZERO_RG);
			return true;
		} 
	}

	// validate columns
	for (let i = 0; i < args.length; i += 2) {
		let yCol = args[i][1];
		let xCol = args[i+1][1];

		let yLen = getColLength(yCol);
		let xLen = getColLength(xCol);

		if (yLen < 1 || xLen < 1) { 
			throwError(ERR_NULL_COL);
			return true;
		}

		if (xLen != yLen) {
			throwError(ERR_COLS_NE); 
			return true;
		}
	}
	
	if (comm == "LPLO") {
		if (getColLength(legendCol) < getColLength(args[0][1])) {
			throwError(ERR_COLS_NE);
			return true;
		}
	}

	// if we need to, get the max and mins from the column data

	if (xMax === -Infinity) {
		for (let i = 0; i < args.length; i += 2) {
			let yCol = args[i][1];
			let xCol = args[i+1][1];

			const yStats = columnOps(Columns[yCol]);
			const xStats = columnOps(Columns[xCol]);

			xMax = Math.max(xMax, xStats[6]);
			xMin = Math.min(xMin, xStats[7]);
			yMax = Math.max(yMax, yStats[6]);
			yMin = Math.min(yMin, yStats[7]);
		}
	
		[xMax, xMin] = cleanEnds(xMax, xMin);
		[yMax, yMin] = cleanEnds(yMax, yMin);
	}

	// initialize graph 
	let graph = [];

	for (let i = 0; i < PlotHeight + 1; i++) {
		graph.push(" ".repeat(PlotWidth + 1));
	}

	//let xRange = Math.abs(xMax - xMin);
	//let yRange = Math.abs(yMax - yMin);

	// plot values 
  const plotPoint = (Unicode) ? "×" : "*";
	for (let j = 0; j < args.length; j += 2) {
		let yCol = args[j][1];
		let xCol = args[j+1][1];
		let xLen = getColLength(xCol);

		for (let i=0; i < xLen; i++) {
			const xCoord = charPos(xMin, xMax, PlotWidth, Columns[xCol][i]);
			const yCoord = PlotHeight - charPos(yMin, yMax, PlotHeight, Columns[yCol][i]) - 1;

			if (xCoord < 0 || xCoord > PlotWidth-1 ||
			    yCoord < 0 || yCoord > PlotHeight-1) continue;

			let plotChar;
			if (comm == "LPLO") {
				const legend = Columns[legendCol][i];
				const charCode = (legend > 0) ? 65 + (legend - 1) % 26 
					                            : 90 - Math.abs(legend) % 26;
				plotChar = String.fromCharCode(charCode);
			} else {  
				plotChar = (args.length == 2) ? plotPoint : "ABCDEFGHIJKLMNOPQRZTUVWXYZ".charAt(j/2);
			}
			let currChar = graph[yCoord][xCoord];
			if (!/[0-9 ]/.test(currChar)) {
				plotChar = "2";
			} else if (/[0-9]/.test(currChar)) {
				plotChar = (parseInt(currChar) + 1).toString();
			}

			graph[yCoord] = graph[yCoord].splice(xCoord, 1, plotChar);
		}
	}

  // set up Axes

	let xJump = (xMax - xMin) / (PlotWidth/10); 
	let xTicks = range(xMin, xMax + xJump/2, xJump);
	
	const yA = yAxis(yMax, yMin);
	for (let i=0; i<graph.length; i++) {
		graph[i] = yA[i] + graph[i];
	}

	const xA = xAxis(xMax, xMin, yA[0].length);

	if (args.length == 2) {
		xA[0] +=  "  C" + (args[1][1]+1).toString();
	}

	writeln();
	if (args.length == 2) {
		writeln(" ".repeat(yA[0].length-2) + "C"+(args[0][1]+1).toString());
	}
	writeln(graph.join("\n"));
	writeln(xA.join("\n"));
	writeln();

	return false;
}

function binPlot(data, labels) {
	const k = data.length;
	const totalStats = columnOps(data.flat())
	const [yMax, yMin] = cleanEnds(totalStats[6], totalStats[7]);

	const yRange = Math.abs(yMax - yMin);

	const yA = yAxis(yMax, yMin)
	const graphs = Array(k+1).fill(null);

  const plotPoint = (Unicode) ? "×" : "*";

	//plot the data
	for (let i = 0; i < k+1; i++) {
		graphs[i] = Array(PlotHeight).fill(" ");
		if (i == 0) continue;
		for(let item of data[i-1]) {
			const yCoord = PlotHeight - charPos(yMin, yMax, PlotHeight, item);
			for (j of [0, i]) {  // both for the current bin and 'All Data'
				const currChar = graphs[j][yCoord];
				let plotChar;
				if (currChar == " ") {
					plotChar = "1";
				} else if (/[0-8]/.test(currChar)) {
					plotChar = (parseInt(currChar) + 1).toString();
				} else {
					plotChar = plotPoint;
				}
				graphs[j][yCoord] = plotChar;
			}
		}
	}

	// output graph
	const margin = " ".repeat(yA[0].length);
	writeln(margin + " ".repeat((k+1)*2) + "Level", OutUnit);
	writeln(margin + "  All", OutUnit);
	write  (margin + " Data", OutUnit);
	for (let level of labels)
		write (level.padStart(5, " "), OutUnit);
	writeln("",OutUnit);
	for (let i = 0; i < PlotHeight; i++) {
		write(yA[i],OutUnit);
		for (let j = 0; j < k+1; j++) {
			write("    " + graphs[j][i], OutUnit);
		}
		writeln("",OutUnit);
	}
	writeln(yA[PlotHeight]+"\n", OutUnit);
}


/*
 * charPos(min, max, width, num) -- figure out where a character plot
 * in a field of {width} characters shoud be for {num} on an axis that 
 * spans from {min} to {max}
 */
function charPos(min, max, width, num) {
	const plotRange = Math.abs(max - min);
	return Math.round((num - min) * (width - 1) / plotRange);
}

/*
 * plot ranges, including midpoints, for an array of ranges, arranged
 * [low end, midpoint, high end]. 
 */
function rangePlot(ranges, labels) {
	const margin = 5
	const rangeStats = columnOps(ranges.flat());
	const [max, min] = cleanEnds(rangeStats[6], rangeStats[7]);
	const xA = xAxis(max, min, margin);
	const beg = (Unicode) ? "├" : "|";
	const ctr = (Unicode) ? "╂" : "|";
	const end = (Unicode) ? "┤" : "|";
	const spc = (Unicode) ? "╌" : "*";
	
	writeln(xA[0].replace(/[┌┬┐]/g, function(m) { 
																		return {'┌': '└',
																			      '┬': '┴',
																			      '┐': '┘'}[m];}),OutUnit);
	for (let i = 0; i < ranges.length; i++)	{
		const lo  = charPos(min, max, PlotWidth, ranges[i][0]);
		const mid = charPos(min, max, PlotWidth, ranges[i][1]);
		const hi  = charPos(min, max, PlotWidth, ranges[i][2]);
		const spread = beg + spc.repeat(mid-lo-1) + ctr +
			                   spc.repeat(hi-mid-1) + end;
		write(labels[i].padEnd(margin, " "), OutUnit);
		writeln(" ".repeat(lo) + spread, OutUnit);
	}
	writeln(xA.join('\n'), OutUnit);


}
