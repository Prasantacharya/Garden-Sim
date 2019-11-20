// String replacement code:
// test out without rendering things first
var string = "AB";
/*
String replacement method:
-------------------------
Replace "A" with "BA"
Replace "B" with "A"
*/
var iterations = 5;
var replace = "";
for(i = 0; i < iterations; i++){
	for each(var character in string){
		if(character === "A"){
			replace += "AB"
		}else if(character === "B"){
			replace += "A"
		}else{
			replace += character
		}
	}
	string = replace;
	console.log(string);
}
