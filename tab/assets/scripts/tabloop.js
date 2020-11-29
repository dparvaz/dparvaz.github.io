const MaxCols = 50;
const MaxKonsts = 50;
const Error = 1e-15;

let PlotWidth, PlotHeight, PrintFlag, ErrorFlag, Brief, Rounding, 
	  Columns=[], Konstants=[], Output, formatFound, NoIntercept,
		InUnit, OutUnit, Unicode, Alpha, Countdown, MaxColsPrinted; 
let LtrMu, LtrAlpha, LtrLambda, LtrSigma, LtrChi, LtrNE, LtrGE, LtrLE,
	  LtrYhat, LtrXbar, LtrSq;

/*
 * reset() -- reinitialze jsTab
 */
function reset() {
	Alpha = 0.05;
	Unicode = false;
	Brief = false;
	PrintFlag = true;
	ErrorString = "";
	ErrorFlag = false;
	NoIntercept = false;
	Rounding = 3;
	PlotWidth = 50;
	PlotHeight = 25;
	InUnit = 5;
	OutUnit = 6;
  MaxColsPrinted = 6;
  Countdown = null;

	setGreeking();

	Columns = Array(MaxCols).fill(null);
	Konstants = Array(MaxKonsts).fill(null);
	Konstants[MaxKonsts - 2] = Math.E;
	Konstants[MaxKonsts - 1] = Math.PI;
	//Output = "";

	//for (let i=0; i<MaxCols; i++) {
	//	Columns.push(null);
	//}

	document.getElementById("output").innerHTML = "";
}

/*
 * run() -- main loop for executing Tab code
 */
function run() {
	reset();
	let result;

	const fComms = ["FREA", "FSET", "FPRI", "FPUN", "FPUN"];
	let code = editor.getValue().split("\n");
	Output = "";   // global
	let reading = false;
	let halted = false;
	formatFound = false;
	let data = []
	let parse, comm, args;
	let lineNum = 0;

	for (line of code) {
		lineNum++;
		if (line.trim().startsWith("#")) continue;
		let clean = cleanLine(line.toUpperCase());
		if (clean == "") continue;
		if (!formatFound) {
			parse = parseLine(clean);
			comm = checkParse(parse, true) ? getCommand(clean): "";
			args = checkParse(parse) ? resolveArgs(getArgs(clean)) : null;
			if (args === true) { break;	}
		} 

		if (reading) {
			if (formatFound) {
				if (fComms.includes(data[0])) {
					const fmts = parseFormat(line);
					if (fmts === true) {
						halted = true;
						break;
					} else {
						data[2] = fmts;
					}
				}
				formatFound = false;
			} else {
				if (InUnit != 5) {
					const idx = findNode(document.getElementById("dev"+InUnit))[0];
					for (let dataLine of DeviceFiles[idx].getValue().split("\n")) {
						if (dataLine.trim() == "" || dataLine.trim().startsWith("#")) 
							continue;
						if (fComms.includes(data[0])) {
							const temp = formatArgs(dataLine, data[2]) 
							if (temp === true) break;
							data[3].push(temp);
						} else {
							data[3].push(resolveArgs(cleanLine(dataLine)));
						}
					}
					result = readValues(data);
					if (result === true) break; 
					data = [];
					reading = false;
				} else {
					if (checkParse(parse,true)) {
						result = readValues(data);
						if (result === true) break; 
						data = [];
						reading = false;
					} else {
						//if (/^[A-Z]/.test(clean)) {
						//	clean = clean.substr(clean.indexOf(" ")+1);
						//}
						if (fComms.includes(data[0])) {
							const temp = formatArgs(line, data[2]) 
							if (temp === true) break;
							data[3].push(temp);
						} else {
							data[3].push(resolveArgs(clean));
						}
					}
				}
			}
		}	

		if (!reading) {
			if (data.length != 0) {	
				if (formatFound) {
					const fmts = parseFormat(line);
					if (fmts === true) break;
					result = formatPrint(data[1], fmts);
					if (result === true) break;
				} else {
					throwError(ERR_NO_FORMT);
					break;
				}
				formatFound = false;
				data = [];
				continue;
			}

			if (formatFound) {
				throwError(ERR_NO_FCOMM);
				break;
			}
				
			writeln("<span class='comm'>-- "+ line+"</span>");
			if (!checkParse(parse)) {
				throwError(ERR_SYNT_ERR);
				break;
			}
			result = false;
    	switch (comm) {
    		case "STOP":
    			halted = true;
    			break;
    	/*	case "END":
					if (reading) {
						reading = false;
					} else {
						throwError(ERR_END_WHY);
						halted = true;
					}
    			break; */
				case "ADD":
				case "SUBT":
				case "MULT":
				case "DIVI":
				case "MAXR":
				case "MINR":
				case "RAIS":
					result = doArithmetic(comm, args);
    			break;
				case "SIGN":
				case "ABSO":
				case "ROUN":
				case "SQRT":
				case "LOGE":
				case "LOGT":
				case "EXPO":
				case "ANTI":
				case "SIN":
				case "COS":
				case "TAN":
				case "ASIN":
				case "ACOS":
				case "ATAN":
					result = doFunc(comm, args);
    			break;
				case "STAN":
				case "COUN":
				case "MEDI":
				case "MAXI":
				case "MINI":
				case "SUM":
				case "AVER":
					result = doColumnStats(comm, args);
					break;
				case "WIDT":
					result = graphSize(args);
					break;
				case "MPLO":
				case "PLOT":
				case "LPLO":
					result = plotCols(args,comm);
					break;
				case "ORDE":
					result = orderCol(args);
					break;
				case "SORT":
					result = sortCol(args);
					break;
				case "RANK":
					result = rankCol(args);
					break;
				case "CHOO":
					result = chooseOmit(args);
					break;
				case "OMIT":
					result = chooseOmit(args, false);
					break;
				case "RECO":
					result = recode(args);
					break;
				case "JOIN":
					result = joinVals(args);
					break;
				case "PICK":
					result = pick(args);
					break;
				case "GENE":
					result = generate(args);
					break;
				case "HIST":
					result = histogram(args);
					break;
				case "IRAN":
				case "BTRI":
				case "NRAN":
				case "URAN":
					result = rand(args, comm);
					break;
				case "BRAN":
					result = bRandom(args);
					break;
				case "BINO":
					result = binomial(args);
					break;
				case "SAMP":
					result = sample(args);
					break;
				case "DRAN":
					result = dSample(args);
					break;
				case "PARS":
				case "PARP":
					result = cumul(args, comm);
					break;
				case "POIS":
					result = poissonTable(args);
					break;
				case "PRAN":
					result = pRandom(args);
					break;
				case "NSCO":
					result = nScores(args);
					break;
				case "ZINT":
				case "TINT":
					result = interval(args, comm);
					break;
				case "ZTES":
				case "TTES":
					result = hypTest(args, comm);
					break;
				case "TWOS":
				case "POOL":
					result = unpaired(args, comm);
					break;
				case "CORR":
					result = correlation(args);
					break;
				case "REGR":
					result = linearRegression(args);
					break;
				case "AOVO":
				case "ONEW":
					result = prepOneWay(args, comm);
					break;
				case "TWOW":
					result = twoWayAnova(args);
					break;
				case "CHIS":
					result = chiSquare(args);
					break;
				case "TABL":
				case "CONT":
					result = table(args, comm);
					break;
				case "CONS":
					NoIntercept = false;
					break;
				case "NOCO":
					NoIntercept = true;
					break;
				case "NEWP":
					write("<div style='page-break-before: always;'></div>");
					break;
				case "DESC":
					result = describe(args);
					break;
				case "DECI":
					result = decimalPlaces(args);
					break;
				case "ALPH":
					result = setAlpha(args);
					break;
				case "DEFI":
					result = define(args);
					break;
				case "SUBS":
					result = substitute(args);
					break;
				case "RUNS":
					result = runsTest(args);
					break;
				case "SET":
    		case "READ":
				case "FREA":
				case "FSET":
					reading = true;
					data.push(comm); // so readValues() knows: READing or SETting?
          [Countdown, args] = stripCountdown(args);
          if (args === true) { result == true };
					data.push(args);
					data.push([]); // for any FORMAT specs
					data.push([]); // the actual data
					break;
				case "FPRI":
					data.push(comm);
					data.push(args);
					break;
				case "PRIN":
					printCols(args);
					break;
				case "NOPR":
					PrintFlag = false;
					break;
				case "BRIE":
				  Brief = true;	
					break;
				case "NOBR":
					Brief = false;
					break;
        case "COLU":
          result = setPrintCols(args);
          break;
        case "INUN":
				case "OUTU":
					result = setDevice(args, comm);
					break;
				case "UNIC":
					Unicode = true;
					setGreeking();
					break;
				case "NOUN":
					Unicode = false;
					setGreeking();
					break;
				default:
					break;
    			// output += `&gt; ${comm} -- ${args} <br> \n`;
    	}
			if (result === true) { halted = true; }
			if (halted) { break; }
		}
	}

	if (reading) {
		readValues(data);
	}
	
	if (ErrorFlag) {
		writeln(`*** Execution halted in line ${lineNum} ***`);
	} else {
		writeln("*** Execution halted ***");
	}

	//document.getElementById("output").innerHTML = Output;
}
