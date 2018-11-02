var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

var trails = document.createElement('canvas');
var trailsCtx = trails.getContext('2d');

var W = 800;
var H = 800;

var grid = new Array(H);

canvas.width = W;
canvas.height = H;

trails.width = W;
trails.height = H;

document.body.appendChild(trails);
document.body.appendChild(canvas);

trailsCtx.fillStyle = '#000';
trailsCtx.fillRect(0, 0, W, H);

const POPULATION_SIZE = 100;
const MUTATION_CHANCE = 0.001;

const ROCKET_LIFESPAN = 300;
const ROCKET_START_VELOCITY = 2;
const ROCKET_MAX_VELOCITY = 5;
const ROCKET_LAND_BONUS = 1000;
const ROCKET_CRASH_PENALTY = 400;

const rocketSpawn = {
  x: W / 2,
  y: H - 20
};

function randomRocketGene() {
  return ((Math.random() * 20 - 10) * Math.PI) / 180;
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
      if (i % 10 === 0) {
        crossedGenes[i] = otherDNA.genes[i];
      } else {
        crossedGenes[i] = this.genes[i];
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
    this.generation = 0;
    this.maxFitness = 0;

    for (var i = 0; i < POPULATION_SIZE; i += 1) {
      var dna = new Rocket(rocketSpawn.x, rocketSpawn.y);

      if (dna.fitness > this.maxFitness) this.maxFitness = dna.fitness;

      this.items[i] = dna;
    }
  }

  breed() {
    var selection = this.items.sort((a, b) => a.fitness - b.fitness);

    selection = selection.slice(0, 10);

    var maxFitness = 0;
    for (var i = 0; i < selection.length; i++) {
      if (selection[i].fitness > maxFitness) {
        maxFitness = selection[i].fitness;
      }
    }
    maxFitness += 10;

    console.log(selection.map((s) => s.fitness));

    var pool = [];
    for (var i = 0; i < selection.length; i += 1) {
      var chance = ((maxFitness - selection[i].fitness) / maxFitness) * 1000;
      console.log(chance);

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
    x: W * 0.35,
    y: H / 2 - 50,
    w: W * 0.9,
    h: 20
  }
  // {
  //   x: W * 0.65,
  //   y: H / 2 + 150,
  //   w: W * 0.9,
  //   h: 20
  // }
];

var currentFrame = 0;
var ticktimeout = null;
var bestTime = Infinity;
var lastRocketTime = Infinity;

trailsCtx.fillStyle = 'rgba(255,255,255,.05)';

var queue = [];

for (var y = 0; y < H; y++) {
  grid[y] = new Array(W);

  for (var x = 0; x < W; x++) {
    grid[y][x] = {
      y,
      x,
      visited: false,
      weight: 0,
      obstacleWeight: 0,
      target: false
    };
  }
}

var maxWeight = 0;

grid[target.y][target.x].target = true;
grid[target.y][target.x].visited = true;

obstacles.forEach((o) => {
  for (var y = o.y - o.h / 2; y < o.y + o.h / 2; y++) {
    for (var x = o.x - o.w / 2; x < o.x + o.w / 2; x++) {
      var yy = Math.floor(y);
      var xx = Math.floor(x);

      if (yy < 0 || yy > H - 1 || xx < 0 || xx > W - 1) {
        continue;
      }

      let el = grid[yy][xx];

      el.obstacle = true;
      el.obstacleWeight = 100;
    }
  }
});

queue.push(grid[target.y][target.x]);

function processQueue() {
  let el = queue.shift();

  if (el) {
    el.visited = true;

    for (var yy = el.y - 1; yy <= el.y + 1; yy++) {
      for (var xx = el.x - 1; xx <= el.x + 1; xx++) {
        if (
          yy < 0 ||
          yy > H - 1 ||
          xx < 0 ||
          xx > W - 1 ||
          grid[yy][xx].visited ||
          queue.includes(grid[yy][xx]) ||
          grid[yy][xx].obstacle
        ) {
          continue;
        }

        var d = Math.sqrt(Math.pow(yy - el.y, 2) + Math.pow(xx - el.x, 2));

        grid[yy][xx].weight = el.weight + d;

        if (grid[yy][xx].weight + grid[yy][xx].obstacleWeight > maxWeight) {
          maxWeight = grid[yy][xx].weight;
        }

        queue.push(grid[yy][xx]);
      }
    }
  }
}

function inObstacle(x, y) {
  return obstacles.some((o) => {
    var t = o.y - o.h / 2;
    var b = o.y + o.h / 2;
    var l = o.x - o.w / 2;
    var r = o.x + o.w / 2;

    return !(x < l || x > r || y < t || y > b);
  });
}

while (queue.length) {
  processQueue();
}

function tick() {
  ctx.fillStyle = '#000';
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = '#999';
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

    trailsCtx.fillRect(r.pos.x, r.pos.y, 1, 1);
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

    var bestRocketTime = (rockets.best() || {}).landedAt || Infinity;
    lastRocketTime = bestRocketTime;

    if (bestRocketTime < bestTime) bestTime = bestRocketTime;

    rockets.breed();

    currentFrame = 1;
  }

  ctx.fillStyle = '#fff';
  ctx.font = 'normal 16px monospace';
  ctx.fillText(`generation: ${rockets.generation}`, 5, H - 45);
  ctx.fillText(`last hit time: ${lastRocketTime}`, 5, H - 25);
  ctx.fillText(`best hit time: ${bestTime}`, 5, H - 5);

  // fitnessMap();
  // distanceMap();

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

function distanceMap() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  for (var y = 0; y < H; y++) {
    for (var x = 0; x < W; x++) {
      if (grid[y][x].target) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(x, y, 1, 1);
      } else if (grid[y][x].visited) {
        var w = grid[y][x].weight + grid[y][x].obstacleWeight;

        let hue = w / maxWeight;

        ctx.fillStyle = `hsl(${90 - 90 * hue}, 60%, 50%)`;
        ctx.fillRect(x, y, 1, 1);
      } else if (queue.includes(grid[y][x])) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

tick();

canvas.addEventListener('mousemove', ({ clientX, clientY }) => {
  // console.log(clientY, clientX);
  console.log(
    grid[clientY][clientX].obstacle
      ? grid[clientY + obstacles[0].h][clientX].weight
      : grid[clientY][clientX].weight
  );
});
