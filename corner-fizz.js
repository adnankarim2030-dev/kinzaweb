/**
 * Kinza Beverage - Elegant & Normal Soda Carbonation Bubble Engine
 * Features:
 * 1. Balanced Ambient Soda Fizz: 25 subtle, elegant carbonated bubbles float up smoothly.
 * 2. Periodic Water Burst: Animates every 10 seconds with a clean center burst.
 */

(function() {
    'use strict';

    let canvas, ctx;
    let width, height;
    let ambientBubbles = [];
    let burstBubbles = [];
    let popEffects = [];
    let burstRings = [];
    let burstTimerId = null;

    const MAX_AMBIENT_BUBBLES = 25; // Normal, clean, uncluttered density
    const BURST_INTERVAL = 10000;   // Exactly every 10 seconds loop

    function init() {
        if (document.getElementById('corner-fizz-canvas')) return;

        canvas = document.createElement('canvas');
        canvas.id = 'corner-fizz-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '99999';
        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);

        // Seed initial ambient bubbles distributed vertically
        for (let i = 0; i < MAX_AMBIENT_BUBBLES; i++) {
            const b = createAmbientBubble(true);
            ambientBubbles.push(b);
        }

        // Trigger first burst immediately
        triggerBurst();

        // Repeat automatically every 10 seconds
        burstTimerId = setInterval(triggerBurst, BURST_INTERVAL);

        requestAnimationFrame(render);
    }

    function resize() {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createAmbientBubble(randomY = false) {
        const radius = 3 + Math.random() * 11;
        const speed = 1.2 + Math.random() * 2.2;
        return {
            x: Math.random() * width,
            y: randomY ? Math.random() * height : height + 15 + Math.random() * 40,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -speed,
            radius: radius,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.03,
            wobbleAmp: 0.4 + Math.random() * 0.8,
            alpha: 0.4 + Math.random() * 0.35,
            targetTopY: 25 + Math.random() * 100
        };
    }

    function triggerBurst() {
        const count = 18 + Math.floor(Math.random() * 8);
        const centerMinX = width * 0.25;
        const centerMaxX = width * 0.75;

        for (let i = 0; i < count; i++) {
            const startX = centerMinX + Math.random() * (centerMaxX - centerMinX);
            const startY = height + 15 + Math.random() * 90;
            const targetTopY = 35 + Math.random() * 90;
            const initialSpeedY = 6.0 + Math.random() * 3.5;
            const lateralDrift = (Math.random() - 0.5) * 0.8;

            burstBubbles.push({
                x: startX,
                y: startY,
                vx: lateralDrift,
                vy: -initialSpeedY,
                baseDrag: 0.998,
                topDrag: 0.93 + Math.random() * 0.03,
                radius: 4 + Math.random() * 14,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.03 + Math.random() * 0.04,
                wobbleAmp: 0.6 + Math.random() * 1.0,
                alpha: 0.55 + Math.random() * 0.3,
                targetTopY: targetTopY
            });
        }
    }

    function spawnPopEffect(x, y, radius) {
        const dropletCount = 6 + Math.floor(radius * 0.6);
        for (let i = 0; i < dropletCount; i++) {
            const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() - 0.5) * 0.8;
            const speed = 1.4 + Math.random() * 2.5;
            popEffects.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.max(1.2, radius * 0.15 + Math.random() * 1.8),
                alpha: 0.85,
                decay: 0.025 + Math.random() * 0.025,
                gravity: 0.04
            });
        }

        burstRings.push({
            x: x,
            y: y,
            radius: radius * 0.4,
            maxRadius: radius * 3.8,
            alpha: 0.75,
            lineWidth: Math.max(1.4, radius * 0.18),
            expandSpeed: 2.0 + radius * 0.12
        });
    }

    function drawBubble(b) {
        ctx.save();

        // Subtle glow shadow for contrast on white
        ctx.shadowColor = `rgba(14, 165, 233, ${b.alpha * 0.35})`;
        ctx.shadowBlur = Math.max(3, b.radius * 0.4);

        // 3D Soda Water Radial Gradient
        const radGrad = ctx.createRadialGradient(
            b.x - b.radius * 0.35,
            b.y - b.radius * 0.35,
            b.radius * 0.05,
            b.x,
            b.y,
            b.radius
        );

        radGrad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 0.85})`);
        radGrad.addColorStop(0.25, `rgba(224, 242, 254, ${b.alpha * 0.3})`);
        radGrad.addColorStop(0.7, `rgba(56, 189, 248, ${b.alpha * 0.08})`);
        radGrad.addColorStop(0.9, `rgba(14, 165, 233, ${b.alpha * 0.2})`);
        radGrad.addColorStop(1, `rgba(2, 132, 199, ${b.alpha * 0.4})`);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Refraction Contour (Visible & Clean)
        ctx.strokeStyle = `rgba(14, 116, 144, ${b.alpha * 0.4})`;
        ctx.lineWidth = Math.max(0.8, b.radius * 0.08);
        ctx.stroke();

        // Specular Glare Arc (Top-Left Highlight)
        if (b.radius > 3) {
            ctx.beginPath();
            ctx.arc(
                b.x - b.radius * 0.28,
                b.y - b.radius * 0.28,
                b.radius * 0.55,
                Math.PI * 1.1,
                Math.PI * 1.65
            );
            ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.9})`;
            ctx.lineWidth = Math.max(1, b.radius * 0.16);
            ctx.stroke();
        }

        ctx.restore();
    }

    function render() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // 1. Render Ambient Bubbles
        for (let i = 0; i < ambientBubbles.length; i++) {
            const b = ambientBubbles[i];
            b.x += b.vx;
            b.y += b.vy;

            b.wobblePhase += b.wobbleSpeed;
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.05;

            if (b.y <= b.targetTopY || b.y <= -25) {
                if (Math.random() < 0.25) {
                    spawnPopEffect(b.x, b.y, b.radius);
                }
                ambientBubbles[i] = createAmbientBubble(false);
            } else {
                drawBubble(b);
            }
        }

        // 2. Render Burst Bubbles
        for (let i = burstBubbles.length - 1; i >= 0; i--) {
            const b = burstBubbles[i];
            b.x += b.vx;
            b.y += b.vy;

            const distanceToTop = b.y - b.targetTopY;
            if (distanceToTop < 120) {
                b.vy *= b.topDrag;
                b.vx *= b.topDrag;
            } else {
                b.vy *= b.baseDrag;
                b.vx *= b.baseDrag;
            }

            b.wobblePhase += b.wobbleSpeed;
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.05;

            if (b.y <= b.targetTopY || Math.abs(b.vy) < 0.15 || b.y <= 25) {
                spawnPopEffect(b.x, b.y, b.radius);
                burstBubbles.splice(i, 1);
            } else {
                drawBubble(b);
            }
        }

        // 3. Render Burst Rings
        for (let i = burstRings.length - 1; i >= 0; i--) {
            const ring = burstRings[i];
            ring.radius += ring.expandSpeed;
            ring.alpha -= 0.035;
            ring.lineWidth *= 0.94;

            if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
                burstRings.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${ring.alpha * 0.6})`;
            ctx.lineWidth = ring.lineWidth;
            ctx.stroke();
            ctx.restore();
        }

        // 4. Render Pop Droplets
        for (let i = popEffects.length - 1; i >= 0; i--) {
            const pop = popEffects[i];
            pop.x += pop.vx;
            pop.y += pop.vy;
            pop.vy += (pop.gravity || 0);
            pop.alpha -= pop.decay;

            if (pop.alpha <= 0) {
                popEffects.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.fillStyle = `rgba(56, 189, 248, ${pop.alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(pop.x, pop.y, pop.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(render);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
