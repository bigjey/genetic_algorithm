const ROCKET_W = 6;
const ROCKET_H = 6;

class Rocket {
  constructor(x, y, dna) {
    this.pos = {
      x,
      y
    };

    this.vel = {
      x: 0,
      y: 0
    };

    this.dna = dna || new RocketDNA();

    this.move = true;
    this.landed = false;
    this.crashed = false;
  }

  update(frame) {
    if (this.move) {
      this.vel.x += this.dna.genes[frame].x;
      this.vel.y += this.dna.genes[frame].y;

      var mag = Math.sqrt(Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2));

      if (mag > ROCKET_MAX_VELOCITY) {
        var normalized = { x: this.vel.x / mag, y: this.vel.y / mag };

        this.vel.x = normalized.x * ROCKET_MAX_VELOCITY;
        this.vel.y = normalized.y * ROCKET_MAX_VELOCITY;
      }

      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;

      if (
        this.pos.x - ROCKET_W / 2 < 0 ||
        this.pos.x > W - ROCKET_W / 2 ||
        this.pos.y - ROCKET_H / 2 < 0 ||
        this.pos.y > H - ROCKET_H / 2
      ) {
        this.move = false;
        this.crashed = true;
        // this.landedAt = frame;

        return;
      }

      var l1 = this.pos.x - ROCKET_W / 2;
      var r1 = this.pos.x + ROCKET_W / 2;
      var t1 = this.pos.y - ROCKET_H / 2;
      var b1 = this.pos.y + ROCKET_H / 2;

      for (var i = 0; i < obstacles.length; i++) {
        var o = obstacles[i];
        var l2 = o.x - o.w / 2;
        var r2 = o.x + o.w / 2;
        var t2 = o.y - o.h / 2;
        var b2 = o.y + o.h / 2;

        if (!(r1 < l2 || b1 < t2 || t1 > b2 || l1 > r2)) {
          this.move = false;
          this.crashed = true;
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
    ctx.fillRect(
      this.pos.x - ROCKET_W / 2,
      this.pos.y - ROCKET_H / 2,
      ROCKET_W,
      ROCKET_H
    );
  }

  evaluate() {
    this.fitness = 500;

    var d = Math.sqrt(
      Math.pow(target.x - this.pos.x, 2) + Math.pow(target.y - this.pos.y, 2)
    );
    this.fitness -= d;

    if (this.crashedO) {
      var diff = 0;
      if (this.pos.x < W / 2) {
        diff = this.pos.x - obstacles[0].x + obstacles[0].w / 2;
      } else {
        diff = obstacles[0].x + obstacles[0].w / 2 - this.pos.x;
      }

      if (this.pos.y < obstacles[0].y) {
        this.fitness -= obstacles[0].w / 2 - diff;
      } else {
        this.fitness -= diff + 250;
      }
    }

    if (this.crashed) {
      this.fitness -= 80;
    }

    if (this.landed) {
      this.fitness += 2000;
      this.fitness += (ROCKET_LIFESPAN / this.landedAt) * 200;
    }

    if (!this.crashed && this.pos.y > obstacles[0].y) {
      this.fitness -= 200;
    }
  }
}
