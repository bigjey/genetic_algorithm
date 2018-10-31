var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

var W = 600;
var H = 600;

document.body.appendChild(canvas);

canvas.width = W;
canvas.height = H;

const POPULATION_SIZE = 100;
const MUTATION_CHANCE = 0.02;

const ROCKET_LIFESPAN = 400;
const ROCKET_START_VELOCITY = 2;
const ROCKET_MAX_VELOCITY = 5;
const ROCKET_LAND_BONUS = 1000;
const ROCKET_CRASH_PENALTY = 400;

function randomRocketGene() {
  var x = Math.random() * (ROCKET_START_VELOCITY * 2) - ROCKET_START_VELOCITY;
  var y =
    Math.sqrt(ROCKET_START_VELOCITY * ROCKET_START_VELOCITY - x * x) *
    (Math.random() > 0.5 ? 1 : -1);

  var acc = {
    x,
    y
  };

  return acc;
}

class RocketDNA {
  constructor(genes) {
    if (genes) {
      this.genes = genes;
    } else {
      this.genes = new Array(ROCKET_LIFESPAN);
      for (var i = 0; i < ROCKET_LIFESPAN; i += 1) {
        this.genes[i] = randomRocketGene();
      }
    }

    // console.log(this.genes.length);

    // this.fitness = this.calculateFitness();
  }

  calculateFitness() {
    // var matches = 0;
    // for (var i = 0; i < ROCKET_LIFESPAN; i += 1) {
    //   if (this.genes[i] === ANSWER[i]) matches += 1;
    // }
    // return matches / ROCKET_LIFESPAN;
  }

  crossover(otherDNA) {
    var crossedGenes = new Array(ROCKET_LIFESPAN);
    for (var i = 0; i < ROCKET_LIFESPAN; i += 1) {
      if (i % 2 === 0) {
        crossedGenes[i] = this.genes[i];
      } else {
        crossedGenes[i] = otherDNA.genes[i];
      }

      if (Math.random() < MUTATION_CHANCE) {
        crossedGenes[i] = randomRocketGene();
      }
    }

    // if (Math.random() < MUTATION_CHANCE) {
    //   // return new RocketDNA();
    //   crossedGenes[
    //     Math.floor(Math.random() * GENOME_LENGTH)
    //   ] = randomRocketGene();
    // }

    return new RocketDNA(crossedGenes);
  }
}

class RocketsPopulation {
  constructor() {
    this.items = new Array(POPULATION_SIZE);
    this.generation = 1;
    this.maxFitness = 0;

    for (var i = 0; i < POPULATION_SIZE; i += 1) {
      var dna = new Rocket(W / 2, H - 50);

      if (dna.fitness > this.maxFitness) this.maxFitness = dna.fitness;

      this.items[i] = dna;
    }
  }

  breed() {
    var selection = this.items
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, POPULATION_SIZE * 0.6);

    var minFitness = selection.reduce(
      (min, rocket) => (rocket.fitness < min ? rocket.fitness : min),
      Infinity
    );

    this.maxFitness =
      selection.reduce(
        (max, rocket) => (rocket.fitness > max ? rocket.fitness : max),
        0
      ) - minFitness;

    var pool = [];
    for (var i = 0; i < selection.length; i += 1) {
      var chance =
        this.maxFitness == 0
          ? 1
          : (((selection[i].fitness - minFitness) / this.maxFitness) * 100) | 0;
      for (var j = 0; j < chance; j += 1) {
        pool.push(i);
      }
    }

    var nextPopulation = new Array(POPULATION_SIZE);

    for (var i = 0; i < POPULATION_SIZE; i += 1) {
      var indexA = pool[Math.floor(Math.random() * pool.length)];
      var indexB = pool[Math.floor(Math.random() * pool.length)];

      var A = selection[indexA];
      var B = selection[indexB];

      var newDNA = A.dna.crossover(B.dna);

      nextPopulation[i] = new Rocket(W / 2, H - 50, newDNA);
    }

    this.generation += 1;

    this.items = nextPopulation;
  }

  best() {
    return this.items.find((i) => i.fitness >= this.maxFitness);
  }
}

var rockets = new Array(50).fill(0).map((_) => new Rocket(W / 2, H - 50));
var rockets = new RocketsPopulation();
var target = {
  x: W / 2,
  y: 50,
  r: 30
};

var obstacles = [
  {
    x: 300,
    y: 300,
    w: 400,
    h: 20
  }
];

var currentFrame = 0;
var ticktimeout = null;
function tick() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  // ctx.fillStyle = "#000";

  ctx.beginPath();
  ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  obstacles.forEach((o) => {
    ctx.fillRect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  rockets.items.forEach((r) => {
    r.update(currentFrame);
    r.draw();
  });

  currentFrame += 1;

  if (currentFrame >= ROCKET_LIFESPAN) {
    rockets.items.forEach((r) => r.evaluate());

    console.log(
      'hit count',
      rockets.items.reduce((sum, rocket) => {
        if (rocket.landed) {
          sum++;
        }
        return sum;
      }, 0)
    );

    rockets.breed();

    currentFrame = 1;
  }

  // fitnessMap();

  ticktimeout = setTimeout(tick, 1000 / 100);
}

function fitnessMap() {
  for (var y = 0; y < H; y++) {
    for (var x = 0; x < W; x++) {
      var fitness = 600;
      var crashed = false;
      var landed = false;

      if (
        x - ROCKET_W / 2 < 0 ||
        x > W - ROCKET_W / 2 ||
        y - ROCKET_H / 2 < 0 ||
        y > H - ROCKET_H / 2
      ) {
        crashed = true;
        fitness -= 100;
      }

      var l1 = x - ROCKET_W / 2;
      var r1 = x + ROCKET_W / 2;
      var t1 = y - ROCKET_H / 2;
      var b1 = y + ROCKET_H / 2;

      for (var i = 0; i < obstacles.length; i++) {
        var o = obstacles[i];
        var l2 = o.x - o.w / 2;
        var r2 = o.x + o.w / 2;
        var t2 = o.y - o.h / 2;
        var b2 = o.y + o.h / 2;

        if (!(r1 < l2 || b1 < t2 || t1 > b2 || l1 > r2)) {
          crashed = true;
          // fitness -= 200;
          var diff = 0;
          if (x < W / 2) {
            diff = x - l2;
          } else {
            diff = r2 - x;
          }

          if (y < o.y) {
            fitness -= o.w / 2 - diff;
          } else {
            fitness -= diff + 250;
          }
        }
      }

      if (!crashed && y > o.y) {
        fitness -= 200;
      }

      var d = Math.sqrt(Math.pow(target.x - x, 2) + Math.pow(target.y - y, 2));
      fitness -= d;

      // if (crashed) {
      //   // var penalty = obstacles[0].w / 2 + 50;

      //   // if (y < obstacles[0].y) {
      //   //   penalty /= 2;
      //   // }

      //   fitness -= 200;
      // } else if (y > obstacles[0].y) {
      //   fitness -= 200;
      // }

      // if (y > obstacles[0].y) {
      //   // var diff = Math.abs(x - W / 2);

      //   fitness -= 200;
      // }

      ctx.fillStyle = `hsl(${120 - (fitness / 600) * 120}, 100%, 50%)`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

tick();
