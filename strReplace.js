// String replacement code:
// test out without rendering things first
var string = "AB";
/*
String replacement method:
-------------------------
Replace "A" with "BA"
Replace "B" with "A"
*/
var rules = {
"A":"AB",
"B":"A"
};
// rules for special characters

var iterations = 5;
var replace = "";
for(i = 0; i < iterations; i++){
	for each(var character in string){
		if(character in rules){ // do the replacement if it is special
			replace += rules[character]
		}else{ // if the character is not special, then don't do anything
			replace += character
		}
	}
	string = replace;
	// console.log(string); // just to verify if it works
}
