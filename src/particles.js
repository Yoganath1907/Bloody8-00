// particles.js — Rain, Blood, and Spark Particle System

class Particle {
  constructor(x, y, vx, vy, life, color, size, type) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.life = life; this.maxLife = life;
    this.color = color; this.size = size;
    this.type = type; // 'rain' | 'blood' | 'spark' | 'dust'
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15; // gravity
    this.life--;
    return this.life > 0 && this.y < 620;
  }
  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    if (this.type === 'rain') {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.vx * 2, this.y + this.vy * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.stroke();
    } else if (this.type === 'spark') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.emitters = {};  // active emitters
    this.canvas = null;
    this.ctx = null;
  }

  init(container) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:6;';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this._loop();
  }

  _loop() {
    this.ctx.clearRect(0, 0, 800, 600);
    // Emit from active emitters
    for (const [key, emitter] of Object.entries(this.emitters)) {
      emitter.tick(this);
    }
    this.particles = this.particles.filter(p => {
      const alive = p.update();
      if (alive) p.draw(this.ctx);
      return alive;
    });
    requestAnimationFrame(() => this._loop());
  }

  addParticle(p) {
    this.particles.push(p);
  }

  startRain() {
    if (this.emitters.rain) return;
    this.emitters.rain = {
      tick: (sys) => {
        for (let i = 0; i < 4; i++) {
          const x = Math.random() * 820 - 10;
          const speed = 6 + Math.random() * 4;
          sys.addParticle(new Particle(
            x, -5,
            -1, speed,
            Math.floor(12 + Math.random() * 10),
            `rgba(${100 + Math.random()*50|0},${160 + Math.random()*40|0},255,0.5)`,
            0.8, 'rain'
          ));
        }
      }
    };
  }

  stopRain() {
    delete this.emitters.rain;
  }

  burst(x, y, type, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      if (type === 'blood') {
        this.addParticle(new Particle(
          x + (Math.random() - 0.5) * 30,
          y + (Math.random() - 0.5) * 20,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed - 1,
          40 + Math.random() * 40 | 0,
          `rgba(${140 + Math.random()*50|0},${Math.random()*15|0},${Math.random()*10|0},0.85)`,
          2 + Math.random() * 4,
          'blood'
        ));
      } else if (type === 'spark') {
        this.addParticle(new Particle(
          x, y,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6 - 2,
          20 + Math.random() * 25 | 0,
          `hsl(${40 + Math.random()*40},100%,${60 + Math.random()*30}%)`,
          2 + Math.random() * 3,
          'spark'
        ));
      } else if (type === 'dust') {
        this.addParticle(new Particle(
          x + (Math.random() - 0.5) * 60,
          y,
          (Math.random() - 0.5) * 0.5,
          -0.2 - Math.random() * 0.5,
          80 + Math.random() * 80 | 0,
          `rgba(200,190,170,0.3)`,
          1 + Math.random() * 2,
          'dust'
        ));
      }
    }
  }

  flashLightning() {
    // Big white flash burst at top
    for (let i = 0; i < 15; i++) {
      this.addParticle(new Particle(
        Math.random() * 800,
        Math.random() * 200,
        (Math.random() - 0.5) * 3,
        1 + Math.random() * 2,
        15,
        `rgba(200,220,255,0.9)`,
        3 + Math.random() * 5,
        'spark'
      ));
    }
  }

  clear() {
    this.particles = [];
  }
}
