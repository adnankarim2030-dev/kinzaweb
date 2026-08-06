/**
 * Kinza Beverage - Bulletproof & High-Visibility Carbonated Soda Bubble Engine
 * 100% Guaranteed DOM Safety, Zero Dependencies, High-Contrast Visibility
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

    const MAX_AMBIENT_BUBBLES = 45; // Rich, vivid soda carbonation density
    const BURST_INTERVAL = 10000;   // Energetic burst every 10 seconds

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

        // Seed initial ambient bubbles distributed vertically across the viewport
        for (let i = 0; i < MAX_AMBIENT_BUBBLES; i++) {
            const b = createAmbientBubble(true);
            ambientBubbles.push(b);
        }

        // Trigger first burst immediately
        triggerBurst();

        // Repeat automatically every 10 seconds
        burstTimerId = setInterval(triggerBurst, BURST_INTERVAL);

        requestAnimationFrame(render);
        console.log('🫧 Kinza Soda Carbonation Bubble Engine Active');
    }

    function resize() {
        if (!canvas) return;
        width = canvas.width = window.innerWidth || document.documentElement.clientWidth || 1024;
        height = canvas.height = window.innerHeight || document.documentElement.clientHeight || 768;
    }

    function createAmbientBubble(randomY = false) {
        // Prominent size (10px to 26px)
        const radius = 10 + Math.random() * 16;
        const speed = 1.4 + Math.random() * 2.4;
        return {
            x: Math.random() * width,
            y: randomY ? Math.random() * height : height + 20 + Math.random() * 60,
            vx: (Math.random() - 0.5) * 0.7,
            vy: -speed,
            radius: radius,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.025 + Math.random() * 0.035,
            wobbleAmp: 0.6 + Math.random() * 1.2,
            alpha: 0.85 + Math.random() * 0.15,
            targetTopY: 30 + Math.random() * 120
        };
    }

    function triggerBurst() {
        const count = 28 + Math.floor(Math.random() * 10);
        const centerMinX = width * 0.2;
        const centerMaxX = width * 0.8;

        for (let i = 0; i < count; i++) {
            const startX = centerMinX + Math.random() * (centerMaxX - centerMinX);
            const startY = height + 20 + Math.random() * 100;
            const targetTopY = 40 + Math.random() * 100;
            const initialSpeedY = 7.0 + Math.random() * 4.0;
            const lateralDrift = (Math.random() - 0.5) * 1.0;

            burstBubbles.push({
                x: startX,
                y: startY,
                vx: lateralDrift,
                vy: -initialSpeedY,
                baseDrag: 0.998,
                topDrag: 0.92 + Math.random() * 0.03,
                radius: 12 + Math.random() * 18,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.035 + Math.random() * 0.045,
                wobbleAmp: 0.8 + Math.random() * 1.4,
                alpha: 0.9 + Math.random() * 0.1,
                targetTopY: targetTopY
            });
        }
    }

    function spawnPopEffect(x, y, radius) {
        const dropletCount = 8 + Math.floor(radius * 0.6);
        for (let i = 0; i < dropletCount; i++) {
            const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() - 0.5) * 0.8;
            const speed = 1.8 + Math.random() * 3.2;
            popEffects.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.max(2.2, radius * 0.22 + Math.random() * 2),
                alpha: 0.95,
                decay: 0.025 + Math.random() * 0.025,
                gravity: 0.05
            });
        }

        burstRings.push({
            x: x,
            y: y,
            radius: radius * 0.4,
            maxRadius: radius * 4.0,
            alpha: 0.85,
            lineWidth: Math.max(2.0, radius * 0.22),
            expandSpeed: 2.2 + radius * 0.14
        });
    }

    function drawBubble(b) {
        ctx.save();
        ctx.globalAlpha = b.alpha;

        // 1. Solid Soda Aqua Base Circle (100% High Visibility!)
        ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // 2. 3D Soda Volume Gradient
        const radGrad = ctx.createRadialGradient(
            b.x - b.radius * 0.35,
            b.y - b.radius * 0.35,
            b.radius * 0.05,
            b.x,
            b.y,
            b.radius
        );
        radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        radGrad.addColorStop(0.35, 'rgba(186, 230, 253, 0.6)');
        radGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.4)');
        radGrad.addColorStop(1, 'rgba(14, 165, 233, 0.7)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // 3. Crisp Bold Dark Cyan Rim (Very High Contrast Outline!)
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = Math.max(2.0, b.radius * 0.14);
        ctx.stroke();

        // 4. Pure White 3D Specular Glare Arc (Top-Left Highlight)
        ctx.beginPath();
        ctx.arc(
            b.x - b.radius * 0.25,
            b.y - b.radius * 0.25,
            b.radius * 0.55,
            Math.PI * 1.0,
            Math.PI * 1.65
        );
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2.2, b.radius * 0.22);
        ctx.stroke();

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
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.06;

            if (b.y <= b.targetTopY || b.y <= -30) {
                if (Math.random() < 0.35) {
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
            b.x += Math.sin(b.wobblePhase) * b.wobbleAmp * 0.06;

            if (b.y <= b.targetTopY || Math.abs(b.vy) < 0.15 || b.y <= 30) {
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
            ctx.globalAlpha = ring.alpha;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#0284c7';
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
            ctx.globalAlpha = pop.alpha;
            ctx.fillStyle = '#0284c7';
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
