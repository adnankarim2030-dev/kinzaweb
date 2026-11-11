/**
 * Kinza Beverage - Dynamic Carbonation Bubble Engine (v10.0)
 * Perfectly tuned for visibility & elegance:
 * 1. z-index: 35 (visible above page backgrounds, behind nav & modals z-50)
 * 2. pointer-events: none (zero interference with clicking or scrolling)
 * 3. Quantity: 35 - 50 bubbles on desktop, 25 - 35 on mobile
 * 4. Crisp 3D gas bubble gradient with specular reflection
 * 5. Smooth 6-second wave loop with continuous floating
 */

(function() {
    'use strict';

    let canvas, ctx;
    let width, height;
    let bubbles = [];
    let popEffects = [];
    let burstRings = [];
    let waveTimerId = null;

    const WAVE_INTERVAL = 6000; // 6 seconds loop for continuous lively refreshment

    function init() {
        if (!document.body) {
            window.addEventListener('DOMContentLoaded', init);
            return;
        }

        if (document.getElementById('corner-fizz-canvas')) return;

        canvas = document.createElement('canvas');
        canvas.id = 'corner-fizz-canvas';
        // z-index: 35 ensures it is clearly visible above section backgrounds, but below nav & modals (z-50)
        canvas.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;pointer-events:none;z-index:35;';
        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);

        // Spawn initial wave across entire height so screen isn't empty on load
        spawnInitialBubbles();

        // Start regular wave timer
        waveTimerId = setInterval(triggerGasWave, WAVE_INTERVAL);

        requestAnimationFrame(render);
    }

    function resize() {
        if (!canvas) return;
        width = canvas.width = window.innerWidth || document.documentElement.clientWidth || 1024;
        height = canvas.height = window.innerHeight || document.documentElement.clientHeight || 768;
    }

    function spawnInitialBubbles() {
        const isMobile = width < 768;
        const count = isMobile ? 30 : 45;

        for (let i = 0; i < count; i++) {
            const startX = Math.random() * width;
            // Distribute across screen vertically on first load
            const startY = Math.random() * height;
            const targetTopY = 20 + Math.random() * 80;
            const speedY = 1.8 + Math.random() * 2.2;
            const lateralDrift = (Math.random() - 0.5) * 0.6;
            const radius = 3 + Math.random() * 5.5;

            bubbles.push({
                x: startX,
                y: startY,
                vx: lateralDrift,
                vy: -speedY,
                radius: radius,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.04,
                wobbleAmp: 0.5 + Math.random() * 0.8,
                alpha: 0.5 + Math.random() * 0.35,
                targetTopY: targetTopY
            });
        }
    }

    function triggerGasWave() {
        const isMobile = width < 768;
        // Increased quantity: 25-35 on mobile, 35-50 on desktop
        const count = isMobile ? (25 + Math.floor(Math.random() * 10)) : (35 + Math.floor(Math.random() * 15));

        for (let i = 0; i < count; i++) {
            const startX = Math.random() * width;
            const startY = height + 10 + Math.random() * 150;
            const targetTopY = 20 + Math.random() * 100;
            const speedY = 1.8 + Math.random() * 2.4;
            const lateralDrift = (Math.random() - 0.5) * 0.6;

            const radius = isMobile ? (2.8 + Math.random() * 4.5) : (3.2 + Math.random() * 5.5);

            bubbles.push({
                x: startX,
                y: startY,
                vx: lateralDrift,
                vy: -speedY,
                radius: radius,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.04,
                wobbleAmp: 0.5 + Math.random() * 0.8,
                alpha: 0.55 + Math.random() * 0.35,
                targetTopY: targetTopY
            });
        }
    }

    function spawnPopEffect(x, y, radius) {
        const dropletCount = 3 + Math.floor(radius * 0.5);
        for (let i = 0; i < dropletCount; i++) {
            const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() - 0.5) * 0.6;
            const speed = 1.0 + Math.random() * 1.8;
            popEffects.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.max(1.0, radius * 0.22),
                alpha: 0.75,
                decay: 0.03 + Math.random() * 0.03,
                gravity: 0.04
            });
        }

        burstRings.push({
            x: x,
            y: y,
            radius: radius * 0.3,
            maxRadius: radius * 2.8,
            alpha: 0.6,
            lineWidth: Math.max(0.8, radius * 0.15),
            expandSpeed: 1.5 + radius * 0.1
        });
    }

    function drawGasBubble(b) {
        ctx.save();
        ctx.globalAlpha = b.alpha;

        // 1. Transparent Gas Bubble Radial Gradient
        const radGrad = ctx.createRadialGradient(
            b.x - b.radius * 0.3,
            b.y - b.radius * 0.3,
            b.radius * 0.05,
            b.x,
            b.y,
            b.radius
        );

        radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        radGrad.addColorStop(0.35, 'rgba(224, 242, 254, 0.45)');
        radGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.18)');
        radGrad.addColorStop(1, 'rgba(14, 165, 233, 0.45)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Fine Transparent Contour Edge
        ctx.strokeStyle = 'rgba(14, 116, 144, 0.45)';
        ctx.lineWidth = Math.max(0.75, b.radius * 0.1);
        ctx.stroke();

        // 3. Specular Glare Arc (3D Glass Reflection)
        if (b.radius > 2.5) {
            ctx.beginPath();
            ctx.arc(
                b.x - b.radius * 0.28,
                b.y - b.radius * 0.28,
                b.radius * 0.55,
                Math.PI * 1.1,
                Math.PI * 1.65
            );
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = Math.max(0.8, b.radius * 0.18);
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
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.04;

            // Pop when reaching target top region
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
            ring.alpha -= 0.035;
            ring.lineWidth *= 0.94;

            if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
                burstRings.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = ring.alpha;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
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
            ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
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
