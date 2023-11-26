p5.disableFriendlyErrors = true;
const width = 800;
const height = 800;

let f;

const boundary = new Boundary({ x: width / 2, y: height / 2 }, width / 2);
const quad = new QuadTree(boundary, 20);

function getMultipleRandom(arr, num) {
    const out = [];
    for (let i = 0; i < num; i++) {
        out.push(arr[Math.floor(Math.random()*arr.length)])
    }

    return out;
}

function setup() {
    let cnvs = createCanvas(width, height);
    cnvs.parent("canvas_div");

    f = new Flock(1000);
    f.makeBoids();

    alignSlider = select("#align-strength");
    cohesionSlider = select("#cohesion-strength");
    separationSlider = select("#separation-strength");
    separationRadius = select("#separation-range");
    alignRadius = select("#align-range");
    cohesionRadius = select("#cohesion-range");
}

function draw() {
    background(255);
    f.update();

    let fps = frameRate();
    fill(255);
    stroke(0);
    text("FPS: " + fps.toFixed(2), 10, height - 10);
}

class Flock {
    constructor(size) {
        this.size = size;
        this.boids = [];
    }
    makeBoids() {
        for (let i = 0; i < this.size; i++) {
            this.boids.push(new Boid());
        }
    }
    update() {
        for (let i = 0; i < this.boids.length; i++) {

            // quad.update(this.boids);
            // let boidsInRange = quad.queryRangeCircle(new Boundary(this.boids[i].point, 20));

            const boidsInRange = getMultipleRandom(this.boids, 32);

            this.boids[i].run(boidsInRange);
        }
    }
}

class Boid {
    constructor() {

        this.r = 3.0;
        this.acceleration = createVector(0, 0)
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.position = createVector(Math.random() * width, Math.random() * height);
        this.maxSpeed = 3;
        this.maxForce = 0.05;
        this.point = {x: this.position.x, y: this.position.y}

        this.color = Math.random() * 360;
        this.size = Math.floor(Math.random() * (8 - 4 + 1)) + 4;

    }

    run(boids) {
        this.flock(boids);
        this.update();
        this.onHitWall();
        this.draw();
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        this.point = {x: this.position.x, y: this.position.y};
        this.acceleration.mult(0);
    }

    draw(increment) {
        // let theta = this.velocity.heading() + radians(90);
        // colorMode(HSB);
        fill(this.color, 100, 100);
        noStroke();
        circle(this.position.x, this.position.y, this.size)
    }

    onHitWall() {
        if (this.position.x < -this.r) this.position.x = width + this.r;
        if (this.position.y < -this.r) this.position.y = height + this.r;
        if (this.position.x > width + this.r) this.position.x = -this.r;
        if (this.position.y > height + this.r) this.position.y = -this.r;
    }

    flock(boids) {
        let separation = this.separate(boids);
        let align = this.align(boids);
        let cohesion = this.cohesion(boids);

        separation.mult(separationSlider.value() / 50);
        align.mult(alignSlider.value() / 50);
        cohesion.mult(cohesionSlider.value() / 50);

        this.applyForce(separation);
        this.applyForce(align);
        this.applyForce(cohesion);
    }


    separate(boids) {
        let steer = createVector(0, 0);
        let count = 0;

        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.position, boids[i].position);
            if ((d > 0) && (d < separationRadius.value())) {
                let diff = p5.Vector.sub(this.position, boids[i].position);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }
        if (count > 0) {
            steer.div(count);

            if (steer.mag() > 0) {
                steer.normalize();
                steer.mult(this.maxSpeed);
                steer.sub(this.velocity);
                steer.limit(this.maxForce);
            }
        }
        
        return steer;
    }

    align(boids) {
        let steer = createVector(0, 0);
        let count = 0;

        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.position, boids[i].position);
            if ((d > 0) && (d < alignRadius.value())) {
                steer.add(boids[i].velocity);
                count++;
            }
        }
        if (count > 0) {
            steer.div(count);
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer = p5.Vector.sub(steer, this.velocity);
            steer.limit(this.maxForce);
        }

        return steer;
    }

    cohesion(boids) {
        let steer = createVector(0, 0);
        // let colorValue = 0;
        let count = 0;

        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.position, boids[i].position);
            if ((d > 0) && (d < cohesionRadius.value())) {
                steer.add(boids[i].position);
                // colorValue += boids[i].color;
                count++;
                // stroke((this.color + boids[i].color) / 2, 100, 100, (50 - d) / 50);
                // line(this.position.x, this.position.y, boids[i].position.x, boids[i].position.y);
            }
        }
        if (count > 0) {
            steer.div(count);
            steer.sub(this.position);
            steer.setMag(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);

            // colorValue = colorValue / count;
            // this.color = (colorValue > this.color) ? this.color + 1 : this.color - 1;
            // this.color = (this.color < 0) ? 360 : this.color;
            // this.color = (this.color > 360) ? 0 : this.color; 
        }

        return steer;
    }
}


