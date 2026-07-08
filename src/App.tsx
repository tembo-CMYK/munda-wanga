import { useState, useMemo, useEffect, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Volume2,
  Compass,
  BookOpen,
  Sparkles,
  Menu,
  X,
  Heart,
  Info,
  Star,
  Plus,
  TreePine,
  Ticket,
  AlertTriangle,
  QrCode,
  Binoculars,
  Sun,
  Leaf,
  Bird,
  Turtle,
  Fish,
  Squirrel,
  Rabbit,
  PawPrint,
  Sprout
} from 'lucide-react';

import { SPECIES_DATA, FAQ_DATA, TESTIMONIALS_DATA } from './data';
import { Species } from './types';
import TiltCard from './components/TiltCard';
import ParkMap from './components/ParkMap';

// Module-level audio context definitions
let audioCtx: AudioContext | null = null;
let windNode: AudioNode | null = null;
let birdInterval: NodeJS.Timeout | null = null;
let lionInterval: NodeJS.Timeout | null = null;

// Clean browser Web Audio API synthesizer for completely immersive natural sounds!
const startSynthesizer = (type: 'off' | 'canopy' | 'aviary' | 'deep') => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    stopSynthesizer();
    
    if (type === 'off') return;
    
    if (type === 'canopy') {
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 5;
      
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.frequency.value = 0.15;
      oscGain.gain.value = 150;
      
      filter.frequency.value = 350;
      
      osc.connect(oscGain);
      oscGain.connect(filter.frequency);
      
      const windGain = audioCtx.createGain();
      windGain.gain.value = 0.08;
      
      whiteNoise.connect(filter);
      filter.connect(windGain);
      windGain.connect(audioCtx.destination);
      
      whiteNoise.start();
      osc.start();
      
      windNode = whiteNoise;
    }
    
    if (type === 'aviary') {
      const playBirdTrill = () => {
        if (!audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = 1800 + Math.random() * 1200;
        
        const mod = audioCtx.createOscillator();
        const modGain = audioCtx.createGain();
        mod.frequency.value = 15 + Math.random() * 25;
        modGain.gain.value = 180;
        
        mod.connect(modGain);
        modGain.connect(o.frequency);
        
        g.gain.setValueAtTime(0, audioCtx.currentTime);
        g.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35 + Math.random() * 0.4);
        
        o.connect(g);
        g.connect(audioCtx.destination);
        
        o.start();
        mod.start();
        
        o.stop(audioCtx.currentTime + 0.8);
        mod.stop(audioCtx.currentTime + 0.8);
      };
      
      playBirdTrill();
      birdInterval = setInterval(playBirdTrill, 900);
    }
    
    if (type === 'deep') {
      const playRoar = () => {
        if (!audioCtx) return;
        const o1 = audioCtx.createOscillator();
        const o2 = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        
        o1.type = 'sawtooth';
        o1.frequency.value = 75;
        o2.type = 'triangle';
        o2.frequency.value = 77;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 120;
        
        g.gain.setValueAtTime(0, audioCtx.currentTime);
        g.gain.linearRampToValueAtTime(0.09, audioCtx.currentTime + 0.15);
        g.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.6);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);
        
        o1.connect(filter);
        o2.connect(filter);
        filter.connect(g);
        g.connect(audioCtx.destination);
        
        o1.start();
        o2.start();
        
        o1.stop(audioCtx.currentTime + 2.0);
        o2.stop(audioCtx.currentTime + 2.0);
      };
      
      playRoar();
      lionInterval = setInterval(playRoar, 4500);
    }
  } catch (err) {
    console.error("Web Audio API failed: ", err);
  }
};

const stopSynthesizer = () => {
  if (windNode) {
    try { (windNode as any).stop(); } catch(e) {}
    windNode = null;
  }
  if (birdInterval) {
    clearInterval(birdInterval);
    birdInterval = null;
  }
  if (lionInterval) {
    clearInterval(lionInterval);
    lionInterval = null;
  }
};

export default function App() {
  // Loading screen states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [activeIconIdx, setActiveIconIdx] = useState(0);

  const loaderIcons = useMemo(() => [Leaf, Bird, Turtle, Fish, Squirrel, Rabbit, Sprout, PawPrint], []);

  const loadingTexts = useMemo(() => [
    "Awakening botanical canopies...",
    "Syncing wildlife rescue records...",
    "Nurturing rare botanical species...",
    "Calibrating micro-climate sensors...",
    "Welcoming natural serenity..."
  ], []);

  // Sync scroll lock with loading state
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  // Loading screen automatic simulation effect
  useEffect(() => {
    let textInterval: NodeJS.Timeout;
    let iconInterval: NodeJS.Timeout;

    if (isLoading) {
      // Rotate status text every 700ms
      textInterval = setInterval(() => {
        setLoadingTextIdx((prev) => (prev + 1) % 5);
      }, 700);

      // Rotate icons every 640ms for a more calm and polished animated progression
      iconInterval = setInterval(() => {
        setActiveIconIdx((prev) => (prev + 1) % 8);
      }, 640);

      const startTime = Date.now();
      const duration = 2800; // 2.8 seconds modern layout transition duration

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(elapsed / duration, 1);
        
        // Non-linear cubic easing out progression
        const progressVal = Math.floor((1 - Math.pow(1 - ratio, 3)) * 100);
        
        setLoadingProgress(progressVal);

        if (ratio < 1) {
          requestAnimationFrame(updateProgress);
        } else {
          setLoadingProgress(100);
          setTimeout(() => {
            setIsLoading(false);
          }, 450);
        }
      };

      requestAnimationFrame(updateProgress);
    }

    return () => {
      clearInterval(textInterval);
      clearInterval(iconInterval);
    };
  }, [isLoading]);

  // Navigation & Interactive states
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'animals' | 'gardens' | 'stories' | 'faq' | 'map'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'Big-cat moments' | 'Birdlife trails' | 'Easy routes'>('all');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Subpage: About Page helper states
  const [timelineYear, setTimelineYear] = useState<1959 | 1998 | 2012 | 2026>(1959);
  const [selectedPartner, setSelectedPartner] = useState<string>('ZCS');
  const [donationPledge, setDonationPledge] = useState<number>(100);

  // Subpage: Animals Page search state & map pin highlight
  const [animalSearchQuery, setAnimalSearchQuery] = useState('');
  const [activeAnimalHotspot, setActiveAnimalHotspot] = useState<'lagoon' | 'cats' | 'aviary' | null>('lagoon');
  const [vocalSoundPhonetic, setVocalSoundPhonetic] = useState<string | null>(null);

  // Subpage: Gardens Page helper states
  const [activeGardenRoute, setActiveGardenRoute] = useState<'mahogany' | 'cycad' | 'orchid'>('mahogany');
  const [picnicSpotName, setPicnicSpotName] = useState<'lotus' | 'giant' | 'rose'>('lotus');

  // Subpage: Stories list rating filter
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  
  // Immersive "Today's Mood" state
  const [wildMood, setWildMood] = useState<'adventurous' | 'zen' | 'curious' | 'peaceful'>('adventurous');
  const [isPlayingAudioSim, setIsPlayingAudioSim] = useState(false);

  // Synchronize synthetic soundscapes with activeSound state
  const [activeSound, setActiveSound] = useState<'off' | 'canopy' | 'aviary' | 'deep'>('off');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  useEffect(() => {
    if (isPlayingAudioSim) {
      if (wildMood === 'adventurous') setActiveSound('deep');
      else if (wildMood === 'zen') setActiveSound('canopy');
      else if (wildMood === 'peaceful') setActiveSound('canopy');
      else if (wildMood === 'curious') setActiveSound('aviary');
    } else {
      setActiveSound('off');
    }
  }, [isPlayingAudioSim, wildMood]);

  useEffect(() => {
    if (activeSound !== 'off') {
      startSynthesizer(activeSound);
      setIsPlayingAudioSim(true);
    } else {
      stopSynthesizer();
      setIsPlayingAudioSim(false);
    }
    return () => {
      stopSynthesizer();
    };
  }, [activeSound]);

  // Immersive "Bloom Calendar" filter
  const [bloomMonth, setBloomMonth] = useState<'jan-mar' | 'apr-jun' | 'jul-sep' | 'oct-dec'>('apr-jun');

  // Dynamic Hero Slideshow State
  const [heroSlide, setHeroSlide] = useState(0);
  const heroSlides = useMemo(() => [
    {
      url: '/assets/Hero.jpg',
      title: 'Munda Wanga',
      tagline: 'Zambia’s Rescued Animal Sanctuary',
      accent: 'Rescued wildlife encounters'
    },
    {
      url: '/assets/2.jpg',
      title: 'Botanical Paths',
      tagline: 'Deep Within the Garden Canopy',
      accent: '1,000+ botanical species'
    },
    {
      url: '/assets/3.jpg',
      title: 'Lush Sanctuaries',
      tagline: 'A Haven of Healing & Preservation',
      accent: 'Waterways and dense pathways'
    }
  ], []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Gallery Focus Spotlight Modal State
  const [focusedGalleryItem, setFocusedGalleryItem] = useState<{
    id: string;
    url: string;
    name: string;
    title: string;
    location: string;
    description: string;
  } | null>(null);

  // Sanctuary Snapshots - Premium Responsive Automatic/Manual Carousel Slider State
  const [resetKey, setResetKey] = useState(0);
  const [sliderClass, setSliderClass] = useState<'next' | 'prev' | ''>('');
  const [sliderItems, setSliderItems] = useState(() => [
    {
      id: 'elephant',
      url: '/assets/Elephant 3.jpg',
      name: 'ELEPHANT',
      title: 'African Elephant Woodlands',
      location: 'Eastern Forest Trail',
      description: 'Lush, thick-canopied paths where our orphaned bull elephant calf explores and rehabilitates under protective care.'
    },
    {
      id: 'tiger',
      url: '/assets/Tiger.jpg',
      name: 'TIGER',
      title: 'Bengal Tiger Haven',
      location: 'Northern Shaded Caves',
      description: 'An immersive subtropical ecosystem complete with diving lagoons and rocky overhangs mimicking their native habitat.'
    },
    {
      id: 'cheetah',
      url: '/assets/Cheetah.jpg',
      name: 'CHEETAH',
      title: 'Zambian Cheetah Range',
      location: 'Western Savannah Plains',
      description: 'An open, wide-stretching grassland terrain optimized for agile strides, mock hunts, and sunbathing spots.'
    },
    {
      id: 'eagle',
      url: '/assets/Eagle.jpg',
      name: 'EAGLE',
      title: "Verreaux's Raptor Aviary",
      location: 'Cliffside Flight Canopy',
      description: 'A spectacular, double-height high-domed structure letting our rescued black eagles stretch their wings.'
    },
    {
      id: 'zebra',
      url: '/assets/Zebra.jpg',
      name: 'ZEBRA',
      title: 'Plains Zebra Pasture',
      location: 'Central Grasslands',
      description: 'A social, communal environment where zebra herds graze happily alongside native Zambian impalas.'
    },
    {
      id: 'rhino',
      url: '/assets/Rhino.jpg',
      name: 'RHINOCEROS',
      title: 'Black Rhinoceros Walloy',
      location: 'Southern Thornbush Reserve',
      description: 'A secure oasis for our pre-historic giants to cool off in mud marshes and feed on thick shrubs.'
    },
    {
      id: 'glasshouse',
      url: '/assets/Glass House.png',
      name: 'GLASS DOME',
      title: 'Great Glass Botanical Dome',
      location: 'North Greenhouse',
      description: 'An architectural wonder regulating humidity and warmth for highly vulnerable tropical flora.'
    },
    {
      id: 'lotus',
      url: '/assets/pexels-on3sign-33612014.jpg',
      name: 'LOTUS LAGOON',
      title: 'Sacred Water Lotus Lagoons',
      location: 'Central Water Garden',
      description: 'Floating pads of pristine lotus flowers revealing pink and ivory petals as the sun rises over the reserve.'
    }
  ]);

  const handleItemClick = useCallback((itemId: string, index: number) => {
    if (index === 1) {
      const activeItem = sliderItems.find(item => item.id === itemId);
      if (activeItem) {
        setFocusedGalleryItem(activeItem);
      }
      return;
    }
    
    setSliderClass(index > 1 ? 'next' : 'prev');
    setSliderItems(prev => {
      const idx = prev.findIndex(item => item.id === itemId);
      if (idx === -1 || idx === 1) return prev;
      
      const newItems = [...prev];
      if (idx === 0) {
        const last = newItems.pop()!;
        newItems.unshift(last);
      } else {
        const rotateCount = idx - 1;
        for (let i = 0; i < rotateCount; i++) {
          const first = newItems.shift()!;
          newItems.push(first);
        }
      }
      return newItems;
    });
    setResetKey(prev => prev + 1);

    const tid = setTimeout(() => {
      setSliderClass('');
    }, 1000);
    return () => clearTimeout(tid);
  }, [sliderItems, setFocusedGalleryItem]);

  const handleNextSlider = useCallback(() => {
    setSliderClass('next');
    setSliderItems(prev => {
      const nextArr = [...prev];
      const first = nextArr.shift()!;
      nextArr.push(first);
      return nextArr;
    });
    setResetKey(prev => prev + 1);
    
    const tid = setTimeout(() => {
      setSliderClass('');
    }, 1000);
    return () => clearTimeout(tid);
  }, []);

  const handlePrevSlider = useCallback(() => {
    setSliderClass('prev');
    setSliderItems(prev => {
      const nextArr = [...prev];
      const last = nextArr.pop()!;
      nextArr.unshift(last);
      return nextArr;
    });
    setResetKey(prev => prev + 1);

    const tid = setTimeout(() => {
      setSliderClass('');
    }, 1000);
    return () => clearTimeout(tid);
  }, []);

  const jumpToSliderItem = useCallback((itemId: string) => {
    setSliderItems(prev => {
      const idx = prev.findIndex(item => item.id === itemId);
      if (idx === -1) return prev;
      const rotateCount = (idx - 1 + prev.length) % prev.length;
      if (rotateCount === 0) return prev;
      return [...prev.slice(rotateCount), ...prev.slice(0, rotateCount)];
    });
    setResetKey(prev => prev + 1);
  }, []);

  // 7000ms Auto Advance Timeline matching system design
  useEffect(() => {
    const autoTimer = setInterval(() => {
      handleNextSlider();
    }, 7000);
    return () => clearInterval(autoTimer);
  }, [handleNextSlider, resetKey]);

  // Gallery Focused Mode Keyboard & Navigation Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFocusedGalleryItem(null);
      }
    };
    if (focusedGalleryItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedGalleryItem]);

  const handlePrevFocused = useCallback(() => {
    if (!focusedGalleryItem) return;
    const idx = sliderItems.findIndex(item => item.id === focusedGalleryItem.id);
    if (idx !== -1) {
      const prevIdx = (idx - 1 + sliderItems.length) % sliderItems.length;
      setFocusedGalleryItem(sliderItems[prevIdx]);
    }
  }, [focusedGalleryItem, sliderItems]);

  const handleNextFocused = useCallback(() => {
    if (!focusedGalleryItem) return;
    const idx = sliderItems.findIndex(item => item.id === focusedGalleryItem.id);
    if (idx !== -1) {
      const nextIdx = (idx + 1) % sliderItems.length;
      setFocusedGalleryItem(sliderItems[nextIdx]);
    }
  }, [focusedGalleryItem, sliderItems]);

  // Live Testimonials Local State
  const [stories, setStories] = useState(TESTIMONIALS_DATA);
  const [newAuthor, setNewAuthor] = useState('');
  const [newText, setNewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newLocation, setNewLocation] = useState('Lusaka');
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  const [storySuccessMsg, setStorySuccessMsg] = useState('');

  // Selected Animal Detail Drawer State
  const [selectedAnimal, setSelectedAnimal] = useState<Species | null>(null);

  // "Plan Your Visit" Pass Generator Modal State
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [visitDate, setVisitDate] = useState('');
  const [residency, setResidency] = useState<'local' | 'international'>('local');
  const [isPassGenerated, setIsPassGenerated] = useState(false);

  // Newsletter submission state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubbed, setNewsletterSubbed] = useState(false);

  // Filter animals based on active tab
  const filteredSpecies = useMemo(() => {
    if (activeTab === 'all') return SPECIES_DATA;
    return SPECIES_DATA.filter(item => item.tag === activeTab);
  }, [activeTab]);

  // Calculate Admission Fees
  // Local pricing: Adults K50, Kids K25
  // International pricing: Adults $15 (K360), Kids $8 (K190)
  const calculatedTotal = useMemo(() => {
    const adultRate = residency === 'local' ? 50 : 360;
    const childRate = residency === 'local' ? 25 : 190;
    const subtotal = (adultCount * adultRate) + (childCount * childRate);
    
    // Provide a 10% group discount for parties of 5+ total participants
    const totalPeople = adultCount + childCount;
    if (totalPeople >= 5) {
      return {
        subtotal,
        discount: Math.round(subtotal * 0.1),
        total: Math.round(subtotal * 0.9)
      };
    }
    return {
      subtotal,
      discount: 0,
      total: subtotal
    };
  }, [adultCount, childCount, residency]);

  const handleSubmittingStory = (e: FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newText.trim()) return;

    setIsSubmittingStory(true);
    setTimeout(() => {
      const addedStory = {
        id: `t-${Date.now()}`,
        name: newAuthor,
        text: newText,
        location: newLocation || 'Zambia',
        time: 'Just now',
        avatar: 'https://framerusercontent.com/images/sPKYEgghSjneqajxkQkonxXIHHg.jpg'
      };

      setStories([addedStory, ...stories]);
      setNewAuthor('');
      setNewText('');
      setNewRating(5);
      setNewLocation('Lusaka');
      setIsSubmittingStory(false);
      setStorySuccessMsg('Thank you! Your story is now part of the pack.');
      setTimeout(() => setStorySuccessMsg(''), 5000);
    }, 800);
  };

  const handleNewsletterJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubbed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 2000);
  };

  const toggleFaq = (id: string) => {
    setOpenFaq(prev => (prev === id ? null : id));
  };

  // Helper config for different moods in Today's Mood widget
  const moodConfig = {
    adventurous: {
      color: 'bg-[#ffd662]/20 border-[#ffd662]/40 text-[#ffd662]',
      heading: 'Follow the Call of the Wild',
      advice: 'The big cats are active and walking the perimeter. Recommended stop: High Lion Lookout.',
      spotlight: 'Lions',
      accentText: 'text-[#ffd662]',
      glow: 'shadow-[0_0_20px_rgba(253,214,98,0.15)]'
    },
    zen: {
      color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      heading: 'Calm Sanctuary & Green Trails',
      advice: 'Breathe deep under the giant Mahogany trees. The orchid flower pathways are clear of mist.',
      spotlight: 'Greenhouses',
      accentText: 'text-emerald-300',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
    },
    curious: {
      color: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
      heading: 'Wildlife Discoveries & Calls',
      advice: 'Spot rescued Grey Parrot dialogues and the elusive pangolin sanctuary. Keep those ears ready.',
      spotlight: 'Parrots Aviary',
      accentText: 'text-sky-300',
      glow: 'shadow-[0_0_20px_rgba(14,165,233,0.15)]'
    },
    peaceful: {
      color: 'bg-[#6db466]/20 border-[#6db466]/40 text-[#acffa3]',
      heading: 'Picnics & Gentle Breezes',
      advice: 'Find absolute serenity at the lagoon shore. The weekend soundscapes are calming.',
      spotlight: 'Lotus Pond',
      accentText: 'text-[#acffa3]',
      glow: 'shadow-[0_0_20px_rgba(109,180,102,0.15)]'
    }
  };

  return (
    <div className="min-h-screen selection:bg-[#388653] selection:text-white bg-[#f2e9d8] text-[#162625] relative font-sans">
      
      {/* IMMERSIVE BOTANICAL LOADING INTRO SCREEN */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="botanical-loader"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              y: '-100vh',
              scale: 0.98,
              transition: { 
                duration: 0.9, 
                ease: [0.16, 1, 0.3, 1],
                when: "beforeChildren"
              }
            }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-tr from-[#0b1615] via-[#112422] to-[#07100f] text-[#f2e9d8] overflow-hidden select-none"
          >
            {/* Ambient forest sun flare glows */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15],
                x: [0, 30, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -left-12 w-[450px] h-[450px] bg-[#388653]/15 rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.2, 0.1],
                x: [0, -40, 0],
                y: [0, 40, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-[#ffd662]/10 rounded-full blur-[140px] pointer-events-none"
            />

            {/* Subtle atmospheric rain-forest humidity specks */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
            
            <div className="relative flex flex-col items-center z-10 px-6 max-w-md w-full">
              
              {/* Dynamic Canopy Logo & Progress Circle */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Spinning decorative frame outer track */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-white/5"
                />

                {/* Rotating accent nodes */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-1 flex justify-between items-center pointer-events-none"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#acffa3]/80 shadow-[0_0_8px_#acffa3]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffd662]/80 shadow-[0_0_8px_#ffd662]" />
                </motion.div>

                {/* Main Progress Ring Arc */}
                <svg className="w-32 h-32 text-[#ffd662] drop-shadow-[0_0_12px_rgba(255,214,98,0.2)]" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="rgba(255, 255, 255, 0.04)"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="url(#loaderGradient)"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray="276.4"
                    strokeDashoffset={276.4 - (276.4 * loadingProgress) / 100}
                    className="transform -rotate-90 origin-center transition-all duration-200 ease-out"
                  />
                  <defs>
                    <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#388653" />
                      <stop offset="50%" stopColor="#ffd662" />
                      <stop offset="100%" stopColor="#acffa3" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Pulse Leaf & Sparkles Indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.25, 1],
                      filter: [
                        'drop-shadow(0 0 10px rgba(172,255,163,0.4))',
                        'drop-shadow(0 0 28px rgba(172,255,163,0.8))',
                        'drop-shadow(0 0 10px rgba(172,255,163,0.4))'
                      ]
                    }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-[#162625]/80 backdrop-blur-md p-5 rounded-full border border-white/10 shadow-lg flex items-center justify-center w-20 h-20"
                  >
                    {(() => {
                      const ActiveIconComp = loaderIcons[activeIconIdx];
                      return (
                        <AnimatePresence mode="popLayout">
                          <motion.div
                            key={activeIconIdx}
                            initial={{ scale: 0.7, opacity: 0, rotate: -30 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.7, opacity: 0, rotate: 30 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                          >
                            <ActiveIconComp className="w-9 h-9 text-[#acffa3]" />
                          </motion.div>
                        </AnimatePresence>
                      );
                    })()}
                  </motion.div>
                </div>

                {/* Little orbital star particles */}
                <motion.div 
                  className="absolute -top-1 text-[#ffd662]"
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER / NAVIGATION BAR */}
      <motion.nav 
        initial={{ y: -25, opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ y: 0, opacity: 1, backdropFilter: 'blur(24px)' }}
        transition={{ delay: 0.1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        id="header-nav" 
        className="sticky top-4 z-50 mx-auto max-w-6xl w-[calc(100%-2rem)] backdrop-blur-xl bg-[#162625]/45 border border-white/10 py-1.5 px-4 md:px-6 rounded-full shadow-2xl transition-all uppercase text-[10px] tracking-[0.25em] font-medium text-white flex items-center justify-between"
      >
        <div className="w-full relative px-1 md:px-2">
          {/* Main Desktop Grid for Balanced Symmetrical Visual */}
          <div className="hidden md:grid grid-cols-12 items-center w-full">
            {/* Left Wing Navigation */}
            <div className="col-span-5 flex items-center gap-6 md:gap-8 justify-start">
              <button 
                onClick={() => setCurrentPage('about')} 
                className={`hover:text-[#ffd662] transition-colors font-semibold cursor-pointer ${currentPage === 'about' ? 'text-[#ffd662] font-extrabold border-b-2 border-[#ffd662] pb-1' : 'text-white/80'}`}
              >
                About
              </button>
              <button 
                onClick={() => setCurrentPage('animals')} 
                className={`hover:text-[#ffd662] transition-colors font-semibold cursor-pointer ${currentPage === 'animals' ? 'text-[#ffd662] font-extrabold border-b-2 border-[#ffd662] pb-1' : 'text-white/80'}`}
              >
                Animals
              </button>
              <button 
                onClick={() => setCurrentPage('gardens')} 
                className={`hover:text-[#ffd662] transition-colors font-semibold cursor-pointer ${currentPage === 'gardens' ? 'text-[#ffd662] font-extrabold border-b-2 border-[#ffd662] pb-1' : 'text-white/80'}`}
              >
                Gardens
              </button>
              <button 
                onClick={() => setCurrentPage('map')} 
                className={`hover:text-[#ffd662] transition-colors font-semibold cursor-pointer ${currentPage === 'map' ? 'text-[#ffd662] font-extrabold border-b-2 border-[#ffd662] pb-1' : 'text-white/80'}`}
              >
                Park Map
              </button>
            </div>

            {/* Central Symmetrical Logo Anchor */}
            <div className="col-span-2 flex justify-center items-center">
              <button 
                onClick={() => setCurrentPage('home')} 
                className="flex items-center gap-1 group cursor-pointer focus:outline-none"
              >
                <img 
                  src="/assets/Logo.png" 
                  className="h-10 md:h-11 w-auto object-contain filter brightness-0 invert group-hover:scale-110 transition-transform duration-300" 
                  alt="Munda Wanga Logo" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </button>
            </div>

            {/* Right Wing Navigation & Frosted Action */}
            <div className="col-span-5 flex items-center gap-6 md:gap-8 justify-end">
              <button 
                onClick={() => setCurrentPage('stories')} 
                className={`hover:text-[#ffd662] transition-colors font-semibold cursor-pointer ${currentPage === 'stories' ? 'text-[#ffd662] font-extrabold border-b-2 border-[#ffd662] pb-1' : 'text-white/80'}`}
              >
                Stories
              </button>
              <button 
                onClick={() => setCurrentPage('faq')} 
                className={`hover:text-[#ffd662] transition-colors font-semibold cursor-pointer ${currentPage === 'faq' ? 'text-[#ffd662] font-extrabold border-b-2 border-[#ffd662] pb-1' : 'text-white/80'}`}
              >
                FAQ
              </button>
              <button
                onClick={() => {
                  setIsPassModalOpen(true);
                  setIsPassGenerated(false);
                }}
                className="backdrop-blur-md bg-white/10 hover:bg-[#ffd662] hover:text-[#162625] border border-white/20 hover:border-[#ffd662] text-white px-5 py-1.5 rounded-full cursor-pointer transition-all font-semibold uppercase text-[9px] tracking-[0.2em] shadow-sm transform hover:scale-102 active:scale-95"
              >
                Plan Visit
              </button>
            </div>
          </div>

          {/* Mobile Navigation Layout */}
          <div className="flex md:hidden justify-between items-center w-full py-1">
            <button 
              onClick={() => setCurrentPage('home')} 
              className="flex items-center gap-1 cursor-pointer focus:outline-none"
            >
              <img 
                src="/assets/Logo.png" 
                className="h-9 w-auto object-contain filter brightness-0 invert" 
                alt="Munda Wanga Logo" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </button>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-[#ffd662] p-1.5 rounded-xl focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 mt-3 md:hidden bg-[#162625]/95 backdrop-blur-xl border border-white/10 px-5 py-5 rounded-[2rem] shadow-2xl space-y-3 z-50 pointer-events-auto"
            >
              <div className="flex flex-col gap-4 text-xs text-left">
                {[
                  { page: 'about', label: 'About', desc: 'Our History & Mission since 1959' },
                  { page: 'animals', label: 'Animals', desc: 'Rescued wildlife & conservation habitats' },
                  { page: 'gardens', label: 'Gardens', desc: 'Over 1000 exotic floral species' },
                  { page: 'map', label: 'Park Map', desc: 'Interactive 3D guide & wildlife tracker' },
                  { page: 'stories', label: 'Stories', desc: 'Unedited visitor logs & ratings' },
                  { page: 'faq', label: 'FAQ', desc: 'Find directions, hours, pass details' }
                ].map((item) => (
                  <button 
                    key={item.page}
                    onClick={() => {
                      setCurrentPage(item.page as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col justify-center items-start w-full px-6 py-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 min-h-[64px] ${
                      currentPage === item.page 
                        ? 'bg-[#388653]/30 border-[#acffa3] text-[#acffa3]' 
                        : 'bg-white/5 border-white/5 text-white/95 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-black uppercase tracking-widest text-xs">{item.label}</span>
                    <span className="text-xs font-sans font-medium text-white/60 tracking-normal mt-1">{item.desc}</span>
                  </button>
                ))}
                
                <hr className="border-white/10 my-2" />

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsPassModalOpen(true);
                    setIsPassGenerated(false);
                  }}
                  className="bg-[#ffd662] hover:bg-[#ffe082] text-[#162625] w-full py-4.5 rounded-2xl flex justify-center items-center gap-2.5 font-bold transition-all text-xs uppercase tracking-widest cursor-pointer shadow-xl active:scale-[0.98] min-h-[52px]"
                >
                  <Ticket className="w-5 h-5 flex-shrink-0" />
                  <span>PLAN YOUR VISIT</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {currentPage === 'home' ? (
        <>
          {/* HERO SECTION */}
          <header className="relative w-full overflow-hidden -mt-[82px] pt-[82px]">
        
        {/* Hero Background Image with Premium Luxury Reveal Animation & Autoplaying Cycles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img 
              key={heroSlide}
              initial={{ scale: 1.08, filter: 'blur(8px)', opacity: 0 }}
              animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              src={heroSlides[heroSlide].url} 
              alt="Munda Wanga Sanctuary Landscape Slideshow" 
              className="absolute inset-0 w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          {/* Subtle luxurious dark protective wash gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-[#f2e9d8]/5 z-[1]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* Left Columns - Text content with Premium Luxury Entrance Animations */}
        <div className="lg:col-span-7 space-y-8 relative z-10 text-left">
          
          {/* Symmetrical Frosted Glass Pill Tags */}
          <motion.div 
            initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.3, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-3 items-center relative z-10"
          >
            <div className="inline-flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 py-1.5 px-3.5 rounded-full text-white font-mono text-[10px] uppercase font-bold tracking-widest leading-none">
              <Sun className="w-3.5 h-3.5 animate-spin-slow text-[#ffd662]" />
              <span>Open-air adventures daily</span>
            </div>
            <div className="inline-flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 py-1.5 px-3.5 rounded-full text-white font-mono text-[10px] uppercase font-bold tracking-widest leading-none">
              <Leaf className="w-3.5 h-3.5 text-[#ffd662]" />
              <span>Gardens, trails and wildlife</span>
            </div>
          </motion.div>

          {/* Headline & Subheadline */}
          <div className="space-y-3">
            <motion.h1 
              initial={{ opacity: 0, y: 30, filter: 'blur(12px)', scale: 0.98 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              transition={{ delay: 0.5, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-8xl font-display font-extrabold text-[#f2e9d8] leading-[0.9] tracking-tighter"
            >
              Munda Wanga
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.7, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl sm:text-2xl font-sans font-medium text-white/90 leading-snug tracking-wide"
            >
              Explore Zambia’s Wild Heart
            </motion.p>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.9, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm text-[#f2e9d8]/85 max-w-lg leading-relaxed font-sans"
          >
            Follow the calls, spot something new, then cool off under the garden canopy. Our botanical trails connect you seamlessly with Zambia's most treasured rescued animal haven.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <button
              onClick={() => {
                setIsPassModalOpen(true);
                setIsPassGenerated(false);
              }}
              className="bg-[#ffd662] hover:bg-[#ffe082] text-[#162625] px-8 py-4 rounded-full font-semibold transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>Plan your visit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <a
              href="#animals"
              className="backdrop-blur-md bg-white/5 hover:bg-white/15 border border-white/20 hover:border-[#ffd662]/60 text-white hover:text-[#ffd662] px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]"
            >
              <span>Explore wildlife</span>
            </a>
          </motion.div>

          {/* Custom Luxury Navigation Dots for Hero Slideshow */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.25, duration: 1 }}
            className="flex flex-wrap items-center gap-4 pt-2 z-10 relative"
          >
            {heroSlides.map((slide, sIdx) => (
              <button 
                key={sIdx}
                onClick={() => setHeroSlide(sIdx)}
                className="group flex items-center gap-2 text-left focus:outline-none cursor-pointer"
              >
                <div className="relative h-1.5 rounded-full bg-white/30 overflow-hidden w-12 transition-all group-hover:bg-white/50">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#ffd662] transition-all duration-500 ease-out" 
                    style={{ width: heroSlide === sIdx ? '100%' : '0%' }}
                  />
                </div>
                {heroSlide === sIdx && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ffd662] md:inline hidden">
                    {slide.accent}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 1.5 }}
            className="pt-8 border-t border-[#f2e9d8]/10 space-y-4"
          >
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#f2e9d8]/50 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd662]" />
              <span>Recognized sanctuary &amp; botanical reserve partners</span>
            </p>
            <div className="flex flex-wrap gap-4 items-center opacity-80 invert brightness-200 grayscale hover:grayscale-0 transition-all">
              <img src="https://framerusercontent.com/images/JyMhoMvxJwryhBzzU4slNwHBKg.png" className="h-6 object-contain" alt="Partner insignia" referrerPolicy="no-referrer" />
              <img src="https://framerusercontent.com/images/W1b9AIlect4CuPMLUNgJIkHHso.png" className="h-6 object-contain" alt="Wildlife association" referrerPolicy="no-referrer" />
              <img src="https://framerusercontent.com/images/CmjVgrjqNpBghD69iNPh7aoFd5Q.png" className="h-6 object-contain" alt="Rescue council" referrerPolicy="no-referrer" />
              <img src="https://framerusercontent.com/images/i4Lyi0U4cpwdVgIgYFFsvIy7Q.png" className="h-6 object-contain" alt="Education badge" referrerPolicy="no-referrer" />
            </div>
          </motion.div>
        </div>

        {/* Right Columns - Hovering Frosted glass Today's Mood Card with Elegant Slide-in Animation */}
        <div className="lg:col-span-5 relative z-10 w-full flex items-center justify-center">

          {/* Sizing block to hold container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 35, filter: 'blur(15px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.7, duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative z-10 flex flex-col justify-end p-4"
          >
            
            {/* The Floating 'Today's Mood' Card: A dark, muted, semi-transparent forest green container with heavily rounded corners and significant backdrop blur */}
            <div className="backdrop-blur-xl bg-[#162625]/85 border border-white/15 rounded-[32px] p-6 sm:p-7 space-y-5 shadow-[0_16px_45px_rgba(0,0,0,0.55)] transition-all">
              
              {/* Header Info with Binoculars Icon */}
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div className="flex items-center gap-1.5 animate-pulse-slow">
                  <span className="p-2 rounded-xl bg-white/10 flex items-center justify-center">
                    <Binoculars className="w-5 h-5 text-[#ffd662]" />
                  </span>
                  <div>
                    <span className="text-xs font-mono tracking-[0.2em] text-[#ffd662] uppercase font-bold">
                      Today's Mood
                    </span>
                  </div>
                </div>
                {/* Active Indicator pulsing blink */}
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              {/* Text */}
              <p className="text-[#f2e9d8]/95 font-sans font-medium text-sm sm:text-base leading-relaxed text-left">
                Follow the calls, spot something new, then cool off under the garden canopy.
              </p>

              {/* Interactive Selector Buttons inside the Floating Card so the mood feature remains functional! */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {(['adventurous', 'zen', 'curious', 'peaceful'] as const).map(mood => (
                  <button
                    key={mood}
                    onClick={() => setWildMood(mood)}
                    className={`py-3 px-2.5 rounded-2xl text-xs font-mono uppercase tracking-wider border transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center ${
                      wildMood === mood
                        ? 'bg-[#388653] border-[#acffa3]/40 text-[#f2e9d8] font-extrabold shadow-md scale-102 font-bold'
                        : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 active:scale-98'
                    }`}
                  >
                    {mood === 'adventurous' && '🐆 Active'}
                    {mood === 'zen' && '🌿 Calm'}
                    {mood === 'curious' && '🦜 Vocal'}
                    {mood === 'peaceful' && '🪷 Rest'}
                  </button>
                ))}
              </div>

              {/* Dynamic Mood Description displaying in the card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={wildMood}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className={`p-4 rounded-2xl border ${moodConfig[wildMood].color} ${moodConfig[wildMood].glow} mt-2 text-left`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 mb-2 border-b border-white/5 pb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/85">{moodConfig[wildMood].heading}</span>
                    <span className={`font-extrabold uppercase tracking-wide text-xs ${moodConfig[wildMood].accentText}`}>
                      {moodConfig[wildMood].spotlight}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-sans">
                    {moodConfig[wildMood].advice}
                  </p>
                </motion.div>
              </AnimatePresence>

            </div>
          </motion.div>
        </div>

        </div>
      </header>

      {/* MID-BANNER TEXT DECAL */}
      <motion.section 
        initial={{ opacity: 0, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#cbe380] py-4.5 text-[#162625] overflow-hidden whitespace-nowrap font-mono text-[10px] sm:text-[11px] uppercase font-extrabold tracking-[0.25em] border-y border-[#162625]/10 shadow-sm"
      >
        <div className="animate-ticker-slow flex gap-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-12 items-center flex-shrink-0">
              <span className="flex items-center gap-3">🦛 RESCUED WILDLIFE HABITAT</span>
              <span className="text-emerald-800/60 font-semibold text-lg">•</span>
              <span className="flex items-center gap-3">🌿 OVER 1,000 EXOTIC FLORA SPECIES</span>
              <span className="text-emerald-800/60 font-semibold text-lg">•</span>
              <span className="flex items-center gap-3">🎓 40,000+ NATURE CLASSROOMS ANNUALLY</span>
              <span className="text-emerald-800/60 font-semibold text-lg">•</span>
              <span className="flex items-center gap-3">🐆 REHABILITATION &amp; PROTECTION SANCTUARY</span>
              <span className="text-emerald-800/60 font-semibold text-lg">•</span>
              <span className="flex items-center gap-3">🦜 BREATHTAKING VIBRANT AVIARIES</span>
              <span className="text-emerald-800/60 font-semibold text-lg">•</span>
              <span className="flex items-center gap-3">🗺️ EXQUISITE CONSERVATION HERITAGE</span>
              <span className="text-emerald-800/60 font-semibold text-lg">•</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SECTION: GUARDIANS OF THE WILD (WILDLIFE SANCTUARY) */}
      <section id="animals" className="py-20 md:py-28 max-w-7xl mx-auto px-6 space-y-16 overflow-hidden">
        
        {/* Title Header */}
        <motion.div 
          initial={{ opacity: 0, y: 35, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end"
        >
          <div className="space-y-4">
            <span className="text-[#388653] font-mono text-xs uppercase font-bold tracking-widest block">
              Guardians of the Wild
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-[#162625] tracking-tight leading-none">
              A Safe Haven <br />
              <span className="font-light text-[#162625]/70">For Rescued Fauna</span>
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-[#162625]/85 leading-relaxed font-sans font-medium">
              Zambia's premier rescue sanctuary and botanical reserve. Home to protected big cats, wild primates, and rare avian flocks, Munda Wanga is dedicated to rescuing regional fauna, healing ecosystems, and cultivating active conservation.
            </p>
            <p className="text-xs text-[#162625]/60 leading-relaxed font-sans">
              Experience majestic species, feel Zambia’s quiet pulse, and engage with live efforts to release ambassadors safely back into the wild.
            </p>
          </div>
        </motion.div>

        {/* Filter Tab Chips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap gap-2.5 pb-2 border-b border-[#162625]/10"
        >
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-5 rounded-full text-xs font-semibold tracking-wider transition-all uppercase ${
              activeTab === 'all'
                ? 'bg-[#162625] text-[#f2e9d8] shadow-sm'
                : 'hover:bg-[#162625]/5 text-[#162625]/65'
            }`}
          >
            All Wildlife
          </button>
          <button
            onClick={() => setActiveTab('Big-cat moments')}
            className={`py-2 px-5 rounded-full text-xs font-semibold tracking-wider transition-all uppercase flex items-center gap-1.5 ${
              activeTab === 'Big-cat moments'
                ? 'bg-[#162625] text-[#f2e9d8] shadow-sm'
                : 'hover:bg-[#162625]/5 text-[#162625]/65'
            }`}
          >
            🐆 Big-cat moments
          </button>
          <button
            onClick={() => setActiveTab('Birdlife trails')}
            className={`py-2 px-5 rounded-full text-xs font-semibold tracking-wider transition-all uppercase flex items-center gap-1.5 ${
              activeTab === 'Birdlife trails'
                ? 'bg-[#162625] text-[#f2e9d8] shadow-sm'
                : 'hover:bg-[#162625]/5 text-[#162625]/65'
            }`}
          >
            🦜 Birdlife trails
          </button>
          <button
            onClick={() => setActiveTab('Easy routes')}
            className={`py-2 px-5 rounded-full text-xs font-semibold tracking-wider transition-all uppercase flex items-center gap-1.5 ${
              activeTab === 'Easy routes'
                ? 'bg-[#162625] text-[#f2e9d8] shadow-sm'
                : 'hover:bg-[#162625]/5 text-[#162625]/65'
            }`}
          >
            🦌 Easy routes
          </button>
        </motion.div>

        {/* Animal Species Grid list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredSpecies.map((animal, idx) => (
              <motion.div
                layout
                key={animal.id}
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.15 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.8, 
                  delay: Math.min(idx * 0.1, 0.3),
                  ease: [0.16, 1, 0.3, 1] 
                }}
              >
                <TiltCard animal={animal} setSelectedAnimal={setSelectedAnimal} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
 
      </section>

      {/* SECTION: CONVERSION-FOCUS ADMISSION CONSTRUCTOR */}
      <section className="bg-[#162625] text-[#f2e9d8] py-16 md:py-24 relative overflow-hidden border-t border-white/5">
        {/* Decorative ambient glowing backdrops with low intensity */}
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-[#388653]/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-[#ffd662]/5 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-12 xl:col-span-5 space-y-6 text-left">
            <span className="text-[#acffa3] font-mono text-[10px] uppercase font-bold tracking-widest block bg-[#388653]/20 py-1.5 px-3.5 rounded-full w-fit">
              Secure admissions
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight leading-none text-white">
              Instant Pass <br />
              <span className="font-light text-[#acffa3]">Rates &amp; Planner</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#f2e9d8]/80 leading-relaxed font-sans mt-2">
              Evaluate admissions, coordinate date parameters, and instantly generate virtual entries. No credit card required — payments are made safely at the main gate.
            </p>
            
            <div className="pt-4 border-t border-white/10 space-y-3 font-mono text-[11px] text-[#f2e9d8]/75">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#acffa3] animate-pulse" />
                <span>10% Group discount automatically applied for 5+ visitors</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffd662] animate-pulse" />
                <span>Passes remain valid for 30 days after selected date</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-7 bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-6 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Residency toggler */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/50 tracking-widest block">Visitor Residency</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResidency('local')}
                    className={`py-3 px-2 rounded-xl text-center text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                      residency === 'local' 
                        ? 'bg-[#ffd662] text-[#162625] font-extrabold active:scale-98 shadow font-sans' 
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 font-sans font-medium'
                    }`}
                  >
                    ZM Visitor
                  </button>
                  <button
                    onClick={() => setResidency('international')}
                    className={`py-3 px-2 rounded-xl text-center text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                      residency === 'international' 
                        ? 'bg-[#ffd662] text-[#162625] font-extrabold active:scale-98 shadow font-sans' 
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 font-sans font-medium'
                    }`}
                  >
                    International
                  </button>
                </div>
              </div>

              {/* Target Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/50 tracking-widest block">Select Visit Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 focus:border-[#acffa3] focus:bg-white/20 p-3 rounded-xl focus:outline-none font-sans text-xs text-white"
                />
              </div>

            </div>

            {/* Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Adults */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-white/45 tracking-widest block">Adults (12+ yrs)</span>
                  <span className="text-sm font-sans font-extrabold text-white">K{residency === 'local' ? '50' : '360'}/ea</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdultCount(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold font-mono transition-colors hover:bg-white/20 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-white min-w-[20px] text-center">{adultCount}</span>
                  <button
                    onClick={() => setAdultCount(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold font-mono transition-colors hover:bg-white/20 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Kids */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-white/45 tracking-widest block">Children (&lt;12 yrs)</span>
                  <span className="text-sm font-sans font-extrabold text-white">K{residency === 'local' ? '25' : '190'}/ea</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildCount(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold font-mono transition-colors hover:bg-white/20 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-white min-w-[20px] text-center">{childCount}</span>
                  <button
                    onClick={() => setChildCount(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold font-mono transition-colors hover:bg-white/20 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Summary live pricing */}
            <div className="p-4.5 rounded-2xl bg-black/35 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase text-white/60 tracking-widest">Live admissions estimation</span>
                <div className="flex items-baseline gap-1.5">
                  <h4 className="text-2xl font-sans font-black text-[#ffd662]">
                    {residency === 'local' ? `K${calculatedTotal.total}` : `$${Math.round(calculatedTotal.total / 24)}`}
                  </h4>
                  {calculatedTotal.discount > 0 && (
                    <span className="text-[10px] text-[#acffa3] font-mono uppercase tracking-wider font-bold">
                      Saved 10%
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (!visitDate) {
                    triggerToast("Please choose a planned visit date first!");
                    return;
                  }
                  setIsPassModalOpen(true);
                  setIsPassGenerated(true);
                  triggerToast("Custom entry pass constructed with real-time rate validation code!");
                }}
                className="w-full sm:w-auto py-3.5 px-7 bg-[#388653] hover:bg-[#388653]/90 text-white font-mono uppercase tracking-widest text-xs font-bold rounded-xl transition-all shadow hover:scale-102 cursor-pointer flex items-center justify-center gap-2 font-sans"
              >
                <QrCode className="w-4.5 h-4.5" />
                <span>GENERATE PASSPORT</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION: GARDENS OF A THOUSAND SPECIES */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 1.2 }}
        id="gardens" 
        className="relative bg-[#f2e9d8] text-[#162625] py-24 md:py-32 overflow-hidden border-t border-[#162625]/5"
      >
        
        {/* Floating dust particle decoration (simulated botanical pollen) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
          <div className="absolute top-10 left-20 w-3 h-3 bg-emerald-700/10 rounded-full animate-pulse filter blur-sm" />
          <div className="absolute bottom-20 right-10 w-4 h-4 bg-emerald-800/10 rounded-full animate-pulse filter blur-sm" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column - Large Typography Display */}
          <motion.div 
            initial={{ opacity: 0, x: -45, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <span className="text-[#388653] font-mono text-xs uppercase font-extrabold tracking-widest block">
              A botanical wonderland
            </span>
            <h2 className="text-4xl sm:text-6xl font-display font-extrabold leading-[1.0] tracking-tighter text-[#162625]">
              A Garden of <br />
              <span className="font-light text-[#162625]/75">a Thousand Species</span>
            </h2>
            <p className="text-sm text-[#162625]/85 leading-relaxed font-sans max-w-lg font-medium">
              Explore vibrant botanical trails, ancient Mahogany canopies, and shaded wetlands. Discover over 1,000 exotic and indigenous flora designed to heal, refresh, and restore the soul.
            </p>

            {/* Bloom calendar month selector */}
            <div className="pt-4 space-y-3">
              <label className="text-[10px] font-mono uppercase text-[#162625]/60 tracking-widest block">
                Exotic Bloom Calendar (Filtered Peek)
              </label>
              <div className="flex flex-wrap gap-2">
                {(['jan-mar', 'apr-jun', 'jul-sep', 'oct-dec'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setBloomMonth(p)}
                    className={`text-[10px] uppercase tracking-wider font-mono py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                      bloomMonth === p 
                      ? 'bg-[#162625] border-[#162625] text-[#f2e9d8] font-bold shadow-sm' 
                      : 'border-[#162625]/15 text-[#162625]/70 hover:bg-[#162625]/5'
                    }`}
                  >
                    {p === 'jan-mar' && 'Jan-Mar Orchid'}
                    {p === 'apr-jun' && 'Apr-Jun Hibiscus'}
                    {p === 'jul-sep' && 'Jul-Sep Ferns'}
                    {p === 'oct-dec' && 'Oct-Dec Jacaranda'}
                  </button>
                ))}
              </div>

              {/* Bloom message box */}
              <div className="py-2 text-xs text-[#162625]/85 italic border-l-2 border-[#388653] pl-3.5">
                {bloomMonth === 'jan-mar' && '🌸 Featured: Rare Zambia ground orchids pop up. Moisture levels are soaring in the humid warm biome.'}
                {bloomMonth === 'apr-jun' && '🌺 Featured: Crimson and peach hibiscus form thick hedges. Perfect season for photo shoots along internal trails.'}
                {bloomMonth === 'jul-sep' && '🌿 Featured: Lush cycad clusters and ancient ferns dominate the shaded botanical canopy walks.'}
                {bloomMonth === 'oct-dec' && '💜 Featured: Majestic Jacaranda showers carpet paths in violet blooms, making picnics absolutely magical.'}
              </div>
            </div>

            <div className="pt-4">
              <a href="#animals" className="text-xs text-[#162625] hover:text-[#388653] hover:underline cursor-pointer font-mono font-bold tracking-widest uppercase inline-flex items-center gap-2">
                <span>Explore Gardens</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Right Column - Big clean image of the garden of a thousand species + clean light features list */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="aspect-video w-full rounded-[24px] overflow-hidden border border-[#162625]/10 shadow-sm"
            >
              <img
                src="https://framerusercontent.com/images/uCnjobWpqXFtAryryEcdxA6lbQU.jpg"
                alt="Munda Wanga Botanical Garden Corridor"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <h4 className="text-md font-display font-black text-[#162625]">Weekend Serenity</h4>
                <p className="text-xs text-[#162625]/70 leading-relaxed font-sans">
                  Relax at lakeside viewpoints, sports courts, and pristine family playgrounds surrounded by nature.
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-md font-display font-black text-[#162625]">Living Classrooms</h4>
                <p className="text-xs text-[#162625]/70 leading-relaxed font-sans">
                  Empowering over 40,000 youth annually through hands-on environmental classes and wildlife care.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-[#162625]/10 text-left">
              <div className="space-y-1">
                <h4 className="text-sm font-display font-black text-[#162625]">Active Stewardship</h4>
                <p className="text-xs text-[#162625]/70 font-sans max-w-sm">
                  Guided botanical paths, daily feedings, and interactive rescue exhibits. Nature is not just seen—it's experienced.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsPassModalOpen(true);
                  setIsPassGenerated(false);
                }}
                className="py-3 px-6 bg-[#388653] hover:bg-[#2c6c41] text-white font-extrabold text-[#f2e9d8] text-xs font-mono tracking-widest uppercase rounded-xl transition-all shadow-sm cursor-pointer"
              >
                BOOK TOUR
              </button>
            </div>
          </div>

        </div>

      </motion.section>

      {/* SECTION: SANCTUARY SNAPSHOTS (INTERACTIVE GALLERY & LIVING MOSAIC) */}
      <section id="snapshots" className="py-20 md:py-28 bg-[#f2e9d8] relative overflow-hidden border-t border-[#162625]/5">
        {/* Subtle decorative background blur washes */}
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-[#cbe380]/20 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-80 h-80 bg-emerald-100/30 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          
          {/* Header Title Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-4">
              <span className="text-[#388653] font-mono text-xs uppercase font-extrabold tracking-widest block">
                The Living Lens
              </span>
              <h2 className="text-4xl sm:text-6xl font-display font-extrabold text-[#162625] leading-[1.0] tracking-tighter text-left">
                Sanctuary Snapshots <br />
                <span className="font-light text-[#162625]/60">in Full Bloom</span>
              </h2>
            </div>
            <p className="text-sm text-[#162625]/75 leading-relaxed font-sans max-w-lg text-left">
              Through morning dew and gentle breezes, Munda Wanga lives in details. Flip through the living scrapbook of our botanical corridors, rescued bird preserves, and peaceful water pools.
            </p>
          </div>
        </div>

        {/* 1. THE IMMERSIVE FULL-WIDTH GALLERY BLOCK (Fully responsive, edge-to-edge, layout matching premium slider specs) */}
        <div className={`w-full relative overflow-hidden shadow-2xl border-y border-[#162625]/5 group mt-12 snapshots-carousel ${sliderClass}`}>
          <div className="list h-full w-full relative">
            {sliderItems.map((item, index) => (
              <div 
                key={item.id} 
                className="item"
                style={{ backgroundImage: `url(${item.url})` }}
                onClick={() => handleItemClick(item.id, index)}
              >
                <div className="content">
                  <div className="title">{item.location}</div>
                  <div className="name">{item.name}</div>
                  <div className="des">{item.description}</div>
                  <div className="btn">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedGalleryItem(item);
                        triggerToast(`Visual spotlight active: ${item.title}. Safety and wellness metrics validated.`);
                      }}
                      className="btn-primary"
                    >
                      See Spotlight
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPassModalOpen(true);
                        setIsPassGenerated(false);
                        triggerToast(`Secure ticket gate initialized for ${item.title}.`);
                      }}
                      className="btn-secondary"
                    >
                      Plan Experience
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* next prev button */}
          <div className="arrows">
            <button className="prev" onClick={handlePrevSlider} aria-label="Previous image">&lt;</button>
            <button className="next" onClick={handleNextSlider} aria-label="Next image">&gt;</button>
          </div>

          {/* time running progress bar */}
          <div key={resetKey} className="timeRunning timeRunningActive" />
        </div>

        {/* 2. SECONDARY CONTROLLING BENTO INFORMATION ROW (Contained in grid context) */}
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-4">
            
            {/* Feature card description */}
            <div className="md:col-span-7 flex flex-col justify-center text-left py-4 pr-0 md:pr-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-[#162625]/5 text-[#162625] py-1 px-3 rounded-full text-[9px] font-mono uppercase font-bold tracking-wider float-left">
                  <Leaf className="w-3 h-3 text-[#388653]" />
                  <span>Luminous Moss Revitalization</span>
                </div>
                <div className="clear-both" />
                <h3 className="text-2xl sm:text-3xl font-display font-black leading-tight text-[#162625]">
                  Balancing Light &amp; Canopy
                </h3>
                <p className="text-sm text-[#162625]/85 leading-relaxed font-sans">
                  Our critical cooling pathways shield native soils and support water filtrations. Active flora cultivation shields wild ecosystems, maintaining perfect moisture layers for rare sub-tropical species.
                </p>
                <div className="flex justify-between items-center pt-3 border-t border-[#162625]/10 max-w-md">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#162625]/70">
                    💚 Active Revitalization Core
                  </span>
                  <div className="h-2 w-2 rounded-full bg-[#388653] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Interactive preview slots (directly connected state drivers) */}
            <div className="md:col-span-5 grid grid-cols-2 gap-4">
              
              {/* Preview Thumbnail for Slide 1 (Tiger Haven) */}
              <div 
                className={`group bg-white rounded-3xl border overflow-hidden shadow-sm flex flex-col h-full cursor-pointer relative transition-all duration-300 ${
                  sliderItems[1].id === 'tiger' ? 'ring-2 ring-[#388653] scale-[1.02] shadow-md border-transparent' : 'border-[#162625]/10'
                }`} 
                onClick={() => jumpToSliderItem('tiger')}
              >
                <div className="aspect-square relative overflow-hidden flex-1 min-h-[140px]">
                  <img 
                    src="/assets/Tiger.jpg" 
                    alt="Bengal Tiger Haven" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-90" />
                  <span className="absolute bottom-4 left-4 text-[10px] font-mono text-white tracking-widest font-bold uppercase text-left leading-none">
                    Tiger Haven
                  </span>
                </div>
              </div>

              {/* Preview Thumbnail for Slide 2 (Cheetah Range) */}
              <div 
                className={`group bg-white rounded-3xl border overflow-hidden shadow-sm flex flex-col h-full cursor-pointer relative transition-all duration-300 ${
                  sliderItems[1].id === 'cheetah' ? 'ring-2 ring-[#388653] scale-[1.02] shadow-md border-transparent' : 'border-[#162625]/10'
                }`} 
                onClick={() => jumpToSliderItem('cheetah')}
              >
                <div className="aspect-square relative overflow-hidden flex-1 min-h-[140px]">
                  <img 
                    src="/assets/Cheetah.jpg" 
                    alt="Zambian Cheetah Range" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-90" />
                  <span className="absolute bottom-4 left-4 text-[10px] font-mono text-white tracking-widest font-bold uppercase text-left leading-none">
                    Cheetah Range
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* SECTION: VISITOR STORIES (REVIEWS & SUBMIT BOX) */}
      <section id="stories" className="py-20 md:py-28 max-w-7xl mx-auto px-6 space-y-16 overflow-hidden">
        
        {/* Review list banner */}
        <motion.div 
          initial={{ opacity: 0, y: 35, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <span className="text-[#388653] font-mono text-xs uppercase font-extrabold tracking-widest block">
            Visitor stories
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-[#162625] leading-none">
            The kind of day people talk about <br />
            <span className="font-light text-[#162625]/60">on the ride home.</span>
          </h2>
        </motion.div>

        {/* Stories interface section: Submitting form + actual grid list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Submit Story Box Column */}
          <motion.div 
            initial={{ opacity: 0, x: -45, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 bg-white border border-[#162625]/10 rounded-3xl p-6 shadow-sm space-y-6"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-display font-extrabold tracking-tight flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                <span>Share your Story</span>
              </h3>
              <p className="text-xs text-[#162625]/60 font-sans">
                Post your thoughts and join our community of conservation friends.
              </p>
            </div>

            {storySuccessMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs rounded-xl font-medium animate-fade-in flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{storySuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmittingStory} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#162625]/75 tracking-widest uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mwansa Banda"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full bg-[#f2e9d8]/50 border border-[#162625]/15 focus:border-[#388653] p-3 rounded-xl focus:outline-none font-sans text-sm text-[#162625]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#162625]/75 tracking-widest uppercase">Your Location</label>
                <input
                  type="text"
                  placeholder="e.g. Lusaka, Zambia"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#f2e9d8]/50 border border-[#162625]/15 focus:border-[#388653] p-3 rounded-xl focus:outline-none font-sans text-sm text-[#162625]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#162625]/75 tracking-widest uppercase block mb-1">Scale Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      type="button"
                      key={stars}
                      onClick={() => setNewRating(stars)}
                      className="p-1.5 rounded-lg border border-[#162625]/10 hover:bg-[#388653]/10 transition-all text-amber-500"
                    >
                      <Star className={`w-4 h-4 ${newRating >= stars ? 'fill-[#ffd662] text-[#ffd662]' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#162625]/75 tracking-widest uppercase">Your Experience</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what animals you saw or how you liked the botanical gardens..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full bg-[#f2e9d8]/50 border border-[#162625]/15 focus:border-[#388653] p-3 rounded-xl focus:outline-none font-sans text-sm text-[#162625] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingStory}
                className="w-full bg-[#162625] hover:bg-[#388653] text-[#f2e9d8] py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {isSubmittingStory ? (
                  <span>Posting to feed...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Submit Story</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Testimonial review cards deck */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {stories.map((story, idx) => (
                <motion.div
                  layout
                  key={story.id}
                  initial={{ opacity: 0, y: 35, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, amount: 0.15 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: Math.min(idx * 0.1, 0.3),
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="bg-white/80 border border-[#162625]/10 p-6 rounded-3xl flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    {/* Header star details */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-0.5 text-[#ffd662]">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-500/10 py-1 px-2.5 rounded-full uppercase font-bold tracking-widest">
                        Verified Visit
                      </span>
                    </div>

                    <p className="text-xs text-[#162625]/85 italic leading-relaxed font-sans">
                      &ldquo;{story.text}&rdquo;
                    </p>
                  </div>

                  {/* Foot profile information */}
                  <div className="flex items-center gap-3 pt-6 border-t border-[#162625]/5 mt-6">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-[#162625]/10">
                      {/* Check if is default or uploaded */}
                      <img
                        src={story.avatar || "https://framerusercontent.com/images/sPKYEgghSjneqajxkQkonxXIHHg.jpg"}
                        alt={story.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-display font-extrabold text-[#162625]">
                        {story.name}
                      </h4>
                      <p className="text-[9px] font-mono text-[#162625]/55">
                        {story.location} • {story.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>

      </section>

      {/* SECTION: KNOW BEFORE YOU GO (FAQ) */}
      <section id="faq" className="py-20 md:py-28 bg-[#cbe380] text-[#162625] overflow-hidden relative">
        {/* Subtle decorative nature overlay blobs */}
        <div className="absolute top-1/4 -right-16 w-64 h-64 bg-white/20 rounded-full filter blur-2xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 space-y-12 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 35, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-3"
          >
            <span className="text-emerald-950/70 font-mono text-xs uppercase font-extrabold tracking-widest block">
              Know before you go
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-[#162625] leading-none">
              A smoother visit starts <br />
              <span className="font-light text-[#162625]/70">before the gate.</span>
            </h2>
          </motion.div>

          {/* Interactive Accordion list */}
          <div className="space-y-4">
            {FAQ_DATA.map((faq, idx) => {
              const isOpen = openFaq === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: Math.min(idx * 0.08, 0.3), 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="bg-white/85 border border-[#162625]/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-6 text-left flex justify-between items-center gap-4 focus:outline-none group cursor-pointer"
                  >
                    <span className="font-display font-extrabold text-sm sm:text-md text-[#162625] group-hover:text-[#388653] transition-colors leading-tight">
                      {faq.question}
                    </span>
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#162625]/5 flex items-center justify-center text-[#162625]/75 group-hover:bg-emerald-800/15 group-hover:text-emerald-800 transition-colors">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-[#162625]/5"
                      >
                        <div className="p-6 bg-white/40 text-xs sm:text-sm text-[#162625]/85 leading-relaxed font-sans">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center pt-4"
          >
            <div className="p-5 rounded-2xl bg-white/70 border border-[#162625]/10 inline-flex flex-col sm:flex-row items-center gap-4 text-xs">
              <span className="text-[#162625]/80 font-sans flex items-center gap-1.5 justify-center">
                <Info className="w-4 h-4 text-emerald-800" />
                <span>Group bookings or school trips of 20+ qualify for customized support.</span>
              </span>
              <button
                onClick={() => {
                  setAdultCount(10);
                  setChildCount(15);
                  setIsPassModalOpen(true);
                  setIsPassGenerated(false);
                }}
                className="font-mono font-bold uppercase tracking-wider text-emerald-850 hover:underline cursor-pointer"
              >
                CALCULATE SCHOOL GRANTS
              </button>
            </div>
          </motion.div>

        </div>
      </section>
        </>
      ) : currentPage === 'about' ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative min-h-[85vh] w-full flex flex-col items-center justify-center py-16 px-6 overflow-hidden -mt-[82px] pt-[120px]"
        >
          <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-6 text-left">
            {/* Left: Beautiful Typography & Heritage Timeline */}
            <div className="lg:col-span-7 space-y-8 p-8 text-left text-[#162625]">
              
              {/* Big Clean Image of the Sanctuary */}
              <div className="aspect-video w-full rounded-[24px] overflow-hidden border border-[#162625]/10 shadow-sm mb-6">
                <img
                  src="/assets/Hero.jpg"
                  className="w-full h-full object-cover"
                  alt="Munda Wanga Botanical Garden Entrance"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-4">
                <span className="text-[#388653] font-mono text-xs uppercase font-extrabold tracking-widest block">
                  Preservation &amp; Heritage Since 1959
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[#162625] leading-tight tracking-tight">
                  Zambia's Rescued <br />
                  <span className="text-[#388653]">Fauna Sanctuary</span>
                </h1>
                <p className="text-sm text-[#162625]/85 leading-relaxed font-sans mt-2">
                  Initially developed as an elegant private botanical landscape, Munda Wanga was transformed into a national wildlife rescue haven to support critical animal rehabilitation, educational nature walks, and flora protection services in Lusaka.
                </p>
              </div>

              {/* TIMELINE INTERACTION */}
              <div className="space-y-4 border-t border-[#162625]/10 pt-6">
                <span className="text-[10px] font-mono uppercase text-[#388653] tracking-widest block font-bold">
                  Interactive Timeline Milestones
                </span>
                <div className="flex flex-wrap gap-3">
                  {([1959, 1998, 2012, 2026] as const).map((year) => (
                    <button
                      key={year}
                      onClick={() => setTimelineYear(year)}
                      className={`py-3 px-5 rounded-2xl text-xs font-mono uppercase tracking-wider border cursor-pointer transition-all active:scale-95 ${
                        timelineYear === year 
                          ? 'bg-[#162625] border-[#162625] text-white font-extrabold shadow-sm' 
                          : 'border-[#162625]/15 text-[#162625]/70 hover:bg-[#162625]/5'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                {/* Timeline display card - clean & background-free */}
                <div className="py-5 text-left border-l-2 border-[#388653] pl-4 space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#162625]/5 text-[#388653] text-[9px] font-mono uppercase tracking-wider font-extrabold">
                    {timelineYear === 1959 && 'Botanical Inception'}
                    {timelineYear === 1998 && 'Rescue Shift'}
                    {timelineYear === 2012 && 'Education Outreach'}
                    {timelineYear === 2026 && 'Modern Ecosystem'}
                  </span>
                  <h4 className="text-md font-bold text-[#162625] uppercase tracking-wider font-display">
                    {timelineYear === 1959 && "The Pioneer's Vision"}
                    {timelineYear === 1998 && 'Transition to Wildlife Sanctuary'}
                    {timelineYear === 2012 && 'The Great Community Initiative'}
                    {timelineYear === 2026 && "Today's Living Sanctuary"}
                  </h4>
                  <p className="text-xs text-[#162625]/80 font-sans leading-relaxed">
                    {timelineYear === 1959 && "Founded as Zambia's first botanical garden. Pioneered by local conservationists to protect indigenous miombo woodland flora and rescue abandoned regional fauna."}
                    {timelineYear === 1998 && 'Renamed and specialized as a certified animal rescue and rehabilitation center. Munda Wanga became the primary safe sanctuary for rescued big cats and exotic reptiles.'}
                    {timelineYear === 2012 && 'Introduced the Nature Classroom program. Opened gates to schools and local groups across Zambia, educating over 40,000 children annually on wildlife stewardship.'}
                    {timelineYear === 2026 && 'Upgraded aviaries and species tracking, restoring rare populations of grey parrots, pangolins, and vultures under expert veterinary and botanical care.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Donation slider gamification & Sponsorship Partner showcase */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* DONATION SLIDER GAMIFICATION WIDGET - clean transparent container */}
              <div className="p-6 sm:p-8 space-y-6 text-left text-[#162625] bg-white/40 border border-[#162625]/5 rounded-3xl shadow-sm">
                <div>
                  <span className="text-xs font-mono uppercase text-[#388653] font-extrabold tracking-widest block mb-1.5">Interactive Sandbox</span>
                  <h3 className="text-2xl font-display font-extrabold text-[#162625]">Support Our Sanctuary</h3>
                  <p className="text-sm text-[#162625]/85 font-sans leading-relaxed mt-1">
                    Evaluate how simulated community pledges translates directly into veterinary medicine, raw logs, or seed formulas for our species.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-mono font-bold">
                    <span className="text-[#162625]/80">Select Pledge Amount</span>
                    <span className="text-[#388653] font-black text-xl">K{donationPledge}</span>
                  </div>
                  
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={donationPledge}
                    onChange={(e) => setDonationPledge(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#162625]/10 rounded-lg appearance-none cursor-pointer accent-[#388653]"
                  />
                  <div className="flex justify-between text-xs font-mono font-semibold text-[#162625]/60 uppercase tracking-widest">
                    <span>K50</span>
                    <span>K500</span>
                    <span>K1000</span>
                  </div>

                  <div className="py-4 border-l-2 border-[#388653] pl-4 text-sm flex gap-3 text-left bg-emerald-50/20 rounded-r-xl pr-3">
                    <Heart className="w-5 h-5 text-[#388653] fill-[#388653] flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#388653]">Impact Breakdown</span>
                      <p className="text-xs sm:text-sm text-[#162625]/90 leading-relaxed font-sans mt-1 font-medium">
                        {donationPledge <= 150 && "Purchases 10 packs of healing formulas and seed mixes for rescued parrot chicks."}
                        {donationPledge > 150 && donationPledge <= 400 && "Provides clean, mineral-enriched water and food supplies for a cheetah or leopard enclosure for 5 days."}
                        {donationPledge > 400 && donationPledge <= 750 && "Secures custom medical kits, sterile gloves, and specialized pediatric milk formulas for orphaned/injured primates."}
                        {donationPledge > 750 && "Sponsors a full school delegation of 15 children for educational Nature Classrooms and custom guided tours!"}
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => triggerToast(`Simulated pledge of K${donationPledge} recorded! In a live environment, this secures veterinary kits and flora formulas. Thank you for supporting Munda Wanga!`)}
                  className="w-full bg-[#388653] hover:bg-[#2c6c41] active:scale-98 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-xs font-sans transition-all flex justify-center items-center gap-2 cursor-pointer shadow-md"
                >
                  Confirm Pledged Support
                </button>
              </div>

              {/* SPONSORSHIP PARTNER DETAIL LIST */}
              <div className="p-6 sm:p-8 space-y-4 text-[#162625] text-left bg-white/40 border border-[#162625]/5 rounded-3xl">
                <span className="text-xs font-mono uppercase text-[#388653] font-bold tracking-widest block leading-none">Global Partner Grid</span>
                <h4 className="text-lg font-display font-extrabold uppercase tracking-wide text-[#162625]">Conservation Sponsors</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono uppercase tracking-wider">
                  {[
                    { key: 'WCSZ', name: 'Wildlife Conservation ZM', text: 'Co-funding veterinary facilities' },
                    { key: 'ZTA', name: 'Zambia Tourism Agency', text: 'Financing visitor pathways' },
                    { key: 'ICF', name: 'Crane Protection Council', text: 'Wetland birds preservation' },
                    { key: 'BWZ', name: 'BirdWatch Zambia', text: 'Vulture protection surveys' }
                  ].map((partner) => (
                    <button
                      key={partner.key}
                      onClick={() => setSelectedPartner(partner.key)}
                      className={`p-4 rounded-xl text-left border transition-all cursor-pointer min-h-[58px] ${
                        selectedPartner === partner.key 
                          ? 'border-[#388653] bg-[#bcffa3]/10 ring-1 ring-[#388653]/30' 
                          : 'border-[#162625]/10 bg-transparent hover:bg-[#162625]/5'
                      }`}
                    >
                      <span className="font-extrabold block text-[#162625] text-sm">{partner.key}</span>
                      <span className="text-[10px] text-[#162625]/70 mt-1 block normal-case font-sans font-medium leading-tight">{partner.name}</span>
                    </button>
                  ))}
                </div>

                <div className="py-2.5 text-xs sm:text-sm text-[#162625]/90 font-sans italic text-left leading-relaxed border-l-2 border-[#388653] pl-3.5 mt-2">
                  {selectedPartner === 'WCSZ' && "Partner ZM Veterinarians supply full-time surgeons and local equipment support to diagnose animal injuries."}
                  {selectedPartner === 'ZTA' && "The Zambia Tourism Agency maintains the main trail networks, lighting systems, and informational signage across our park."}
                  {selectedPartner === 'ICF' && "Co-sponsors the central marsh bird species list and supports deep pond filtering to emulate wilderness creeks."}
                  {selectedPartner === 'BWZ' && "Focuses on providing clean feeding spots and tracking platforms for wild raptors traveling past Lusaka."}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      ) : currentPage === 'animals' ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative min-h-[85vh] w-full flex flex-col items-center justify-start py-16 px-6 overflow-hidden -mt-[82px] pt-[120px]"
        >
          {/* Full bleed background image with subtle dark overlay */}
          <div className="absolute inset-0 z-[1] pointer-events-none select-none">
            <img 
              src="/assets/pexels-simplydomz-33616034.jpg" 
              className="w-full h-full object-cover filter brightness-[0.70] contrast-[1.02] saturate-[1.1]" 
              alt="Munda Wanga Wildlife Sanctuary backdrop" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-[#162625]/90 z-[2]" />
          </div>

          <div className="relative z-10 w-full max-w-6xl mx-auto space-y-10 mt-6">
            
            {/* Header with Search and Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end text-left p-6 sm:p-8 text-white">
              <div className="space-y-4">
                <span className="text-[#acffa3] font-mono text-xs uppercase font-extrabold tracking-widest block font-bold">
                  The Sanctuary Enclosures
                </span>
                <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight">
                  Guardians of <br />
                  <span className="font-light text-[#ffd662]">Zambia's Rescued Wildlife</span>
                </h1>
                <p className="text-xs text-white/80 leading-relaxed font-sans max-w-sm">
                  Our animals are rehabilitated with expert veterinary care. Use filters or search to explore species names or trigger virtual habitat monitoring!
                </p>
              </div>

              {/* SEARCH BOX AND HIGHLIGHT CORES */}
              <div className="space-y-4 font-mono text-xs text-left text-white">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-white/70 uppercase tracking-widest">Active Species Filter</label>
                  <input
                    type="text"
                    placeholder="Search by name: e.g. Lions, Leopards, Parrots..."
                    value={animalSearchQuery}
                    onChange={(e) => setAnimalSearchQuery(e.target.value)}
                    className="w-full bg-[#162625] border border-white/15 focus:border-[#acffa3] p-4 rounded-xl focus:outline-none font-sans text-sm text-white shadow-inner"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 pt-1 font-sans">
                  {(['all', 'Big-cat moments', 'Birdlife trails', 'Easy routes'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 px-5 rounded-2xl text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all min-h-[44px] flex items-center justify-center ${
                        activeTab === tab 
                          ? 'bg-[#388653] border-[#388653] text-white font-extrabold shadow-md' 
                          : 'border-white/15 text-white/85 hover:bg-white/10 active:scale-95'
                      }`}
                    >
                      {tab === 'all' ? 'All Groups' : tab.replace(' moments', '').replace(' trails', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SPLIT GRID: Left list of animals, Right Interactive Map Hotspots */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Filtered List of Species (Card Grid) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SPECIES_DATA
                  .filter(animal => {
                    const searchLower = animalSearchQuery.toLowerCase().trim();
                    const nameMatch = animal.name.toLowerCase().includes(searchLower);
                    const subtitleMatch = animal.subtitle.toLowerCase().includes(searchLower);
                    const descMatch = animal.description.toLowerCase().includes(searchLower);
                    const tagMatch = animal.tag.toLowerCase().includes(searchLower);
                    
                    let synonymMatch = false;
                    if (['lion', 'lions', 'feline', 'cat', 'cats', 'big-cat', 'leopard', 'panther'].some(term => searchLower.includes(term))) {
                      synonymMatch = animal.tag === 'Big-cat moments';
                    }
                    if (['bird', 'birds', 'aviary', 'parrot', 'parrots', 'owl', 'macaw', 'feather'].some(term => searchLower.includes(term))) {
                      synonymMatch = animal.tag === 'Birdlife trails';
                    }
                    if (['safari', 'mammal', 'mammals', 'graze', 'hoof', 'herd'].some(term => searchLower.includes(term))) {
                      synonymMatch = animal.tag === 'Easy routes' || animal.tag === 'Big-cat moments';
                    }

                    const matchesSearch = nameMatch || subtitleMatch || descMatch || tagMatch || synonymMatch;
                    const matchesTab = activeTab === 'all' || animal.tag === activeTab;
                    return matchesSearch && matchesTab;
                  })
                  .map(animal => (
                    <div 
                      key={animal.id}
                      className="border border-white/10 hover:border-white/20 bg-black/35 backdrop-blur-sm rounded-3xl p-5 space-y-4 flex flex-col justify-between transition-all shadow-sm"
                    >
                      <div className="space-y-2 text-left">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden relative border border-white/10 bg-black/25">
                          <img 
                            src={animal.image} 
                            alt={animal.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-[8px] text-white py-1 px-2 rounded-md font-mono uppercase tracking-wider">
                            {animal.tag}
                          </span>
                        </div>
                        <h3 className="text-xl font-display font-extrabold text-white mt-2 leading-none">{animal.name}</h3>
                        <p className="text-[11px] font-mono text-[#acffa3] uppercase tracking-wider">{animal.subtitle}</p>
                        <p className="text-xs text-white/80 font-sans leading-normal">{animal.description.substring(0, 110)}...</p>
                      </div>

                      <button 
                        onClick={() => setSelectedAnimal(animal)}
                        className="w-full py-2.5 rounded-xl border border-white/15 hover:border-[#acffa3] bg-white/5 hover:bg-[#388653] text-white hover:text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                      >
                        Enclosure Info &amp; Sound
                      </button>
                    </div>
                  ))
                }
              </div>

              {/* Right Column: Interactive Wildlife Map Hotspots with Virtual Sound Sandbox! - glassmorphism */}
              <div className="lg:col-span-5 bg-black/35 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-[32px] space-y-6 text-white text-left shadow-sm">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#acffa3] uppercase tracking-widest block font-bold">Virtual Wildlife Deck</span>
                  <h3 className="text-lg font-display font-extrabold text-white">Active Reserve Enclosures</h3>
                  <p className="text-xs text-white/80 font-sans">
                    Click an enclosure area to check feed updates, simulated activity telemetry, and trigger realistic wildlife sound effects!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'lagoon', label: 'Lagoon', icon: '🦆' },
                    { key: 'cats', label: 'Big Cats', icon: '🐆' },
                    { key: 'aviary', label: 'Aviary', icon: '🦜' }
                  ].map((dot) => (
                    <button
                      key={dot.key}
                      onClick={() => {
                        setActiveAnimalHotspot(dot.key as any);
                        if (dot.key === 'lagoon') setVocalSoundPhonetic("Hiss, whistle, splash!");
                        if (dot.key === 'cats') setVocalSoundPhonetic("Low guttural roar!");
                        if (dot.key === 'aviary') setVocalSoundPhonetic("Sqwaaak, double whistle-chirp!");
                        setTimeout(() => setVocalSoundPhonetic(null), 3000);
                      }}
                      className={`p-4 rounded-2xl border text-center font-mono text-xs uppercase cursor-pointer transition-all min-h-[48px] ${
                        activeAnimalHotspot === dot.key 
                          ? 'bg-[#acffa3] border-[#acffa3] text-[#162625] font-extrabold shadow-sm' 
                          : 'border-white/10 text-white/80 hover:bg-white/5 active:scale-98'
                      }`}
                    >
                      <span className="text-xl block mb-1">{dot.icon}</span>
                      <span>{dot.label}</span>
                    </button>
                  ))}
                </div>

                {activeAnimalHotspot && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 animate-fade-in text-xs leading-relaxed">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="font-mono text-[9px] text-[#acffa3] uppercase font-bold">
                        ⚡ Enclosure telemetry
                      </span>
                      <span className="text-[10px] bg-[#acffa3]/10 text-[#acffa3] px-2 py-0.5 rounded font-mono uppercase font-bold tracking-widest">
                        {activeAnimalHotspot === 'lagoon' && 'Wetlands'}
                        {activeAnimalHotspot === 'cats' && 'Predator Zone'}
                        {activeAnimalHotspot === 'aviary' && 'Canopy Aviary'}
                      </span>
                    </div>

                    <p className="text-white/90">
                      {activeAnimalHotspot === 'lagoon' && "Aquatic birds and reptiles are bathing. Local staff is refilling central lagoon feed logs with freshwater minnows."}
                      {activeAnimalHotspot === 'cats' && "The rescued leopards and lions are napping on high canopy lookouts. Best optimal window to catch them active: 16:30 feeding."}
                      {activeAnimalHotspot === 'aviary' && "Poached parrots undergoing social training. High vocal signals and parrot whistles detected in the tree corridor."}
                    </p>

                    {vocalSoundPhonetic ? (
                      <div className="p-3 bg-white/10 border border-[#acffa3]/20 rounded-xl text-[#acffa3] font-mono text-center animate-pulse tracking-wide italic">
                        🔊 {vocalSoundPhonetic}
                      </div>
                    ) : (
                      <div className="text-[10px] text-white/50 text-center font-mono italic">
                        (Click buttons above to trigger vocal sound mimics)
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsPassModalOpen(true);
                    setIsPassGenerated(false);
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#388653] hover:bg-[#2c6c41] text-white font-mono font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Reserve Passes to see our Animals</span>
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      ) : currentPage === 'gardens' ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative min-h-[85vh] w-full flex flex-col items-center justify-start py-16 px-6 overflow-hidden -mt-[82px] pt-[120px]"
        >
          {/* Full bleed background image with subtle dark overlay */}
          <div className="absolute inset-0 z-[1] pointer-events-none select-none">
            <img 
              src="/assets/pexels-lorenza-magnaghi-660554185-33752159.jpg" 
              className="w-full h-full object-cover filter brightness-[0.70] contrast-[1.02] saturate-[1.1]" 
              alt="Munda Wanga Botanical Garden backdrop" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-[#162625]/90 z-[2]" />
          </div>

          <div className="relative z-10 w-full max-w-6xl mx-auto space-y-10 mt-6">
            
            {/* Header banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end text-left p-6 sm:p-8 text-white">
              <div className="space-y-4">
                <span className="text-[#acffa3] font-mono text-xs uppercase font-extrabold tracking-widest block">
                  A Botanical Haven
                </span>
                <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight">
                  A Garden of <br />
                  <span className="font-light text-[#ffd662]">A Thousand Exotic Species</span>
                </h1>
                <p className="text-xs text-white/80 leading-relaxed font-sans max-w-sm">
                  Walk through rows of native mahogany trees, rare ancient cycad clusters, and humid orchids. Filter with the interactive bloom wheel!
                </p>
              </div>

              {/* SEASONAL CONTROLLER */}
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-mono uppercase text-white/60 tracking-widest block font-bold">
                  Interactive Bloom Calendar
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['jan-mar', 'apr-jun', 'jul-sep', 'oct-dec'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setBloomMonth(p)}
                      className={`text-[9px] uppercase tracking-wider font-mono py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                        bloomMonth === p 
                        ? 'bg-[#388653] border-[#388653] text-white font-bold shadow-sm' 
                        : 'border-white/10 text-white/75 hover:bg-white/5'
                      }`}
                    >
                      {p === 'jan-mar' && 'Jan-Mar Orchid'}
                      {p === 'apr-jun' && 'Apr-Jun Hibiscus'}
                      {p === 'jul-sep' && 'Jul-Sep Ferns'}
                      {p === 'oct-dec' && 'Oct-Dec Jacaranda'}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-3 text-xs sm:text-sm text-[#f2e9d8]/95 font-sans leading-relaxed text-left border-l-2 border-[#388653] pl-3.5 italic">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/15 flex-shrink-0 bg-black/20 shadow-md">
                    <img
                      src={
                        bloomMonth === 'jan-mar' ? '/assets/pexels-mary-murmu-175408659-33952257.jpg' :
                        bloomMonth === 'apr-jun' ? '/assets/pexels-irene-asthetik-2147866784-37971748.jpg' :
                        bloomMonth === 'jul-sep' ? '/assets/pexels-olga-petrova-129200401-38007128.jpg' :
                        '/assets/pexels-simplydomz-33616034.jpg'
                      }
                      className="w-full h-full object-cover"
                      alt={`${bloomMonth} flower`}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    {bloomMonth === 'jan-mar' && '🌸 Rare Zambia ground orchids pop up. Moisture levels are soaring in the humid warm biome.'}
                    {bloomMonth === 'apr-jun' && '🌺 Crimson and peach hibiscus form thick hedges. Perfect season for photo shoots along internal trails.'}
                    {bloomMonth === 'jul-sep' && '🌿 Lush cycad clusters and ancient ferns dominate the shaded botanical canopy walks.'}
                    {bloomMonth === 'oct-dec' && '💜 Majestic Jacaranda showers carpet paths in violet blooms, making picnics absolutely magical.'}
                  </div>
                </div>
              </div>
            </div>

            {/* SPLIT SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: Interactive Botanical Walk & Paths - premium glassmorphism */}
              <div className="lg:col-span-7 bg-black/35 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-[32px] space-y-6 text-white text-left shadow-sm">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#acffa3] uppercase tracking-widest block font-bold">Scenic Trail Explorer</span>
                  <h3 className="text-xl font-display font-extrabold text-white">Botanical Canopy Walks</h3>
                  <p className="text-xs text-white/80 font-sans">
                    Pick a designed route to read about native botanical ages and simulate tranquility wind soundscapes!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono uppercase">
                  {[
                    { key: 'mahogany', label: 'Mahogany Path', stat: 'Ages 90+ yrs' },
                    { key: 'cycad', label: 'Cycad Gully', stat: 'Rare relics' },
                    { key: 'orchid', label: 'Orchid Ridge', stat: 'Humid dome' }
                  ].map((route) => (
                    <button
                      key={route.key}
                      onClick={() => setActiveGardenRoute(route.key as any)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all min-h-[48px] ${
                        activeGardenRoute === route.key 
                          ? 'border-[#acffa3] bg-[#acffa3] text-[#162625] font-extrabold shadow-sm' 
                          : 'border-white/10 bg-transparent text-white/80 hover:bg-white/5 active:scale-98'
                      }`}
                    >
                      <span className="font-bold block text-xs">{route.label}</span>
                      <span className={`text-[9px] tracking-widest block mt-1 uppercase font-semibold ${activeGardenRoute === route.key ? 'text-[#162625]/65' : 'text-white/50'}`}>{route.stat}</span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 p-4 bg-white/5 rounded-xl border border-white/10 text-left">
                  <div className="w-full md:w-1/3 aspect-[4/3] rounded-lg overflow-hidden border border-white/10 relative bg-black/20 flex-shrink-0">
                    <img
                      src={
                        activeGardenRoute === 'mahogany' ? '/assets/pexels-ralph-407274-2323411.jpg' :
                        activeGardenRoute === 'cycad' ? '/assets/pexels-on3sign-33612012.jpg' :
                        '/assets/pexels-magda-ehlers-pexels-33586007.jpg'
                      }
                      className="w-full h-full object-cover"
                      alt={activeGardenRoute}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#acffa3] block font-bold">
                        🌿 Path acoustics &amp; view
                      </span>
                      <p className="text-xs text-white/90 leading-relaxed font-sans mt-1">
                        {activeGardenRoute === 'mahogany' && "Deep shade provided by African Mahogany trees (Khaya anthotheca). Giant branches create a heavy wind buffer, keeping forest trails cool."}
                        {activeGardenRoute === 'cycad' && "Lush ferns dating back to prehistoric eras. Perfect damp soil conditions from lagoon seepage feed these vulnerable Jurassic foliage beds."}
                        {activeGardenRoute === 'orchid' && "Climate controlled greenhouse simulating continuous tropical humidity. Houses over 40 species of rare geophytic creeping orchids."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-[#acffa3]">
                      <span className="w-2 h-2 rounded-full bg-[#acffa3] animate-pulse" />
                      <span>
                        {activeGardenRoute === 'mahogany' && "🔊 Soundscape: Rustle of majestic high canopy leaves"}
                        {activeGardenRoute === 'cycad' && "🔊 Soundscape: Humid drop splash & distant frog coos"}
                        {activeGardenRoute === 'orchid' && "🔊 Soundscape: Gentle nozzle misting sprayers hiss"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Picnic Reservation Spot Simulator - Premium glassmorphism */}
              <div className="lg:col-span-5 bg-black/35 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-[32px] space-y-5 text-white text-left shadow-sm">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#acffa3] uppercase tracking-widest font-extrabold block">Picnic Spot Planning</span>
                  <h3 className="text-lg font-display font-extrabold">Reserve Picnic Bed</h3>
                  <p className="text-xs text-white/70 font-sans">
                    Settle under giant shade lines. Confirm a spot in our interactive simulation dashboard!
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-bold text-white/60 uppercase tracking-widest block mb-1">Select Location Spot</label>
                    <select
                      value={picnicSpotName}
                      onChange={(e) => setPicnicSpotName(e.target.value as any)}
                      className="w-full bg-[#162625] border border-white/15 focus:border-[#acffa3] p-3 rounded-xl focus:outline-none text-sm text-white font-sans cursor-pointer animate-fade-in"
                    >
                      <option className="bg-[#162625] text-white" value="lotus">Lotus Pond Shore (K120 fee)</option>
                      <option className="bg-[#162625] text-white" value="giant">Giant Mahogany Shade (K150 fee)</option>
                      <option className="bg-[#162625] text-white" value="rose">Horticultural Rose Bed (K100 fee)</option>
                    </select>
                  </div>

                  {/* Real visual preview of the selected picnic spot */}
                  <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/15 relative bg-black/20 shadow-sm">
                    <img
                      src={
                        picnicSpotName === 'lotus' ? '/assets/pexels-on3sign-33612014.jpg' :
                        picnicSpotName === 'giant' ? '/assets/Garden main.jpg' :
                        '/assets/pexels-magda-ehlers-pexels-33586007.jpg'
                      }
                      className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                      alt={picnicSpotName}
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/85 text-white py-1 px-2.5 rounded text-[8px] tracking-widest uppercase font-extrabold backdrop-blur-sm">
                      📸 Spot Preview
                    </span>
                  </div>

                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1.5 text-xs font-sans text-left">
                    <div className="flex justify-between font-bold text-white/95">
                      <span>Area Spot Name:</span>
                      <span className="text-[#acffa3]">
                        {picnicSpotName === 'lotus' && "Lotus Pond Shore"}
                        {picnicSpotName === 'giant' && "Giant Mahogany Canopy"}
                        {picnicSpotName === 'rose' && "Horticultural Rose Bed"}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/70 text-[11px]">
                      <span>Recommended Size:</span>
                      <span>
                        {picnicSpotName === 'lotus' && "Up to 8 guests"}
                        {picnicSpotName === 'giant' && "Up to 15 guests"}
                        {picnicSpotName === 'rose' && "Up to 6 guests"}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/70 text-[11px]">
                      <span>Sound / Vibe:</span>
                      <span>
                        {picnicSpotName === 'lotus' && "Calm aquatic breeze"}
                        {picnicSpotName === 'giant' && "Cool, dense canopy isolation"}
                        {picnicSpotName === 'rose' && "Fragrant floral backdrop"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => triggerToast(`Picnic Spot Reserved! Your space at [${picnicSpotName === 'lotus' ? 'Lotus Pond Shore' : picnicSpotName === 'giant' ? 'Giant Mahogany Canopy' : 'Horticultural Rose Bed'}] has been provisionally reserved for your selected visit date.`)}
                  className="w-full py-3.5 bg-[#388653] hover:bg-[#2c6c41] text-white font-mono font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  <TreePine className="w-4 h-4" />
                  <span>Reserve Picnic Spot</span>
                </button>
              </div>

            </div>

            {/* Featured Botanical Species Grid */}
            <div className="space-y-6 pt-10 border-t border-white/10 text-left">
              <div className="space-y-2">
                <span className="text-[#acffa3] font-mono text-xs uppercase font-extrabold tracking-widest block font-bold">
                  Floral Collection &amp; Herbarium
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  Featured Plant Species of Munda Wanga
                </h3>
                <p className="text-xs text-white/80 font-sans max-w-xl leading-relaxed">
                  Explore several of the thousand rare, exotic, and native floral specimens cataloged across our greenhouse domes and open lawns.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: 'Sacred Water Lotus',
                    sci: 'Nelumbo nucifera',
                    origin: 'Asia & East Africa',
                    status: 'Preserved',
                    tagColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-900/40',
                    img: '/assets/Flower 1.png',
                    desc: 'Floating on our central calm lagoons, these pristine lotuses reveal multi-layered pink petals at dawn.'
                  },
                  {
                    name: 'Exotic Peach Hibiscus',
                    sci: 'Hibiscus rosa-sinensis',
                    origin: 'Tropical Biomes',
                    status: 'Ornamental',
                    tagColor: 'bg-amber-950/80 text-amber-300 border-amber-900/40',
                    img: '/assets/Flower 2.png',
                    desc: 'Dazzling trumpet-shaped blooms that thrive along our main garden borders, attracting nectar-feeding sunbirds.'
                  },
                  {
                    name: 'Zambian Wild Orchid',
                    sci: 'Eulophia leachii',
                    origin: 'Native Zambia',
                    status: 'Vulnerable',
                    tagColor: 'bg-rose-950/80 text-rose-300 border-rose-900/40',
                    img: '/assets/Flower 3.png',
                    desc: 'A rare geophytic species protected inside the humid glass canopy dome, blooming with detailed pink and golden wings.'
                  },
                  {
                    name: 'Jurassic Seed Cycad',
                    sci: 'Encephalartos zambiensis',
                    origin: 'Luangwa Valley',
                    status: 'Endangered',
                    tagColor: 'bg-purple-950/80 text-purple-300 border-purple-900/40',
                    img: '/assets/Flower 4.png',
                    desc: 'Prehistoric slow-growing non-flowering evergreens preserving ancient plant histories since the dinosaur ages.'
                  }
                ].map((specimen, idx) => (
                  <div key={idx} className="group border border-white/10 rounded-2xl overflow-hidden bg-black/35 backdrop-blur-sm shadow-sm flex flex-col justify-between hover:border-white/20 transition-all">
                    <div className="space-y-3">
                      <div className="aspect-[4/3] w-full overflow-hidden relative bg-black/20">
                        <img 
                          src={specimen.img} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt={specimen.name}
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute top-2.5 right-2.5 text-[8px] font-mono uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${specimen.tagColor} backdrop-blur-sm`}>
                          {specimen.status}
                        </span>
                      </div>
                      <div className="px-4 text-left">
                        <h4 className="font-display font-extrabold text-white text-sm leading-tight">
                          {specimen.name}
                        </h4>
                        <span className="text-[10px] font-serif italic text-white/60 block">
                          {specimen.sci}
                        </span>
                        <p className="text-[11px] font-sans text-white/85 mt-2 leading-relaxed">
                          {specimen.desc}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-1.5 border-t border-white/5 mt-4 text-[10px] font-mono text-white/50 flex justify-between">
                      <span>Native Origin:</span>
                      <span className="font-bold text-[#acffa3]">{specimen.origin}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      ) : currentPage === 'stories' ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative min-h-[85vh] w-full flex flex-col items-center justify-start py-16 px-6 overflow-hidden -mt-[82px] pt-[120px]"
        >
          {/* Full bleed background image with subtle dark overlay */}
          <div className="absolute inset-0 z-[1] pointer-events-none select-none">
            <img 
              src="/assets/pexels-yagiz-ucal-2152858471-33610751.jpg" 
              className="w-full h-full object-cover filter brightness-[0.70] contrast-[1.02] saturate-[1.1]" 
              alt="Munda Wanga Visitor Stories backdrop" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-[#162625]/90 z-[2]" />
          </div>

          <div className="relative z-10 w-full max-w-6xl mx-auto space-y-12 mt-6">
            
            {/* Header section with Dynamic Ratings filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end text-left p-6 sm:p-8 text-white">
              <div className="space-y-4 font-sans">
                <span className="text-[#acffa3] font-mono text-xs uppercase font-extrabold tracking-widest block font-bold">
                  The Guestbook Desk
                </span>
                <h1 className="text-3xl sm:text-5xl font-display font-extrabold leading-tight text-white animate-fade-in">
                  The Kind of Day <br />
                  <span className="font-light text-[#ffd662]">People Talk About</span>
                </h1>
                <p className="text-xs text-white/80 leading-relaxed max-w-sm">
                  Filter by ratings or write your own experience down below to instantly update the verified visitor stories feed!
                </p>
              </div>

              {/* RATINGS QUICK FILTER */}
              <div className="space-y-3 font-mono text-xs text-left text-white">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-white/60 tracking-widest block">Stars Quick Filter</span>
                  <div className="flex flex-wrap gap-1.5 font-sans">
                    {['all', 5, 4, 3].map((val) => (
                      <button
                        key={val}
                        onClick={() => setRatingFilter(val as any)}
                        className={`py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all border ${
                          ratingFilter === val 
                            ? 'bg-[#388653] border-[#388653] text-white font-extrabold shadow-sm' 
                            : 'border-white/10 text-white/75 hover:bg-white/5'
                        }`}
                      >
                        {val === 'all' ? 'Show All Reviews' : `${val} Stars ★`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Split submission form + reviews cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Review submit form */}
              <div className="lg:col-span-4 bg-black/35 backdrop-blur-md border border-white/10 p-6 rounded-[32px] space-y-6 text-white text-left shadow-sm">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-extrabold tracking-tight flex items-center gap-2 text-white">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                    <span>Post Your Story</span>
                  </h3>
                  <p className="text-xs text-white/70 font-sans">
                    Submit your thoughts to immediately see them listed in the verification feed.
                  </p>
                </div>

                {storySuccessMsg && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-[#acffa3] text-xs rounded-xl font-medium animate-fade-in flex items-center gap-2 font-sans">
                    <CheckCircle className="w-4 h-4 text-[#acffa3] flex-shrink-0" />
                    <span>{storySuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmittingStory} className="space-y-4 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-white/60 uppercase tracking-widest block mb-1.5">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mwansa Banda"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full bg-[#162625] border border-white/15 focus:border-[#acffa3] p-3 rounded-xl focus:outline-none font-sans text-sm text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-white/60 uppercase tracking-widest block mb-1.5">Your Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Lusaka, Zambia"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full bg-[#162625] border border-white/15 focus:border-[#acffa3] p-3 rounded-xl focus:outline-none font-sans text-sm text-white"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-extrabold text-white/60 uppercase tracking-widest block mb-1.5">Select Star Rating</label>
                    <div className="flex gap-1 justify-start">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          type="button"
                          key={stars}
                          onClick={() => setNewRating(stars)}
                          className="p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-[#acffa3] cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${newRating >= stars ? 'fill-[#acffa3] text-[#acffa3]' : 'text-white/30'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-white/60 uppercase tracking-widest block mb-1.5">Your Experience</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about the animals you watched, trails walked, or the picnic spots..."
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      className="w-full bg-[#162625] border border-white/15 focus:border-[#acffa3] p-3 rounded-xl focus:outline-none font-sans text-sm text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#388653] hover:bg-[#2c6c41] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer flex justify-center items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Story</span>
                  </button>
                </form>
              </div>

              {/* List of cards */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {stories
                    .filter(story => {
                      if (ratingFilter === 'all') return true;
                      const starsReviewOption = (story as any).rating || 5;
                      return starsReviewOption === ratingFilter;
                    })
                    .map((story) => (
                      <motion.div
                        layout
                        key={story.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border border-white/10 hover:border-white/20 bg-black/35 backdrop-blur-sm p-6 rounded-[32px] flex flex-col justify-between shadow-sm text-left transition-all"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-0.5 text-[#acffa3]">
                              {Array.from({ length: (story as any).rating || 5 }).map((_, stIdx) => (
                                <Star key={stIdx} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </div>
                            <span className="text-[8px] font-mono text-[#acffa3] bg-[#acffa3]/10 py-1 px-2.5 rounded-full uppercase font-bold tracking-widest">
                              Verified Visit
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-white/90 leading-relaxed italic font-sans">
                            "{story.text}"
                          </p>
                        </div>

                        <div className="pt-6 border-t border-white/10 mt-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-black/20 flex-shrink-0">
                            <img src={story.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={story.name} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{story.name}</h4>
                            <p className="text-[9px] font-mono text-white/50 uppercase tracking-widest mt-0.5 truncate">
                              {story.location} • {story.time}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  }
                </AnimatePresence>
              </div>

            </div>

          </div>
        </motion.div>
      ) : currentPage === 'faq' ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative min-h-[85vh] w-full flex flex-col items-center justify-start py-16 px-6 overflow-hidden -mt-[82px] pt-[120px]"
        >
          <div className="relative z-10 w-full max-w-6xl mx-auto space-y-10 mt-6 text-[#162625]">
            
            <div className="text-left p-6 sm:p-8 space-y-3">
              <span className="text-[#388653] font-mono text-xs uppercase font-extrabold tracking-widest block">
                FAQ &amp; Admission Passes
              </span>
              <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[#162625] leading-none">
                Know Before <br />
                <span className="font-light text-[#388653]">You Reach the Gate</span>
              </h1>
              <p className="text-xs text-[#162625]/80 font-sans max-w-lg">
                Calculate custom admission discounts, generate secure visitor passes with virtual QR codes, and review core guidelines.
              </p>
            </div>

            {/* Big beautiful FAQ banner preview */}
            <div className="px-6 sm:px-8">
              <div className="aspect-[21/9] w-full rounded-[24px] overflow-hidden border border-[#162625]/10 shadow-sm">
                <img
                  src="/assets/3.jpg"
                  className="w-full h-full object-cover"
                  alt="Visitor gate banner view"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Interactive Admissions Pass Generator */}
              <div className="lg:col-span-5 border border-[#162625]/10 p-6 sm:p-8 rounded-[32px] text-[#162625] text-left space-y-6 shadow-sm">
                <div>
                  <span className="text-[9px] font-mono text-[#388653] uppercase tracking-widest font-extrabold block">Pass Generator Sandbox</span>
                  <h3 className="text-lg font-display font-extrabold">Instant Group Pass</h3>
                  <p className="text-xs text-[#162625]/50 font-sans">
                    Configure dates and counts to generate your customized virtual barcode ticket!
                  </p>
                </div>

                {isPassGenerated ? (
                  <div className="space-y-4 font-mono text-center animate-fade-in border-4 border-dashed border-[#388653]/25 p-5 rounded-2xl bg-[#388653]/5 text-[#162625]">
                    <span className="text-[9px] bg-[#388653] text-white px-2.5 py-1 rounded-full uppercase font-bold tracking-widest inline-block">
                      🎫 Provisional Park Pass
                    </span>
                    <h4 className="text-sm font-bold uppercase mt-1">Munda Wanga Sanctuary</h4>

                    <div className="border-t border-b border-[#162625]/10 py-3 text-xs space-y-1 text-left">
                      <div className="flex justify-between">
                        <span>Residency:</span>
                        <span className="font-bold uppercase">{residency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Adult Visitors:</span>
                        <span className="font-bold">{adultCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Child Visitors:</span>
                        <span className="font-bold">{childCount}</span>
                      </div>
                      <div className="flex justify-between border-t border-dashed border-[#162625]/10 pt-2 font-bold text-[#388653]">
                        <span>Pledge Total:</span>
                        <span>
                          {residency === 'local' ? `K${(adultCount * 50) + (childCount * 25)}` : `$${(adultCount * 15) + (childCount * 8)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center flex-col items-center pt-2 space-y-1 bg-white p-3 rounded-xl border border-[#162625]/10">
                      <QrCode className="w-24 h-24 text-[#162625]" />
                      <span className="text-[7px] text-[#162625]/50 tracking-widest uppercase font-extrabold">
                        REF_MW_70201
                      </span>
                    </div>

                    <p className="text-[9px] font-sans leading-normal italic text-[#162625]/60">
                      Show this virtual pass at our main gate scanner to authorize group discounts!
                    </p>

                    <button
                      onClick={() => setIsPassGenerated(false)}
                      className="w-full py-2 bg-[#162625] hover:bg-[#388653] text-white text-[9px] uppercase tracking-wider font-bold rounded-lg cursor-pointer transition-all"
                    >
                      ← Modify Details
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 font-mono text-xs text-left">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-[#162625]/60 uppercase tracking-widest block mb-1.5">Residency Type</label>
                      <div className="grid grid-cols-2 gap-2 font-sans text-xs">
                        <button
                          type="button"
                          onClick={() => setResidency('local')}
                          className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${residency === 'local' ? 'bg-[#162625] border-[#162625] text-white shadow-sm' : 'border-[#162625]/15 bg-transparent hover:bg-[#162625]/5'}`}
                        >
                          Local ZM
                        </button>
                        <button
                          type="button"
                          onClick={() => setResidency('international')}
                          className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${residency === 'international' ? 'bg-[#162625] border-[#162625] text-white shadow-sm' : 'border-[#162625]/15 bg-transparent hover:bg-[#162625]/5'}`}
                        >
                          International
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#162625]/5 border border-[#162625]/10 rounded-2xl space-y-1">
                        <label className="text-[11px] uppercase font-bold text-[#162625]/60 tracking-wider block mb-1">Adults (12+)</label>
                        <div className="flex items-center justify-between font-sans">
                          <button type="button" onClick={() => setAdultCount(prev => Math.max(1, prev - 1))} className="w-10 h-10 bg-white border border-[#162625]/15 rounded-xl text-base font-bold select-none cursor-pointer text-[#162625] hover:bg-neutral-50 active:scale-95 transition-all shadow-sm flex items-center justify-center">-</button>
                          <span className="font-extrabold text-sm text-[#162625]">{adultCount}</span>
                          <button type="button" onClick={() => setAdultCount(prev => prev + 1)} className="w-10 h-10 bg-white border border-[#162625]/15 rounded-xl text-base font-bold select-none cursor-pointer text-[#162625] hover:bg-neutral-50 active:scale-95 transition-all shadow-sm flex items-center justify-center">+</button>
                        </div>
                      </div>
                      <div className="p-3 bg-[#162625]/5 border border-[#162625]/10 rounded-2xl space-y-1">
                        <label className="text-[11px] uppercase font-bold text-[#162625]/60 tracking-wider block mb-1">Children (2-11)</label>
                        <div className="flex items-center justify-between font-sans">
                          <button type="button" onClick={() => setChildCount(prev => Math.max(0, prev - 1))} className="w-10 h-10 bg-white border border-[#162625]/15 rounded-xl text-base font-bold select-none cursor-pointer text-[#162625] hover:bg-neutral-50 active:scale-95 transition-all shadow-sm flex items-center justify-center">-</button>
                          <span className="font-extrabold text-sm text-[#162625]">{childCount}</span>
                          <button type="button" onClick={() => setChildCount(prev => prev + 1)} className="w-10 h-10 bg-white border border-[#162625]/15 rounded-xl text-base font-bold select-none cursor-pointer text-[#162625] hover:bg-neutral-50 active:scale-95 transition-all shadow-sm flex items-center justify-center">+</button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#388653]/5 border border-[#388653]/15 text-xs text-left">
                      <div className="flex justify-between font-bold text-[#162625]">
                        <span>Estimated Charge:</span>
                        <span className="text-[#388653] text-sm">
                          {residency === 'local' ? `K${(adultCount * 50) + (childCount * 25)}` : `$${(adultCount * 15) + (childCount * 8)}`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsPassGenerated(true)}
                      className="w-full py-3 bg-[#388653] hover:bg-[#2c6c41] text-white font-mono font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Confirm &amp; Generate Barcode</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: FAQ Accordions */}
              <div className="lg:col-span-7 space-y-4">
                {FAQ_DATA.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div 
                      key={faq.id}
                      className="border border-[#162625]/10 rounded-2xl overflow-hidden shadow-sm text-left bg-transparent"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none focus:ring-1 focus:ring-[#388653] group cursor-pointer"
                      >
                        <span className="font-display font-extrabold text-sm sm:text-md text-[#162625] group-hover:text-[#388653] transition-colors leading-tight">
                          {faq.question}
                        </span>
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#162625]/5 text-[#162625]/70 group-hover:bg-[#388653]/10 group-hover:text-[#388653] transition-colors flex items-center justify-center">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-t border-[#162625]/10"
                          >
                            <div className="p-6 bg-[#162625]/5 text-xs sm:text-sm text-[#162625]/85 leading-relaxed font-sans">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <div className="p-5 rounded-2xl border border-[#162625]/10 flex flex-col sm:flex-row items-center gap-4 text-xs text-left">
                  <span className="text-[#162625]/80 font-sans flex items-center gap-1.5 justify-start">
                    <Info className="w-4 h-4 text-[#388653] flex-shrink-0" />
                    <span>School grant packages qualify for 40%+ discount with dynamic codes.</span>
                  </span>
                  <button 
                    onClick={() => {
                      setIsPassModalOpen(true);
                      setIsPassGenerated(false);
                    }}
                    className="font-mono font-bold uppercase tracking-wider text-[#388653] hover:underline cursor-pointer ml-auto"
                  >
                    PLAN EDUCATIONAL TRIP
                  </button>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      ) : currentPage === 'map' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative min-h-[90vh] w-full flex flex-col items-center justify-start py-16 px-6 overflow-hidden -mt-[82px] pt-[120px]"
        >
          <div className="relative z-10 w-full max-w-6xl mx-auto space-y-8 mt-4">
            {/* Elegant header segment */}
            <div className="text-left py-4 space-y-2">
              <span className="text-[#388653] font-mono text-xs uppercase font-extrabold tracking-widest block">
                IMMERSIVE PARK COMPASS
              </span>
              <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[#162625] leading-none">
                Interactive <span className="font-light text-[#388653]">Sanctuary Explorer</span>
              </h1>
              <p className="text-xs text-[#162625]/80 font-sans max-w-xl">
                Locate critical botanical glasshouses, follow wildlife rehabilitation cages, or test your tracking skills in our digital habitat exploration hub.
              </p>
            </div>

            {/* Custom Interactive Isometric Map component */}
            <ParkMap />
          </div>
        </motion.div>
      ) : null}

      {/* FOOTER & IMMERSIVE BASE MAP */}
      <motion.footer 
        initial={{ opacity: 0, y: 55, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.08, margin: "-100px 0px" }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-[#162625] text-[#f2e9d8] pt-20 pb-12 overflow-hidden"
      >
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Column 1 - Brand Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <img 
                    src="/assets/Logo.png" 
                    className="h-24 w-auto object-contain filter brightness-0 invert" 
                    alt="Munda Wanga Logo" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#acffa3]">
                  Explore Zambia’s Wild Heart
                </p>
              </div>
              <p className="text-xs text-[#f2e9d8]/65 max-w-sm font-sans leading-relaxed">
                Munda Wanga is Zambia's ultimate environmental sanctuary, merging premier botanical floral trails, rescued wildlife habitats, and nature classrooms into one immersive ecosystem.
              </p>

              <div className="space-y-1 bg-black/20 p-4 border border-white/5 rounded-2xl">
                <p className="text-[9px] font-mono text-white/50 uppercase tracking-wider">Sanctuary Gate Location</p>
                <p className="text-xs font-sans text-white/95 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#acffa3] flex-shrink-0" />
                  <span>Kafue Road, Chilanga, Lusaka, Zambia</span>
                </p>
              </div>
            </div>

            {/* Column 2 - Links columns */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-8 text-xs font-sans">
              
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-extrabold">
                  Explore Fauna
                </h4>
                <ul className="space-y-2.5 text-[#f2e9d8]/75">
                  <li><a href="#animals" className="hover:text-white transition-colors">Rescued Big Cats</a></li>
                  <li><a href="#animals" className="hover:text-white transition-colors">Vocal Aviaries</a></li>
                  <li><a href="#animals" className="hover:text-white transition-colors">Reptile Houses</a></li>
                  <li><a href="#animals" className="hover:text-white transition-colors">Flora Species List</a></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#ffd662] font-extrabold">
                  Support Mission
                </h4>
                <ul className="space-y-2.5 text-[#f2e9d8]/75">
                  <li><span className="hover:text-white transition-colors cursor-pointer">Tax-Free Donations</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Educational Grants</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Wildlife Adoption</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Sponsorship Badges</span></li>
                </ul>
              </div>

            </div>

            {/* Column 3 - Newsletter form */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-1">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-extrabold">
                  Join the Conservation Feed
                </h4>
                <p className="text-xs text-[#f2e9d8]/65 font-sans">
                  Sign up for seasonal bloom alerts, wildlife rescue stories, and program releases.
                </p>
              </div>

              {newsletterSubbed ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-[#acffa3] rounded-2xl text-xs font-medium animate-fade-in flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Welcome! You are subscribed.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterJoin} className="flex gap-2 font-mono text-xs">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="bg-black/25 text-white border border-white/10 hover:border-white/20 focus:border-emerald-300 rounded-xl px-3.5 py-3 w-full focus:outline-none font-sans"
                  />
                  <button
                    type="submit"
                    className="p-3.5 bg-[#ffd662] hover:bg-[#ffe082] text-[#162625] rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="pt-2 flex flex-col sm:flex-row text-[10px] font-mono text-white/40 justify-between items-start gap-4 uppercase tracking-wider">
                <div className="flex gap-1 items-center">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Gates: 08:00 - 18:00 daily</span>
                </div>
                <div>
                  <span>Plan visit before entry</span>
                </div>
              </div>

            </div>

          </div>

          <hr className="border-white/10" />

          {/* Copyright bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-[#f2e9d8]/45 uppercase tracking-wider">
            <p>© {new Date().getFullYear()} Munda Wanga Environmental Park. All rights reserved.</p>
            <div className="flex gap-4 items-center">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Charter</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">Zambia tourism link</span>
              <span>•</span>
              <button
                onClick={() => {
                  setLoadingProgress(0);
                  setActiveIconIdx(0);
                  setIsLoading(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-[#ffd662] hover:text-[#162625] text-white transition-all text-[9px] uppercase tracking-wider cursor-pointer border border-white/10 hover:border-[#ffd662]"
              >
                <Sparkles className="w-3 h-3 text-[#ffd662] class-pulse group-hover:text-current" />
                Replay Intro
              </button>
            </div>
          </div>

        </div>

      </motion.footer>

      {/* ANIMAL DETAIL SLIDE-OUT PANEL (Immersive Drawer) */}
      <AnimatePresence>
        {selectedAnimal && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnimal(null)}
              className="absolute inset-0 bg-black pointer-events-auto"
            />

            {/* Slide block */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-[#f2e9d8] border-l border-[#162625]/15 p-6 sm:p-8 flex flex-col justify-between h-full z-10 shadow-2xl "
            >
              {/* Close pin */}
              <button
                onClick={() => setSelectedAnimal(null)}
                className="absolute top-6 right-6 p-2 rounded-full border border-[#162625]/10 hover:bg-[#162625]/5 text-[#162625]"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6 overflow-y-auto pr-2 pb-6 max-h-[80vh] scrollbar text-left">
                
                <span className="inline-block bg-[#388653] text-[#f2e9d8] text-[9px] font-mono tracking-widest uppercase font-bold py-1 px-3 rounded-full mt-4">
                  {selectedAnimal.tag}
                </span>

                <div className="space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-[#388653] font-bold">
                    {selectedAnimal.subtitle}
                  </p>
                  <h3 className="text-3xl font-display font-extrabold text-[#162625] leading-none">
                    {selectedAnimal.name}
                  </h3>
                </div>

                <div className="aspect-video rounded-2xl overflow-hidden shadow-sm border border-[#162625]/10">
                  <img
                    src={selectedAnimal.image}
                    alt={selectedAnimal.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <p className="text-xs sm:text-sm text-[#162625]/85 leading-relaxed font-sans pt-2">
                  {selectedAnimal.description}
                </p>

                {/* Species Conservation Details Decal */}
                <div className="p-4 rounded-xl bg-white/70 border border-[#162625]/10 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-[#162625]/55">Conservation Status</span>
                    <p className="text-xs font-display font-extrabold text-[#388653] flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Rescued &amp; Protected</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-[#162625]/55">Optimal Viewing Time</span>
                    <p className="text-xs font-sans font-bold text-[#162625]">
                      09:00 - 11:30 (Active Feeding)
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-[#162625]/10 pt-2 space-y-1">
                    <span className="text-[9px] font-mono uppercase text-[#162625]/55">Virtual Soundscape Simulator</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-sans text-[#162625]/75 italic">Grey Parrot mimicking rain &amp; wind calls</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#ffd662]/10 border border-[#ffd662]/30 text-amber-900 text-xs rounded-xl font-sans flex items-start gap-2.5 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>Always maintain a 2-meter safety distance behind secure protective wire rails while visiting enclosures. Never attempt to feed animals outside of guided staff visits.</span>
                </div>

              </div>

              {/* Action plan button */}
              <div className="pt-4 border-t border-[#162625]/15 mt-4">
                <button
                  onClick={() => {
                    setSelectedAnimal(null);
                    setIsPassModalOpen(true);
                    setIsPassGenerated(false);
                  }}
                  className="w-full bg-[#162625] hover:bg-[#388653] text-[#f2e9d8] py-4 rounded-xl font-bold uppercase tracking-wider text-xs font-mono transition-all flex justify-center items-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book pass to see the {selectedAnimal.name}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* "PLAN YOUR VISIT" ADMISSION CALCULATOR AND TICKET GENERATOR */}
      <AnimatePresence>
        {isPassModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPassModalOpen(false)}
              className="absolute inset-0 bg-black pointer-events-auto"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#f2e9d8] text-[#162625] border border-[#162625]/20 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[#388653] font-bold tracking-widest bg-[#388653]/10 py-1 px-3 rounded-full inline-block">
                    Interactive Admission Planner
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight">
                    Munda Wanga Park Pass
                  </h3>
                </div>
                <button
                  onClick={() => setIsPassModalOpen(false)}
                  className="p-1.5 rounded-full border border-[#162625]/10 hover:bg-[#162625]/5 text-[#162625]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              {!isPassGenerated ? (
                <div className="space-y-4 text-xs font-mono text-left">
                  
                  {/* Local vs International Residencies Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-extrabold text-[#162625]/75 tracking-widest block">Residency Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setResidency('local')}
                        className={`py-3 px-3 rounded-xl border text-center transition-all font-mono font-bold tracking-wider ${
                          residency === 'local' 
                            ? 'bg-[#162625] border-[#162625] text-[#f2e9d8]' 
                            : 'border-[#162625]/15 bg-white/40 hover:bg-white/70'
                        }`}
                      >
                        Local visitor (K50/K25)
                      </button>
                      <button
                        type="button"
                        onClick={() => setResidency('international')}
                        className={`py-3 px-3 rounded-xl border text-center transition-all font-mono font-bold tracking-wider ${
                          residency === 'international' 
                            ? 'bg-[#162625] border-[#162625] text-[#f2e9d8]' 
                            : 'border-[#162625]/15 bg-white/40 hover:bg-white/70'
                        }`}
                      >
                        International ($15/$8)
                      </button>
                    </div>
                  </div>

                  {/* Planned Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-extrabold text-[#162625]/75 tracking-widest block">Select Planned Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full bg-white border border-[#162625]/15 focus:border-[#388653] p-3 rounded-xl focus:outline-none font-sans text-sm text-[#162625]"
                      />
                    </div>
                  </div>

                  {/* Adults and Children counters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-3.5 bg-white/50 border border-[#162625]/10 rounded-2xl">
                    <label className="text-[11px] uppercase font-extrabold text-[#162625]/70 tracking-widest block">Adults (12+ yrs)</label>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setAdultCount(prev => Math.max(1, prev - 1))}
                          className="w-10 h-10 rounded-xl bg-white border border-[#162625]/10 text-[#162625] flex items-center justify-center font-bold text-base hover:bg-[#162625]/5 active:scale-95 transition-all shadow-sm"
                        >
                          -
                        </button>
                        <span className="text-md font-sans font-extrabold text-[#162625]">{adultCount}</span>
                        <button
                          type="button"
                          onClick={() => setAdultCount(prev => prev + 1)}
                          className="w-10 h-10 rounded-xl bg-white border border-[#162625]/10 text-[#162625] flex items-center justify-center font-bold text-base hover:bg-[#162625]/5 active:scale-95 transition-all shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 p-3.5 bg-white/50 border border-[#162625]/10 rounded-2xl">
                    <label className="text-[11px] uppercase font-extrabold text-[#162625]/70 tracking-widest block">Children (&lt;12 yrs)</label>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setChildCount(prev => Math.max(0, prev - 1))}
                          className="w-10 h-10 rounded-xl bg-white border border-[#162625]/10 text-[#162625] flex items-center justify-center font-bold text-base hover:bg-[#162625]/5 active:scale-95 transition-all shadow-sm"
                        >
                          -
                        </button>
                        <span className="text-md font-sans font-extrabold text-[#162625]">{childCount}</span>
                        <button
                          type="button"
                          onClick={() => setChildCount(prev => prev + 1)}
                          className="w-10 h-10 rounded-xl bg-white border border-[#162625]/10 text-[#162625] flex items-center justify-center font-bold text-base hover:bg-[#162625]/5 active:scale-95 transition-all shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing dynamic calculation box */}
                  <div className="p-4 rounded-2xl bg-[#162625] text-white space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-white/60">
                      <span>Subtotal amount:</span>
                      <span className="font-sans font-medium text-white/95">
                        {residency === 'local' ? `K${calculatedTotal.subtotal}` : `$${calculatedTotal.subtotal / 24}`}
                      </span>
                    </div>

                    {calculatedTotal.discount > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-emerald-300 font-bold">
                        <span>Group Promo Discount (10%):</span>
                        <span>
                          -{residency === 'local' ? `K${calculatedTotal.discount}` : `$${calculatedTotal.discount / 24}`}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-white/10 pt-2 font-display text-sm">
                      <span className="font-extrabold text-white">Estimated Cost total:</span>
                      <span className="font-sans font-black text-[#ffd662]">
                        {residency === 'local' ? `K${calculatedTotal.total}` : `$${calculatedTotal.total / 24}`}
                      </span>
                    </div>

                    <p className="text-[9px] text-[#ffd662]/75 font-sans leading-tight">
                      *Note: Group discount matches 10% off automatically for groups of 5+ adults or children combined. Payments are made locally at the entry gate.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsPassGenerated(true)}
                    className="w-full py-4 bg-[#388653] hover:bg-[#388653]/90 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex justify-center items-center gap-2 cursor-pointer shadow-md"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Generate Virtual Park Pass</span>
                  </button>

                </div>
              ) : (
                /* Generated Park Pass View */
                <div className="space-y-6 text-center animate-fade-in text-xs font-mono">
                  
                  <div className="inline-flex gap-2 items-center bg-[#388653]/10 text-[#388653] py-1 px-3.5 rounded-full uppercase font-bold tracking-widest text-[9px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>MOCK PASS GENERATED SUCCESSFULLY</span>
                  </div>

                  {/* Physical Pass Decal Card */}
                  <div className="p-6 border-2 border-dashed border-white/25 rounded-[32px] bg-black/40 backdrop-blur-md text-white space-y-6 relative overflow-hidden">
                    
                    {/* Header bar */}
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <img 
                          src="/assets/Logo.png" 
                          className="h-10 w-auto object-contain filter brightness-0 invert" 
                          alt="Munda Wanga Logo" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="font-display font-extrabold text-md uppercase leading-none tracking-tight text-white">Munda Wanga</span>
                      </div>
                      <span className="text-[8px] bg-[#388653] text-white py-0.5 px-2 rounded-full uppercase font-bold tracking-wider">SANCTUARY ADMISSION</span>
                    </div>

                    {/* QR Code and details split */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                      
                      {/* Generative QR Code Icon container */}
                      <div className="p-4 rounded-2xl bg-[#162625]/90 border border-white/10 text-[#ffd662] shadow-sm flex-shrink-0">
                        <QrCode className="w-24 h-24 stroke-1.5" />
                      </div>

                      {/* Details */}
                      <div className="text-left space-y-2 font-sans w-full text-white">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-white/50 block">VISIT DATE</span>
                          <span className="text-xs font-extrabold text-white">
                            {visitDate ? new Date(visitDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'Open Reservation'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[9px] font-mono uppercase text-white/50 block">PARTY</span>
                            <span className="font-bold text-white">
                              {adultCount} Adult{adultCount > 1 ? 's' : ''} {childCount > 0 ? `, ${childCount} Kid${childCount > 1 ? 's' : ''}` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono uppercase text-white/50 block">FEES</span>
                            <span className="font-bold text-[#acffa3]">
                              {residency === 'local' ? `K${calculatedTotal.total}` : `$${calculatedTotal.total / 24}`}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Explanatory footprint */}
                    <div className="pt-3 border-t border-white/10 text-[9px] text-white/55 block font-mono">
                      BARCODE ID: MW-{Math.floor(100000 + Math.random() * 900000)} • SCAN AT GATE TERMINAL
                    </div>

                  </div>

                  <p className="text-xs text-[#162625]/75 font-sans leading-relaxed text-left">
                    Take a screenshot or bookmark this mockup pass. Present this at the Chilanga entry gates upon arrival. Estimated check-in duration: Under 2 minutes. We can't wait to welcome your pack!
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsPassGenerated(false)}
                      className="w-1/2 py-3 border border-[#162625]/15 hover:border-[#162625]/45 text-[#162625] rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all"
                    >
                      Edit details
                    </button>
                    <button
                      onClick={() => setIsPassModalOpen(false)}
                      className="w-1/2 py-3 bg-[#162625] hover:bg-[#162625]/90 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all"
                    >
                      Done
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMMERSIVE GALLERY FOCUS LIGHTBOX */}
      <AnimatePresence>
        {focusedGalleryItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] bg-[#0b1110]/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
            onClick={() => setFocusedGalleryItem(null)} // Click outside to close
          >
            {/* Close button top right of screen */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/50 select-none hidden sm:inline">
                Esc to close
              </span>
              <button
                onClick={() => setFocusedGalleryItem(null)}
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white text-white/80 hover:text-white bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Close spotlight"
              >
                ✕
              </button>
            </div>

            {/* Main Modal Container */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative max-w-5xl w-full bg-[#162625]/95 border border-white/15 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.8)] cursor-default grid grid-cols-1 md:grid-cols-12 gap-0 max-h-[90vh] overflow-y-auto md:overflow-visible"
              onClick={(e) => e.stopPropagation()} // Prevent clicking inner modal from closing
            >
              {/* Image Frame Left (7 columns on md+) */}
              <div className="md:col-span-7 relative h-[250px] sm:h-[350px] md:h-[550px] overflow-hidden group">
                <img
                  src={focusedGalleryItem.url}
                  alt={focusedGalleryItem.title}
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Gradient Shading */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
                
                {/* Floating Location Badge */}
                <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 bg-[#162625]/85 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 text-[9px] font-mono uppercase tracking-widest text-[#acffa3] font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{focusedGalleryItem.location}</span>
                </div>
              </div>

              {/* Description Content Right (5 columns on md+) */}
              <div className="md:col-span-5 p-6 md:p-10 flex flex-col justify-between text-left min-h-[300px] md:min-h-[550px] bg-[#111e1d]">
                
                {/* Header & Description */}
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-[#acffa3] font-bold uppercase block">
                      {focusedGalleryItem.name}
                    </span>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold text-white leading-tight tracking-tight">
                      {focusedGalleryItem.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#f2e9d8]/85 leading-relaxed font-sans">
                    {focusedGalleryItem.description}
                  </p>

                  {/* Extra Rehabilitation Stats to enrich detail (Anti-Slop, contextually-relevant copy) */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <h4 className="text-[10px] font-mono uppercase text-white/50 tracking-wider">Sanctuary Status &amp; Integration</h4>
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div>
                        <span className="text-[8px] font-mono text-[#acffa3]/70 block uppercase">Supervision</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">24/7 Wardens</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-[#acffa3]/70 block uppercase">Environment</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Bioregulation</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation and Actions */}
                <div className="pt-6 border-t border-white/10 flex flex-col gap-4 mt-6">
                  {/* Quick soundscape simulation triggers */}
                  <div className="flex items-center justify-between text-xs font-mono text-white/65">
                    <span>Sensory Audio:</span>
                    <button
                      onClick={() => {
                        setIsPlayingAudioSim(true);
                        if (focusedGalleryItem.id === 'tiger') setActiveSound('deep');
                        else if (focusedGalleryItem.id === 'eagle') setActiveSound('aviary');
                        else setActiveSound('canopy');
                        triggerToast(`Immersive spatial sounds active for ${focusedGalleryItem.title}.`);
                      }}
                      className="text-[#acffa3] hover:text-[#ffd662] transition-colors font-bold uppercase tracking-widest text-[9px] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      Play Ambient Sound
                    </button>
                  </div>

                  {/* Slider Carousel Navigation Arrows */}
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrevFocused}
                        className="w-10 h-10 rounded-xl border border-white/10 hover:border-white/30 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                        aria-label="Previous slide"
                      >
                        ←
                      </button>
                      <button
                        onClick={handleNextFocused}
                        className="w-10 h-10 rounded-xl border border-white/10 hover:border-white/30 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                        aria-label="Next slide"
                      >
                        →
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setIsPassModalOpen(true);
                        setIsPassGenerated(false);
                        setFocusedGalleryItem(null); // Close spotlight when planning visit
                        triggerToast(`Secure ticket pass constructor initialized for ${focusedGalleryItem.title}.`);
                      }}
                      className="px-4 md:px-5 py-3 bg-[#ffd662] hover:bg-[#ffe082] text-[#162625] font-extrabold uppercase text-[10px] tracking-[0.15em] rounded-xl transition-all hover:scale-102 active:scale-95 cursor-pointer"
                    >
                      Plan Visit
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING SENSORY SOUNDSCAPE ENGINE */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <div className="flex items-center gap-2">
          {activeSound !== 'off' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#162625]/95 backdrop-blur-md border border-[#acffa3]/20 py-2 px-3.5 rounded-2xl flex items-center gap-1.5 shadow-2xl"
            >
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-0.5 bg-[#acffa3] rounded-full animate-wave-bar" style={{ height: '35%' }} />
                <div className="w-0.5 bg-[#acffa3] rounded-full animate-wave-bar" style={{ height: '70%', animationDelay: '0.2s' }} />
                <div className="w-0.5 bg-[#acffa3] rounded-full animate-wave-bar" style={{ height: '100%', animationDelay: '0.4s' }} />
                <div className="w-0.5 bg-[#acffa3] rounded-full animate-wave-bar" style={{ height: '50%', animationDelay: '0.1s' }} />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#acffa3] font-black">
                {activeSound === 'canopy' && 'Canopy Winds'}
                {activeSound === 'aviary' && 'Aviary Birds'}
                {activeSound === 'deep' && 'Midnight Roars'}
              </span>
            </motion.div>
          )}

          <div className="relative group/sound">
            <button
              onClick={() => setActiveSound(prev => prev === 'off' ? 'canopy' : prev === 'canopy' ? 'aviary' : prev === 'aviary' ? 'deep' : 'off')}
              className={`p-3.5 rounded-full backdrop-blur-md border transition-all active:scale-95 shadow-lg flex items-center justify-center cursor-pointer ${
                activeSound === 'off'
                  ? 'bg-[#162625]/90 border-white/10 text-white/50 hover:text-white'
                  : 'bg-[#388653] border-[#acffa3]/40 text-white shadow-[0_0_15px_rgba(56,134,83,0.3)]'
              }`}
            >
              <Volume2 className="w-5 h-5 mx-auto" />
            </button>
            <div className="absolute right-0 bottom-full mb-2 bg-[#162625] border border-white/10 text-white text-[8px] tracking-wider font-mono uppercase py-1 px-2.5 rounded opacity-0 pointer-events-none group-hover/sound:opacity-100 transition-opacity whitespace-nowrap">
              {activeSound === 'off' && "Turn on Soundscapes"}
              {activeSound === 'canopy' && "Switch: Aviary Birds"}
              {activeSound === 'aviary' && "Switch: Midnight Roars"}
              {activeSound === 'deep' && "Turn Off Sound"}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING STATUS BOX ON BOTTOM LEFT */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-2.5">
        <div className="bg-[#162625]/95 backdrop-blur-md border border-white/10 rounded-full py-2.5 px-4 shadow-2xl flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#acffa3] font-bold">
            Reserve Active • Lusaka, ZM
          </span>
        </div>
      </div>

      {/* IMMERSIVE TOAST COMPONENT */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed bottom-24 right-6 left-6 md:left-auto md:w-96 z-[100] backdrop-blur-xl bg-[#162625]/95 border border-[#acffa3]/35 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-left flex gap-3.5 items-start animate-fade-in"
          >
            <div className="p-2 bg-[#388653]/20 rounded-xl text-[#acffa3] flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#acffa3]">System Action</h4>
              <p className="text-xs text-[#f2e9d8]/95 font-sans leading-relaxed">
                {toastMessage}
              </p>
            </div>
            <button 
              onClick={() => setToastMessage(null)} 
              className="text-white/40 hover:text-[#acffa3] transition-colors text-xs font-mono p-1 ml-auto"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
