let w = 0, h = 0;
const pressedKeys = {};
let lastTimestamp = 0;

const backgroundImage = new Image();
const playerImage = new Image();
const invaderImages = [];

const imageCount = 5;
let loadedImageCount = 0;

const invaderReload = 60;
const playerReload = 0.5;

let invaders = [];
let player = {};
let projectiles = [];

function pageLoad() {

    fixSize();
    loadImages();
    preparePlayer();
    prepareInvaders();

    window.addEventListener("resize", fixSize);
    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => pressedKeys[event.key] = false);

}

function fixSize() {

    w = window.innerWidth;
    h = window.innerHeight;
    const canvas = document.getElementById('invadersCanvas');
    canvas.width = w;
    canvas.height = h;

}

function loadImages() {

    playerImage.src = "0.png";
    playerImage.onload = () => loadCheck();

    let invader1 = new Image();
    invader1.src = "1.png";
    invader1.onload = () => loadCheck();
    invaderImages.push(invader1);

    let invader2 = new Image();
    invader2.src = "2.png";
    invader2.onload = () => loadCheck();
    invaderImages.push(invader2);

    let invader3 = new Image();
    invader3.src = "3.png";
    invader3.onload = () => loadCheck();
    invaderImages.push(invader3);

    backgroundImage.src = "background.jpg";
    backgroundImage.onload = () => loadCheck();

}

function loadCheck() {

    loadedImageCount++;
    if (loadedImageCount === imageCount) {
        window.requestAnimationFrame(gameFrame);
    }

}

function preparePlayer() {

  player.x = w / 2;
  player.y = h - 100;
  player.dx = 0;
  player.alive = true;
  player.reload = 0;

  player.draw = function(context) {
      context.drawImage(playerImage,
          0, 0, playerImage.width, playerImage.height,
          player.x - 32, player.y - 32, 64, 64);
  }

  player.update = function(frameLength) {

    player.x += player.dx * frameLength;

    if (player.x < 50) {
        player.x = 50;
        player.dx = 0;
    } else if (player.x > w - 50) {
        player.x = w-50;
        player.dx = 0;
    }

  }

}

class Invader {

  constructor(x, y, image) {

    this.x = x;
    this.y = y;
    this.image = image;
    this.dx = 256;
    this.edge = false;
    this.alive = true;
    this.reload = Math.random() * invaderReload;

  }

  draw(context) {

    context.drawImage(this.image,
                      0, 0, this.image.width, this.image.height,
                      this.x - 32, this.y - 32, 64, 64);

  }

  update(frameLength) {
    this.x += this.dx * frameLength;
  }

}

function prepareInvaders() {

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 6; j++) {
        let x = 50 + 80*i;
        let y = 50 + 80*j;
        let image = invaderImages[j % 3];
        invaders.push(new Invader(x, y, image));
      }
    }

}

class Projectile {

    //TO-DO

}

function gameFrame(timestamp) {

    if (lastTimestamp === 0) lastTimestamp = timestamp;
    const frameLength = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    inputs();
    processes(frameLength);
    outputs();

    window.requestAnimationFrame(gameFrame);

}

function inputs() {

    if (pressedKeys["ArrowLeft"]) {
      player.dx = -400;
    } else if (pressedKeys["ArrowRight"]) {
      player.dx = 400;
    } else {
      player.dx *= 0.8;
    }

    //TO-DO: Write fire button

}

function seperation(entity1, entity2) {

    return Math.sqrt(Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2));

}

function processes(frameLength) {

    player.update(frameLength);

    for (let invader of invaders) {
      invader.update(frameLength);
    }

}

function outputs() {

  const canvas = document.getElementById('invadersCanvas');
  const context = canvas.getContext('2d');

  context.drawImage(backgroundImage, 0, 0);
  //Optional...
  //context.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height, 0, 0, w, h);

  for (let invader of invaders) {
    invader.draw(context);
  }

  player.draw(context);

}
