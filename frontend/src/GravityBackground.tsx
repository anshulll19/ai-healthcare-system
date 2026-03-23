import React, { useEffect, useRef } from 'react';

// Gaussian random generation
const randomGaussian = (mean = 0, stdev = 1) => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
};

const GravityBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    
    let mouse = { x: -1000, y: -1000, isActive: false };
    // Virtual center of the swarm that smoothly follows the mouse
    let currentCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      currentCenter = { x: cx, y: cy };

      particles = [];
      const numParticles = 190; // Decreased particle count significantly 
      
      const colors = [
        '0, 229, 255',
        '168, 85, 247',
        '255, 255, 255',
        '34, 211, 238',
        '129, 140, 248'
      ];
      
      for (let i = 0; i < numParticles; i++) {
        // By assigning every particle a perfectly distributed fraction of 360 degrees, 
        // we put them on unique "train tracks" (radial spokes). They can never collide!
        const angle = (i / numParticles) * Math.PI * 2 + (Math.random() * 0.01);
        
        let baseRadius = Math.abs(randomGaussian(350, 150)); 
        
        const wave1 = 1 + 0.3 * Math.sin(angle * 3);
        const wave2 = 1 + 0.2 * Math.cos(angle * 5);
        const scatter = 1 + (Math.random() - 0.5) * 0.2;
        baseRadius *= (wave1 * wave2 * scatter);

        const homeRadius = baseRadius;
        
        const size = Math.random() * 2 + 1; 
        const opacity = Math.random() * 0.6 + 0.3; // Gentle glow
        const baseColorTuple = colors[Math.floor(Math.random() * colors.length)];
        const color = `rgba(${baseColorTuple}, ${opacity})`;

        particles.push({
          homeAngle: angle,
          homeRadius: homeRadius,
          pulseOffset: Math.random() * Math.PI * 2, 
          x: cx + Math.cos(angle) * homeRadius,
          y: cy + Math.sin(angle) * homeRadius,
          vx: 0,
          vy: 0,
          size,
          color,
          shadowColor: `rgba(${baseColorTuple}, 1)`
        });
      }
    };

    const draw = () => {
      // Hard clear the canvas to absolutely prevent any motion blur or shooting star trails
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const targetCenterX = mouse.isActive ? mouse.x : canvas.width / 2;
      const targetCenterY = mouse.isActive ? mouse.y : canvas.height / 2;

      // Heavy Latency: Dropped the easing coefficient significantly (0.04 -> 0.012)
      // This causes the swarm to lazily float towards the cursor with massive lag.
      currentCenter.x += (targetCenterX - currentCenter.x) * 0.012;
      currentCenter.y += (targetCenterY - currentCenter.y) * 0.012;

      // Increased Heartbeat Rate: Sped up time multiplier
      const time = Date.now() * 0.0015; 
      const globalPulse = 1 + Math.sin(time) * 0.05;

      particles.forEach((p) => {
        let dynamicRadius = p.homeRadius * globalPulse + Math.sin(time * 0.5 + p.pulseOffset) * 8;

        // Interaction (Repulsion purely along the radial spoke to prevent lateral collisions)
        if (mouse.isActive) {
          const expectedX = currentCenter.x + Math.cos(p.homeAngle) * dynamicRadius;
          const expectedY = currentCenter.y + Math.sin(p.homeAngle) * dynamicRadius;
          
          const dx = expectedX - mouse.x;
          const dy = expectedY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200 && dist > 0) {
            const pushForce = (200 - dist) / 200; 
            // Pushing the particle strictly outwards along its angle preserves 
            // the zero-collision rule because it can't cross another particle's track!
            dynamicRadius += pushForce * 120;
          }
        }

        let targetX = currentCenter.x + Math.cos(p.homeAngle) * dynamicRadius;
        let targetY = currentCenter.y + Math.sin(p.homeAngle) * dynamicRadius;

        // Spring easing towards target
        p.vx = (targetX - p.x) * 0.06;
        p.vy = (targetY - p.y) * 0.06;
        
        p.vx *= 0.85; // Friction
        p.vy *= 0.85;
        
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        // Removed lineTo distortion, particles are perfectly circular arcs
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        ctx.shadowBlur = p.size * 5;
        ctx.shadowColor = p.shadowColor;
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isActive = true;
    };
    
    const handleMouseLeave = () => {
      mouse.isActive = false;
    };
    
    const handleResize = () => {
      init();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    init();
    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};

export default GravityBackground;
