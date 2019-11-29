class seed{
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
		console.log(string);
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
		if(char === "A" || char === "B"){
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

// example of a seed object
dictionary = {
  "A": ["AB"],
  "B": ["B"]
};
extraRules = {
  "-":-Math.PI / 6,/*degrees clockwise*/
  "+":-Math.PI/ 6,/*degrees counter-clockwise*/
  "A":1,/*side length*/
  "B":1.5/*side length*/
};
s = new seed("A", dictionary, extraRules);
console.log(generatePts(s, 4, [0,-1]));
