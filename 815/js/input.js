/* ============================================
   INPUT MANAGER — Keyboard & Mouse
   ============================================ */

const Input = (() => {
    const keys = {};
    const justPressed = {};
    const justReleased = {};
    let mouseX = 0;
    let mouseY = 0;
    let mouseClicked = false;
    let mouseJustClicked = false;

    function init() {
        window.addEventListener('keydown', (e) => {
            if (!keys[e.code]) {
                justPressed[e.code] = true;
            }
            keys[e.code] = true;
            e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            keys[e.code] = false;
            justReleased[e.code] = true;
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width) * 320;
            mouseY = ((e.clientY - rect.top) / rect.height) * 180;
        });

        window.addEventListener('mousedown', (e) => {
            mouseClicked = true;
            mouseJustClicked = true;
        });

        window.addEventListener('mouseup', (e) => {
            mouseClicked = false;
        });
    }

    function isDown(code) {
        return !!keys[code];
    }

    function wasPressed(code) {
        return !!justPressed[code];
    }

    function wasReleased(code) {
        return !!justReleased[code];
    }

    function isMovingUp() {
        return isDown('KeyW') || isDown('ArrowUp');
    }

    function isMovingDown() {
        return isDown('KeyS') || isDown('ArrowDown');
    }

    function isMovingLeft() {
        return isDown('KeyA') || isDown('ArrowLeft');
    }

    function isMovingRight() {
        return isDown('KeyD') || isDown('ArrowRight');
    }

    function isInteract() {
        return wasPressed('KeyE') || wasPressed('Space');
    }

    function isConfirm() {
        return wasPressed('Enter') || wasPressed('Space');
    }

    function getMousePos() {
        return { x: mouseX, y: mouseY };
    }

    function wasMouseClicked() {
        return mouseJustClicked;
    }

    function endFrame() {
        Object.keys(justPressed).forEach(k => delete justPressed[k]);
        Object.keys(justReleased).forEach(k => delete justReleased[k]);
        mouseJustClicked = false;
    }

    return {
        init,
        isDown,
        wasPressed,
        wasReleased,
        isMovingUp,
        isMovingDown,
        isMovingLeft,
        isMovingRight,
        isInteract,
        isConfirm,
        getMousePos,
        wasMouseClicked,
        endFrame
    };
})();
