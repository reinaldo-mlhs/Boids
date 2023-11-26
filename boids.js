// class Vector {
//     constructor(...axes) {
//         this.axes = axes
//         this.x = this.axes[0]
//         this.y = this.axes[1]
//     }

//     add(vector) {
//         return new Vector(
//             ...vector.axes.map((axis, index) => this.axes[index] + axis)
//         )
//     }

//     static subtract(vector1, vector2) {
//         return new Vector(
//             ...vector1.axes.map((axis, index) => vector2.axes[index] - axis)
//         )
//     }

//     subtract(vector) {
//         return new Vector(
//             ...vector.axes.map((axis, index) => this.axes[index] - axis)
//         )
//     }

//     mult(vector) {
//         return vector.axes.reduce((acc, axis, index) => acc + axis * this.axes[index], 0)
//     }

//     divide(vector) {
//         return vector.axes.reduce((acc, axis, index) => acc + axis / this.axes[index], 0)
//     }

//     scaleBy(number) {
//         return new Vector(
//             ...this.axes.map(axis => axis * number)
//         )
//     }

//     length() {
//         return Math.hypot(...this.axes)
//     }

//     normalize() {
//         return this.scaleBy(1 / this.length())
//     }

//     limit(max) {
//         const magnitude = Math.min(Math.max(this.length(), 0), max)
//         return this.withLength(magnitude)
//     }

//     withLength(newLength) {
//         return this.normalize().scaleBy(newLength)
//     }
// }

// class Boid {
//     constructor() {

//         this.r = 3.0;
//         this.acceleration = new Vector(0, 0)
//         this.velocity = new Vector(Math.random(-1, 1), Math.random(-1, 1))
//         this.maxSpeed = 3;
//         this.maxForce = 0.05;
//         this.point = new Vector(Math.random() * width, Math.random() * height)

//         this.color = Math.random() * 360;
//         this.size = Math.floor(Math.random() * (8 - 4 + 1)) + 4;

//     }

//     run(boids) {
//         this.flock(boids);
//         this.update();
//         this.onHitWall();
//         this.draw();
//     }

//     update() {
//         this.velocity = this.velocity.add(this.acceleration);
//         this.velocity = this.velocity.limit(this.maxSpeed);
//         this.point = this.point.add(this.velocity);
//         this.acceleration = this.acceleration.scaleBy(0);
//     }

//     draw(increment) {
//         // let theta = this.velocity.heading() + radians(90);
//         // colorMode(HSB);
//         fill(this.color, 100, 100);
//         noStroke();
//         circle(this.point.axes[0], this.point.axes[1], this.size)
//     }

//     applyForce(force) {
//         this.acceleration = this.acceleration.add(force);
//     }

//     onHitWall() {
//         if (this.point.axes[0] < -this.r) this.point = new Vector(width + this.r, this.point.axes[1]);
//         if (this.point.axes[1] < -this.r) this.point = new Vector(this.point.axes[0], height + this.r);
//         if (this.point.axes[0] > width + this.r) this.point = new Vector(-this.r, this.point.axes[1]);
//         if (this.point.axes[1] > height + this.r) this.point = new Vector(this.point.axes[0], -this.r);
//     }

//     flock(boids) {
//         let separation = this.separate(boids);
//         let align = this.align(boids);
//         let cohesion = this.cohesion(boids);

//         separation = separation.scaleBy(separationSlider.value() / 50);
//         align = align.scaleBy(alignSlider.value() / 50);
//         cohesion = cohesion.scaleBy(cohesionSlider.value() / 50);

//         this.applyForce(separation);
//         this.applyForce(align);
//         this.applyForce(cohesion);
//     }

//     separate(boids) {

//         let separateDelta = new Vector(0, 0);
//         let neighborCount = 0;

//         boids.forEach(boid => {
//             const distanceFromBoid = Math.sqrt((Math.pow(boid.point.axes[0] - this.point.axes[0], 2)) + (Math.pow(boid.point.axes[1] - this.point.axes[1], 2)));
//             if (distanceFromBoid > 0 && distanceFromBoid <= separationRadius.value()) {
                
//                 let diff = Vector.subtract(this.point, boid.point);
//                 // diff = diff.normalize();
//                 // diff = diff.scaleBy(1 / distanceFromBoid);
//                 separateDelta = separateDelta.subtract(diff);
//                 neighborCount += 1
//             }
//         })

//         if (neighborCount > 0) {
//             separateDelta = separateDelta.scaleBy(1 / neighborCount)
//         }

//         if (separateDelta.length() > 0) {
//             // separateDelta = separateDelta.normalize()
//             // separateDelta = separateDelta.scaleBy(this.maxSpeed)
//             // separateDelta = separateDelta.subtract(this.velocity)
//             separateDelta = separateDelta.limit(this.maxForce)
//         }

//         return separateDelta
//     }

//     align(boids) {

//         let alignDelta = new Vector(0, 0);
//         let neighborCount = 0;

//         boids.forEach(boid => {
//             const distanceFromBoid = Math.sqrt((Math.pow(boid.point.axes[0] - this.point.axes[0], 2)) + (Math.pow(boid.point.axes[1] - this.point.axes[1], 2)));
//             if (distanceFromBoid > 0 && distanceFromBoid <= alignRadius.value()) {
//                 alignDelta = alignDelta.add(boid.velocity)
//                 neighborCount += 1
//             }
//         })

//         if (neighborCount > 0) {
//             alignDelta = alignDelta.scaleBy(1 / neighborCount)
//         }

//         return alignDelta;
//     }

//     cohesion(boids) {

//         let cohesionDelta = new Vector(0, 0);
//         let neighborCount = 0;

//         boids.forEach(boid => {
//             const distanceFromBoid = Math.sqrt((Math.pow(boid.point.axes[0] - this.point.axes[0], 2)) + (Math.pow(boid.point.axes[1] - this.point.axes[1], 2)));
//             if (distanceFromBoid > 0 && distanceFromBoid <= cohesionRadius.value()) {
//                 cohesionDelta = cohesionDelta.add(new Vector(boid.point.axes[0], boid.point.axes[1]))
//                 neighborCount += 1
//             }
//         })

//         if (neighborCount > 0) {
//             cohesionDelta = cohesionDelta.scaleBy(1 / neighborCount)
//             cohesionDelta = cohesionDelta.subtract(this.point)
//             cohesionDelta = cohesionDelta.withLength(this.maxSpeed)
//             cohesionDelta = cohesionDelta.subtract(this.velocity)
//             cohesionDelta = cohesionDelta.limit(this.maxForce)
//         }

//         return cohesionDelta;

//     }
// }