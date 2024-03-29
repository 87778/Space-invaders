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
let players = [];
let projectiles = [];

function pageLoad() {

    fixSize();
    loadImages();
    players.push(new Player());
    players.push(new Player());
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

class Player {

  constructor() {
    this.x = w / 2;
    this.y = h - 100;
    this.dx = 0;
    this.alive = true;
    this.reload = 0;
  }

  draw(context) {
      context.drawImage(playerImage,
          0, 0, playerImage.width, playerImage.height,
          this.x - 32, this.y - 32, 64, 64);
  }

  update(frameLength) {

    this.x += this.dx * frameLength;

    if (this.x < 50) {
        this.x = 50;
        this.dx = 0;
    } else if (this.x > w - 50) {
        this.x = w-50;
        this.dx = 0;
    }

    this.reload -= frameLength;

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
    this.edge = this.x > w - 32 || this.x < 32;

    this.reload -= frameLength;
    if (this.reload < 0) {
      projectiles.push(new Projectile(this.x, this.y+25, 250, false));
      this.reload = invaderReload;
    }

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

  constructor(x, y, dy, friendly) {
      this.x = x;
      this.y = y;
      this.dy = dy;
      this.friendly = friendly;
      this.expired = false;
  }

  draw(context) {
    if (this.friendly) {
      context.fillStyle = 'limegreen';
    } else {
      context.fillStyle = 'orange';
    }

    context.beginPath();
    context.arc(this.x, this.y, 10, 0, 2*Math.PI);
    context.fill();

  }

  update(frameLength) {
    this.y += frameLength * this.dy;
    this.expired = this.y < -5 || this.y > h+5;
  }

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

    if (players[0].alive) {

    if (pressedKeys["ArrowLeft"]) {
      players[0].dx = -400;
    } else if (pressedKeys["ArrowRight"]) {
      players[0].dx = 400;
    } else {
      players[0].dx *= 0.8;
    }

    if (pressedKeys["ArrowUp"] && players[0].reload <= 0) {
      players[0].reload = playerReload;
      projectiles.push(new Projectile(players[0].x, players[0].y-25, -500, true));
    }

  }

  if (players[1].alive) {

  if (pressedKeys["a"]) {
    players[1].dx = -400;
  } else if (pressedKeys["d"]) {
    players[1].dx = 400;
  } else {
    players[1].dx *= 0.8;
  }

  if (pressedKeys["w"] && players[1].reload <= 0) {
    players[1].reload = playerReload;
    projectiles.push(new Projectile(players[1].x, players[1].y-25, -500, true));
  }

}

}

function seperation(entity1, entity2) {

    return Math.sqrt(Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2));

}

function processes(frameLength) {

    for (let player of players) {
      player.update(frameLength);
    }

    let oneOfThemHasHitTheEdge = false;
    for (let invader of invaders) {
      invader.update(frameLength);
      oneOfThemHasHitTheEdge = oneOfThemHasHitTheEdge || invader.edge;
      for (let player of players) {
        if (player.alive && seperation(invader, player) < 64) {
          invader.alive = false;
          player.alive = false;
        }
      }
    }

    if (oneOfThemHasHitTheEdge) {
      for (let invader of invaders) {
        invader.y += 32;
        invader.dx = -invader.dx;
      }
    }

    for (let projectile of projectiles) {
      projectile.update(frameLength);
      if (projectile.friendly) {
        for (let invader of invaders) {
          if (seperation(invader, projectile) < 37) {
            projectile.expired = true;
            invader.alive = false;
          }
        }
      } else {
        for (let player of players) {
          if (player.alive && seperation(player, projectile) < 37) {
            projectile.expired = true;
            player.alive = false;
          }
        }
      }
    }

    invaders = invaders.filter(i => i.alive);
    projectiles = projectiles.filter(p => !p.expired);

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

  for (let projectile of projectiles) {
      projectile.draw(context);
  }

  for (let player of players) {
    if (player.alive) {
      player.draw(context);
    }
  }

}
