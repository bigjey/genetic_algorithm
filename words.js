const POPULATION_SIZE = 100;
const MUTATION_CHANCE = 0.02;

const ANSWER = 'DENCHIK';

const GENES_POOL = 'QWERTYUIOPASDFGHJKLZXCVBNM 1234567890';
const GENOME_LENGTH = ANSWER.length;

function randomGene() {
  return GENES_POOL[Math.floor(Math.random() * GENES_POOL.length)];
}

class WordDNA {
  constructor(genes) {
    if (genes) {
      this.genes = genes;
    } else {
      this.genes = new Array(GENOME_LENGTH);
      for (var i = 0; i < GENOME_LENGTH; i += 1) {
        this.genes[i] = randomGene();
      }
    }

    this.fitness = this.calculateFitness();
  }

  calculateFitness() {
    var matches = 0;
    for (var i = 0; i < GENOME_LENGTH; i += 1) {
      if (this.genes[i] === ANSWER[i]) matches += 1;
    }

    return matches / GENOME_LENGTH;
  }

  crossover(otherDNA) {
    var crossedGenes = new Array(GENOME_LENGTH);
    for (var i = 0; i < GENOME_LENGTH; i += 1) {
      if (i % 2 === 0) {
        crossedGenes[i] = this.genes[i];
      } else {
        crossedGenes[i] = otherDNA.genes[i];
      }

      // if (Math.random() < MUTATION_CHANCE) {
      //   crossedGenes[i] =
      //     randomGene();
      // }
    }

    if (Math.random() < MUTATION_CHANCE) {
      crossedGenes[Math.floor(Math.random() * GENOME_LENGTH)] = randomGene();
    }

    return new WordDNA(crossedGenes);
  }
}

class WordsPopulation {
  constructor() {
    this.items = new Array(POPULATION_SIZE);
    this.generation = 1;
    this.maxFitness = 0;

    for (var i = 0; i < POPULATION_SIZE; i += 1) {
      var dna = new WordDNA();

      if (dna.fitness > this.maxFitness) this.maxFitness = dna.fitness;

      this.items[i] = dna;
    }
  }

  breed() {
    var selection =
      this.maxFitness > 0
        ? this.items.filter((i) => i.fitness > 0)
        : this.items;

    var pool = [];
    for (var i = 0; i < selection.length; i += 1) {
      var chance =
        this.maxFitness == 0
          ? 1
          : ((selection[i].fitness / this.maxFitness) * 100) | 0;
      for (var j = 0; j < chance; j += 1) {
        pool.push(i);
      }
    }

    var nextPopulation = new Array(POPULATION_SIZE);
    this.maxFitness = 0;

    for (var i = 0; i < POPULATION_SIZE; i += 1) {
      var indexA = pool[Math.floor(Math.random() * pool.length)];
      var indexB = pool[Math.floor(Math.random() * pool.length)];

      var A = selection[indexA];
      var B = selection[indexB];

      var newDNA = A.crossover(B);

      if (newDNA.fitness > this.maxFitness) this.maxFitness = newDNA.fitness;

      nextPopulation[i] = newDNA;
    }

    this.generation += 1;

    this.items = nextPopulation;
  }

  best() {
    return this.items.find((i) => i.fitness >= this.maxFitness);
  }
}

// #1 Genetic Alghoritm

// console.time('time');
// var results = [];
// var TRIES = 1;

// let p;
// for (var i = 0; i < TRIES; i++) {
//   p = new WordsPopulation();
//   while (p.maxFitness < 1) {
//     p.breed();
//   }

//   results.push(p.generation);
// }
// console.timeEnd('time');

// console.log(results.reduce((sum, a) => sum + a) / results.length);
// console.log(p.best().genes.join(''));

// #2 Pure random

console.time('time');
var TRIES = 2e7;
for (var i = 0; i < TRIES; i += 1) {
  var arr = new Array(GENOME_LENGTH);
  for (var j = 0; j < GENOME_LENGTH; j += 1) {
    arr[j] = randomGene();
  }
  if (arr.join('') === ANSWER) {
    console.log(i, arr);
    break;
  }
}
console.timeEnd('time');
