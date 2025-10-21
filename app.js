/* ========= LÓGICA DE APERTURA (4 pasos) + REVEAL ========= */
(function(){
  const merrywrap = document.getElementById("merrywrap");
  const box = merrywrap.querySelector(".giftbox");
  let step = 1;
  const stepMs = [900, 900, 700, 600]; // tiempos entre pasos

  function setStep(n){
    merrywrap.className = "merrywrap step-" + n;
  }

  function openBox(){
    if(step===1){
      // Evita dobles clics en el primer paso
      box.removeEventListener("click", openBox, false);
    }
    setStep(step);
    if(step===4){ reveal(); return; }
    setTimeout(openBox, stepMs[step-1]);
    step++;
  }

  // Click para abrir
  box.addEventListener("click", openBox, false);

  // Accesibilidad: Enter / Espacio
  window.addEventListener('keydown', (e)=>{
    if((e.key === 'Enter' || e.key === ' ') && step===1){ openBox(); }
  });

  /* ========= CONFETI ========= */
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;

  window.addEventListener('resize', ()=>{
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  });

  const TAU = Math.PI * 2;
  const COLORS = ["#ff5c8a","#ffd166","#06d6a0","#118ab2","#8338ec","#ff9f1c","#2ec4b6","#ff477e"];
  let particles = [];
  let running = false;

  class Confetti {
    constructor(x, y, angle, power){
      this.x = x; this.y = y;
      const speed = power * (0.8 + Math.random()*0.4);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = 6 + Math.random()*6;
      this.color = COLORS[(Math.random()*COLORS.length)|0];
      this.life = 80 + Math.random()*60;
      this.rotation = Math.random()*TAU;
      this.spin = (Math.random()*0.2 - 0.1);
      this.gravity = 0.22 + Math.random()*0.08;
      this.drag = 0.995;
      this.shape = Math.random()<0.5 ? 'rect' : 'circle';
    }
    step(){
      this.vx *= this.drag;
      this.vy = this.vy * this.drag + this.gravity;
      this.x += this.vx; this.y += this.vy;
      this.rotation += this.spin;
      this.life--;
      return this.life > 0 && this.y < H + 40;
    }
    draw(ctx){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      if(this.shape==='rect'){
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size*0.6);
      }else{
        ctx.beginPath();
        ctx.arc(0,0,this.size*0.45,0,TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function burst(x, y, rings=3){
    for(let r=0;r<rings;r++){
      const parts = 26 + r*12;
      const power = 5 + r*1.8;
      for(let i=0;i<parts;i++){
        const angle = (i/parts)*TAU + (Math.random()*0.15);
        particles.push(new Confetti(x, y, angle, power));
      }
    }
  }

  function tick(){
    if(!running) return;
    ctx.clearRect(0,0,W,H);
    particles = particles.filter(p => {
      const alive = p.step();
      if(alive) p.draw(ctx);
      return alive;
    });
    requestAnimationFrame(tick);
  }

  function startConfetti(){
    if(running) return;
    running = true;

    // Estallidos iniciales cerca del regalo
    const rect = box.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    burst(cx, cy, 3);
    setTimeout(()=>burst(cx-120, cy-60, 2), 250);
    setTimeout(()=>burst(cx+120, cy-40, 2), 450);
    setTimeout(()=>burst(W*0.5, H*0.28, 2), 650);

    tick();

    // Llovizna ligera
    let rain = 0;
    const rainTimer = setInterval(()=>{
      if(!running || rain>12){ clearInterval(rainTimer); return; }
      burst(Math.random()*W, -20, 1);
      rain++;
    }, 220);

    // Detener automático después de ~10s
    setTimeout(()=>{ running=false; }, 10000);
  }

  /* ========= REVEAL ========= */
  function reveal(){
    // Mostrar escena/UI y desvanecer regalo
    document.body.classList.remove('pre-reveal');
    document.body.classList.add('revealed');

    // Clonar el mensaje "Feliz cumpleaños Pau." al centro para que permanezca
    const originalIcons = document.querySelector('.icons');
    if (originalIcons){
      const clone = originalIcons.cloneNode(true);
      clone.classList.add('center-greeting');
      document.body.appendChild(clone);
    }

    // Fade out del contenedor del regalo
    merrywrap.style.backgroundColor = 'transparent';
    merrywrap.classList.add('out');

    // Confeti
    startConfetti();

    // Mostrar Live card
    const liveCard = document.getElementById('liveCard');
    setTimeout(()=> liveCard.classList.add('show'), 400);

    // Mostrar toast (se queda visible)
    const chatToast = document.getElementById('chatToast');
    setTimeout(()=> chatToast.classList.add('show'), 900);
  }
})();
