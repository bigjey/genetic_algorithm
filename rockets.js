var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

var trails = document.createElement("canvas");
var trailsCtx = trails.getContext("2d");

var W = 800;
var H = 800;

canvas.width = W;
canvas.height = H;

trails.width = W;
trails.height = H;

document.body.appendChild(trails);
document.body.appendChild(canvas);

trailsCtx.fillStyle = "#000";
trailsCtx.fillRect(0, 0, W, H);

const POPULATION_SIZE = 100;
const MUTATION_CHANCE = 0.001;

const ROCKET_LIFESPAN = 300;
const ROCKET_START_VELOCITY = 1;
const ROCKET_MAX_VELOCITY = 3;
const ROCKET_LAND_BONUS = 1000;
const ROCKET_CRASH_PENALTY = 400;

const rocketSpawn = {
  x: W / 2,
  y: H - 50
};

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
  }

  crossover(otherDNA) {
    var crossedGenes = new Array(ROCKET_LIFESPAN);

    for (var i = 0; i < ROCKET_LIFESPAN; i += 1) {
      if (i % 5 === 0) {
        crossedGenes[i] = otherDNA.genes[i];
      } else {
        crossedGenes[i] = this.genes[i];
      }

      if (i > ROCKET_LIFESPAN / 2 && Math.random() < MUTATION_CHANCE) {
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
    this.generation = 0;
    this.maxFitness = 0;

    for (var i = 0; i < POPULATION_SIZE; i += 1) {
      var dna = new Rocket(rocketSpawn.x, rocketSpawn.y);

      if (dna.fitness > this.maxFitness) this.maxFitness = dna.fitness;

      this.items[i] = dna;
    }
  }

  breed() {
    var selection = this.items
      .filter((a) => !isNaN(a.fitness) && a.fitness > 0)
      .sort((a, b) => b.fitness - a.fitness);

    selection = selection.slice(
      0,
      Math.min(POPULATION_SIZE / 5, selection.length / 3)
    );

    // console.log(selection.map((a) => a.fitness));

    console.log(
      selection.reduce((sum, a) => sum + a.fitness, 0) / selection.length
    );

    this.minFitness = selection.reduce(
      (min, rocket) => (rocket.fitness < min ? rocket.fitness : min),
      Infinity
    );

    this.maxFitness =
      selection.reduce(
        (max, rocket) => (rocket.fitness > max ? rocket.fitness : max),
        0
      ) - this.minFitness;

    var pool = [];
    for (var i = 0; i < selection.length; i += 1) {
      var chance =
        this.maxFitness == 0
          ? 1
          : (((selection[i].fitness - this.minFitness) / this.maxFitness) *
              100) |
            0;
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

      nextPopulation[i] = new Rocket(rocketSpawn.x, rocketSpawn.y);
    }

    this.generation += 1;

    this.items = nextPopulation;
  }

  best() {
    var bestRocket = null;
    var bestTime = Infinity;

    this.items.forEach((rocket) => {
      let landedAt = rocket.landedAt || Infinity;

      if (landedAt < bestTime) {
        bestTime = landedAt;
        bestRocket = rocket;
      }
    });

    return bestRocket;
  }
}

var rockets = new Array(50).fill(0).map((_) => new Rocket(W / 2, H - 50));
var rockets = new RocketsPopulation();
var target = {
  x: W / 2,
  y: 80,
  r: 30
};

var obstacles = [
  {
    x: W / 2,
    y: H / 2 - 50,
    w: W * 0.6,
    h: 20
  }
];

var currentFrame = 0;
var ticktimeout = null;
var bestTime = Infinity;
var lastRocketTime = Infinity;

trailsCtx.fillStyle = "rgba(255,255,255,.05)";

function tick() {
  ctx.fillStyle = "#000";
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "#999";
  // ctx.fillStyle = "#000";

  ctx.beginPath();
  ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  obstacles.forEach((o) => {
    ctx.fillRect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h);
  });

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  rockets.items.forEach((r) => {
    r.update(currentFrame);
    r.draw();

    trailsCtx.fillRect(r.pos.x, r.pos.y, 1, 1);
  });

  currentFrame += 1;

  if (currentFrame >= ROCKET_LIFESPAN) {
    rockets.items.forEach((r) => r.evaluate());

    console.log(
      "hit count",
      rockets.items.reduce((sum, rocket) => {
        if (rocket.landed) {
          sum++;
        }
        return sum;
      }, 0)
    );

    var bestRocketTime = (rockets.best() || {}).landedAt || Infinity;
    lastRocketTime = bestRocketTime;

    if (bestRocketTime < bestTime) bestTime = bestRocketTime;

    rockets.breed();

    currentFrame = 1;
  }

  ctx.fillStyle = "#fff";
  ctx.font = "normal 16px monospace";
  ctx.fillText(`generation: ${rockets.generation}`, 5, H - 45);
  ctx.fillText(`last hit time: ${lastRocketTime}`, 5, H - 25);
  ctx.fillText(`best hit time: ${bestTime}`, 5, H - 5);

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
