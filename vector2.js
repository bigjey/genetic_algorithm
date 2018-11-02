class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get magnitude() {
    const { x, y } = this;

    return Math.sqrt(x * x + y * y);
  }

  rotate(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    // prettier-ignore
    const matrix = [
      [c, s],
      [-s, c]
    ];

    return this.matrixMultiply(matrix);
  }

  matrixMultiply(m) {
    if (m[0].length !== 2) {
      throw new Error("matrix should have Nx2 size");
    }

    const { x, y } = this;

    const xx = m[0][0] * x + m[0][1] * y;
    const yy = m[1][0] * x + m[1][1] * y;

    return new Vector2(xx, yy);
  }

  product(v2) {
    const x1 = this.x;
    const y1 = this.y;

    const x2 = v2.x;
    const y2 = v2.y;

    return x1 * x2 + y1 * y2;
  }

  cross(v2) {
    const x1 = this.x;
    const y1 = this.y;

    const x2 = v2.x;
    const y2 = v2.y;

    return x1 * y2 - x2 * y1;
  }

  angleBetween(v2) {
    const product = this.product(v2);
    const sign = Math.sign(this.cross(v2));

    const m1 = this.magnitude;
    const m2 = v2.magnitude;

    let cos = product / (m1 * m2);

    let angle = sign * Math.acos(cos);

    // console.log(angle / (Math.PI / 180));

    return angle;
  }
}

Vector2.left = new Vector2(-1, 0);
Vector2.up = new Vector2(0, 1);
Vector2.right = new Vector2(1, 0);
Vector2.down = new Vector2(0, -1);

// var v1 = new Vector2(1, 1);
// var v2 = new Vector2(1, -1);

// console.clear();
// console.log(v1.angleBetween(v2));
// console.log("---");
