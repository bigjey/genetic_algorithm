var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

var W = 15;
var H = 15;
var S = 50;

canvas.width = W * S;
canvas.height = H * S;

document.body.appendChild(canvas);

var queue = [];

var grid = new Array(H);

for (var y = 0; y < H; y++) {
  grid[y] = new Array(W);

  for (var x = 0; x < W; x++) {
    grid[y][x] = {
      y,
      x,
      visited: false,
      weight: 0,
      target: false
    };
  }
}

var maxWeight = 0;

grid[6][7].target = true;
grid[6][7].visited = true;

queue.push(grid[6][7]);

grid[2][0].obstacle = true;
grid[2][1].obstacle = true;
grid[2][2].obstacle = true;
grid[2][3].obstacle = true;
grid[2][4].obstacle = true;
grid[2][5].obstacle = true;
grid[2][6].obstacle = true;
grid[3][6].obstacle = true;
grid[4][6].obstacle = true;
grid[5][6].obstacle = true;
grid[6][6].obstacle = true;
grid[7][6].obstacle = true;
grid[7][5].obstacle = true;
grid[7][4].obstacle = true;

grid[7][6].obstacle = true;
grid[7][7].obstacle = true;
grid[7][8].obstacle = true;
grid[7][9].obstacle = true;
grid[7][10].obstacle = true;

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

        grid[yy][xx].weight = el.weight + 1;

        if (grid[yy][xx].weight > maxWeight) {
          maxWeight = grid[yy][xx].weight;
        }

        queue.push(grid[yy][xx]);
      }
    }
  }
}

ctx.font = 'normal 16px monospace';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

function draw() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W * S, H * S);

  for (var y = 0; y < H; y++) {
    for (var x = 0; x < W; x++) {
      if (grid[y][x].target) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(x * S, y * S, S, S);
      } else if (grid[y][x].obstacle) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x * S, y * S, S, S);
      } else if (grid[y][x].visited) {
        let hue = grid[y][x].weight / maxWeight;

        ctx.fillStyle = `hsl(${90 - 90 * hue}, 60%, 50%)`;
        ctx.fillRect(x * S, y * S, S, S);
      } else if (queue.includes(grid[y][x])) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(x * S, y * S, S, S);
      }

      if (!grid[y][x].obstacle) {
        ctx.fillStyle = 'white';
        ctx.fillText(grid[y][x].weight, x * S + S / 2, y * S + S / 2);
      }
    }
  }
}

while (queue.length) {
  processQueue();
}

function tick() {
  draw();

  // setTimeout(tick, 1000 / 10);
}
tick();
