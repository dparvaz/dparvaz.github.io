function Shrink() {
   this.theResponses = ["dont u believe that i can # q|perhaps u wd like to be like me # q|u want me to be able to # q",
      "perhaps u dont want to #|do u want to be able to # q",
      "what makes u think i am # q|does it please u to believe i am # q|perhaps u wd like to be #|do you sometimes wish u were # q",
      "dont u really # q|why dont u # q|do u wish to be able to # q|does that trouble u # q",
      "do u often feel # q|do u often feel # q|do u enjoy feeling # q",
      "do u really believe i dont # q|perhaps in good time i will #|do u want me to # q",
      "do u think u shd be able to # q|why cant u # q",
      "why r u interested in whether or not i am # q|wd u prefer if i were not # q|perhaps in ur fantasies i am #",
      "how do u know u cant # q|have u tried q|perhaps now u can #",
      "did u come to me because u r # q|how long have u been # q|do u believe it is normal to be # q|do u enjoy being # q",
      "we were dicussing u  not me|oh  i # q|u r not really talking abt me, r u qq",
      "what wd it mean to u if u got # q|why do u want # q|suppose u soon got # q|what if u never got # q|i sometimes also want #",
      "why do u ask q|does that question interest u q|what answer wd please u the most q|what do u think q|are such questions on ur mind often q|what is it that u really want to know q|have u asked anyone else q|have u asked such questions before q|what else comes to mind when u ask that q",
      "names do not interest me|i dont care abt names   pls go on",
      "is that the real reason q|dont any other reason come to mind q|does that reason exlpain anything else q|what other reason might there be q",
      "pls do n o t apologize|apologies are not necessary|what feelings do u have when u apologize q|dont be so defensive",
      "what does that dream suggest to u q|do u dream often q|what persons appear in ur dreams q|r u disturbed by ur dreams q",
      "how do u do    pls tell me whats on ur mind|didnt u already say hello q",
      "u dont seem quite certain|why the uncertain tone q|cant u be more positive q|u arent sure q|dont u know q",
      "r u saying no just to be negative q|u r being a bit negative|why not q|r u sure q|why no q",
      "why r u concerned abt my # q|what abt ur own # q",
      "can u think of a specific example q|when q|what r u thinking of q|really qq   always qq",
      "do u really think so q|but u r not sure u #|do u doubt u # q",
      "in what way q|what resemblance do u see q|what does the similarity suggest to u q|what other connections do u see q|cd there really be some connection q|how q",
      "u seem quite positive|r u sure q|i see|i understand",
      "why do u bring up the topic of friends q|do ur friends worry u q|do ur friends pick on u q|r u sure u have any friends q|do u impose on ur friends q|perhaps ur love for friends worries u",
      "do computers worry u q|r u talking abt me in particular q|r u frightened by machines q|why do you mention computers q|what do you think the machines have to do with ur problem q|dont u think that computers can help u q|what is it abt machines that worries u q",
      "say   do u have any psychological problems qq|what does that suggest to u q|i see|im not sure i understand u fully|come come   elucidate ur thoughts|can u eloborate on that q|that is quite interesting"];

   this.theKeywords= [ /can u /,
      /can i /,
      /u r /,
	  /i dont /,
      /i feel /,
      /why dont u /,
      /why cant i /,
      /r u /,
      /i cant /,
      /i am |im /,
      /u /,
      /i want /,
      /what |how |who |where |when |why /,
      /name /,
      /cause /,
      /sorry /,
      /dream /,
      /hello |hi /,
      /maybe /,
      /no /,
      /ur /,
      /always /,
      /think /,
      /alike /,
      /yes /,
      /friend /,
      /computer |computers /,
      /nokeyfound / ];
   
   this.theWordTracker = [];

   for (var i=0; i<this.theResponses.length; i++) {
	   this.theWordTracker[i] = 0;
   }

   // return therapy opening phrase
   this.intro = function() {
	  return "hi this is eliza the virtual deaf psychotherapist what would you like to discuss qq ga ";
   }

   // end of session. Goodbye!
   this.wrap = function() {
	  return "thanks for chatting take care sksk ";
   }
   
   // check for breaches in tty protocol
   this.errorCheck = function(s) {
	  s = s.replace(/ are /g, " r ");
	  s = s.replace(/ you /g, " u ");
	  s = s.replace(/ youre /g, " ur ");
	  s = s.replace(/ your /g, " ur ");

	  var tok = s.split(" ");
 
      for (var i = 0; i < tok.length; i++) {
		  if (/x+/i.test(tok[i])) {
			  tok[i] = "";
              if (i > 0) {
				  tok[i-1] = "";
			  }
		  }
	  }

	  s = tok.join(" ");
      s = s.replace(/ +/g, " ");
      
	  return s;   
   }

   this.reply = function(input) {
      var foundIndex;
      var foundPosition=-1;
      var possibleReponses;
      var response;
      
      input = input.substr(0, input.length-3); // kill the GA
      input = input.replace(/ +/g, " "); // remove excess spaces 
      input = this.errorCheck(" "+input);
      
      // check for keywords
      foundIndex = 0; 
      while ((foundIndex < this.theKeywords.length) && (foundPosition < 0)) { 
         foundPosition = input.search(this.theKeywords[foundIndex]);
         foundIndex++;
      }
      foundIndex--;
      
      if (foundPosition > -1) {
         //get the part we need to reconjugate
         input = input.substr(foundPosition, input.length-foundPosition);
         input = " "+input.replace(this.theKeywords[foundIndex], "");
      
         //reconjugate the string
         input = input.replace(/ r /g, " %am ");
         input = input.replace(/ were /g, " %was ");
         input = input.replace(/ u /g, " %i ");
         input = input.replace(/ ur /g, " %my ");
         input = input.replace(/ ive /g, " %youve ");
         input = input.replace(/ im /g, " %u %r ");
         input = input.replace(/ me /g, " %u ");
         input = input.replace(/ i /g, " %u ");
         input = input.replace(/ my /g, " %ur ");
         input = input.replace(/%/g, "");
      }
      
      //get a reponse based on the keyword. make sure we rotate though
      //all responses
      possibleResponses=this.theResponses[foundIndex].split("|");
      response=possibleResponses[this.theWordTracker[foundIndex]++];
      if (this.theWordTracker[foundIndex] > possibleResponses.length) { // wrap  around
         this.theWordTracker[foundIndex] = 0;
      }
      
      //insert a conjugated string, if needed
      response = response.replace("#", input);
      
      return response + " ga ";
   }
}
      
      
      
      
