// Premium Autoplay Video Loop & Scroll Engine

const html = document.documentElement;
const video = document.getElementById('scroll-video');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const loadingText = document.getElementById('loading-text');
const scrollProgressLine = document.querySelector('.scroll-progress-indicator');

const heroContent = document.querySelector('.hero-content');
let isExperienceStarted = false;
const PLAYBACK_SPEED = 0.4; // 0.4x speed (slower, more cinematic)

// Start preloading and monitoring video load
function initVideoPlayer() {
    // Ensure video is muted and playsinline (required for autoplay)
    video.muted = true;
    video.playsInline = true;
    video.playbackRate = PLAYBACK_SPEED;
    
    // Attempt play immediately (in case browser allows it)
    video.play().catch(err => {
        console.log("Autoplay blocked initially, waiting for load events: ", err);
    });

    // Monitor loading progress via progress events (estimate based on buffered length)
    video.addEventListener('progress', () => {
        if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const duration = video.duration || 1.7; // Fallback to 1.7s if duration isn't loaded yet
            const progress = Math.min(100, Math.round((bufferedEnd / duration) * 100));
            
            progressBar.style.width = `${progress}%`;
            loadingText.textContent = `${progress}% buffered`;
        }
    });

    const markAsReady = () => {
        if (!isExperienceStarted) {
            progressBar.style.width = '100%';
            loadingText.textContent = '100% ready';
            
            setTimeout(startExperience, 600);
        }
    };

    // When ready to play without stutter, start experience
    video.addEventListener('canplaythrough', markAsReady);

    // If video is already cached and ready
    if (video.readyState >= 3) {
        markAsReady();
    }

    // Fallback timer in case events fire late
    setTimeout(markAsReady, 2500);
}

// Start the page experience
function startExperience() {
    if (isExperienceStarted) return;
    isExperienceStarted = true;

    // Fade out the loading screen
    loader.classList.add('fade-out');
    
    // Play the video and animate the hero content
    video.playbackRate = PLAYBACK_SPEED;
    video.play().then(() => {
        console.log("Video is playing successfully.");
    }).catch(err => {
        console.warn("Playback failed: ", err);
    });
    
    // Add active class to hero content to trigger transition
    setTimeout(() => {
        if (heroContent) heroContent.classList.add('active');
    }, 300);
    
    // Bind scroll events
    window.addEventListener('scroll', handleScroll);
    setupGeneralSectionsObserver();
}

// Track global scroll for top progress bar
function handleScroll() {
    const scrollTop = window.scrollY;
    const totalMaxScroll = html.scrollHeight - window.innerHeight;
    const globalProgress = totalMaxScroll <= 0 ? 0 : scrollTop / totalMaxScroll;
    
    scrollProgressLine.style.width = `${globalProgress * 100}%`;
}

// Handle active states of nav links on scroll
function setupGeneralSectionsObserver() {
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const sectionId = entry.target.id;
            const navLink = document.querySelector(`nav a[href="#${sectionId}"]`);
            
            if (entry.isIntersecting) {
                document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Initialize player
initVideoPlayer();
