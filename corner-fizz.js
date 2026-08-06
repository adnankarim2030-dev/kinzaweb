/**
 * Kinza Beverage - High-Visibility Fizzy Soda & Water Bubble Engine
 * Optimized for both Light (White) & Dark Backgrounds
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

    const MAX_AMBIENT_BUBBLES = 80; // High density ambient soda fizz
    const BURST_INTERVAL = 6000;    // Energetic burst every 6s

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
        const radius = 3.5 + Math.random() * 14;
        const speed = 1.4 + Math.random() * 3.0;
        return {
            x: Math.random() * width,
            y: randomY ? Math.random() * height : height + 15 + Math.random() * 40,
            vx: (Math.random() - 0.5) * 0.7,
            vy: -speed,
            radius: radius,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.025 + Math.random() * 0.035,
            wobbleAmp: 0.5 + Math.random() * 1.0,
            alpha: 0.65 + Math.random() * 0.35,
            targetTopY: 20 + Math.random() * 120
        };
    }

    function triggerBurst() {
        const count = 35 + Math.floor(Math.random() * 15);
        const centerMinX = width * 0.15;
        const centerMaxX = width * 0.85;

        for (let i = 0; i < count; i++) {
            const startX = centerMinX + Math.random() * (centerMaxX - centerMinX);
            const startY = height + 15 + Math.random() * 120;
            const targetTopY = 30 + Math.random() * 100;
            const initialSpeedY = 7.0 + Math.random() * 4.5;
            const lateralDrift = (Math.random() - 0.5) * 1.0;

            burstBubbles.push({
                x: startX,
                y: startY,
                vx: lateralDrift,
                vy: -initialSpeedY,
                baseDrag: 0.998,
                topDrag: 0.92 + Math.random() * 0.03,
                radius: 5 + Math.random() * 18,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.035 + Math.random() * 0.045,
                wobbleAmp: 0.7 + Math.random() * 1.3,
                alpha: 0.8 + Math.random() * 0.2,
                targetTopY: targetTopY
            });
        }
    }

    function spawnPopEffect(x, y, radius) {
        const dropletCount = 10 + Math.floor(radius * 0.8);
        for (let i = 0; i < dropletCount; i++) {
            const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() - 0.5) * 0.8;
            const speed = 1.8 + Math.random() * 3.2;
            popEffects.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.max(1.5, radius * 0.18 + Math.random() * 2.2),
                alpha: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                gravity: 0.05
            });
        }

        burstRings.push({
            x: x,
            y: y,
            radius: radius * 0.4,
            maxRadius: radius * 4.2,
            alpha: 0.9,
            lineWidth: Math.max(1.8, radius * 0.22),
            expandSpeed: 2.4 + radius * 0.14
        });

        popEffects.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            radius: radius * 1.3,
            alpha: 0.75,
            decay: 0.06,
            gravity: 0,
            isFlash: true
        });
    }

    function drawBubble(b) {
        ctx.save();

        // Soft cyan-blue glow shadow so bubble pops out on pure white backgrounds
        ctx.shadowColor = `rgba(14, 165, 233, ${b.alpha * 0.45})`;
        ctx.shadowBlur = Math.max(4, b.radius * 0.5);

        // Radial Gradient for 3D Water & Soda Volume
        const radGrad = ctx.createRadialGradient(
            b.x - b.radius * 0.35,
            b.y - b.radius * 0.35,
            b.radius * 0.05,
            b.x,
            b.y,
            b.radius
        );

        radGrad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 0.95})`);
        radGrad.addColorStop(0.2, `rgba(224, 242, 254, ${b.alpha * 0.4})`);
        radGrad.addColorStop(0.65, `rgba(56, 189, 248, ${b.alpha * 0.12})`);
        radGrad.addColorStop(0.85, `rgba(14, 165, 233, ${b.alpha * 0.3})`);
        radGrad.addColorStop(1, `rgba(2, 132, 199, ${b.alpha * 0.55})`);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Reset shadow for crisp stroke drawing
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Outer Dark Cyan/Blue Refraction Contour (Visible on White!)
        ctx.strokeStyle = `rgba(14, 116, 144, ${b.alpha * 0.55})`;
        ctx.lineWidth = Math.max(1, b.radius * 0.09);
        ctx.stroke();

        // Inner White Specular Glare Arc (Top-Left 3D Highlight)
        if (b.radius > 2.5) {
            ctx.beginPath();
            ctx.arc(
                b.x - b.radius * 0.28,
                b.y - b.radius * 0.28,
                b.radius * 0.55,
                Math.PI * 1.1,
                Math.PI * 1.65
            );
            ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.98})`;
            ctx.lineWidth = Math.max(1.2, b.radius * 0.2);
            ctx.stroke();
        }

        // Bottom-Right Crescent Refraction
        if (b.radius > 5) {
            ctx.beginPath();
            ctx.arc(
                b.x + b.radius * 0.2,
                b.y + b.radius * 0.2,
                b.radius * 0.62,
                Math.PI * 0.1,
                Math.PI * 0.55
            );
            ctx.strokeStyle = `rgba(56, 189, 248, ${b.alpha * 0.5})`;
            ctx.lineWidth = Math.max(0.9, b.radius * 0.11);
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
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.06;

            // Reset if out of top or bounds
            if (b.y <= b.targetTopY || b.y <= -25) {
                if (Math.random() < 0.35) {
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
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.06;

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
            ctx.strokeStyle = `rgba(56, 189, 248, ${ring.alpha * 0.8})`;
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
                flashGrad.addColorStop(0, `rgba(255, 255, 255, ${pop.alpha * 0.95})`);
                flashGrad.addColorStop(0.5, `rgba(56, 189, 248, ${pop.alpha * 0.4})`);
                flashGrad.addColorStop(1, `rgba(14, 165, 233, 0)`);
                ctx.fillStyle = flashGrad;
                ctx.beginPath();
                ctx.arc(pop.x, pop.y, pop.radius, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = `rgba(56, 189, 248, ${pop.alpha * 0.85})`;
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
