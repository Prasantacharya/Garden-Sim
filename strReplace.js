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
"A":["AA+B", "A-AB", "A-AC"],
"B":["AC", "+AB", "-AC"]
};
// rules for special characters
/*
Generate rules:
------------
A : Stalk
B : Leaf
C : Flower
+ : rotate a certain amount
- : rotate a diferent amount
[ : save the previous state to a stack
] : remove state from stack
# : thicken by certain amount
! : thin by specificed amount
*/
var iterations = 5;
var replace = "";
for(i = 0; i < iterations; i++){
	for (let character of string){
		if(character in rules){ // do the replacement if it is special
			var rand = Math.random() * 3; // chooses one of 3 random choices
			replace += rules[character][rand];
		}else{ // if the character is not special, then don't do anything
			replace += character;
		}
	}
	string = replace;
	// console.log(string); // just to verify if it works
}
