


class Vector {
    constructor(...axes) {
        this.axes = axes
        this.x = this.axes[0]
        this.y = this.axes[1]
    }

    add(vector) {
        return new Vector(
            ...vector.axes.map((axis, index) => this.axes[index] + axis)
        )
    }

    static subtract(vector1, vector2) {
        return new Vector(
            ...vector1.axes.map((axis, index) => vector2.axes[index] - axis)
        )
    }

    subtract(vector) {
        return new Vector(
            ...vector.axes.map((axis, index) => this.axes[index] - axis)
        )
    }

    mult(vector) {
        return new Vector(
            ...vector.axes.map((axis, index) => this.axes[index] * axis)
        )
    }

    scaleBy(number) {
        return new Vector(
            ...this.axes.map(axis => axis * number)
        )
    }

    length() {
        return Math.hypot(...this.axes)
    }

    normalize() {
        return this.scaleBy(1 / this.length())
    }

    limit(max) {
        const magnitude = Math.min(Math.max(this.length(), 0), max)
        return this.withLength(magnitude)
    }

    withLength(newLength) {
        return this.normalize().scaleBy(newLength)
    }

    angle() {
        return Math.atan2(this.axes[1], this.axes[0])
    }
}

class Controller {
    constructor({width, height}) {

        this.flock = null;

        this.width = width;
        this.height = height;

        this.populationElement = document.getElementById("population");
        this.population = this.populationElement.valueAsNumber;
        this.populationElement.addEventListener("change", (e) => {
            this.onPopulationChange(e.target.valueAsNumber);
        })

        this.simulationAccuracyElement = document.getElementById("simulation-accuracy");
        this.simulationAccuracy = this.simulationAccuracyElement.valueAsNumber;
        this.simulationAccuracyElement.addEventListener("change", (e) => {
            this.simulationAccuracy = e.target.valueAsNumber;
        })

        this.separationStrengthElement = document.getElementById("separation-strength");
        this.cohesionStrengthElement = document.getElementById("cohesion-strength");
        this.alignStrengthElement = document.getElementById("align-strength");

        this.separationStrength = this.separationStrengthElement.valueAsNumber;
        this.cohesionStrength = this.cohesionStrengthElement.valueAsNumber;
        this.alignStrength = this.alignStrengthElement.valueAsNumber;

        this.separationStrengthElement.addEventListener("change", (e) => {
            this.separationStrength = e.target.valueAsNumber;
        })

        this.cohesionStrengthElement.addEventListener("change", (e) => {
            this.cohesionStrength = e.target.valueAsNumber;
        })

        this.alignStrengthElement.addEventListener("change", (e) => {
            this.alignStrength = e.target.valueAsNumber;
        })


        this.separationRadiusElement = document.getElementById("separation-range");
        this.cohesionRadiusElement = document.getElementById("cohesion-range");
        this.alignRadiusElement = document.getElementById("align-range");

        this.separationRadius = this.separationRadiusElement.valueAsNumber;
        this.cohesionRadius = this.cohesionRadiusElement.valueAsNumber;
        this.alignRadius = this.alignRadiusElement.valueAsNumber;

        this.separationRadiusElement.addEventListener("change", (e) => {
            this.separationRadius = e.target.valueAsNumber;
        })

        this.cohesionRadiusElement.addEventListener("change", (e) => {
            this.cohesionRadius = e.target.valueAsNumber;
        })

        this.alignRadiusElement.addEventListener("change", (e) => {
            this.alignRadius = e.target.valueAsNumber;
        })
    }

    onPopulationChange(newPopulation) {
        if (flock) {
            this.flock.changePopulationSize(newPopulation);
        }
        this.population = newPopulation;
    }

}

class Flock {
    constructor({...options}) {
        this.population = controller.population;
        this.boids = [];
        this.options = {
            ...options,
            color: "white"
        };
    }

    makeBoids() {
        for (let i = 0; i < this.population; i++) {

            (i === 0) ? this.options.color = "orange" : this.options.color = "white";

            this.boids.push(new Boid(this.options));
        }
    }

    changePopulationSize(newPopulation) {
        this.population = newPopulation;

        let diff = newPopulation - this.boids.length;
        
        while (diff != 0) {
            if (diff > 0) {
                this.boids.push(new Boid(this.options));
                diff--;
            }
            else {
                this.boids.pop().destroy();
                diff++;
            }
        }
    }

    update() {
        for (let i = 0; i < this.boids.length; i++) {

            // quad.update(this.boids);
            // let boidsInRange = quad.queryRangeCircle(new Boundary(this.boids[i].point, 20));

            const boidsInRange = getMultipleRandom(this.boids, controller.simulationAccuracy);

            this.boids[i].run(boidsInRange);
        }
    }
}

class Boid {
    constructor({color, ...options}) {

        this.r = 3.0;
        this.acceleration = new Vector(0, 0)
        this.velocity = new Vector(Math.random(-1, 1), Math.random(-1, 1))
        this.maxSpeed = 2;
        this.maxForce = 0.05;
        this.point = new Vector(Math.random() * controller.width, Math.random() * controller.height)

        this.color = Math.random() * 360;
        this.size = Math.floor(Math.random() * (8 - 4 + 1)) + 4;

        this.shape = new PIXI.Graphics();
        this.shape.clear();
        
        this.shape.beginFill(color);
        // this.shape.drawCircle(0,0,5)
        this.shape.lineStyle();
        this.shape.moveTo(6, 0);
        this.shape.lineTo(-6, -4);
        this.shape.lineTo(-4, 0);
        this.shape.lineTo(-6, 4);
        this.shape.lineTo(6, 0);
        this.shape.endFill();
        this.shape.alpha = 0.8;
        app.stage.addChild(this.shape);
    }

    run(boids) {
        this.flock(boids);
        this.update();
        this.onHitWall();
        this.draw();
    }

    update() {
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.limit(this.maxSpeed);
        this.point = this.point.add(this.velocity);
        this.acceleration = this.acceleration.scaleBy(0);
    }

    draw(increment) {
        // let theta = this.velocity.heading() + radians(90);
        // colorMode(HSB);
        // fill(this.color, 100, 100);
        // noStroke();
        // circle(this.point.axes[0], this.point.axes[1], this.size)
        this.shape.x = this.point.axes[0];
        this.shape.y = this.point.axes[1];
        this.shape.rotation = this.velocity.angle();
    }

    applyForce(force) {
        this.acceleration = this.acceleration.add(force);
    }

    destroy() {
        this.shape.destroy();
    }

    onHitWall(bounce = false) {
        if (bounce) {
            if (this.point.axes[0] < 0 || this.point.axes[0] > controller.width) {
                this.velocity = this.velocity.mult(new Vector(-1, 1))
            }
            if (this.point.axes[1] < 0 || this.point.axes[1] > controller.height) {
                this.velocity = this.velocity.mult(new Vector(1, -1))
            }
        }
        else {
            if (this.point.axes[0] < -this.r) this.point = new Vector(controller.width + this.r, this.point.axes[1]);
            if (this.point.axes[1] < -this.r) this.point = new Vector(this.point.axes[0], controller.height + this.r);
            if (this.point.axes[0] > controller.width + this.r) this.point = new Vector(-this.r, this.point.axes[1]);
            if (this.point.axes[1] > controller.height + this.r) this.point = new Vector(this.point.axes[0], -this.r);
        }
        
    }

    flock(boids) {
        let separation = this.separate(boids);
        let align = this.align(boids);
        let cohesion = this.cohesion(boids);

        separation = separation.scaleBy(controller.separationStrength / 50);
        align = align.scaleBy(controller.alignStrength / 50);
        cohesion = cohesion.scaleBy(controller.cohesionStrength / 50);

        this.applyForce(separation);
        this.applyForce(align);
        this.applyForce(cohesion);
    }

    separate(boids) {

        let separateDelta = new Vector(0, 0);
        let neighborCount = 0;

        boids.forEach(boid => {
            const distanceFromBoid = Math.sqrt((Math.pow(boid.point.axes[0] - this.point.axes[0], 2)) + (Math.pow(boid.point.axes[1] - this.point.axes[1], 2)));
            if (distanceFromBoid > 0 && distanceFromBoid <= controller.separationRadius) {
                
                let diff = Vector.subtract(this.point, boid.point);
                // diff = diff.normalize();
                // diff = diff.scaleBy(1 / distanceFromBoid);
                separateDelta = separateDelta.subtract(diff);
                neighborCount += 1
            }
        })

        if (neighborCount > 0) {
            separateDelta = separateDelta.scaleBy(1 / neighborCount)
        }

        if (separateDelta.length() > 0) {
            // separateDelta = separateDelta.normalize()
            // separateDelta = separateDelta.scaleBy(this.maxSpeed)
            separateDelta = separateDelta.subtract(this.velocity)
            separateDelta = separateDelta.limit(this.maxForce)
        }

        return separateDelta
    }

    align(boids) {

        let alignDelta = new Vector(0, 0);
        let neighborCount = 0;

        boids.forEach(boid => {
            const distanceFromBoid = Math.sqrt((Math.pow(boid.point.axes[0] - this.point.axes[0], 2)) + (Math.pow(boid.point.axes[1] - this.point.axes[1], 2)));
            if (distanceFromBoid > 0 && distanceFromBoid <= controller.alignRadius) {
                alignDelta = alignDelta.add(boid.velocity)
                neighborCount += 1
            }
        })

        if (neighborCount > 0) {
            alignDelta = alignDelta.scaleBy(1 / neighborCount)
            alignDelta = alignDelta.normalize()
            alignDelta = alignDelta.scaleBy(this.maxSpeed);
            alignDelta = alignDelta.subtract(this.velocity)
            alignDelta = alignDelta.limit(this.maxForce);
        }

        return alignDelta;
    }

    cohesion(boids) {

        let cohesionDelta = new Vector(0, 0);
        let neighborCount = 0;

        boids.forEach(boid => {
            const distanceFromBoid = Math.sqrt((Math.pow(boid.point.axes[0] - this.point.axes[0], 2)) + (Math.pow(boid.point.axes[1] - this.point.axes[1], 2)));
            if (distanceFromBoid > 0 && distanceFromBoid <= controller.cohesionRadius) {
                cohesionDelta = cohesionDelta.add(new Vector(boid.point.axes[0], boid.point.axes[1]))
                neighborCount += 1
            }
        })

        if (neighborCount > 0) {
            cohesionDelta = cohesionDelta.scaleBy(1 / neighborCount)
            cohesionDelta = cohesionDelta.subtract(this.point)
            cohesionDelta = cohesionDelta.withLength(this.maxSpeed)
            cohesionDelta = cohesionDelta.subtract(this.velocity)
            cohesionDelta = cohesionDelta.limit(this.maxForce)
        }

        return cohesionDelta;

    }
}