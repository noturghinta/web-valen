/**
 * Global Music Manager for Valentine Website
 * Handles continuous playback, volume state, and persistence across pages.
 */

class MusicManager {
    constructor() {
        this.audio = null;
        // Determine path based on current location
        const isGalaxy = window.location.pathname.includes('galaxy');
        this.audioSrc = isGalaxy ? '../assets/music/bg-music.mp3' : 'assets/music/bg-music.mp3';

        this.storageKey = 'valen_music_state';
        console.log("MusicManager initialized. Path:", window.location.pathname, "AudioSrc:", this.audioSrc);
        this.init();
    }

    init() {
        // Create audio element if it doesn't exist
        this.audio = document.createElement('audio');
        this.audio.id = 'global-bg-music';
        this.audio.loop = true;
        this.audio.src = this.audioSrc;

        this.audio.addEventListener('canplay', () => console.log("MusicManager: Audio can play"));
        this.audio.addEventListener('error', (e) => console.error("MusicManager: Audio error", e));
        this.audio.addEventListener('play', () => console.log("MusicManager: Playing"));


        // Restore state from localStorage
        const savedState = JSON.parse(localStorage.getItem(this.storageKey)) || {
            currentTime: 0,
            isMuted: false,
            isPlaying: false
        };

        this.audio.muted = savedState.isMuted;

        // Ensure we seek ONLY after metadata is loaded to prevent reset to 0
        this.audio.addEventListener('loadedmetadata', () => {
            if (savedState.currentTime > 0) {
                this.audio.currentTime = savedState.currentTime;
            }
        });

        // Update state periodically and on unload
        setInterval(() => {
            if (!this.audio.paused) {
                this.saveState();
            }
        }, 1000);

        window.addEventListener('beforeunload', () => this.saveState());

        // Handle user interaction to start audio (browser policy)
        const startAudio = () => {
            if (this.audio.paused) {
                this.audio.play().catch(e => console.log("Auto-play blocked, waiting for interaction"));
            }
            document.removeEventListener('click', startAudio);
        };
        document.addEventListener('click', startAudio);

        // Listen for internal state changes to save
        this.audio.onplay = () => this.saveState();
        this.audio.onpause = () => this.saveState();
        this.audio.onvolumechange = () => this.saveState();

        // Attempt/Auto-resume if it was playing
        if (savedState.isPlaying) {
            console.log("Attempting to auto-resume music...");
            this.audio.play().catch(e => {
                console.log("Auto-resume blocked by browser policy. Waiting for interaction.", e);
            });
        }
    }

    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify({
            currentTime: this.audio.currentTime,
            isMuted: this.audio.muted,
            isPlaying: !this.audio.paused
        }));
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.saveState();
        return this.audio.muted;
    }

    play() {
        this.audio.play();
        this.saveState();
    }

    pause() {
        this.audio.pause();
        this.saveState();
    }

    get isMuted() {
        return this.audio.muted;
    }
}

// Global instance
window.musicManager = new MusicManager();
