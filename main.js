const app = new PIXI.Application();

const options = {
    width: innerWidth,
    height: innerHeight,
    population: 250
}

const controller = new Controller(options);

const flock = new Flock(options);
flock.makeBoids();
controller.flock = flock;

async function render() {
    await app.init({ width: innerWidth, height: innerHeight, background: '#1099bb' })

    const PixiDOMContainer = document.getElementById("canvas_div");
    PixiDOMContainer.appendChild(app.canvas);

    app.ticker.add((delta) => {
        flock.update();
    });
}

render();

