/**
 * Kinza Beverage - Continuous Fizzy Soda & Water Bubble Engine
 * Features:
 * 1. Continuous Ambient Soda Fizz: Crystal-clear carbonation bubbles float up steadily across the screen at all times.
 * 2. Periodic Energetic Water Bursts: Fast rising bubble clusters shoot up from bottom to top every 7 seconds and pop with splash droplets.
 * 3. Immediate Startup & High Performance: Canvas scales smoothly on resize, low overhead.
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

    const MAX_AMBIENT_BUBBLES = 75; // Continuous ambient soda fizz density
    const BURST_INTERVAL = 7000;    // Periodic energetic burst every 7s

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

        // Seed initial ambient bubbles distributed vertically so screen is immediately fizzy
        for (let i = 0; i < MAX_AMBIENT_BUBBLES; i++) {
            const b = createAmbientBubble(true);
            ambientBubbles.push(b);
        }

        // Trigger first big burst immediately
        triggerBurst();

        // Schedule periodic bursts
        burstTimerId = setInterval(triggerBurst, BURST_INTERVAL);

        requestAnimationFrame(render);
    }

    function resize() {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createAmbientBubble(randomY = false) {
        const radius = 2.5 + Math.random() * 12;
        const speed = 1.2 + Math.random() * 2.8;
        return {
            x: Math.random() * width,
            y: randomY ? Math.random() * height : height + 10 + Math.random() * 40,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -speed,
            radius: radius,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.03,
            wobbleAmp: 0.4 + Math.random() * 0.8,
            alpha: 0.4 + Math.random() * 0.45,
            targetTopY: 30 + Math.random() * 120
        };
    }

    function triggerBurst() {
        const count = 30 + Math.floor(Math.random() * 15);
        const centerMinX = width * 0.2;
        const centerMaxX = width * 0.8;

        for (let i = 0; i < count; i++) {
            const startX = centerMinX + Math.random() * (centerMaxX - centerMinX);
            const startY = height + 10 + Math.random() * 100;
            const targetTopY = 40 + Math.random() * 90;
            const initialSpeedY = 6.5 + Math.random() * 4.5;
            const lateralDrift = (Math.random() - 0.5) * 0.9;

            burstBubbles.push({
                x: startX,
                y: startY,
                vx: lateralDrift,
                vy: -initialSpeedY,
                baseDrag: 0.998,
                topDrag: 0.93 + Math.random() * 0.03,
                radius: 4 + Math.random() * 16,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.03 + Math.random() * 0.04,
                wobbleAmp: 0.6 + Math.random() * 1.2,
                alpha: 0.75 + Math.random() * 0.25,
                targetTopY: targetTopY
            });
        }
    }

    function spawnPopEffect(x, y, radius) {
        const dropletCount = 8 + Math.floor(radius * 0.7);
        for (let i = 0; i < dropletCount; i++) {
            const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() - 0.5) * 0.8;
            const speed = 1.5 + Math.random() * 2.8;
            popEffects.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.max(1.2, radius * 0.15 + Math.random() * 2),
                alpha: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                gravity: 0.04
            });
        }

        burstRings.push({
            x: x,
            y: y,
            radius: radius * 0.4,
            maxRadius: radius * 4.0,
            alpha: 0.85,
            lineWidth: Math.max(1.5, radius * 0.2),
            expandSpeed: 2.2 + radius * 0.12
        });

        popEffects.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            radius: radius * 1.2,
            alpha: 0.65,
            decay: 0.07,
            gravity: 0,
            isFlash: true
        });
    }

    function drawBubble(b) {
        ctx.save();

        const radGrad = ctx.createRadialGradient(
            b.x - b.radius * 0.35,
            b.y - b.radius * 0.35,
            b.radius * 0.05,
            b.x,
            b.y,
            b.radius
        );

        radGrad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 0.9})`);
        radGrad.addColorStop(0.25, `rgba(255, 255, 255, ${b.alpha * 0.2})`);
        radGrad.addColorStop(0.7, `rgba(255, 255, 255, 0.03)`);
        radGrad.addColorStop(0.9, `rgba(255, 255, 255, ${b.alpha * 0.3})`);
        radGrad.addColorStop(1, `rgba(255, 255, 255, ${b.alpha * 0.5})`);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Edge contour
        ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.5})`;
        ctx.lineWidth = Math.max(0.75, b.radius * 0.08);
        ctx.stroke();

        // Specular glare arc (top-left)
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

        ctx.restore();
    }

    function render() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // 1. Update & Render Ambient Continuous Fizz Bubbles
        for (let i = 0; i < ambientBubbles.length; i++) {
            const b = ambientBubbles[i];
            b.x += b.vx;
            b.y += b.vy;

            b.wobblePhase += b.wobbleSpeed;
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.05;

            // Reset if out of top or bounds
            if (b.y <= b.targetTopY || b.y <= -20) {
                if (Math.random() < 0.3) {
                    spawnPopEffect(b.x, b.y, b.radius);
                }
                ambientBubbles[i] = createAmbientBubble(false);
            } else {
                drawBubble(b);
            }
        }

        // 2. Update & Render Fast Burst Bubbles
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
            ring.alpha -= 0.04;
            ring.lineWidth *= 0.94;

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

        // 4. Render Pop Droplets & Flashes
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
            if (pop.isFlash) {
                const flashGrad = ctx.createRadialGradient(
                    pop.x, pop.y, 0,
                    pop.x, pop.y, pop.radius
                );
                flashGrad.addColorStop(0, `rgba(255, 255, 255, ${pop.alpha * 0.85})`);
                flashGrad.addColorStop(0.5, `rgba(255, 255, 255, ${pop.alpha * 0.25})`);
                flashGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
                ctx.fillStyle = flashGrad;
                ctx.beginPath();
                ctx.arc(pop.x, pop.y, pop.radius, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${pop.alpha * 0.85})`;
                ctx.beginPath();
                ctx.arc(pop.x, pop.y, pop.radius, 0, Math.PI * 2);
                ctx.fill();
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
