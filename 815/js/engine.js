/* ============================================
   ENGINE — Game Loop, Canvas, State Management
   ============================================ */

const Engine = (() => {
    let canvas, ctx;
    let lastTime = 0;
    let isRunning = false;
    let currentScene = null;
    
    // Internal Game State
    const state = {
        loopCount: 0,
        flags: {},
        inventory: [],
        currentObjective: "Finish household chores.",
        powerOn: true
    };

    function init() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        
        // Retro resolution
        canvas.width = 320;
        canvas.height = 180;
        
        // Crisp pixels
        ctx.imageSmoothingEnabled = false;
        
        Input.init();
        AudioAPI.init(); // Assuming Audio exists
        UI.init();
    }

    function changeScene(newScene) {
        if (currentScene && currentScene.exit) {
            currentScene.exit();
        }
        currentScene = newScene;
        if (currentScene && currentScene.enter) {
            currentScene.enter();
        }
    }

    function setFlag(key, value) {
        state.flags[key] = value;
    }

    function getFlag(key) {
        return state.flags[key];
    }

    function gameLoop(timestamp) {
        if (!isRunning) return;

        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (currentScene && currentScene.update) {
            currentScene.update(dt);
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (currentScene && currentScene.draw) {
            currentScene.draw(ctx);
        }

        Input.endFrame();

        requestAnimationFrame(gameLoop);
    }

    function start() {
        if (!isRunning) {
            isRunning = true;
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
    }

    function stop() {
        isRunning = false;
    }

    function resetLoopState() {
        state.inventory = [];
        state.powerOn = true;
        // Keep some flags that persist across loops
        for (let key in state.flags) {
            if (key !== 'knowsAboutLoop' && key !== 'suspectsEmily' && key !== 'foundProof') {
               // We might want to reset specific flags, or just keep persistent ones
            }
        }
    }

    return {
        init,
        start,
        stop,
        changeScene,
        state,
        setFlag,
        getFlag,
        resetLoopState,
        get ctx() { return ctx; },
        get canvas() { return canvas; }
    };
})();
