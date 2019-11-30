class Seed{
	constructor(string, rules, extraRules){
		this.string = string;
		this.rules = rules; // contains the rules for string replacement
		this.extra = extraRules; // contains the rules for extra symbols (how long, rotation, etc)
	}
	addRule(symbol, replacement){
		// allows you to add a string replacement rule
		if(!(symbol in rules)){ // if the symbol does not exist in the rules, then add it
			rules[symbol] = [replacement];
		}else{
			rules[symbol].push(replacement);
		}
	}
	breed(seed2){
		// is able to create a new seed when combined with another seed
	}

}

function makeString(seed, iterations){
	// makes the string from a seed, and a number of iterations
	let replace = "";
	let string = seed.string;
	for(i = 0; i < iterations; i++){
		for(let character of string){
			if(character in seed.rules){
				let rand = Math.floor(Math.random() * seed.rules[character].length);
				replace += seed.rules[character][rand];
			}else{
				replace += character;
			}
		}
		string = replace;
		// console.log(string);
	}
	return string;
}

function generatePts(seed, itr, start){
	// is able to generate the points from the seeds

	let str = makeString(seed, itr);
	let x = start[0];// x point
	let y = start[1];// y point
	// let z = start[2] // for 3d later on
	let degree = 0.0;
	let stack = [];
	var points = [];

	for (let char of str){
		if(valid(char) && (char in seed.extra)){ // assumes that all alphabetic characters are capital
			// if it is a letter, we add the specified ammount to the
			x += seed.extra[char] * Math.cos(degree);
			y += seed.extra[char] * Math.sin(degree);
			points.push([x,y]);
		}else if(char === "+" || char === "-"){
				// if it is a + or a -, we rotate by that specified ammount
				degree += seed.extra[char];
		} else if(char === "["){
			// if it is a [, we save the current state
			stack.unshift([x,y, degree], 0);
		} else if(char === "]"){
			// if it is a ], we go back to the previous state
			x = stack[0][0];
			y = stack[0][1];
			degree = stack[0][2];
		}
	}
	return points;
}

function valid(char){
  char.toUpperCase(); // checks if the character is valid
  return (char.charCodeAt(0) >= 65 && char.charCodeAt() <= 90);
}

function scale(points){
	// scales all the points so they are a reasonable size
}

// example of a seed object
var dictionary = {
  "F": ["FF"],
  "X": ["F-[[X]+X]+F[+FX]-X"]
};
var extraRules = {
  "-":-Math.PI / 6,/*degrees clockwise*/
  "+":-Math.PI/ 6,/*degrees counter-clockwise*/
  "X":1,/*side length*/
  "F":1.5/*side length*/
};
// s = new Seed("X", dictionary, extraRules);
// console.log(generatePts(s, 2, [0,-1]));
