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
			rules[symbol].add(replacement);
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
}

function generatePts(seed, start){
	// is able to generate the points from the seeds
	let str = seed.stringReplace;
	let start = 0.0;
	let end = 0.0;
	for (let char of str){
		// if it is a letter, we add the specified ammount to the
		// if it is a + or a -, we rotate by that specified ammount
		// if it is a [, we save the current state
		// if it is a ], we go back to the previous state
	}

}

// example of a seed object
dictionary = {
  "A": ["AB"],
  "B": ["B"]
};
extraRules = {
  "-":-30,/*degrees clockwise*/
  "+":30,/*degrees counter-clockwise*/
  "A":10,/*side length*/
  "B":15/*side length*/
};
s = new seed("A", dictionary, extraRules);
makeString(s, 4);
