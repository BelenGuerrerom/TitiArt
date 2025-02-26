let walls = [];
let particle;
let wallCount = 100;
let rayCount = 1;
let eyeSize = 100;
let irisColor;
let eyeShapes = [1.2, 1.5, 1.0];
let currentShapeIndex = 0;
let showWalls = true;
let backgroundColor = 0;
let letters = [];
let cursorInsideEye = false;
let formedWord = "";
let angleOffset = 0;
let enterButton;
let showText = true;
let displayMessage = "Haz click";

function setup() {
  createCanvas(windowWidth, windowHeight);
  let centerX = width / 2;
  let centerY = height / 2;
  irisColor = color(100, 50, 200);

  for (let i = 0; i < wallCount; i++) {
    let angle1 = (TWO_PI / wallCount) * i;
    let angle2 = (TWO_PI / wallCount) * ((i + 1) % wallCount);

    let x1 = centerX + sin(angle1) * 3000;
    let y1 = centerY + cos(angle1) * 1000;
    let x2 = centerX + sin(angle2) * 80;
    let y2 = centerY + cos(angle2) * 80;

    walls[i] = new Boundary(x1, y1, x2, y2);
  }

  walls.push(new Boundary(-1, -1, width, -1));
  walls.push(new Boundary(width, -1, width, height));
  walls.push(new Boundary(width, height, -1, height));
  walls.push(new Boundary(-1, height, -1, -1));

  particle = new Particle();
  noCursor();

  // Crear botón "Enter"
enterButton = createButton('HOME');
  enterButton.style('font-size', '40px'); // Tamaño más grande
  enterButton.style('padding', '20px 40px'); // Botón más grande
  enterButton.style('border', '3px solid');
  enterButton.style('background', 'transparent');
  enterButton.style('cursor', 'pointer');
   // Posicionar el botón arriba a la derecha **dentro del canvas**
  enterButton.position(width - width*0.15625, height*0.037);
  enterButton.mousePressed(onEnterPressed);

  
}

function draw() {
  background(backgroundColor);

  if (showWalls) {
    for (let wall of walls) {
      wall.show();
    }
  }

  drawEye(width / 2, height / 2, eyeSize, irisColor);
  updateAndDrawLetters();

  if (!cursorInsideEye) {
    particle.update(mouseX, mouseY);
    particle.show();
    particle.look(walls);
  }

  if (cursorInsideEye) {
    angleOffset += 0.02;
  }
  // Actualizar el color del botón al del ojo
  enterButton.style('color', irisColor.toString());
  enterButton.style('border-color', irisColor.toString());

  
  if (showText) {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
   text(displayMessage, width / 2, height - 50);
  }
}
function mousePressed() {

  displayMessage = "Escribe algo"; // Cambia la frase al hacer clic
  irisColor = color(random(255), random(255), random(255)); // Cambia el color del iris
  currentShapeIndex = (currentShapeIndex + 1) % eyeShapes.length; // Cambia la forma del ojo
}

function drawEye(x, y, size, irisColor) {
  fill(255);
  ellipse(x, y, size * 2);
  fill(irisColor);
  ellipse(x, y, size * eyeShapes[currentShapeIndex]);
  fill(0);
  ellipse(x, y, size * 0.5);
}

function updateAndDrawLetters() {
  let centerX = width / 2;
  let centerY = height / 2;

  if (cursorInsideEye) {
    let radius = 200;

    for (let i = 0; i < letters.length; i++) {
      let angle = angleOffset + (TWO_PI / max(letters.length, 1)) * i;
      let targetX = centerX + cos(angle) * radius;
      let targetY = centerY + sin(angle) * radius;

      letters[i].update(targetX, targetY, angle);
    }
  } else {
    for (let letter of letters) {
      letter.vx += random(-0.1, 0.1);
      letter.vy += random(-0.1, 0.1);
      letter.x += letter.vx;
      letter.y += letter.vy;
    }
  }

  for (let letter of letters) {
    letter.show();
  }
}



function mouseMoved() {
  let d = dist(mouseX, mouseY, width / 2, height / 2);
  cursorInsideEye = d <= eyeSize;
  showWalls = !cursorInsideEye;
  backgroundColor = cursorInsideEye ? irisColor : 0;
  eyeSize = map(d, 0, width / 2, 150, 80);
}

function keyPressed() {
 if (formedWord.length === 0) {
    showText = false; // Se oculta la frase PERMANENTEMENTE después de la primera escritura
  }
  if (keyCode === BACKSPACE) {
    if (formedWord.length > 0) {
      formedWord = formedWord.slice(0, -1);
      letters.pop();
    }
  } else if (key.length === 1) {
    let newLetter = new FloatingLetter(key, random(width), random(height), irisColor);
    letters.push(newLetter);
    formedWord += key;
  }
}

function onEnterPressed() {
  window.open("https://labavalencia.net/?gad_source=1&gclid=CjwKCAiAlPu9BhAjEiwA5NDSA46a_Qf3Sz7-LomakZ_-dQVilLLFucVQ2pb8e-ilOdY8w-4494c0MhoCJUMQAvD_BwE", "_blank");
}
  

class FloatingLetter {
  constructor(letter, x, y, color) {
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.color = color;
    this.angle = 0;
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
  }

  update(targetX, targetY, angle) {
    this.x = lerp(this.x, targetX, 0.1);
    this.y = lerp(this.y, targetY, 0.1);
    this.angle = angle;
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle + HALF_PI);
    fill(this.color);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(this.letter, 0, 0);
    pop();
  }
}

class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(irisColor);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let a = 0; a < 360; a += rayCount) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        stroke(irisColor);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 4);
    for (let ray of this.rays) {
      ray.show();
    }
  }
}

class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  show() {
    stroke(irisColor);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      return createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }
  }
}
