/**
 * Sharks Group - Authentic Social Media App Notification Sound Engine
 * Synthesizes official notification audio via Web Audio API
 * High-fidelity, immediate response with eager AudioContext unlock & debouncing
 */
(function() {
    'use strict';

    const lastPlayed = {
        facebook: 0,
        youtube: 0,
        linkedin: 0,
        twitter: 0
    };

    const DEBOUNCE_MS = 250;

    const AppSounds = {
        ctx: null,
        unlocked: false,

        init() {
            if (!this.ctx) {
                try {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) {
                        this.ctx = new AudioCtx();
                    }
                } catch (e) {
                    console.warn('AudioContext initialization warning:', e);
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().then(() => {
                    this.unlocked = true;
                }).catch(() => {});
            } else if (this.ctx && this.ctx.state === 'running') {
                this.unlocked = true;
            }
            return this.ctx;
        },

        withAudio(key, fn) {
            // STRICT USER REQUIREMENT: Sound is ONLY allowed for social media platforms
            const allowedSocialKeys = ['facebook', 'youtube', 'linkedin', 'twitter'];
            if (!key || !allowedSocialKeys.includes(key)) {
                return;
            }

            const nowTime = Date.now();
            if (nowTime - (lastPlayed[key] || 0) < DEBOUNCE_MS) {
                return; // Prevent duplicate triggering from pointerdown + click
            }
            lastPlayed[key] = nowTime;

            const ctx = this.init();
            if (!ctx) return;

            if (ctx.state === 'suspended') {
                ctx.resume().then(() => {
                    this.unlocked = true;
                    fn(ctx);
                }).catch(() => {
                    fn(ctx);
                });
            } else {
                fn(ctx);
            }
        },

        // 1. Facebook Notification Chime (Classic vibrant rising Messenger ding)
        playFacebook() {
            this.withAudio('facebook', (ctx) => {
                const now = ctx.currentTime;

                // Tone 1: G5 (784 Hz)
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(783.99, now);
                gain1.gain.setValueAtTime(0.7, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.15);

                // Tone 2: C6 (1046.5 Hz - vibrant Messenger ding)
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(1046.5, now + 0.08);
                gain2.gain.setValueAtTime(0.8, now + 0.08);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(now + 0.08);
                osc2.stop(now + 0.42);
            });
        },

        // 2. YouTube Notification Bell (Ringing bell harmonic ding)
        playYouTube() {
            this.withAudio('youtube', (ctx) => {
                const now = ctx.currentTime;

                // Fundamental: C6 (1046.5 Hz)
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(1046.5, now);
                gain1.gain.setValueAtTime(0.75, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.5);

                // Overtone 1: E6 (1318.5 Hz)
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(1318.5, now);
                gain2.gain.setValueAtTime(0.4, now);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(now);
                osc2.stop(now + 0.35);

                // Bell Shimmer: High C7 (2093 Hz)
                const osc3 = ctx.createOscillator();
                const gain3 = ctx.createGain();
                osc3.type = 'sine';
                osc3.frequency.setValueAtTime(2093.0, now);
                gain3.gain.setValueAtTime(0.3, now);
                gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc3.connect(gain3);
                gain3.connect(ctx.destination);
                osc3.start(now);
                osc3.stop(now + 0.3);
            });
        },

        // 3. LinkedIn Notification Ping (Crisp professional soft chime)
        playLinkedIn() {
            this.withAudio('linkedin', (ctx) => {
                const now = ctx.currentTime;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(659.25, now); // E5
                osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.08); // B5
                gain.gain.setValueAtTime(0.75, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.38);
            });
        },

        // 4. Twitter / X Tweet Chirp (Snappy high-frequency alert pop)
        playTwitter() {
            this.withAudio('twitter', (ctx) => {
                const now = ctx.currentTime;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1400, now);
                osc.frequency.exponentialRampToValueAtTime(2200, now + 0.05);
                osc.frequency.exponentialRampToValueAtTime(1700, now + 0.12);
                gain.gain.setValueAtTime(0.75, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.28);
            });
        },

        // 5. Theme Toggle (Disabled per user request - only social media has sounds)
        playThemeToggle() {},

        // 6. Navigation Tab Hover (Disabled per user request - only social media has sounds)
        playTabHover() {},

        // 7. Navigation Tab Click (Disabled per user request - only social media has sounds)
        playTabClick() {}
    };

    // Eager AudioContext unlock on first user interaction anywhere on page
    const unlockEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'];
    const doUnlock = function() {
        AppSounds.init();
        unlockEvents.forEach(evt => {
            window.removeEventListener(evt, doUnlock);
        });
    };
    unlockEvents.forEach(evt => {
        window.addEventListener(evt, doUnlock, { once: true, passive: true });
    });

    window.AppSounds = AppSounds;
})();
