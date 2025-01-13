// Polyfill just in case
window.requestAnimationFrame = 
  window.requestAnimationFrame       ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame    ||
  window.oRequestAnimationFrame      ||
  window.msRequestAnimationFrame     ||
  function(callback){
    return setTimeout(callback, 1000 / 60);
  };

// Function for random bright color (HSL)
function getRandomBrightColor() {
  const hue = Math.floor(Math.random() * 360);
  const sat = Math.floor(60 + Math.random() * 40); // 60..100
  const lig = Math.floor(40 + Math.random() * 30); // 40..70
  return `hsl(${hue}, ${sat}%, ${lig}%)`;
}

// Brush Options
const maxThickness = 40;
const minThickness = 5;
const maxSpeed = 25; // when moving quickly, the thickness -> minThickness

// Brush class
class Brush {
  constructor() {
    this.isDrawing = false;
    this.color = '#000';

    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.lastMidX = 0;
    this.lastMidY = 0;
  }

  startStroke(x, y) {
    this.isDrawing = true;
    this.color = getRandomBrightColor(); // A new color with every "stroke"
    this.x = this.lastX = x;
    this.y = this.lastY = y;
    this.lastMidX = x;
    this.lastMidY = y;
  }

  endStroke() {
    this.isDrawing = false;
  }

  draw(ctx, x, y) {
    if (!this.isDrawing) return;

    // Calculate "speed"
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const speed = Math.min(dist, maxSpeed);

    // Linear thickness interpolation
    const thickness = maxThickness - 
      ((maxThickness - minThickness) * (speed / maxSpeed));

    // Midpoint between previous and current points
    const midX = (this.lastX + x) / 2;
    const midY = (this.lastY + y) / 2;

    // Draw a quadratic curve
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = thickness;

    ctx.beginPath();
    ctx.moveTo(this.lastMidX, this.lastMidY);
    ctx.quadraticCurveTo(this.lastX, this.lastY, midX, midY);
    ctx.stroke();

    ctx.restore();

    // Updating previous values
    this.lastMidX = midX;
    this.lastMidY = midY;
    this.lastX = x;
    this.lastY = y;
  }
}

// Initialization
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const brush = new Brush();

// Fitting canvas to window
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Mouse Events
canvas.addEventListener('mousedown', (e) => {
  brush.startStroke(e.clientX, e.clientY);
});
canvas.addEventListener('mousemove', (e) => {
  brush.draw(ctx, e.clientX, e.clientY);
});
canvas.addEventListener('mouseup', () => {
  brush.endStroke();
});
canvas.addEventListener('mouseout', () => {
  brush.endStroke();
});

// Events of the touch
canvas.addEventListener('touchstart', (e) => {
  if (!e.touches.length) return;
  const t = e.touches[0];
  brush.startStroke(t.clientX, t.clientY);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (!e.touches.length) return;
  e.preventDefault(); // disable scrolling
  const t = e.touches[0];
  brush.draw(ctx, t.clientX, t.clientY);
}, { passive: false });

canvas.addEventListener('touchend', () => {
  brush.endStroke();
});
canvas.addEventListener('touchcancel', () => {
  brush.endStroke();
});
