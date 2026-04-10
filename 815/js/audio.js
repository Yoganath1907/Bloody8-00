/* ============================================
   AUDIO MANAGER — Web Audio API
   Procedural sound effects for retro horror
   ============================================ */

const AudioManager = (() => {
    let ctx = null;
    let masterGain = null;
    let musicGain = null;
    let sfxGain = null;
    let ambienceGain = null;
    let activeLoops = {};
    let initialized = false;

    function init() {
        if (initialized) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.7;
        masterGain.connect(ctx.destination);

        musicGain = ctx.createGain();
        musicGain.gain.value = 0.3;
        musicGain.connect(masterGain);

        sfxGain = ctx.createGain();
        sfxGain.gain.value = 0.6;
        sfxGain.connect(masterGain);

        ambienceGain = ctx.createGain();
        ambienceGain.gain.value = 0.4;
        ambienceGain.connect(masterGain);

        initialized = true;
    }

    function ensureContext() {
        if (!initialized) init();
        if (ctx.state === 'suspended') ctx.resume();
    }

    // --- Noise Generator ---
    function createNoiseBuffer(duration, type) {
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * duration;
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        if (type === 'white') {
            for (let i = 0; i < length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'brown') {
            let last = 0;
            for (let i = 0; i < length; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (last + (0.02 * white)) / 1.02;
                last = data[i];
                data[i] *= 3.5;
            }
        } else if (type === 'pink') {
            let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
            for (let i = 0; i < length; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886*b0 + white*0.0555179;
                b1 = 0.99332*b1 + white*0.0750759;
                b2 = 0.96900*b2 + white*0.1538520;
                b3 = 0.86650*b3 + white*0.3104856;
                b4 = 0.55000*b4 + white*0.5329522;
                b5 = -0.7616*b5 - white*0.0168980;
                data[i] = b0+b1+b2+b3+b4+b5+b6 + white*0.5362;
                data[i] *= 0.11;
                b6 = white * 0.115926;
            }
        }
        return buffer;
    }

    // --- Rain ---
    function playRain() {
        ensureContext();
        if (activeLoops['rain']) return;

        const noiseBuffer = createNoiseBuffer(4, 'brown');
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.5;

        const gain = ctx.createGain();
        gain.gain.value = 0.35;

        // Subtle patter effect with second noise layer
        const patter = ctx.createBufferSource();
        patter.buffer = createNoiseBuffer(2, 'pink');
        patter.loop = true;
        
        const patterFilter = ctx.createBiquadFilter();
        patterFilter.type = 'highpass';
        patterFilter.frequency.value = 4000;
        
        const patterGain = ctx.createGain();
        patterGain.gain.value = 0.08;

        // LFO for rain intensity variation
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.15;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.1;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ambienceGain);
        source.start();

        patter.connect(patterFilter);
        patterFilter.connect(patterGain);
        patterGain.connect(ambienceGain);
        patter.start();

        activeLoops['rain'] = { sources: [source, patter, lfo], gains: [gain, patterGain] };
    }

    // --- Thunder ---
    function playThunder() {
        ensureContext();
        const noiseBuffer = createNoiseBuffer(3, 'brown');
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        source.start();
        source.stop(ctx.currentTime + 3);
    }

    // --- Alarm Clock ---
    function playAlarm() {
        ensureContext();
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'square';
        osc2.type = 'square';
        osc1.frequency.value = 880;
        osc2.frequency.value = 660;

        const gain = ctx.createGain();
        gain.gain.value = 0;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(sfxGain);

        const now = ctx.currentTime;
        for (let i = 0; i < 6; i++) {
            gain.gain.setValueAtTime(0.25, now + i * 0.4);
            gain.gain.setValueAtTime(0, now + i * 0.4 + 0.2);
        }

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.5);
        osc2.stop(now + 2.5);
    }

    // --- Phone Vibration ---
    function playPhoneVibrate() {
        ensureContext();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 150;

        const gain = ctx.createGain();
        gain.gain.value = 0;

        const now = ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            gain.gain.setValueAtTime(0.15, now + i * 0.5);
            gain.gain.setValueAtTime(0, now + i * 0.5 + 0.3);
        }

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 1.8);
    }

    // --- Heartbeat ---
    function playHeartbeat(fast) {
        ensureContext();
        if (activeLoops['heartbeat']) stopLoop('heartbeat');

        const rate = fast ? 2.0 : 1.0;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 50;

        const gain = ctx.createGain();
        gain.gain.value = 0;

        function beat() {
            if (!activeLoops['heartbeat']) return;
            const now = ctx.currentTime;
            // Lub
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            // Dub
            gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

            activeLoops['heartbeat'].timer = setTimeout(beat, 1000 / rate);
        }

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start();

        activeLoops['heartbeat'] = { sources: [osc], gains: [gain], timer: null };
        beat();
    }

    // --- Footsteps ---
    function playFootstep() {
        ensureContext();
        const noiseBuffer = createNoiseBuffer(0.1, 'white');
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1500;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        source.start();
        source.stop(ctx.currentTime + 0.1);
    }

    // --- Door Creak ---
    function playDoorCreak() {
        ensureContext();
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.8);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 5;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
    }

    // --- Scream ---
    function playScream() {
        ensureContext();
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1.0);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 2;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(1.5, 'white');
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 2000;
        noiseFilter.Q.value = 1;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.15;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(sfxGain);
        noise.start();
        noise.stop(ctx.currentTime + 1.5);
    }

    // --- Power Down ---
    function playPowerDown() {
        ensureContext();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.5);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
    }

    // --- Power Up ---
    function playPowerUp() {
        ensureContext();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(50, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.8);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
    }

    // --- Clock Tick ---
    function playClockTick() {
        ensureContext();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 4000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }

    // --- Dish Clink ---
    function playDishClink() {
        ensureContext();
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 2000 + Math.random() * 1000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
    }

    // --- Switch Click ---
    function playSwitchClick() {
        ensureContext();
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(0.05, 'white');
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        noise.connect(gain);
        gain.connect(sfxGain);
        noise.start();
        noise.stop(ctx.currentTime + 0.05);
    }

    // --- Knife Sound ---
    function playKnifeSound() {
        ensureContext();
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(3000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
    }

    // --- Eerie Drone ---
    function playEerieDrone() {
        ensureContext();
        if (activeLoops['drone']) return;

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 55;

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 57; // slight detuning

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        const gain = ctx.createGain();
        gain.gain.value = 0.12;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(musicGain);
        osc1.start();
        osc2.start();

        activeLoops['drone'] = { sources: [osc1, osc2], gains: [gain] };
    }

    // --- TV Static ---
    function playTVStatic() {
        ensureContext();
        if (activeLoops['tv']) return;

        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(2, 'white');
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 0.3;

        const gain = ctx.createGain();
        gain.gain.value = 0.06;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        noise.start();

        activeLoops['tv'] = { sources: [noise], gains: [gain] };
    }

    // --- Siren (police) ---
    function playSiren() {
        ensureContext();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        
        const now = ctx.currentTime;
        for (let i = 0; i < 10; i++) {
            osc.frequency.setValueAtTime(600, now + i * 0.6);
            osc.frequency.linearRampToValueAtTime(900, now + i * 0.6 + 0.3);
        }

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.setValueAtTime(0.15, now + 5.5);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 6);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 6);
    }

    // --- Impact Hit ---
    function playImpact() {
        ensureContext();
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(0.3, 'brown');
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        noise.start();
        noise.stop(ctx.currentTime + 0.3);
    }

    // --- UI Select ---
    function playUISelect() {
        ensureContext();
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 440;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }

    // --- Stop a loop ---
    function stopLoop(name) {
        if (activeLoops[name]) {
            const loop = activeLoops[name];
            if (loop.timer) clearTimeout(loop.timer);
            loop.sources.forEach(s => {
                try { s.stop(); } catch(e) {}
            });
            delete activeLoops[name];
        }
    }

    // --- Stop all ---
    function stopAll() {
        Object.keys(activeLoops).forEach(stopLoop);
    }

    // --- Fade ambience ---
    function fadeAmbience(targetVol, duration) {
        if (!initialized) return;
        ambienceGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + duration);
    }

    return {
        init,
        playRain,
        playThunder,
        playAlarm,
        playPhoneVibrate,
        playHeartbeat,
        playFootstep,
        playDoorCreak,
        playScream,
        playPowerDown,
        playPowerUp,
        playClockTick,
        playDishClink,
        playSwitchClick,
        playKnifeSound,
        playEerieDrone,
        playTVStatic,
        playSiren,
        playImpact,
        playUISelect,
        stopLoop,
        stopAll,
        fadeAmbience
    };
})();
