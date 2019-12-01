class Seed{
	constructor(string, rules, extraRules){
		this.string = string;
		this.rules = rules; // contains the rules for string replacement
		this.extra = extraRules; // contains the rules for extra symbols (how long, rotation, etc)
	}
	getString(){
		return this.string;
	}
	getRules(){
		return this.rules;
	}
	getExtraRules(){
		return this.extraRules;
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
		let newString = "";
		let newRules = {};
		let newExtra = {};
		return new Seed(newString, newRules, newExtra);
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
		replace = "";
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
  // console.log("Starting string:", str);

	for (let char of str){
		// console.log("character: ", char);
		if(valid(char) && (char in seed.extra)){ // assumes that all alphabetic characters are capital
			// if it is a letter, we add the specified ammount to the
      // console.log("x: ", x, "| y: ", y, "| degree: ", degree);
      // console.log(seed.extra[char] * Math.sin(degree));
			points.push([x,y]);
			y += seed.extra[char] * Math.cos(degree);
			x += seed.extra[char] * Math.sin(degree);
			points.push([x,y]);
		}else if(char === "+" || char === "-"){
				// if it is a + or a -, we rotate by that specified ammount
				degree += seed.extra[char];
		} else if(char === "["){
			// if it is a [, we save the current state
			stack.unshift([x,y, degree]);
		} else if(char === "]"){
			// if it is a ], we go back to the previous state
			x = stack[0][0];
			y = stack[0][1];
			degree = stack[0][2];
			stack.splice(0,1);
		}
	}
	return points;
}

function valid(char){
  char.toUpperCase(); // checks if the character is valid
  return (char.charCodeAt(0) >= 65 && char.charCodeAt() <= 90);
}

/*
function generate3d(seed, itr, start){

}

function scale3d(points){

}
*/

function scale(points){
	// scales all the points so they are a reasonable size
	let max = 0;
	for(i = 0; i < points.length; i++){
		if(max < Math.abs(points[i][0])) max = Math.abs(points[i][0]);
		if(max < Math.abs(points[i][1])) max = Math.abs(points[i][1]);
	}
	for(i = 0; i < points.length; i++){
		points[i][0] = points[i][0] / (max+ 0.25);
		points[i][1] = points[i][1] / (max + 0.25);
	}
	return points;
}

// some starter seeds
var replacementLibrary = {
    "Fern":{},
		"Bramble":{  "F": ["F[+FF][-FF]F[-F][+F]F", "F[-FF][+F]FF[-F][+F]F", "F[+F]F[-FF]F[-F+F-F][F]F"]}
};

var extraRules = {
		"Fern":{},
		"Bramble":{"-":-0.6108652,/*degrees clockwise*/
		"+":0.6108652,/*degrees counter-clockwise*/
		"F":1/*side length*/}
};

var startingRules = {
		"Fern":"",
		"Bramble":"F"
};

function newSeed(seedType){
	return new Seed(startingRules[seedType], replacementLibrary[seedType], extraRules[seedType]);
}

function addSeedToLibrary(seed){
	// adds a new seed to the library
}

// s = new Seed("X", dictionary, extraRules);
// generatePts(s, 2, [0,-1]);
