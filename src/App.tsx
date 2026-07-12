import { useEffect, useRef, useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ArrowRight, Instagram, Twitter, Check, X, CreditCard, Compass } from 'lucide-react';
import AboutSection from './components/AboutSection';
import FeaturedVideoSection from './components/FeaturedVideoSection';
import PhilosophySection from './components/PhilosophySection';
import ServicesSection from './components/ServicesSection';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [manifestoOpen, setManifestoOpen] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'signup' | 'pricing' | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isFadingOut = false;
    let animationFrameId: number | null = null;

    const animateOpacity = (
      start: number,
      end: number,
      duration: number,
      callback?: () => void
    ) => {
      let startTime: number | null = null;
      
      const step = (now: number) => {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentOpacity = start + (end - start) * progress;
        video.style.opacity = currentOpacity.toString();
        
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          animationFrameId = null;
          if (callback) callback();
        }
      };
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(step);
    };

    const handleCanPlay = () => {
      video.play().catch(err => console.log("Video autoplay blocked or failed:", err));
      animateOpacity(0, 0.7, 500);
    };

    const handleTimeUpdate = () => {
      const remaining = video.duration - video.currentTime;
      if (remaining <= 0.55 && !isFadingOut && video.duration > 0) {
        isFadingOut = true;
        const currentOpacity = parseFloat(video.style.opacity || '0');
        animateOpacity(currentOpacity, 0, 500);
      }
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        isFadingOut = false;
        video.play().catch(err => console.log("Video replay failed:", err));
        animateOpacity(0, 0.7, 500);
      }, 100);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    if (video.readyState >= 3) {
      handleCanPlay();
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* SECTION 1 -- HERO */}
      <header className="relative min-h-screen overflow-hidden flex flex-col justify-between w-full">
        {/* Background video with fade logic */}
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
          className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none"
          muted
          autoPlay
          playsInline
          preload="auto"
          style={{ opacity: 0 }}
        />
        <div className="radial-overlay" />
        
        {/* Absolute dark vignette layer behind text */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black pointer-events-none" />

        {/* Navbar */}
        <nav className="relative z-20 px-6 py-6 w-full">
          <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center">
              <a href="#" className="flex items-center gap-2 cursor-pointer group">
                <Globe className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-white font-semibold text-lg tracking-tight">Philosophere</span>
              </a>
              <div className="hidden md:flex items-center gap-8 ml-8">
                <a href="#philosophy" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Features</a>
                <button onClick={() => setModalType('pricing')} className="text-white/80 hover:text-white text-sm font-medium transition-colors cursor-pointer bg-transparent border-none">Pricing</button>
                <a href="#about" className="text-white/80 hover:text-white text-sm font-medium transition-colors">About</a>
              </div>
            </div>
            
            {/* Right */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setModalType('signup')}
                className="text-white hover:text-white/80 text-sm font-medium transition-colors cursor-pointer bg-transparent border-none"
              >
                Sign Up
              </button>
              <button 
                onClick={() => setModalType('login')}
                className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-all cursor-pointer bg-transparent border-none"
              >
                Login
              </button>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%] max-w-4xl mx-auto w-full">
          
          <h1 className="font-instrument text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-tight whitespace-nowrap mb-8 select-none leading-none">
            Know it then <em className="italic font-serif">all</em>.
          </h1>

          {/* Email input pill */}
          <div className="max-w-xl w-full mb-8">
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  key="subscribe-form"
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleSubscribe}
                  className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3 w-full"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-white placeholder:text-white/40 bg-transparent outline-none flex-1 text-sm font-sans"
                  />
                  <button 
                    type="submit" 
                    className="bg-white rounded-full p-3 text-black hover:bg-white/90 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer border-none"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="subscribe-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="liquid-glass rounded-full px-6 py-4 flex items-center justify-center gap-3 w-full bg-white/5"
                >
                  <div className="bg-white text-black p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-white text-sm font-medium font-sans">
                    Thank you! You've successfully subscribed.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtitle */}
          <p className="text-white text-sm leading-relaxed max-w-lg mb-8 font-sans px-4">
            Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates.
          </p>

          {/* Manifesto button */}
          <button 
            onClick={() => setManifestoOpen(true)}
            className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
          >
            Read Our Manifesto
          </button>
        </div>

        {/* Social icons footer */}
        <div className="relative z-10 flex justify-center gap-4 pb-12">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a 
            href="#" 
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Website"
          >
            <Globe className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* SECTION 2 -- ABOUT SECTION */}
      <AboutSection />

      {/* SECTION 3 -- FEATURED VIDEO */}
      <FeaturedVideoSection />

      {/* SECTION 4 -- PHILOSOPHY SECTION */}
      <PhilosophySection />

      {/* SECTION 5 -- SERVICES SECTION */}
      <ServicesSection />

      {/* FOOTER CODA */}
      <footer className="bg-black py-16 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.01)_0%,_transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-white/40" />
            <span className="text-white/40 text-sm font-semibold">Asme © 2026</span>
          </div>
          <div className="flex gap-8 text-xs text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* MANIFESTO MODAL */}
      <AnimatePresence>
        {manifestoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setManifestoOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="liquid-glass rounded-3xl p-8 md:p-12 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative z-10 shadow-[0_0_80px_rgba(255,255,255,0.05)]"
            >
              <button
                onClick={() => setManifestoOpen(false)}
                className="absolute top-6 right-6 text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors cursor-pointer bg-transparent border-none"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white/40 text-xs tracking-widest uppercase mb-2">
                  <Compass className="w-4 h-4" />
                  <span>Our Creed</span>
                </div>
                
                <h3 className="text-4xl md:text-5xl font-instrument italic text-white leading-tight">
                  The Asme Manifesto
                </h3>
                
                <div className="h-px bg-white/10 w-full" />
                
                <p className="text-white/80 text-base md:text-lg leading-relaxed font-sans">
                  We believe that the world belongs to the curious. Not to those who are content with the surface, but those who seek the depth of why and how.
                </p>
                <p className="text-white/80 text-base md:text-lg leading-relaxed font-sans">
                  Technology is not a barrier; it is the ultimate medium of expression. High design is not an ornament; it is the physical architecture of human trust.
                </p>
                <p className="text-white/80 text-base md:text-lg leading-relaxed font-sans">
                  By marrying relentless strategy with flawless craft, we don't just anticipate what comes next. We design it. We manifest it. We build it with glass, light, and conviction.
                </p>
                
                <div className="pt-4">
                  <button
                    onClick={() => setManifestoOpen(false)}
                    className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/10 transition-colors w-full md:w-auto cursor-pointer bg-transparent border-none"
                  >
                    Walk with us
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX MODALS FOR NAVIGATION LINKS */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="liquid-glass rounded-3xl p-8 max-w-md w-full relative z-10 shadow-[0_0_80px_rgba(255,255,255,0.05)]"
            >
              <button
                onClick={() => setModalType(null)}
                className="absolute top-6 right-6 text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors cursor-pointer bg-transparent border-none"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {modalType === 'login' && (
                <div className="space-y-6">
                  <h3 className="text-3xl font-instrument italic text-white">Welcome back</h3>
                  <p className="text-white/60 text-sm font-sans">Access your spaces, tools, and creative insights portfolio.</p>
                  <form onSubmit={(e) => { e.preventDefault(); setModalType(null); }} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase text-white/40 tracking-wider font-semibold font-sans">Email</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="name@domain.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm font-sans" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase text-white/40 tracking-wider font-semibold font-sans">Password</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm font-sans" 
                      />
                    </div>
                    <button 
                      type="submit"
                      className="bg-white text-black w-full py-3 rounded-full font-medium text-sm hover:bg-white/90 transition-colors cursor-pointer font-sans border-none"
                    >
                      Authenticate
                    </button>
                  </form>
                </div>
              )}

              {modalType === 'signup' && (
                <div className="space-y-6">
                  <h3 className="text-3xl font-instrument italic text-white">Join the vision</h3>
                  <p className="text-white/60 text-sm font-sans">Create your membership and unlock pioneering research tools.</p>
                  <form onSubmit={(e) => { e.preventDefault(); setModalType(null); }} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase text-white/40 tracking-wider font-semibold font-sans">Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Your Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm font-sans" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase text-white/40 tracking-wider font-semibold font-sans">Email</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="name@domain.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm font-sans" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase text-white/40 tracking-wider font-semibold font-sans">Security Key</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="Create strong passphrase"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm font-sans" 
                      />
                    </div>
                    <button 
                      type="submit"
                      className="bg-white text-black w-full py-3 rounded-full font-medium text-sm hover:bg-white/90 transition-colors cursor-pointer font-sans border-none"
                    >
                      Register Membership
                    </button>
                  </form>
                </div>
              )}

              {modalType === 'pricing' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-white/40 text-xs tracking-widest uppercase">
                    <CreditCard className="w-4 h-4" />
                    <span>Spaces & Plans</span>
                  </div>
                  <h3 className="text-3xl font-instrument italic text-white">Transparent Tiers</h3>
                  <div className="space-y-4">
                    <div className="liquid-glass rounded-2xl p-4 flex justify-between items-center bg-white/5 border border-white/15">
                      <div>
                        <h4 className="font-semibold text-white font-sans text-sm">Explorer</h4>
                        <p className="text-xs text-white/50 font-sans">Weekly trends & research notes</p>
                      </div>
                      <span className="text-xl font-instrument italic font-semibold">Free</span>
                    </div>
                    <div className="liquid-glass rounded-2xl p-4 flex justify-between items-center bg-white/5 border border-white/15 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white/[0.02] pointer-events-none group-hover:opacity-100 transition-opacity" />
                      <div>
                        <h4 className="font-semibold text-white flex items-center gap-2 font-sans text-sm">
                          Pioneer <span className="bg-white/10 text-white text-[9px] px-2 py-0.5 rounded-full font-sans uppercase tracking-wider">Most Loved</span>
                        </h4>
                        <p className="text-xs text-white/50 font-sans">Full analytical suite & priority streams</p>
                      </div>
                      <span className="text-xl font-instrument italic font-semibold">$19<span className="text-xs text-white/40">/mo</span></span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setModalType(null)}
                    className="bg-white text-black w-full py-3 rounded-full font-medium text-sm hover:bg-white/90 transition-colors cursor-pointer font-sans border-none"
                  >
                    Close Tiers
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
