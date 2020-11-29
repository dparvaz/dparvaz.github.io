ace.define("ace/mode/minitab_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

let oop = require("../lib/oop");
let TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

let MinitabHighlightRules = function() {
let keywords = "STOP|ADD|SUBT\\w*|MULT\\w*|DIVI\\w*|MAXR\\w*|MINR\\w*|"+
               "RAIS\\w*|SIGN|ABSO\\w*|ROUN\\w*|SQRT|LOGE|LOGT\\w*|"+
               "EXPO\\w*|ANTI\\w*|SIN|COS|TAN|ASIN|ACOS|ATAN|STAN\\w*|"+
               "COUN\\w*|MEDI\\w*|MAXI\\w*|MINI\\w*|SUM|AVER\\w*|WIDT\\w*|"+
               "MPLO\\w*|PLOT|ORDE\\w*|SORT|RANK|CHOO\\w*|OMIT|JOIN|PICK|"+
               "GENE\\w*|HIST\\w*|IRAN\\w*|BTRI\\w*|NRAN\\w*|URAN\\w*|"+
               "BRAN\\w*|BINO\\w*|SAMP\\w*|DRAN\\w*|PARS\\w*|PARP\\w*|"+
               "POIS\\w*|PRAN\\w*|NSCO\\w*|ZINT\\w*|TINT\\w*|ZTES\\w*|"+
               "TTES\\w*|TWOS\\w*|POOL\\w*|CORR\\w*|REGR\\w*|DESC\\w*|"+
               "DECI\\w*|DEFI\\w*|SUBS\\w*|RUNS\\w*|SET|READ|FREA\\w*|"+
               "FSET\\w*|FPRI\\w*|PRIN\\w*|NOPR\\w*|BRIE\\w*|NOBR\\w*|"+
               "CONS\\w*|NOCO\\w*|INUN\\w*|OUTU\\w*|NEWP\\w*|AOVO\\w*|"+
               "ONEW\\w*|TWOW\\w*|LPLO\\w*|UNIC\\w*|NOUN\\w*|CHIS\\w*|"+
		           "TABL\\w*|CONT\\w*|ALPH\\w*|RECO\\w*|COLU\\w*"; 
    // var keywordMapper = this.createKeywordMapper({
    //     "keyword": keywords
    // }, "identifier", true);

    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "^\\s*note.*$",
            caseInsensitive: true,
        }, {
            token : "keyword",
            regex :  keywords,
            caseInsensitive: true,
            next  : "comm"
        }, {
            token : "paren.lparen",
            regex : "\\(",
            next  : "format"
        }, {
            token : "text",
            regex : "\\s+"
        }, {
            token : "EOL", 
            regex : "$",
            next  : "start"
        } ],
        "comm" : [ {
            token : "variable.language",
            regex : "[cC]\\d+"
        }, {
            token : "constant.other",
            regex : "[kK]\\d+"
        }, {
            token : "constant.numeric", // float
            regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
        }, {
            token : "text",
            regex : "\\s+"
        }, {
            token : "EOL", 
            regex : "$",
            next  : "start"
        } ],
        "format" : [ {
            token : "variable.language",
            regex : "[FfiIxX]"
        }, {
            token : "constant.numeric",
            regex : "\\d+(\.\\d+)?"
        }, {
            token : "punctuation.operator", // float
            regex : ","
        }, {
            token : "paren.rparen",
            regex : "\\)"
        }, {
            token : "EOL", 
            regex : "$",
            next  : "start"
        } ]
    };
};

oop.inherits(MinitabHighlightRules, TextHighlightRules);

exports.MinitabHighlightRules = MinitabHighlightRules;
});


ace.define("ace/mode/minitab",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/minitab_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var MinitabHighlightRules = require("./minitab_highlight_rules").MinitabHighlightRules;

var Mode = function() {
    this.HighlightRules = MinitabHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "note ";

    this.$id = "ace/mode/minitab";
}).call(Mode.prototype);

exports.Mode = Mode;

});                (function() {
                    ace.require(["ace/mode/minitab"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            
