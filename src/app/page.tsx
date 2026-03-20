'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useInView, AnimatePresence } from 'framer-motion';
import {
  Globe, FileText, Globe2, Mic, Video, FileBadge,
  Briefcase, CheckCircle2, Star, Mail, Phone, MapPin,
  Twitter, Linkedin, Facebook, Instagram, UploadCloud,
  Menu, X, ArrowDown, ArrowRight, Quote
} from 'lucide-react';

const seededUnit = (index: number, salt: number): number => {
  const x = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const unitRange = (index: number, salt: number, min: number, max: number): number => {
  return min + seededUnit(index, salt) * (max - min);
};

// ==========================================
// 1. GLOBAL STYLES & CSS ANIMATIONS
// ==========================================
// Injected into the document to handle complex keyframes and custom fonts
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

    :root {
      --dark-navy: #0A1628;
      --ocean-blue: #1E3A5F;
      --teal: #00BFA6;
      --gold: #FFD166;
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--dark-navy);
      color: white;
      overflow-x: hidden;
      cursor: none; /* Hide default cursor for custom one */
    }

    h1, h2, h3, h4, h5, h6, .font-playfair {
      font-family: 'Playfair Display', serif;
    }

    /* Hide scrollbar for cleaner look but keep functionality */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--dark-navy);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--ocean-blue);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--teal);
    }

    /* Custom Animations */
    @keyframes spin-globe {
      0% { transform: rotateY(0deg) rotateX(15deg); }
      100% { transform: rotateY(360deg) rotateX(15deg); }
    }

    @keyframes orbit {
      0% { transform: rotate(0deg) translateX(140px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
    }

    @media (min-width: 1024px) {
      @keyframes orbit {
        0% { transform: rotate(0deg) translateX(220px) rotate(0deg); }
        100% { transform: rotate(360deg) translateX(220px) rotate(-360deg); }
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes marquee-left {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @keyframes marquee-right {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .animate-spin-globe { animation: spin-globe 20s linear infinite; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-marquee-left { animation: marquee-left 30s linear infinite; }
    .animate-marquee-right { animation: marquee-right 30s linear infinite; }
    .animate-shimmer {
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }

    .pause-on-hover:hover { animation-play-state: paused; }
    
    /* 3D Utility Classes */
    .preserve-3d { transform-style: preserve-3d; }
    .perspective-1000 { perspective: 1000px; }
  `}</style>
);

// ==========================================
// 2. UTILITY HOOKS
// ==========================================
// Hook for counting up numbers smoothly
const useCounter = (end: number, duration = 2, start = 0) => {
  const [count, setCount] = useState<number>(start);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      let startTime: number | null = null;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

        // Easing out function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * (end - start) + start));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [end, duration, start, inView]);

  return { count, nodeRef };
};

// Hook for typewriter effect
const useTypewriter = (text: string, speed = 50, delay = 1000) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setInterval> | undefined;

    const startTyping = () => {
      setIsTyping(true);
      timer = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, speed);
    };

    const delayTimer = setTimeout(startTyping, delay);
    return () => {
      clearTimeout(delayTimer);
      clearInterval(timer);
    };
  }, [text, speed, delay]);

  return { displayedText, isTyping };
};

// ==========================================
// 3. GLOBAL COMPONENTS
// ==========================================
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (['A', 'BUTTON', 'INPUT', 'TEXTAREA'].includes(target.tagName) || target.closest('button, a'))) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-[#00BFA6] pointer-events-none z-[100] mix-blend-screen flex items-center justify-center"
      animate={{
        x: mousePosition.x - 16,
        y: mousePosition.y - 16,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? 'rgba(0, 191, 166, 0.2)' : 'transparent'
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <div className={`w-1 h-1 rounded-full bg-[#00BFA6] ${isHovering ? 'opacity-0' : 'opacity-100'}`} />
    </motion.div>
  );
};

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E3A5F] via-[#00BFA6] to-[#FFD166] origin-left z-[100]"
      style={{ scaleX }}
    />
  );
};

const FloatingShapes = () => {
  const shapeConfigs = Array.from({ length: 5 }, (_, i) => ({
    x: [
      unitRange(i, 1, -1000, 1000),
      unitRange(i, 2, -1000, 1000),
      unitRange(i, 3, -1000, 1000)
    ],
    y: [
      unitRange(i, 4, -1000, 1000),
      unitRange(i, 5, -1000, 1000),
      unitRange(i, 6, -1000, 1000)
    ],
    duration: unitRange(i, 7, 20, 40),
    left: `${unitRange(i, 8, 0, 100)}%`,
    top: `${unitRange(i, 9, 0, 100)}%`
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden perspective-1000">
      {shapeConfigs.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[#1E3A5F]/10 to-[#00BFA6]/5 blur-3xl preserve-3d"
          animate={{
            x: shape.x,
            y: shape.y,
            rotateX: [0, 180, 360],
            rotateY: [0, 180, 360],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            left: shape.left,
            top: shape.top,
          }}
        />
      ))}
    </div>
  );
};

// ==========================================
// 4. MAIN SECTIONS
// ==========================================

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const links = ['Services', 'How It Works', 'Pricing', 'Testimonials', 'Contact'];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Basic Scroll Spy
      const sections = ['home', 'services', 'how-it-works', 'pricing', 'testimonials', 'contact'];
      let current = 'home';
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 150) {
          current = section;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A1628]/80 backdrop-blur-md border-b border-white/10 py-4 shadow-lg' : 'bg-transparent py-6'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => scrollTo('home')}
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Globe2 className="w-8 h-8 text-[#00BFA6] group-hover:rotate-180 transition-transform duration-700" />
            <motion.div
              className="absolute inset-0 border-2 border-[#FFD166] rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="font-playfair text-2xl font-bold tracking-wide">
            Lingua<span className="text-[#00BFA6]">Bridge</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const id = link.toLowerCase().replace(/ /g, '-');
            const isActive = activeSection === id;
            return (
              <button
                key={link}
                onClick={() => scrollTo(id)}
                className={`text-sm font-medium transition-colors relative group ${isActive ? 'text-[#00BFA6]' : 'text-gray-300 hover:text-white'
                  }`}
              >
                {link}
                <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#00BFA6] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
              </button>
            )
          })}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollTo('contact')}
            className="px-6 py-2.5 bg-gradient-to-r from-[#1E3A5F] to-[#00BFA6] rounded-full text-white font-medium shadow-[0_0_15px_rgba(0,191,166,0.3)] hover:shadow-[0_0_25px_rgba(0,191,166,0.5)] transition-shadow relative overflow-hidden group"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-[72px] bg-[#0A1628] z-40 flex flex-col items-center justify-center gap-8 border-t border-white/10"
          >
            {links.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
                className="text-2xl font-playfair text-gray-300 hover:text-[#00BFA6] transition-colors"
              >
                {link}
              </button>
            ))}
            <button
              onClick={() => scrollTo('contact')}
              className="mt-4 px-8 py-4 bg-[#00BFA6] rounded-full text-white font-medium text-lg"
            >
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const headline = "Breaking Language Barriers Across The World";
  const { displayedText } = useTypewriter("Professional translation in 50+ languages for businesses that think globally.", 40, 1500);

  const orbitingWords = [
    { text: "Hola" },
    { text: "Bonjour" },
    { text: "こんにちは" },
    { text: "مرحبا" },
    { text: "Привет" },
    { text: "Hello" },
    { text: "你好" },
    { text: "Namaste" }
  ];

  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${unitRange(i, 10, 0, 100)}%`,
    top: `${unitRange(i, 11, 0, 100)}%`,
    animationDelay: `${unitRange(i, 12, 0, 5)}s`,
    animationDuration: `${unitRange(i, 13, 5, 10)}s`
  }));

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden z-10">
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#1E3A5F]/20 to-[#0A1628] z-0" />

      {/* Floating Particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-white/20 rounded-full animate-float"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration
          }}
        />
      ))}

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Left Content */}
        <div className="text-left space-y-8">
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold font-playfair leading-tight"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {headline.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-4 mb-2">
                {word.split('').map((char, j) => (
                  <motion.span
                    key={j}
                    className="inline-block"
                    variants={{
                      hidden: { opacity: 0, y: 50, rotateX: -90 },
                      visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", damping: 12 } }
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>

          <div className="h-16 text-xl text-gray-300 font-light flex items-center">
            <p>
              {displayedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-6 bg-[#00BFA6] ml-1 align-middle"
              />
            </p>
          </div>

          <motion.div
            className="flex flex-wrap gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 0.8 }}
          >
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-[#00BFA6] to-[#1E3A5F] rounded-full font-semibold text-white shadow-[0_4px_20px_rgba(0,191,166,0.4)] hover:shadow-[0_4px_30px_rgba(0,191,166,0.6)] transition-all transform hover:-translate-y-1"
            >
              Get Free Quote
            </button>
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-white/20 hover:border-[#00BFA6] bg-white/5 backdrop-blur-sm rounded-full font-semibold text-white transition-all transform hover:-translate-y-1 relative overflow-hidden group"
            >
              <span className="relative z-10">Our Services</span>
              <div className="absolute inset-0 bg-[#00BFA6]/10 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Right Content - 3D Globe */}
        <div className="relative flex justify-center items-center h-[400px] lg:h-[600px] preserve-3d perspective-1000">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, type: "spring" }}
            className="relative w-64 h-64 lg:w-96 lg:h-96 rounded-full preserve-3d animate-spin-globe"
          >
            {/* Core Sphere */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0A1628] via-[#1E3A5F] to-[#00BFA6] opacity-30 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,191,166,0.4)]" />

            {/* Lat/Long Lines */}
            <div className="absolute inset-0 rounded-full border border-white/10" style={{ transform: 'rotateX(75deg)' }} />
            <div className="absolute inset-0 rounded-full border border-white/10" style={{ transform: 'rotateX(-75deg)' }} />
            <div className="absolute inset-0 rounded-full border border-white/10" style={{ transform: 'rotateY(45deg)' }} />
            <div className="absolute inset-0 rounded-full border border-white/10" style={{ transform: 'rotateY(90deg)' }} />
            <div className="absolute inset-0 rounded-full border border-white/10" style={{ transform: 'rotateY(135deg)' }} />
          </motion.div>

          {/* Floating Words Orbiting */}
          <div className="absolute top-1/2 left-1/2 w-0 h-0 preserve-3d" style={{ transform: 'translate(-50%, -50%)' }}>
            {orbitingWords.map((item, i) => (
              <div
                key={i}
                className="absolute top-0 left-0 flex items-center justify-center"
                style={{
                  animation: `orbit 15s linear infinite`,
                  animationDelay: `${-(15 / orbitingWords.length) * i}s`
                }}
              >
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm font-medium whitespace-nowrap shadow-lg text-white">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ArrowDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
};

const Services = () => {
  const services = [
    { icon: FileText, title: "Document Translation", desc: "Legal, medical, technical, and academic documents translated with precision." },
    { icon: Globe, title: "Website Localization", desc: "Adapt your digital presence for global audiences, respecting cultural nuances." },
    { icon: Mic, title: "Interpretation Services", desc: "Real-time consecutive and simultaneous interpretation for meetings & events." },
    { icon: Video, title: "Media & Subtitles", desc: "Video, audio transcription, and culturally accurate subtitle translation." },
    { icon: FileBadge, title: "Certified Translation", desc: "Official certified translations guaranteed for immigration and legal entities." },
    { icon: Briefcase, title: "Business Translation", desc: "Contracts, business proposals, and internal corporate communications." },
  ];

  return (
    <section id="services" className="py-24 relative z-10 bg-[#0A1628]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-playfair font-bold mb-4"
          >
            Our Translation <span className="text-[#00BFA6]">Services</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Comprehensive language solutions tailored to your specific industry needs. We do not just translate words; we translate meaning.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-300 transform preserve-3d hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(0,191,166,0.2)] hover:border-[#00BFA6]/30 cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00BFA6] opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500" />

              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#0A1628] border border-white/10 flex items-center justify-center mb-6 transform group-hover:rotate-y-12 group-hover:-rotate-x-12 transition-transform duration-300 preserve-3d shadow-lg">
                <service.icon className="w-7 h-7 text-[#00BFA6] transform group-hover:translate-z-6" />
              </div>

              <h3 className="text-xl font-bold font-playfair mb-3">{service.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{service.desc}</p>

              <div className="flex items-center text-[#FFD166] text-sm font-medium group-hover:text-[#00BFA6] transition-colors">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { num: "01", title: "Submit Document", desc: "Upload your files and tell us your requirements." },
    { num: "02", title: "Receive Quote", desc: "Get a detailed, transparent quote within 1 hour." },
    { num: "03", title: "Translation Begins", desc: "Our native expert linguists start working." },
    { num: "04", title: "Quality Delivery", desc: "Reviewed, polished, and delivered on time." }
  ];

  return (
    <section id="how-it-works" className="py-24 relative z-10 bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-playfair font-bold inline-block relative"
          >
            How It Works
            <motion.div
              className="absolute -bottom-4 left-0 h-1 bg-[#00BFA6]"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.h2>
        </div>

        <div className="relative">
          {/* Connecting Line Desktop */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00BFA6] to-[#FFD166]"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          {/* Connecting Line Mobile */}
          <div className="block lg:hidden absolute top-0 left-8 w-0.5 h-full bg-white/10">
            <motion.div
              className="w-full bg-gradient-to-b from-[#00BFA6] to-[#FFD166]"
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-4 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.3 + 0.5, type: "spring" }}
                className="flex lg:flex-col items-start lg:items-center relative z-10 pl-20 lg:pl-0"
              >
                {/* Number Bubble */}
                <div className="absolute left-0 lg:static w-16 h-16 rounded-full bg-[#1E3A5F] border-4 border-[#0A1628] flex items-center justify-center shadow-[0_0_20px_rgba(0,191,166,0.3)] mb-6 z-10">
                  <span className="font-playfair text-xl font-bold text-[#FFD166]">{step.num}</span>
                  {/* Pulsing dot */}
                  <div className="absolute inset-0 rounded-full border border-[#00BFA6] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                </div>

                <div className="lg:text-center mt-2 lg:mt-0">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm max-w-[200px]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const plans = [
    {
      name: "BASIC", price: "0.08", desc: "For standard texts and general communication.",
      features: ["Standard documents", "3-5 day delivery", "1 revision round", "Email support", "Native translators"]
    },
    {
      name: "PROFESSIONAL", price: "0.12", desc: "For business, legal, and medical documents.", popular: true,
      features: ["All document types", "1-2 day delivery", "Unlimited revisions", "Priority support", "Certified translation", "Industry specialists"]
    },
    {
      name: "ENTERPRISE", price: "Custom", desc: "For high-volume and continuous localization.",
      features: ["Dedicated team", "Same-day delivery", "API integration", "24/7 phone support", "Volume discounts", "Translation memory"]
    }
  ];

  return (
    <section id="pricing" className="py-24 relative z-10 bg-gradient-to-b from-[#0A1628] to-[#0A1628]/90">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-playfair font-bold mb-4"
          >
            Transparent <span className="text-[#FFD166]">Pricing</span>
          </motion.h2>
          <p className="text-gray-400">No hidden fees. Pay per word with guaranteed quality.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center perspective-1000">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, rotateY: 30, y: 50 }}
              whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className={`relative bg-[#1E3A5F]/20 backdrop-blur-md rounded-2xl p-8 border ${plan.popular ? 'border-[#00BFA6] shadow-[0_0_30px_rgba(0,191,166,0.15)] md:-translate-y-4 py-12' : 'border-white/10'
                } preserve-3d transition-transform duration-300 hover:rotate-x-2`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full">
                  <div className="bg-gradient-to-r from-[#00BFA6] to-[#1E3A5F] px-4 py-1 text-xs font-bold tracking-wider uppercase text-white relative">
                    Most Popular
                    <div className="absolute inset-0 w-full h-full bg-white/30 skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-300 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                {plan.price !== 'Custom' ? (
                  <>
                    <span className="text-2xl text-gray-400">$</span>
                    <span className="text-5xl font-playfair font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">/word</span>
                  </>
                ) : (
                  <span className="text-5xl font-playfair font-bold text-white">Custom</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-8 h-10">{plan.desc}</p>

              <div className="space-y-4 mb-8">
                {plan.features.map((feat, j) => (
                  <motion.div
                    key={j}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (j * 0.1) }}
                  >
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-[#00BFA6]' : 'text-gray-500'}`} />
                    <span className="text-sm text-gray-300">{feat}</span>
                  </motion.div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-xl font-bold transition-all relative overflow-hidden group ${plan.popular
                  ? 'bg-[#00BFA6] text-[#0A1628] hover:shadow-[0_0_20px_rgba(0,191,166,0.5)]'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}>
                <span className="relative z-10">{plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}</span>
                {plan.popular && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform rounded-xl" />}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    { name: "Sarah Chen", role: "CEO, GlobalTech", text: "LinguaBridge completely transformed our website localization. The cultural nuances were captured perfectly, leading to a 40% increase in our Asian market engagement." },
    { name: "Mohammed Al-Rashid", role: "Legal Director", text: "Their certified legal translations are impeccable. Fast, accurate, and recognized by all official entities we deal with. Highly recommended for corporate law." },
    { name: "Maria Garcia", role: "Marketing VP", text: "Speed and quality rarely go hand-in-hand, but LinguaBridge delivers both. Our global marketing campaigns launch seamlessly thanks to their swift turnaround." },
    { name: "Hans Weber", role: "COO, EuroTrade", text: "The business terminology in our complex technical manuals was translated with expert precision into 12 languages simultaneously." },
    { name: "Yuki Tanaka", role: "Publisher", text: "Literary translation requires a soul. The translators at LinguaBridge managed to keep the original emotional impact of our novels intact." },
    { name: "Pierre Dubois", role: "Startup Founder", text: "As a startup, budget is tight. Their transparent pricing and high-quality output made global expansion accessible for us earlier than expected." }
  ];

  // Duplicate for infinite scroll
  const scrollItems = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="py-24 relative z-10 overflow-hidden bg-[#0A1628]">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E3A5F] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00BFA6] rounded-full blur-[100px] opacity-10 translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold">What Our <span className="text-[#00BFA6]">Clients</span> Say</h2>
      </div>

      <div className="relative w-full overflow-hidden flex z-10 pause-on-hover">
        <div className="flex animate-marquee-left whitespace-nowrap gap-6 px-3">
          {scrollItems.map((testimonial, i) => (
            <div
              key={i}
              className="w-[350px] md:w-[450px] shrink-0 bg-white/[0.03] backdrop-blur-md border border-white/5 p-8 rounded-2xl relative"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-white/5" />
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#FFD166] text-[#FFD166]" />)}
              </div>
              <p className="text-gray-300 italic mb-8 whitespace-normal text-sm md:text-base h-24 line-clamp-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00BFA6] to-[#1E3A5F] flex items-center justify-center text-lg font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold font-playfair">{testimonial.name}</h4>
                  <p className="text-xs text-[#00BFA6]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  const stats = [
    { label: "Projects Completed", value: 500, suffix: "+" },
    { label: "Languages Supported", value: 50, suffix: "+" },
    { label: "Client Satisfaction", value: 98, suffix: "%" },
    { label: "Available Support", value: 24, suffix: "/7" }
  ];

  return (
    <section className="py-16 relative z-10 bg-gradient-to-r from-[#1E3A5F] to-[#00BFA6]">
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 11px)' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20">
          {stats.map((stat, i) => <StatCard key={i} stat={stat} />)}
        </div>
      </div>
    </section>
  );
};

type StatCardProps = {
  stat: {
    label: string;
    value: number;
    suffix: string;
  };
};

const StatCard = ({ stat }: StatCardProps) => {
  const { count, nodeRef } = useCounter(stat.value, 2.5);

  return (
    <div ref={nodeRef} className="text-center pl-4 first:pl-0">
      <div className="text-4xl md:text-5xl font-playfair font-bold text-white mb-2 shadow-sm">
        {count}{stat.suffix}
      </div>
      <div className="text-sm md:text-base font-medium text-white/80 uppercase tracking-wider">
        {stat.label}
      </div>
    </div>
  );
};

type InputWrapperProps = {
  name: string;
  label: string;
  type?: string;
  children?: React.ReactNode;
  focusedInput: string;
  setFocusedInput: React.Dispatch<React.SetStateAction<string>>;
};

const InputWrapper = ({
  name,
  label,
  type = 'text',
  children,
  focusedInput,
  setFocusedInput,
}: InputWrapperProps) => (
  <div className="relative mb-6">
    {children ? children : (
      <input
        type={type}
        name={name}
        id={name}
        required
        onFocus={() => setFocusedInput(name)}
        onBlur={(e) => !e.target.value && setFocusedInput('')}
        className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none transition-colors peer placeholder-transparent"
        placeholder={label}
      />
    )}
    {!children && (
      <label
        htmlFor={name}
        className={`absolute left-0 transition-all duration-300 pointer-events-none ${focusedInput === name ? '-top-3 text-xs text-[#00BFA6]' : 'top-3 text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#00BFA6]'
          }`}
      >
        {label}
      </label>
    )}
    <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#00BFA6] transition-all duration-300 peer-focus:w-full peer-focus:left-0" />
  </div>
);

const Languages = () => {
  type Language = {
    name: string;
    native: string;
    flag: string;
  };

  const row1 = [
    { name: "English", native: "English", flag: "🇺🇸" },
    { name: "Spanish", native: "Español", flag: "🇪🇸" },
    { name: "French", native: "Français", flag: "🇫🇷" },
    { name: "German", native: "Deutsch", flag: "🇩🇪" },
    { name: "Chinese", native: "中文", flag: "🇨🇳" },
    { name: "Japanese", native: "日本語", flag: "🇯🇵" },
    { name: "Korean", native: "한국어", flag: "🇰🇷" },
    { name: "Arabic", native: "العربية", flag: "🇸🇦" },
    { name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
    { name: "Portuguese", native: "Português", flag: "🇵🇹" }
  ];

  const row2 = [
    { name: "Russian", native: "Русский", flag: "🇷🇺" },
    { name: "Italian", native: "Italiano", flag: "🇮🇹" },
    { name: "Dutch", native: "Nederlands", flag: "🇳🇱" },
    { name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
    { name: "Swedish", native: "Svenska", flag: "🇸🇪" },
    { name: "Polish", native: "Polski", flag: "🇵🇱" },
    { name: "Thai", native: "ไทย", flag: "🇹🇭" },
    { name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
    { name: "Indonesian", native: "Bahasa", flag: "🇮🇩" },
    { name: "Greek", native: "Ελληνικά", flag: "🇬🇷" }
  ];

  const LanguagePill = ({ lang }: { lang: Language }) => (
    <div className="group relative px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-[#00BFA6] hover:bg-[#00BFA6]/10 transition-all duration-300 cursor-pointer flex items-center gap-3 shrink-0 mx-3 transform hover:scale-110">
      <span className="text-2xl">{lang.flag}</span>
      <span className="font-medium text-white group-hover:hidden">{lang.name}</span>
      <span className="font-medium text-[#00BFA6] hidden group-hover:block">{lang.native}</span>
    </div>
  );

  return (
    <section className="py-24 bg-[#0A1628] overflow-hidden border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h2 className="text-3xl font-playfair font-bold">Languages We Speak</h2>
      </div>

      <div className="relative flex flex-col gap-6 transform -rotate-2 scale-105">
        <div className="flex animate-marquee-left whitespace-nowrap pause-on-hover">
          {[...row1, ...row1, ...row1].map((lang, i) => <LanguagePill key={`r1-${i}`} lang={lang} />)}
        </div>
        <div className="flex animate-marquee-right whitespace-nowrap pause-on-hover ml-[-200px]">
          {[...row2, ...row2, ...row2].map((lang, i) => <LanguagePill key={`r2-${i}`} lang={lang} />)}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [formState, setFormState] = useState('idle'); // idle, loading, success, error
  const [focusedInput, setFocusedInput] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('loading');

    // Simulate API call
    setTimeout(() => {
      // Basic validation simulation
      const form = e.currentTarget;
      const formData = new FormData(form);
      const name = String(formData.get('name') ?? '').trim();
      const email = String(formData.get('email') ?? '').trim();
      if (!name || !email) {
        setFormState('error');
        setTimeout(() => setFormState('idle'), 800);
      } else {
        setFormState('success');
        form.reset();
        setTimeout(() => setFormState('idle'), 3000);
      }
    }, 1500);
  };

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  };

  return (
    <section id="contact" className="py-24 relative z-10 bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">

        {/* Left: Info */}
        <div>
          <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">Ready to go <span className="text-[#FFD166]">global?</span></h2>
          <p className="text-gray-400 mb-10 text-lg leading-relaxed">
            Contact us today for a free quote or to discuss how we can help break down language barriers for your business.
          </p>

          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-[#1E3A5F] flex items-center justify-center group-hover:bg-[#00BFA6] transition-colors">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email Us</p>
                <p className="font-medium">hello@linguabridge.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-[#1E3A5F] flex items-center justify-center group-hover:bg-[#00BFA6] transition-colors">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Call Us</p>
                <p className="font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-[#1E3A5F] flex items-center justify-center group-hover:bg-[#00BFA6] transition-colors">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Headquarters</p>
                <p className="font-medium">New York, USA (Serving Worldwide)</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#00BFA6] hover:border-[#00BFA6] hover:-translate-y-1 transition-all">
                <Icon className="w-4 h-4 text-white" />
              </a>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-sm relative overflow-hidden">
          {formState === 'success' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A1628]/95 backdrop-blur-md z-20"
            >
              <div className="w-20 h-20 bg-[#00BFA6]/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#00BFA6]" />
              </div>
              <h3 className="text-2xl font-playfair font-bold mb-2">Message Sent!</h3>
              <p className="text-gray-400">We&apos;ll get back to you shortly.</p>
            </motion.div>
          ) : null}

          <motion.form
            onSubmit={handleSubmit}
            animate={formState === 'error' ? shakeAnimation : {}}
          >
            <InputWrapper name="name" label="Full Name" focusedInput={focusedInput} setFocusedInput={setFocusedInput} />
            <InputWrapper name="email" label="Email Address" type="email" focusedInput={focusedInput} setFocusedInput={setFocusedInput} />

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="relative">
                <select defaultValue="" className="w-full bg-transparent border-b border-white/20 py-3 text-gray-300 focus:outline-none appearance-none focus:border-[#00BFA6] cursor-pointer">
                  <option value="" disabled>Language Pair</option>
                  <option className="bg-[#0A1628] text-white">English → Spanish</option>
                  <option className="bg-[#0A1628] text-white">English → French</option>
                  <option className="bg-[#0A1628] text-white">Spanish → English</option>
                  <option className="bg-[#0A1628] text-white">Multiple / Other</option>
                </select>
                <ArrowDown className="absolute right-0 top-4 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              <div className="relative">
                <select defaultValue="" className="w-full bg-transparent border-b border-white/20 py-3 text-gray-300 focus:outline-none appearance-none focus:border-[#00BFA6] cursor-pointer">
                  <option value="" disabled>Service Type</option>
                  <option className="bg-[#0A1628] text-white">Document</option>
                  <option className="bg-[#0A1628] text-white">Website</option>
                  <option className="bg-[#0A1628] text-white">Certified</option>
                  <option className="bg-[#0A1628] text-white">Interpretation</option>
                </select>
                <ArrowDown className="absolute right-0 top-4 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <InputWrapper name="details" label="Project Details" focusedInput={focusedInput} setFocusedInput={setFocusedInput}>
              <textarea
                name="details"
                id="details"
                rows={3}
                className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#00BFA6] resize-none peer"
                placeholder="Project Details & Requirements..."
              ></textarea>
            </InputWrapper>

            <div className="mb-8 border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#00BFA6]/50 hover:bg-white/5 transition-colors cursor-pointer group">
              <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#00BFA6] mb-2 transition-colors" />
              <p className="text-sm text-gray-300">Drag & drop files here or <span className="text-[#00BFA6]">browse</span></p>
              <p className="text-xs text-gray-500 mt-1">Max file size 50MB</p>
            </div>

            <button
              type="submit"
              disabled={formState === 'loading'}
              className="w-full py-4 bg-gradient-to-r from-[#1E3A5F] to-[#00BFA6] rounded-xl font-bold text-white relative overflow-hidden group flex justify-center items-center"
            >
              {formState === 'loading' ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Send Message</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#050B14] pt-20 pb-8 relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

        {/* Col 1 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-[#00BFA6]" />
            <span className="font-playfair text-xl font-bold tracking-wide">
              Lingua<span className="text-[#00BFA6]">Bridge</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Breaking language barriers and connecting businesses globally through precise, culturally-aware translation services.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-[#00BFA6] transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-[#00BFA6] transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-bold mb-6 text-white">Quick Links</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            {['Home', 'About Us', 'How It Works', 'Pricing', 'Testimonials'].map(link => (
              <li key={link}><a href="#" className="hover:text-[#00BFA6] transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-bold mb-6 text-white">Services</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            {['Document Translation', 'Website Localization', 'Interpretation', 'Media Subtitles', 'Certified Translation'].map(link => (
              <li key={link}><a href="#" className="hover:text-[#00BFA6] transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="font-bold mb-6 text-white">Newsletter</h4>
          <p className="text-sm text-gray-400 mb-4">Subscribe to get translation tips and global business insights.</p>
          <div className="flex bg-white/5 rounded-lg overflow-hidden border border-white/10 focus-within:border-[#00BFA6] transition-colors">
            <input
              type="email"
              placeholder="Email address"
              className="bg-transparent px-4 py-3 w-full text-sm focus:outline-none text-white"
            />
            <button className="bg-[#00BFA6] px-4 py-3 text-[#0A1628] font-bold hover:bg-[#FFD166] transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm">© 2026 LinguaBridge. All rights reserved.</p>
        <div className="flex gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-[#1E3A5F] border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#00BFA6] hover:-translate-y-2 transition-all z-50 group"
      >
        <ArrowDown className="w-5 h-5 rotate-180 group-hover:scale-110 transition-transform" />
      </button>
    </footer>
  );
};

// ==========================================
// 5. MAIN APP ASSEMBLY
// ==========================================
export default function App() {
  return (
    <div className="relative selection:bg-[#00BFA6] selection:text-white font-sans">
      <GlobalStyles />
      <CustomCursor />
      <ScrollProgress />
      <FloatingShapes />

      <Navbar />

      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <Stats />
        <Languages />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}