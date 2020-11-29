const ERR_NULL_COL = "No data in column";
const ERR_NULL_KON = "No data in constant";
const ERR_RANG_COL = "Column index out of range";
const ERR_RANG_KON = "Constant index out of range";
const ERR_RANG_VAL = "Value out of range";
const ERR_NOAR_COL = "Column does not hold array";
const ERR_ZERO_COL = "Column is empty";
const ERR_SCAL_COL = "Column holds single value";
const ERR_ARRA_COL = "Column does not hold constant";
const ERR_ARRA_KON = "Constant cannot hold column data";
const ERR_DIV_ZERO = "Divide by zero error";
const ERR_SYNT_ERR = "Syntax error";
const ERR_NUM_ARGS = "Illegal number of arguments";
const ERR_TOO_FEW  = "Too few data items";
const ERR_COLS_NE  = "Columns are uneven";
const ERR_ZERO_RG  = "Zero range";
const ERR_BAD_RAN  = "Illegal range values";
const ERR_WID_TEN  = "Graph width must be a multiple of 10";
const ERR_HEI_FIV  = "Graph height must be a multiple of 5";
const ERR_NON_INT  = "Non-integer value";
const ERR_PROB_ON  = "Probabilities must sum to one";
const ERR_TOO_SAMP = "More samples than items";
const ERR_BAD_FMT  = "Incorrect format specification";
const ERR_END_WHY  = "END without READ or SET";
const ERR_FORM_NUM = "Format does not match data line";
const ERR_FORM_LNG = "Format specification extends past end of line";
const ERR_NO_FORMT = "Command requires format specification";
const ERR_NO_FCOMM = "Format specification without command";
const ERR_OUT_FIVE = "Can't output to the keyboard";
const ERR_IN_SIX   = "Can't read from the screen";
const ERR_INOUT_EQ = "Input and output devices cannot be the same";
const ERR_UNEVEN_R = "Inconsistent number of trials per cell";

function throwError(err) {
	ErrorFlag = true;
	writeln("*** ERROR: " + err); // errors are always sent to the screen
	return true;
}
