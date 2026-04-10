let crtCache = null;
let noiseCache = null;

export function applyCRT_Noise(ctx, width, height) {
    if (!crtCache) {
        // Pre-render Scanlines
        crtCache = document.createElement('canvas');
        crtCache.width = width;
        crtCache.height = height;
        const cCtx = crtCache.getContext('2d');
        cCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for(let y = 0; y < height; y += 4) {
            cCtx.fillRect(0, y, width, 2);
        }
        for(let y = 0; y < height; y += 4) {
            cCtx.fillRect(0, y+2, width, 1);
        }

        // Pre-render a large noise sheet (larger than screen for panning)
        noiseCache = document.createElement('canvas');
        noiseCache.width = width * 2;
        noiseCache.height = height * 2;
        const nCtx = noiseCache.getContext('2d');
        nCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        const gSize = 4;
        for(let x = 0; x < noiseCache.width; x += gSize) {
            for(let y = 0; y < noiseCache.height; y += gSize) {
                if(Math.random() > 0.6) {
                    nCtx.fillRect(x, y, gSize, gSize);
                }
            }
        }
    }

    ctx.save();
    
    // Draw cached scanlines (fast)
    ctx.drawImage(crtCache, 0, 0);

    // Dynamic Film Grain (Pan the cached noise sheet randomly)
    ctx.globalCompositeOperation = 'overlay';
    const ox = Math.floor(Math.random() * width);
    const oy = Math.floor(Math.random() * height);
    ctx.drawImage(noiseCache, ox, oy, width, height, 0, 0, width, height);
    
    ctx.restore();
}

export function drawFloatingDust(ctx, width, height, playerX, playerY) {
    // Only see dust around the player
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const time = Date.now() * 0.001;
    for (let i = 0; i < 40; i++) {
        // pseudo-random deterministic positions based on index
        let baseX = (Math.sin(i * 1234.5) * 20000) % width;
        if (baseX < 0) baseX += width;
        let baseY = (Math.cos(i * 5432.1) * 20000) % height;
        if (baseY < 0) baseY += height;
        
        // Float logic
        let px = (baseX + Math.sin(time + i) * 30 + playerX * 0.1) % width;
        let py = (baseY - time * 20 - i * 5) % height;
        if (py < 0) py += height;
        
        // Distance to player brightness
        let dist = Math.sqrt(Math.pow(px - playerX, 2) + Math.pow(py - playerY, 2));
        if (dist < 150) {
            let opacity = (1 - dist / 150) * (0.15 + 0.1 * Math.sin(time * 3 + i));
            ctx.fillStyle = `rgba(255,240,200,${opacity})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
}
