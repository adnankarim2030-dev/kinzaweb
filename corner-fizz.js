/**
 * Kinza Beverage - Top-Reaching Center Water Bubble Burst System
 * Requirements:
 * 1. Triggers IMMEDIATELY on website start/load.
 * 2. Repeats automatically every 10 seconds.
 * 3. Clear transparent water bubbles shoot up from bottom-center, travel all the way up to the page top, decelerate smoothly, and burst near the top.
 */

(function() {
    'use strict';

    let canvas, ctx;
    let width, height;
    let bubbles = [];
    let popEffects = [];
    let burstRings = [];
    let timerId = null;

    const LOOP_INTERVAL = 10000; // 10 seconds loop between bubble bursts

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

        bubbles = [];
        popEffects = [];
        burstRings = [];

        // 1. Trigger IMMEDIATELY when website starts!
        triggerCenterWaterBurst();

        // 2. Repeat automatically every 10 seconds
        timerId = setInterval(() => {
            triggerCenterWaterBurst();
        }, LOOP_INTERVAL);

        requestAnimationFrame(render);
    }

    function resize() {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function triggerCenterWaterBurst() {
        const bubbleCount = 35; // Crystal clear transparent water bubbles per burst
        const centerMinX = width * 0.25;
        const centerMaxX = width * 0.75;

        for (let i = 0; i < bubbleCount; i++) {
            const startX = centerMinX + Math.random() * (centerMaxX - centerMinX);
            // Tight stagger so all bubbles launch together quickly
            const startY = height + 10 + Math.random() * 120;

            // Target pop height right near the TOP of the page (40px to 120px from top)
            const targetTopY = 40 + Math.random() * 80;

            // FAST upward speed (6 to 10 px per frame) - bubbles shoot up quickly
            const initialSpeedY = 6 + Math.random() * 4;
            const lateralDrift = (Math.random() - 0.5) * 0.8;

            bubbles.push({
                x: startX,
                y: startY,
                vx: lateralDrift,
                vy: -initialSpeedY,
                baseDrag: 0.998, // Slight drag but stays fast throughout
                topDrag: 0.92 + Math.random() * 0.03, // Quicker deceleration near top before burst
                radius: 4 + Math.random() * 15,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.03 + Math.random() * 0.04, // Faster wobble to match speed
                wobbleAmp: 0.6 + Math.random() * 1.2,
                alpha: 0.80 + Math.random() * 0.20,
                targetTopY: targetTopY
            });
        }
    }

    function spawnPopEffect(x, y, radius) {
        // Spray droplets - more particles for a visible burst
        const dropletCount = 10 + Math.floor(radius * 0.8);
        for (let i = 0; i < dropletCount; i++) {
            const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() - 0.5) * 0.8;
            const speed = 1.5 + Math.random() * 3.0;
            popEffects.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.max(1.2, radius * 0.15 + Math.random() * 2),
                alpha: 1.0,
                decay: 0.015 + Math.random() * 0.015,
                gravity: 0.04
            });
        }

        // Expanding burst ring
        burstRings.push({
            x: x,
            y: y,
            radius: radius * 0.5,
            maxRadius: radius * 4.5,
            alpha: 0.9,
            lineWidth: Math.max(2, radius * 0.25),
            expandSpeed: 2.5 + radius * 0.15
        });

        // Inner flash - a brief bright circle
        popEffects.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            radius: radius * 1.2,
            alpha: 0.7,
            decay: 0.06,
            gravity: 0,
            isFlash: true
        });
    }

    function render() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // Render & update bubbles
        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];

            // Move bubble
            b.x += b.vx;
            b.y += b.vy;

            // Progressive gentle Deceleration only when right near the top target
            const distanceToTop = b.y - b.targetTopY;
            if (distanceToTop < 120) {
                b.vy *= b.topDrag;
                b.vx *= b.topDrag;
            } else {
                b.vy *= b.baseDrag;
                b.vx *= b.baseDrag;
            }

            // Sine wave lateral wobble (gentle natural floating effect)
            b.wobblePhase += b.wobbleSpeed;
            const wobbleX = Math.sin(b.wobblePhase) * b.wobbleAmp;
            b.x += wobbleX * 0.04;

            // Burst condition: when reaching near top or slowed down completely
            if (b.y <= b.targetTopY || Math.abs(b.vy) < 0.15 || b.y <= 25 || b.alpha <= 0) {
                spawnPopEffect(b.x, b.y, b.radius);
                bubbles.splice(i, 1);
                continue;
            }

            // Draw Crystal Clear Transparent Water Bubble
            ctx.save();

            const radGrad = ctx.createRadialGradient(
                b.x - b.radius * 0.35,
                b.y - b.radius * 0.35,
                b.radius * 0.05,
                b.x,
                b.y,
                b.radius
            );

            // Pure transparent water gradient
            radGrad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 0.85})`);
            radGrad.addColorStop(0.25, `rgba(255, 255, 255, ${b.alpha * 0.15})`);
            radGrad.addColorStop(0.7, `rgba(255, 255, 255, 0.02)`); // Transparent core
            radGrad.addColorStop(0.9, `rgba(255, 255, 255, ${b.alpha * 0.25})`);
            radGrad.addColorStop(1, `rgba(255, 255, 255, ${b.alpha * 0.4})`);

            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();

            // Crisp Outer Glass/Water Edge Contour
            ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.45})`;
            ctx.lineWidth = Math.max(0.75, b.radius * 0.09);
            ctx.stroke();

            // Specular Light Glare Arc (Top-Left)
            if (b.radius > 3) {
                ctx.beginPath();
                ctx.arc(
                    b.x - b.radius * 0.28,
                    b.y - b.radius * 0.28,
                    b.radius * 0.55,
                    Math.PI * 1.1,
                    Math.PI * 1.65
                );
                ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.95})`;
                ctx.lineWidth = Math.max(1, b.radius * 0.18);
                ctx.stroke();
            }

            // Bottom-Right Refraction Crescent
            if (b.radius > 5) {
                ctx.beginPath();
                ctx.arc(
                    b.x + b.radius * 0.2,
                    b.y + b.radius * 0.2,
                    b.radius * 0.65,
                    Math.PI * 0.1,
                    Math.PI * 0.55
                );
                ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.35})`;
                ctx.lineWidth = Math.max(0.8, b.radius * 0.1);
                ctx.stroke();
            }

            ctx.restore();
        }

        // Render Burst Rings (expanding circle on pop)
        for (let i = burstRings.length - 1; i >= 0; i--) {
            const ring = burstRings[i];

            ring.radius += ring.expandSpeed;
            ring.alpha -= 0.035;
            ring.lineWidth *= 0.95;

            if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
                burstRings.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${ring.alpha})`;
            ctx.lineWidth = ring.lineWidth;
            ctx.stroke();
            ctx.restore();
        }

        // Render Pop Droplets & Flashes
        for (let i = popEffects.length - 1; i >= 0; i--) {
            const pop = popEffects[i];
            pop.x += pop.vx;
            pop.y += pop.vy;
            pop.vy += (pop.gravity || 0); // gravity pulls droplets down after burst
            pop.alpha -= pop.decay;

            if (pop.alpha <= 0) {
                popEffects.splice(i, 1);
                continue;
            }

            ctx.save();

            if (pop.isFlash) {
                // Brief bright radial flash
                const flashGrad = ctx.createRadialGradient(
                    pop.x, pop.y, 0,
                    pop.x, pop.y, pop.radius
                );
                flashGrad.addColorStop(0, `rgba(255, 255, 255, ${pop.alpha * 0.9})`);
                flashGrad.addColorStop(0.5, `rgba(255, 255, 255, ${pop.alpha * 0.3})`);
                flashGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
                ctx.fillStyle = flashGrad;
                ctx.beginPath();
                ctx.arc(pop.x, pop.y, pop.radius, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Water spray droplet
                ctx.fillStyle = `rgba(255, 255, 255, ${pop.alpha * 0.85})`;
                ctx.beginPath();
                ctx.arc(pop.x, pop.y, pop.radius, 0, Math.PI * 2);
                ctx.fill();

                // Tiny highlight on droplet
                if (pop.radius > 1.5) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${pop.alpha * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(pop.x - pop.radius * 0.3, pop.y - pop.radius * 0.3, pop.radius * 0.35, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

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
