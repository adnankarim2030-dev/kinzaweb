/**
 * Kinza Beverage - Transparent Gas Carbonation Bubble Wave & Burst Engine
 * Features:
 * 1. Transparent Gas Micro-Bubbles (Size: 3px - 9.5px).
 * 2. Rise from BOTTOM to TOP.
 * 3. Burst/Pop at the TOP with water splash droplets & rings.
 * 4. Repeats automatically every 10 seconds.
 */

(function() {
    'use strict';

    let canvas, ctx;
    let width, height;
    let bubbles = [];
    let popEffects = [];
    let burstRings = [];
    let waveTimerId = null;

    const WAVE_INTERVAL = 10000; // 10 seconds loop

    function init() {
        if (!document.body) {
            window.addEventListener('DOMContentLoaded', init);
            return;
        }

        if (document.getElementById('corner-fizz-canvas')) return;

        canvas = document.createElement('canvas');
        canvas.id = 'corner-fizz-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;pointer-events:none;z-index:999999;';
        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);

        // Start first wave of gas bubbles immediately
        triggerGasWave();

        // Repeat every 10 seconds
        waveTimerId = setInterval(triggerGasWave, WAVE_INTERVAL);

        requestAnimationFrame(render);
        console.log('🫧 Kinza 10-Second Gas Bubble Wave Engine Active');
    }

    function resize() {
        if (!canvas) return;
        width = canvas.width = window.innerWidth || document.documentElement.clientWidth || 1024;
        height = canvas.height = window.innerHeight || document.documentElement.clientHeight || 768;
    }

    function triggerGasWave() {
        // Staggered wave of delicate gas bubbles
        const count = 50 + Math.floor(Math.random() * 20); // 50 to 70 delicate gas bubbles

        for (let i = 0; i < count; i++) {
            const startX = Math.random() * width;
            const startY = height + 10 + Math.random() * 160;
            const targetTopY = 20 + Math.random() * 100;
            const speedY = 2.2 + Math.random() * 3.2;
            const lateralDrift = (Math.random() - 0.5) * 0.7;

            // Small, delicate gas bubble size (3px to 9.5px)
            const radius = 3 + Math.random() * 6.5;

            bubbles.push({
                x: startX,
                y: startY,
                vx: lateralDrift,
                vy: -speedY,
                radius: radius,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.03 + Math.random() * 0.04,
                wobbleAmp: 0.5 + Math.random() * 1.0,
                alpha: 0.5 + Math.random() * 0.35,
                targetTopY: targetTopY
            });
        }
    }

    function spawnPopEffect(x, y, radius) {
        const dropletCount = 5 + Math.floor(radius * 0.8);
        for (let i = 0; i < dropletCount; i++) {
            const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() - 0.5) * 0.8;
            const speed = 1.2 + Math.random() * 2.2;
            popEffects.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.max(1.0, radius * 0.2 + Math.random() * 1.2),
                alpha: 0.85,
                decay: 0.03 + Math.random() * 0.03,
                gravity: 0.04
            });
        }

        burstRings.push({
            x: x,
            y: y,
            radius: radius * 0.3,
            maxRadius: radius * 3.5,
            alpha: 0.7,
            lineWidth: Math.max(1.0, radius * 0.18),
            expandSpeed: 1.8 + radius * 0.12
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

        radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        radGrad.addColorStop(0.3, 'rgba(224, 242, 254, 0.35)');
        radGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.12)');
        radGrad.addColorStop(1, 'rgba(14, 165, 233, 0.35)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Fine Transparent Contour Edge
        ctx.strokeStyle = 'rgba(14, 116, 144, 0.45)';
        ctx.lineWidth = Math.max(0.75, b.radius * 0.1);
        ctx.stroke();

        // 3. Top-Left Specular Glare Arc (3D Glass Reflection)
        if (b.radius > 2.5) {
            ctx.beginPath();
            ctx.arc(
                b.x - b.radius * 0.28,
                b.y - b.radius * 0.28,
                b.radius * 0.55,
                Math.PI * 1.1,
                Math.PI * 1.65
            );
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
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
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.05;

            // When bubble reaches the top region, POP / BURST it!
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
            ring.alpha -= 0.04;
            ring.lineWidth *= 0.94;

            if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
                burstRings.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = ring.alpha;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
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
            ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
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
