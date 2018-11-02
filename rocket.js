const ROCKET_W = 12;
const ROCKET_H = 24;

class Rocket {
  constructor(x, y, dna) {
    this.pos = {
      x,
      y
    };

    this.vel = {
      x: 0,
      y: -1
    };

    var x = 0;
    var y = -1;

    this.acc = new Vector2(x, y);

    this.dna = dna || new RocketDNA();

    this.move = true;
    this.landed = false;
    this.crashed = false;
  }

  update(frame) {
    if (this.move) {
      // var newDir = new Vector2(
      //   this.dna.genes[frame].x,
      //   this.dna.genes[frame].y
      // );

      var v = new Vector2(this.vel.x, this.vel.y);

      var angle = this.dna.genes[frame];

      var vv = v.rotate(angle);

      this.vel.x = vv.x * 1.1;
      this.vel.y = vv.y * 1.1;

      var mag = Math.sqrt(Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2));

      if (mag > ROCKET_MAX_VELOCITY) {
        var normalized = { x: this.vel.x / mag, y: this.vel.y / mag };

        this.vel.x = normalized.x * ROCKET_MAX_VELOCITY;
        this.vel.y = normalized.y * ROCKET_MAX_VELOCITY;
      }

      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;

      if (
        this.pos.x < 0 ||
        this.pos.x > W ||
        this.pos.y < 0 ||
        this.pos.y > H
      ) {
        this.move = false;
        this.crashed = true;
        // this.landedAt = frame;

        return;
      }

      var l1 = this.pos.x;
      var r1 = this.pos.x;
      var t1 = this.pos.y;
      var b1 = this.pos.y;

      for (var i = 0; i < obstacles.length; i++) {
        var o = obstacles[i];
        var l2 = o.x - o.w / 2;
        var r2 = o.x + o.w / 2;
        var t2 = o.y - o.h / 2;
        var b2 = o.y + o.h / 2;

        if (!(r1 < l2 || b1 < t2 || t1 > b2 || l1 > r2)) {
          this.move = false;
          // this.crashed = true;
          this.crashedO = true;
          // this.landedAt = frame;
        }
      }

      var d = Math.sqrt(
        Math.pow(target.x - this.pos.x, 2) + Math.pow(target.y - this.pos.y, 2)
      );

      if (d <= target.r) {
        this.move = false;
        this.landed = true;
        this.landedAt = frame;

        return;
      }
    }
  }

  draw() {
    const v = new Vector2(this.vel.x, this.vel.y);
    const angle = v.angleBetween(Vector2.right);

    ctx.save();

    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(-angle + Math.PI / 2);

    const w = ROCKET_W;
    const h = ROCKET_H;

    ctx.beginPath();
    ctx.moveTo(-w / 2, h / 2);
    ctx.lineTo(w / 2, h / 2);
    ctx.lineTo(0, -h / 2);
    ctx.closePath();
    ctx.fill();

    // ctx.fillRect(-ROCKET_W / 2, -ROCKET_H / 2, ROCKET_W, ROCKET_H);

    ctx.restore();
  }

  evaluate() {
    var x = this.pos.x;
    var y = this.pos.y;

    if (this.crashedO) {
      y += 50;
    }

    if (x < 0) {
      x = 0;
    }

    if (x > W - 1) {
      x = W - 1;
    }

    if (y < 0) {
      y = 0;
    }

    if (y > H - 1) {
      y = H - 1;
    }

    this.fitness = grid[y | 0][x | 0].weight;

    if (this.landed) {
      this.fitness += 1000;
    }
  }
}
