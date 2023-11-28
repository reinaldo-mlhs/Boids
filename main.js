const app = new PIXI.Application({ width: innerWidth, height: innerHeight, background: '#1099bb' });

const PixiDOMContainer = document.getElementById("canvas_div");
PixiDOMContainer.appendChild(app.view);

const options = {
    width: innerWidth,
    height: innerHeight,
    population: 250
}

const controller = new Controller(options);

const flock = new Flock(options);
flock.makeBoids();
controller.flock = flock;

app.ticker.add((delta) => {
    flock.update();
});