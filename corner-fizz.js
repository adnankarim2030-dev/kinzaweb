/**
 * Kinza Beverage - Ultra-Subtle Ambient Carbonation Fizz Engine (v9.0)
 * Refined for luxury, distraction-free aesthetic:
 * 1. Low Z-Index (z-index: 0) - floats behind cards & text, never covering readable content.
 * 2. Delicate Micro-Bubbles (2px - 6.5px).
 * 3. Minimal bubble count (Mobile: 6-10 bubbles, Desktop: 12-18 bubbles).
 * 4. Soft translucent opacity (0.2 - 0.4).
 * 5. Calm 22-second ambient cycle.
 */

(function() {
    'use strict';

    let canvas, ctx;
    let width, height;
    let bubbles = [];
    let popEffects = [];
    let burstRings = [];
    let waveTimerId = null;

    const WAVE_INTERVAL = 22000; // 22 seconds ambient cycle (calm, non-distracting)

    function init() {
        if (!document.body) {
            window.addEventListener('DOMContentLoaded', init);
            return;
        }

        if (document.getElementById('corner-fizz-canvas')) return;

        canvas = document.createElement('canvas');
        canvas.id = 'corner-fizz-canvas';
        // z-index: 0 ensures it stays in the ambient background behind cards & text
        canvas.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.6;';
        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);

        // Initial soft wave
        triggerGasWave();

        // Calm, spaced repetition
        waveTimerId = setInterval(triggerGasWave, WAVE_INTERVAL);

        requestAnimationFrame(render);
    }

    function resize() {
        if (!canvas) return;
        width = canvas.width = window.innerWidth || document.documentElement.clientWidth || 1024;
        height = canvas.height = window.innerHeight || document.documentElement.clientHeight || 768;
    }

    function triggerGasWave() {
        const isMobile = width < 768;
        // Ultra-subtle count: only 6-10 on mobile, 12-18 on desktop
        const count = isMobile ? (6 + Math.floor(Math.random() * 4)) : (12 + Math.floor(Math.random() * 6));

        for (let i = 0; i < count; i++) {
            const startX = Math.random() * width;
            const startY = height + 10 + Math.random() * 120;
            const targetTopY = 30 + Math.random() * 120;
            const speedY = 1.3 + Math.random() * 1.6; // gentle, relaxing rise
            const lateralDrift = (Math.random() - 0.5) * 0.4;

            // Small, delicate micro-bubble size (2px to 6.5px)
            const radius = isMobile ? (2 + Math.random() * 3.5) : (2.5 + Math.random() * 4);

            bubbles.push({
                x: startX,
                y: startY,
                vx: lateralDrift,
                vy: -speedY,
                radius: radius,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.03,
                wobbleAmp: 0.3 + Math.random() * 0.6,
                alpha: 0.22 + Math.random() * 0.2, // soft, translucent
                targetTopY: targetTopY
            });
        }
    }

    function spawnPopEffect(x, y, radius) {
        // Minimal, subtle burst (only 2-3 tiny droplets)
        const dropletCount = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < dropletCount; i++) {
            const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() - 0.5) * 0.5;
            const speed = 0.8 + Math.random() * 1.2;
            popEffects.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.max(0.8, radius * 0.2),
                alpha: 0.45,
                decay: 0.04 + Math.random() * 0.02,
                gravity: 0.03
            });
        }

        burstRings.push({
            x: x,
            y: y,
            radius: radius * 0.4,
            maxRadius: radius * 2.4,
            alpha: 0.35,
            lineWidth: Math.max(0.75, radius * 0.12),
            expandSpeed: 1.2 + radius * 0.08
        });
    }

    function drawGasBubble(b) {
        ctx.save();
        ctx.globalAlpha = b.alpha;

        // 1. Transparent Soft Gas Radial Gradient
        const radGrad = ctx.createRadialGradient(
            b.x - b.radius * 0.3,
            b.y - b.radius * 0.3,
            b.radius * 0.05,
            b.x,
            b.y,
            b.radius
        );

        radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        radGrad.addColorStop(0.35, 'rgba(224, 242, 254, 0.25)');
        radGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.08)');
        radGrad.addColorStop(1, 'rgba(14, 165, 233, 0.25)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Fine Transparent Contour Edge
        ctx.strokeStyle = 'rgba(14, 116, 144, 0.3)';
        ctx.lineWidth = Math.max(0.6, b.radius * 0.08);
        ctx.stroke();

        // 3. Specular Glare Arc
        if (b.radius > 2.5) {
            ctx.beginPath();
            ctx.arc(
                b.x - b.radius * 0.28,
                b.y - b.radius * 0.28,
                b.radius * 0.5,
                Math.PI * 1.1,
                Math.PI * 1.65
            );
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = Math.max(0.6, b.radius * 0.14);
            ctx.stroke();
        }

        ctx.restore();
    }

    function render() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // 1. Render Gas Wave Bubbles
        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            b.x += b.vx;
            b.y += b.vy;

            b.wobblePhase += b.wobbleSpeed;
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.03;

            // When bubble reaches top region, softly pop
            if (b.y <= b.targetTopY || b.y <= 15) {
                spawnPopEffect(b.x, b.y, b.radius);
                bubbles.splice(i, 1);
            } else {
                drawGasBubble(b);
            }
        }

        // 2. Render Burst Rings
        for (let i = burstRings.length - 1; i >= 0; i--) {
            const ring = burstRings[i];
            ring.radius += ring.expandSpeed;
            ring.alpha -= 0.03;
            ring.lineWidth *= 0.95;

            if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
                burstRings.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = ring.alpha;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.lineWidth = ring.lineWidth;
            ctx.stroke();
            ctx.restore();
        }

        // 3. Render Pop Droplets
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
            ctx.globalAlpha = pop.alpha;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
            ctx.beginPath();
            ctx.arc(pop.x, pop.y, pop.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(render);
    }

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
        window.addEventListener('load', init);
    }
})();
