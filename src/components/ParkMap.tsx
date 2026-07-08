import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  MapPin, 
  Trees, 
  PawPrint, 
  Bird, 
  Activity, 
  Sparkles, 
  Plus, 
  Minus, 
  RefreshCw, 
  Heart, 
  Info, 
  Droplet, 
  BookOpen, 
  Search,
  CheckCircle2,
  Navigation
} from 'lucide-react';

interface MapLocation {
  id: string;
  name: string;
  category: 'wildlife' | 'botanical' | 'building';
  tagline: string;
  description: string;
  icon: React.ComponentType<any>;
  image: string;
  coordX: number; // percentage width
  coordY: number; // percentage height
  status: 'Active Care' | 'Seasonal Bloom' | 'Visitor Gateway' | 'Operational';
  statusColor: string;
  funFact: string;
  sightingsToday: number;
}

// 3D Isometric Miniature Voxel-Style Architectural Block Models
function Isometric3DModel({
  locId,
  isSelected,
  onClick
}: {
  locId: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
      }}
      animate={{
        // Sit flat on the tilted map board and rise dynamically on selection/hover
        y: isSelected ? [-6, -16, -6] : [0, -3, 0],
        scale: isSelected ? 1.15 : 1.0,
      }}
      whileHover={{
        y: isSelected ? -20 : -8,
        scale: isSelected ? 1.2 : 1.08,
      }}
      whileTap={{ scale: 0.94, y: 0 }}
      transition={{
        y: isSelected 
          ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          : { duration: 3.0, repeat: Infinity, ease: "easeInOut" },
        default: { duration: 0.3 }
      }}
      className="relative focus:outline-none cursor-pointer w-32 h-32 flex items-center justify-center select-none"
    >
      <svg className="w-full h-full overflow-visible" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        {/* Ambient shadow is now handled outside on the flat surface map plane. */}

        {/* 3D MODEL 1: LION & CHEETAH RESERVE (Stepped Sandwood Canyons) */}
        {locId === 'loc-1' && (
          <g>
            {/* Base platform */}
            <path d="M 60 90 L 105 68 L 60 46 L 15 68 Z" fill="#9a3412" /> {/* Underbase */}
            <path d="M 15 68 L 60 90 L 60 98 L 15 76 Z" fill="#7c2d12" /> {/* Left Face */}
            <path d="M 60 90 L 105 68 L 105 76 L 60 98 Z" fill="#431407" /> {/* Right Face */}
            <path d="M 60 90 L 105 68 L 60 46 L 15 68 Z" fill="#b45309" /> {/* Top Sand Base */}

            {/* Stepped Cliff blocks (Tier 2 Center-Left) */}
            <path d="M 45 74 L 80 57 L 55 42 L 20 59 Z" fill="#ea580c" /> {/* Top */}
            <path d="M 20 59 L 45 74 L 45 84 L 20 69 Z" fill="#c2410c" /> {/* Left */}
            <path d="M 45 74 L 80 57 L 80 67 L 45 84 Z" fill="#7c2d12" /> {/* Right */}

            {/* Cliff Peak (Tier 3 Tall right-back) */}
            <path d="M 62 55 L 88 42 L 68 30 L 42 43 Z" fill="#f97316" /> {/* Top */}
            <path d="M 42 43 L 62 55 L 62 68 L 42 56 Z" fill="#ca8a04" /> {/* Left */}
            <path d="M 62 55 L 88 42 L 88 55 L 62 68 Z" fill="#a16207" />  {/* Right */}

            {/* Micro Trees / Shrubberies */}
            <ellipse cx="32" cy="56" rx="4" ry="2.5" fill="#15803d" />
            <ellipse cx="32" cy="53" rx="3.5" ry="3.5" fill="#166534" />
            <ellipse cx="80" cy="50" rx="3.5" ry="2" fill="#166534" />

            {/* Glow Halo around Emblem */}
            <circle cx="65" cy="30" r="14" fill="url(#amber-radial-glow)" opacity="0.65" />
          </g>
        )}

        {/* 3D MODEL 2: HIGH-NET AVIARY CANOPY (Geodesic Emerald Net Enclosure) */}
        {locId === 'loc-2' && (
          <g>
            {/* Tech Baseplate */}
            <path d="M 60 90 L 100 70 L 60 50 L 20 70 Z" fill="#334155" /> 
            <path d="M 20 70 L 60 90 L 60 96 L 20 76 Z" fill="#1e293b" /> 
            <path d="M 60 90 L 100 70 L 100 76 L 60 96 Z" fill="#0f172a" /> 
            <path d="M 60 90 L 100 70 L 60 50 L 20 70 Z" fill="#475569" /> {/* Top Base */}

            {/* Dome Geodesic Frame struts (Semi-Translucent Cyber Cage) */}
            <circle cx="60" cy="55" r="26" fill="rgba(6,182,212,0.06)" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="2 2" />
            
            {/* Isometric Glass arcs */}
            <path d="M 34 55 Q 60 25 86 55" fill="none" stroke="#22d3ee" strokeWidth="1.2" />
            <path d="M 60 29 M 34 55 Q 60 40 86 55" fill="none" stroke="#0891b2" strokeWidth="1" opacity="0.7" />
            <path d="M 35 60 Q 60 81 85 60" fill="none" stroke="#0e7490" strokeWidth="1.2" />
            
            {/* Internal birds nests */}
            <rect x="52" y="52" width="16" height="5" rx="2" fill="#78350f" opacity="0.8" />
            <circle cx="60" cy="50" r="3.5" fill="#fef08a" />

            {/* Golden Star at Apex */}
            <path d="M 60 21 L 62 25 L 66 26 L 62 27 L 60 31 L 58 27 L 54 26 L 58 25 Z" fill="#ffd662" />
            <circle cx="60" cy="26" r="12" fill="url(#cyan-radial-glow)" opacity="0.5" />
          </g>
        )}

        {/* 3D MODEL 3: BOTANICAL GLASSHOUSE (Victorian Glass conservatory) */}
        {locId === 'loc-3' && (
          <g>
            {/* Stone Masonry Platform */}
            <path d="M 60 90 L 105 68 L 60 46 L 15 68 Z" fill="#3f3f46" />
            <path d="M 15 68 L 60 90 L 60 98 L 15 76 Z" fill="#27272a" />
            <path d="M 60 90 L 105 68 L 105 76 L 60 98 Z" fill="#18181b" />
            <path d="M 60 90 L 105 68 L 60 46 L 15 68 Z" fill="#525255" /> {/* Slate Floor */}

            {/* Glasshouse left-wing */}
            <path d="M 24 64 L 50 76 L 50 60 L 24 48 Z" fill="rgba(16,185,129,0.35)" stroke="#34d399" strokeWidth="1" />
            <path d="M 24 48 L 50 60 L 37 40 Z" fill="rgba(52,211,153,0.2)" stroke="#a7f3d0" strokeWidth="1" />

            {/* Glasshouse right-wing */}
            <path d="M 50 76 L 96 64 L 96 48 L 50 60 Z" fill="rgba(16,185,129,0.5)" stroke="#059669" strokeWidth="1" />
            <path d="M 50 60 L 96 48 L 73 38 Z" fill="rgba(4,120,87,0.3)" stroke="#34d399" strokeWidth="1" />

            {/* Center Royal Conservatory tower (Symmetry) */}
            <path d="M 40 55 L 60 64 L 60 35 L 40 26 Z" fill="rgba(5,150,105,0.4)" stroke="#6ee7b7" strokeWidth="1.2" />
            <path d="M 60 64 L 80 55 L 80 26 L 60 35 Z" fill="rgba(4,120,87,0.55)" stroke="#34d399" strokeWidth="1.2" />
            {/* Pitched Roof */}
            <path d="M 40 26 L 60 35 L 80 26 L 60 14 Z" fill="rgba(16,185,129,0.7)" stroke="#a7f3d0" strokeWidth="1" />

            {/* Victorian White Filigree crown detail */}
            <line x1="60" y1="14" x2="60" y2="8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="60" cy="7" r="1.5" fill="#f59e0b" />

            {/* Glistening highlight flashes */}
            <line x1="48" y1="36" x2="52" y2="44" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
            <line x1="68" y1="34" x2="72" y2="42" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
          </g>
        )}

        {/* 3D MODEL 4: WETLANDS LAGOON (Volumetric Deep-Water Lily Basin) */}
        {locId === 'loc-4' && (
          <g>
            {/* Thick Dark Stone Basin Well Rim */}
            <path d="M 60 90 L 105 68 L 60 46 L 15 68 Z" fill="#1e293b" />
            <path d="M 15 68 L 60 90 L 60 98 L 15 76 Z" fill="#0f172a" />
            <path d="M 60 90 L 105 68 L 105 76 L 60 98 Z" fill="#020617" />
            <path d="M 60 90 L 105 68 L 60 46 L 15 68 Z" fill="#334155" /> {/* Stone rim top */}

            {/* Inset Dugout Pool Level with deep blue lagoon reservoir */}
            <path d="M 60 83 L 97 65 L 60 47 L 23 65 Z" fill="#0891b2" /> {/* Lagoon water surface */}
            <path d="M 60 83 L 97 65 L 60 47 L 23 65 Z" fill="url(#lagoon-blue-reflective)" />

            {/* Water Ripple Waves */}
            <ellipse cx="60" cy="65" rx="20" ry="10" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
            <ellipse cx="60" cy="65" rx="10" ry="5" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />

            {/* Floating 3D Pink Lotus Lily (Petal Cluster system) */}
            <g transform="translate(60, 62)">
              {/* Green Pad */}
              <ellipse cx="0" cy="3" rx="13" ry="7" fill="#047857" opacity="0.85" />
              <path d="M -13 3 Q -6 6 0 3" fill="none" stroke="#065f46" strokeWidth="1" />
              
              {/* Pink layered Lotus Blossom petals */}
              <path d="M 0 -8 C -4 -4 -6 1 0 5 C 6 1 4 -4 0 -8 Z" fill="#ec4899" />
              <path d="M -6 -4 C -8 -1 -9 3 -4 5 C 1 7 2 3 -6 -4 Z" fill="#f43f5e" />
              <path d="M 6 -4 C 8 -1 9 3 4 5 C -1 7 -2 3 6 -4 Z" fill="#f43f5e" />
              
              <path d="M 0 -5 C -2 -2 -3 1 0 3 C 3 1 2 -2 0 -5 Z" fill="#fbcfe8" />
              <circle cx="0" cy="0" r="1.8" fill="#ffd662" />
            </g>
          </g>
        )}

        {/* 3D MODEL 5: HERPETOLOGY & REPTILE PAVILION (Stacked Terrace Step-Pyramid) */}
        {locId === 'loc-5' && (
          <g>
            {/* Tier 1 (Massive Ground Layer) */}
            <path d="M 60 94 L 105 72 L 60 50 L 15 72 Z" fill="#b45309" />
            <path d="M 15 72 L 60 94 L 60 99 L 15 77 Z" fill="#78350f" />
            <path d="M 60 94 L 105 72 L 105 77 L 60 99 Z" fill="#451a03" />
            <path d="M 60 94 L 105 72 L 60 50 L 15 72 Z" fill="#d97706" />

            {/* Tier 2 (Middle layer stepped structure) */}
            <path d="M 60 81 L 91 66 L 60 48 L 29 66 Z" fill="#d97706" />
            <path d="M 29 66 L 60 81 L 60 88 L 29 73 Z" fill="#92400e" />
            <path d="M 60 81 L 91 66 L 91 73 L 60 88 Z" fill="#7c2d12" />
            <path d="M 60 81 L 91 66 L 60 48 L 29 66 Z" fill="#f59e0b" />

            {/* Tier 3 (Peak Altar/Observatory Deck) */}
            <path d="M 60 68 L 78 59 L 60 47 L 42 59 Z" fill="#fbbf24" />
            <path d="M 42 59 L 60 68 L 60 74 L 42 65 Z" fill="#b45309" />
            <path d="M 60 68 L 78 59 L 78 65 L 60 74 Z" fill="#92400e" />
            <path d="M 60 68 L 78 59 L 60 47 L 42 59 Z" fill="#fef08a" />

            {/* Continuous Neon Serpent (Tropic Green Serpent line wrapping the terrace steps) */}
            <path 
              d="M 33 68 Q 63 80 82 71 T 50 56 T 60 51" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2.8" 
              strokeLinecap="round" 
              opacity="0.95"
              className="drop-shadow-[0_0_8px_#10b981]"
            />
            
            {/* Serpent Eyes / Beacon */}
            <circle cx="60" cy="51" r="1.5" fill="#f87171" />
          </g>
        )}

        {/* 3D MODEL 6: SCIENCE CLASSROOM (Modern Solar Glass cabin Wood lodge) */}
        {locId === 'loc-6' && (
          <g>
            {/* Heavy Timber foundation deck */}
            <path d="M 60 90 L 105 68 L 60 46 L 15 68 Z" fill="#7c2d12" />
            <path d="M 15 68 L 60 90 L 60 96 L 15 74 Z" fill="#451a03" />
            <path d="M 60 90 L 105 68 L 105 74 L 60 96 Z" fill="#2d0f01" />
            <path d="M 60 90 L 105 68 L 60 46 L 15 68 Z" fill="#a16207" /> {/* Wood Floor deck */}

            {/* Left Lodge Cabin Wall */}
            <path d="M 32 64 L 56 75 L 56 50 L 32 39 Z" fill="#ca8a04" />
            <path d="M 38 48 L 48 53 L 48 61 L 38 56 Z" fill="#1e293b" /> {/* Dark screen window panel */}
            <path d="M 38 48 L 48 53 L 48 61 L 38 56 Z" fill="url(#window-warm-glow)" opacity="0.8" />

            {/* Right Lodge Cabin Wall */}
            <path d="M 56 75 L 80 64 L 80 39 L 56 50 Z" fill="#854d0e" />
            <path d="M 63 56 L 73 51 L 73 66 L 63 71 Z" fill="#1e2d2f" /> {/* Door shape */}

            {/* Angled Modern Eco Solar Roof wedge */}
            <path d="M 28 41 L 56 54 L 84 41 L 56 19 Z" fill="#1d4ed8" />
            {/* Solar panel structural grid lines */}
            <path d="M 28 41 L 84 41 M 56 19 L 56 54" stroke="#60a5fa" strokeWidth="0.8" />
            <path d="M 35 36 L 63 49 M 42 31 L 70 44" stroke="#60a5fa" strokeWidth="0.5" opacity="0.6" />
            <path d="M 56 19 L 28 41 L 56 54 Z" fill="url(#solar-blue-reflective)" />
          </g>
        )}

        {/* 3D MODEL 7: VETERINARY CLINIC & HOSPITAL (Red-cross Clinical White Capsule) */}
        {locId === 'loc-7' && (
          <g>
            {/* Clinical metal foundation plate */}
            <path d="M 60 90 L 100 70 L 60 50 L 20 70 Z" fill="#475569" />
            <path d="M 20 70 L 60 90 L 60 96 L 20 76 Z" fill="#334155" />
            <path d="M 60 90 L 100 70 L 100 76 L 60 96 Z" fill="#1e293b" />
            <path d="M 60 90 L 100 70 L 60 50 L 20 70 Z" fill="#64748b" /> {/* Top Slate floor */}

            {/* Left pristine sterile white panel wall with red cross insignia */}
            <path d="M 30 65 L 60 80 L 60 45 L 30 30 Z" fill="#ffffff" />
            {/* Red Cross */}
            <path d="M 41 53 L 49 57 L 49 54 L 41 50 Z M 45 46 L 45 59 L 45 61 L 45 44 Z" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="square" />

            {/* Right clinical block panel wall */}
            <path d="M 60 80 L 90 65 L 90 30 L 60 45 Z" fill="#e2e8f0" />
            {/* Vent slots */}
            <line x1="68" y1="52" x2="82" y2="45" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="68" y1="58" x2="82" y2="51" stroke="#94a3b8" strokeWidth="1.2" />

            {/* Top capsule clean steel frame deck */}
            <path d="M 30 30 L 60 45 L 90 30 L 60 15 Z" fill="#f1f5f9" />

            {/* Glowing Pediatric Incubator glass dome canopy */}
            <path d="M 45 28 C 45 18 75 18 75 28 Z" fill="rgba(6,182,212,0.4)" stroke="#22d3ee" strokeWidth="1" />
            <path d="M 45 28 L 75 28" stroke="#0891b2" strokeWidth="1" />

            {/* Warm pink nursery pulse cross core inside */}
            <circle cx="60" cy="24" r="3" fill="#ec4899" className="animate-pulse" />
          </g>
        )}

        {/* PERSISTENT GRADIENT DEFINITIONS NEEDED FOR RICH VOXEL LIGHT EFFECTS */}
        <defs>
          <radialGradient id="amber-radial-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cyan-radial-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lagoon-blue-reflective" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="window-warm-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="solar-blue-reflective" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

      </svg>
    </motion.button>
  );
}

export default function ParkMap() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'wildlife' | 'botanical' | 'building'>('all');
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);
  
  // Interactive isometric map perspective states
  const [zoom, setZoom] = useState<number>(1.1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(-15);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  
  // Interactive Sighting Compass Mini-Game State
  const [foundClues, setFoundClues] = useState<string[]>([]);
  const [activeQuestMsg, setActiveQuestMsg] = useState<string>("Sighting Compass: Locate three footprint markings in hidden grass sectors to earn a virtual Ranger Badge!");

  const locations: MapLocation[] = useMemo(() => [
    {
      id: 'loc-1',
      name: 'Rescued Lion & Cheetah Reserve',
      category: 'wildlife',
      tagline: 'Apex Predator Sanctuary grounds',
      description: 'Lush grassland reserve serving as a vital rehabilitation haven for rescued lions and recovering cheetah complexes.',
      icon: PawPrint,
      image: '/src/assets/images/assets/Cheetah.jpg',
      coordX: 30,
      coordY: 28,
      status: 'Active Care',
      statusColor: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
      funFact: 'Cheetah rehabilitation zones include active sensory pulleys for sprint fitness testing.',
      sightingsToday: 4
    },
    {
      id: 'loc-2',
      name: 'High-Net Aviary Canopy',
      category: 'wildlife',
      tagline: 'Sanctuary of Grey Parrots & Eagles',
      description: 'Massive towering sanctuary dome netting wild eagle recoveries, local hornbills, and interactive Grey Parrot dialogues.',
      icon: Bird,
      image: '/src/assets/images/assets/Eagle.jpg',
      coordX: 68,
      coordY: 25,
      status: 'Active Care',
      statusColor: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
      funFact: 'Many parrots here are rescued from border confiscations and are learning native jungle vocalizations.',
      sightingsToday: 12
    },
    {
      id: 'loc-3',
      name: 'Historic Botanical Glasshouse',
      category: 'botanical',
      tagline: 'Orchids, ancient ferns and cacti',
      description: 'Established in the mid-20th century. Highlighting over 1,000 global and native botanical treasures within a temperature-buffered pavilion.',
      icon: Trees,
      image: '/src/assets/images/assets/Glass House.png',
      coordX: 22,
      coordY: 62,
      status: 'Seasonal Bloom',
      statusColor: 'text-[#acffa3] border-[#acffa3]/20 bg-[#acffa3]/5',
      funFact: 'Houses exotic vanilla vines and ancient ferns unchanged since the dinosaur era.',
      sightingsToday: 0
    },
    {
      id: 'loc-4',
      name: 'Waterfront Wetlands Lagoon',
      category: 'botanical',
      tagline: 'Lush lily trail and wetland waterfowl',
      description: 'The scenic center of gravity of the park system. Fed by natural freshwater runs that foster wild lotus lilies and marsh species.',
      icon: Droplet,
      image: '/assets/pexels-on3sign-33612014.jpg',
      coordX: 50,
      coordY: 52,
      status: 'Seasonal Bloom',
      statusColor: 'text-[#acffa3] border-[#acffa3]/20 bg-[#acffa3]/5',
      funFact: 'The lagoon serves as an unscheduled rest-stop for hundreds of migrating wild waterfowl.',
      sightingsToday: 19
    },
    {
      id: 'loc-5',
      name: 'Herpetology & Reptile Pavilion',
      category: 'wildlife',
      tagline: 'Saviors of Zambia Pythons & Tortoises',
      description: 'Educational shelter built to protect Zambia’s threatened rock python population, tortoises in therapy, and local glass-exhibit chameleons.',
      icon: Activity,
      image: '/src/assets/images/assets/Python.jpg',
      coordX: 78,
      coordY: 68,
      status: 'Active Care',
      statusColor: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
      funFact: 'African rock pythons here assist in teaching local communities safe relocate-and-save practices.',
      sightingsToday: 7
    },
    {
      id: 'loc-6',
      name: 'Environmental Science Classroom',
      category: 'building',
      tagline: 'Junior Ranger and Student Academy',
      description: 'Spacious outdoor classroom utilizing solar architecture and wooden decks where Zambia’s university students spearhead floral preservation studies.',
      icon: BookOpen,
      image: '/assets/3.jpg',
      coordX: 48,
      coordY: 15,
      status: 'Operational',
      statusColor: 'text-sky-300 border-sky-300/20 bg-sky-300/5',
      funFact: 'Runs fully on recycled rainwater harvesting and solar panels crafted by Lusaka volunteers.',
      sightingsToday: 0
    },
    {
      id: 'loc-7',
      name: 'Wildlife Veterinary & Cub Nursery',
      category: 'building',
      tagline: 'The Hospital Center for Orphaning Rescues',
      description: 'Medical quarantine bay staffed by full-time veterinarians and critical nursery cages for newly rescued infants.',
      icon: Heart,
      image: '/src/assets/images/assets/Tiger 2.jpg',
      coordX: 82,
      coordY: 40,
      status: 'Operational',
      statusColor: 'text-sky-300 border-sky-300/20 bg-sky-300/5',
      funFact: 'The nursery operates 24/7 with a volunteer baby-watch team monitoring orphan rehabilitation.',
      sightingsToday: 3
    }
  ], []);

  // Hidden footmarks for interactive map discovery game
  const hiddenFootprints = useMemo(() => [
    { id: 'foot-1', locIdx: 0, x: 28, y: 38, name: 'Lion Cub Markings', image: '/src/assets/images/assets/Tiger.jpg' },
    { id: 'foot-2', locIdx: 2, x: 24, y: 56, name: 'Rare Bushbaby Markings', image: '/src/assets/images/assets/Cheetah.jpg' },
    { id: 'foot-3', locIdx: 4, x: 74, y: 76, name: 'Tortoise Trail Markings', image: '/src/assets/images/assets/Zebra.jpg' }
  ], []);

  const handleClueFind = (id: string, name: string) => {
    if (foundClues.includes(id)) return;
    const newList = [...foundClues, id];
    setFoundClues(newList);
    if (newList.length === 3) {
      setActiveQuestMsg("🎉 Ranger Achievement Unlocked! You successfully traced Munda Wanga’s hidden tracks. Show this to the visitor pavilion for a commemorative sticker!");
    } else {
      setActiveQuestMsg(`Excellent! Traced footprint: ${name}. Only ${3 - newList.length} more footprint track(s) remaining!`);
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(2.0, z + 0.15));
  const handleZoomOut = () => setZoom(z => Math.max(0.8, z - 0.15));
  const handleReset = () => {
    setZoom(1.1);
    setPanX(0);
    setPanY(-15);
    setIs3DMode(true);
  };

  const filteredLocations = useMemo(() => {
    if (activeFilter === 'all') return locations;
    return locations.filter(l => l.category === activeFilter);
  }, [activeFilter, locations]);

  return (
    <div className="w-full relative bg-[#112422] rounded-[36px] border border-white/5 overflow-hidden text-white shadow-2xl flex flex-col min-h-[760px] lg:h-[820px]">
      
      {/* MAP CONTROLS OVERLAY HEADER */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-[#112422] via-[#112422]/90 to-transparent flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#ffd662]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#acffa3] font-bold">
              Zambian Wilderness Guide Map
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-1">
            Munda Wanga Sanctuary Map
          </h2>
          <p className="text-[11px] text-white/60 font-sans mt-0.5">
            Click on glowing markers or trace footprints to interact with zones.
          </p>
        </div>

        {/* View Controls & Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Legend Selector */}
          <div className="bg-[#162625]/80 backdrop-blur-md p-1 border border-white/15 rounded-xl flex gap-1">
            {(['all', 'wildlife', 'botanical', 'building'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-mono lowercase tracking-wider capitalize transition-all cursor-pointer ${
                  activeFilter === cat 
                    ? 'bg-[#388653] text-[#acffa3] font-bold shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Perspective Toggle */}
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`px-3 py-1.5 rounded-xl text-[9px] border font-mono uppercase tracking-wider transition-all cursor-pointer ${
              is3DMode 
                ? 'bg-[#ffd662] text-[#162625] border-[#ffd662] font-black' 
                : 'bg-[#162625]/80 text-white/80 border-white/10 hover:bg-white/5'
            }`}
          >
            {is3DMode ? '3D Isometric' : '2D Traditional'}
          </button>
        </div>
      </div>

      {/* INTERACTIVE TRACKING BAR / MINI QUIZ */}
      <div className="absolute bottom-4 left-4 right-4 md:right-auto z-30 max-w-sm bg-gradient-to-r from-[#162625] to-[#122221] border border-[#acffa3]/20 py-3.5 px-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex gap-2 items-start">
          <div className="bg-[#acffa3]/10 p-2 rounded-xl text-[#acffa3]">
            <Navigation className="w-4 h-4 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[9px] font-mono tracking-wider uppercase font-extrabold text-[#ffd662] flex items-center gap-1.5">
              <span>SIGHTING COMPASS APPLET</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded-md text-[8px] text-white">
                {foundClues.length}/3 Traced
              </span>
            </h4>
            <p className="text-[10px] text-white/80 leading-relaxed font-sans select-all">
              {activeQuestMsg}
            </p>
          </div>
        </div>
      </div>

      {/* FLOAT MAP ZOOM UTILITIES */}
      <div className="absolute right-4 bottom-4 z-30 flex flex-col gap-1.5 p-1 bg-[#162625]/80 border border-white/10 rounded-2xl backdrop-blur-md">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-[#acffa3] cursor-pointer transition-colors"
          title="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-[#acffa3] cursor-pointer transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-[#ffd662] cursor-pointer transition-colors border-t border-white/5"
          title="Reset Camera"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* IMMERSIVE MAP STAGE */}
      <div 
        className="flex-1 w-full relative overflow-hidden flex items-center justify-center"
        style={{ cursor: 'move' }}
      >
        <motion.div
          animate={{
            scale: zoom,
            rotateX: is3DMode ? 54 : 0,
            rotateZ: is3DMode ? -24 : 0,
            x: panX,
            y: panY,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-[840px] h-[580px] bg-[#142e2b] rounded-[28px] border-2 border-dashed border-[#ffd662]/10 relative shadow-inner overflow-hidden select-none origin-center"
        >
          {/* Custom Forest Terrains Grid Patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffd662/0.02_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Isometric Hill Gradients & Forest Contour Rings */}
          <div className="absolute top-12 left-10 w-[240px] h-[240px] border border-dashed border-[#acffa3]/4 rounded-full" />
          <div className="absolute top-24 left-24 w-[120px] h-[120px] border border-[#acffa3]/8 rounded-full" />
          <div className="absolute bottom-16 right-16 w-[340px] h-[340px] border border-dashed border-[#acffa3]/4 rounded-full" />

          {/* SVG MAP SHAPES, WATERWAYS, PATHS */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lagoonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e4e4a" />
                <stop offset="100%" stopColor="#0d312e" />
              </linearGradient>
              <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffd662" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#acffa3" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Lush Blue-Green Central Waterway System */}
            <path
              d="M -10 52 Q 25 45 42 50 T 60 55 T 85 50 T 110 52"
              fill="none"
              stroke="url(#lagoonGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              className="opacity-40"
            />
            {/* Fine Stream feeders */}
            <path
              d="M 50 52 Q 48 30 68 25"
              fill="none"
              stroke="#1e4e4a"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="opacity-25"
            />
            <path
              d="M -10 53 Q 15 55 22 62"
              fill="none"
              stroke="#1e4e4a"
              strokeWidth="4"
              strokeLinecap="round"
              className="opacity-25"
            />

            {/* Walking Visitor Pathways linking regions together */}
            {/* Trail Alpha: Entrance -> Science Academy -> Predator Cave -> Aviary */}
            <path
              className="stroke-transparent md:stroke-[0.6] stroke-dashed"
              strokeDasharray="2,2"
              stroke="url(#pathGrad)"
              d="M 48 15 Q 35 20 30 28 Q 45 40 50 52"
              fill="none"
            />
            <path
              className="stroke-transparent md:stroke-[0.6] stroke-dashed"
              strokeDasharray="2,2"
              stroke="url(#pathGrad)"
              d="M 30 28 Q 15 48 22 62 Q 35 58 50 52"
              fill="none"
            />
            {/* Trail Beta: Aviary -> Lagoon -> Zoo Hospital */}
            <path
              className="stroke-transparent md:stroke-[0.6] stroke-[#acffa3]/20"
              d="M 68 25 Q 56 40 50 52 T 82 40"
              fill="none"
            />
            <path
              className="stroke-transparent md:stroke-[0.6] stroke-[#acffa3]/20"
              d="M 82 40 Q 85 58 78 68 Q 63 60 50 52"
              fill="none"
            />
          </svg>

          {/* Scenic tree clusters illustrations scatter */}
          <div className="absolute top-[8%] left-[25%] opacity-20"><Trees className="w-5 h-5 text-[#acffa3]" /></div>
          <div className="absolute top-[28%] left-[12%] opacity-25"><Trees className="w-5 h-5 text-[#307047]" /></div>
          <div className="absolute top-[18%] left-[62%] opacity-15"><Trees className="w-6 h-6 text-[#acffa3]" /></div>
          <div className="absolute top-[48%] left-[84%] opacity-25"><Trees className="w-6 h-6 text-[#307047]" /></div>
          <div className="absolute top-[75%] left-[45%] opacity-20"><Trees className="w-5 h-5 text-[#acffa3]" /></div>
          <div className="absolute top-[78%] left-[18%] opacity-30"><Trees className="w-7 h-7 text-[#307047]" /></div>
          <div className="absolute top-[58%] left-[32%] opacity-20"><Trees className="w-5 h-5 text-[#acffa3]" /></div>
          <div className="absolute top-[40%] left-[68%] opacity-15"><Trees className="w-5 h-5 text-[#307047]" /></div>

          {/* HIDDEN FOOTPRINT CLUES FOR RANGER ACHIEVEMENT GAME */}
          {hiddenFootprints.map((foot) => {
            const isFound = foundClues.includes(foot.id);
            return (
              <button
                key={foot.id}
                onClick={() => handleClueFind(foot.id, foot.name)}
                className="absolute p-2 cursor-pointer group focus:outline-none z-20"
                style={{ left: `${foot.x}%`, top: `${foot.y}%` }}
              >
                <div className="relative">
                  <motion.div
                    animate={isFound ? {} : {
                      scale: [0.8, 1.1, 0.8],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className={`rounded-full transition-all flex items-center justify-center overflow-hidden ${isFound ? 'w-8 h-8 p-0.5 bg-emerald-500/30 border border-emerald-400' : 'p-1.5 bg-[#ffd662]/5 border border-[#ffd662]/10 hover:bg-[#ffd662]/20'}`}
                  >
                    {isFound ? (
                      <img 
                        src={foot.image} 
                        className="w-full h-full object-cover rounded-full select-none" 
                        alt={foot.name}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <PawPrint className="w-3.5 h-3.5 text-transparent group-hover:text-[#ffd662]/60" />
                    )}
                  </motion.div>
                  
                  {isFound && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-mono text-[7px] py-0.5 px-1.5 rounded-md whitespace-nowrap shadow-md">
                      TRACED!
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* DYNAMIC PINS */}
          <AnimatePresence>
            {filteredLocations.map((loc) => {
              const isSelected = selectedLoc?.id === loc.id;
              const IconComp = loc.icon;
              return (
                <motion.div
                  key={loc.id}
                  initial={{ scale: 0.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.1, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="absolute z-20"
                  style={{ 
                    left: `${loc.coordX}%`, 
                    top: `${loc.coordY}%`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Glowing core 3D isometric pillar structure */}
                  <div className="relative -left-16 -top-24 flex flex-col items-center" style={{ transformStyle: 'preserve-3d' }}>
                    
                    {/* Flat Environment Ground Shadow & Active Ripple Ring (Deforms natively with the tilted map plane) */}
                    <div className="absolute top-[80px] left-1/2 -translate-x-1/2 pointer-events-none w-24 h-12 flex items-center justify-center">
                      {/* Ambient fuzzy base shadow */}
                      <div className="w-16 h-6 rounded-full bg-black/60 blur-[3px] transform scale-y-[0.5]" />
                      
                      {/* Interactive active glowing ripple ring */}
                      {isSelected ? (
                        <div className="absolute w-20 h-10 rounded-full border-2 border-[#ffd662]/50 animate-ping transform scale-y-[0.5]" />
                      ) : (
                        <div className="absolute w-16 h-8 rounded-full border border-[#acffa3]/30 transform scale-y-[0.5] flex items-center justify-center">
                          <motion.div 
                            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-4 h-2 rounded-full bg-[#acffa3]/40 blur-[1px]" 
                          />
                        </div>
                      )}
                    </div>

                    {/* 3D Isometric Miniature Voxel-Model */}
                    <Isometric3DModel 
                      locId={loc.id} 
                      isSelected={isSelected} 
                      onClick={() => setSelectedLoc(loc)} 
                    />

                    {/* CAMERA-FACING ORTHOGRAPHIC PIN BADGE (Featuring user's high-res uploaded photograph as high-fidelity icon + tiny category badge helper) */}
                    <motion.div
                      style={is3DMode ? { 
                        transform: 'rotateZ(24deg) rotateX(-54deg)',
                        transformStyle: 'preserve-3d'
                      } : {}}
                      animate={{
                        y: isSelected ? [-24, -34, -24] : [-16, -20, -16],
                        scale: isSelected ? 1.18 : 1.0,
                      }}
                      whileHover={{
                        scale: 1.25,
                        y: isSelected ? -38 : -24,
                      }}
                      transition={{
                        y: isSelected 
                          ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                          : { duration: 3.0, repeat: Infinity, ease: "easeInOut" },
                        default: { duration: 0.3 }
                      }}
                      onClick={() => setSelectedLoc(loc)}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 cursor-pointer flex flex-col items-center select-none"
                    >
                      {/* Photographic Pin Badge capsule with category badge */}
                      <div className={`w-11 h-11 rounded-full border-2 ${isSelected ? 'border-[#ffd662] shadow-[0_0_15px_#ffd662]' : 'border-[#acffa3]/40'} bg-[#162625]/95 p-0.5 flex items-center justify-center transition-all duration-300 relative`}>
                        {/* Interactive Rotating dash borders */}
                        <div className={`absolute inset-0 rounded-full border border-dashed ${isSelected ? 'border-[#ffd662] animate-[spin_8s_linear_infinite]' : 'border-[#acffa3]/10'} opacity-50`} />

                        {/* Photographic View Circular frame */}
                        <div className="w-full h-full rounded-full overflow-hidden relative border border-white/5 bg-[#112422]">
                          <img 
                            src={loc.image} 
                            className="w-full h-full object-cover rounded-full select-none" 
                            alt={loc.name}
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Small Category icon vector offset label badge */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${isSelected ? 'bg-[#ffd662] text-[#162625]' : 'bg-[#162625] text-[#acffa3] border border-white/10'} flex items-center justify-center shadow-md transform scale-90`}>
                          <IconComp className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Dynamic connecting stand pole line */}
                      <div className="w-[1px] h-[34px] border-l border-dashed border-[#acffa3]/50 -mt-[1px] opacity-70 pointer-events-none" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ffd662]/90 -mt-[5px] pointer-events-none shadow-sm" />
                    </motion.div>

                    {/* Symmetrical Mini Floating labels, aligned to face camera perfectly */}
                    <div 
                      className="absolute top-24 left-1/2 -translate-x-1/2 text-center pointer-events-none w-32"
                      style={is3DMode ? { 
                        transform: 'rotateZ(24deg) rotateX(-54deg)',
                        transformStyle: 'preserve-3d'
                      } : {}}
                    >
                      <span className="bg-[#162625]/95 text-[#f2e9d8] text-[9px] font-mono tracking-wider font-extrabold py-0.5 px-2 rounded-lg border-b-2 border-r-2 border-white/10 shadow-lg block truncate uppercase text-[#acffa3]">
                        {loc.name.split(' ')[0]} {loc.name.split(' ')[1] || ''}
                      </span>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* LOCATION DETAIL OVERLAY CARD */}
      <AnimatePresence>
        {selectedLoc && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute inset-x-4 bottom-4 md:left-auto md:right-4 z-40 max-w-sm bg-[#162625]/95 border border-white/10 p-5 rounded-3xl shadow-2xl backdrop-blur-md text-left text-white"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[8px] font-mono uppercase tracking-widest font-black ${selectedLoc.statusColor}`}>
                    {selectedLoc.status}
                  </span>
                  <h3 className="text-md sm:text-lg font-display font-bold text-white mt-1.5 leading-tight">
                    {selectedLoc.name}
                  </h3>
                  <p className="text-[10px] text-[#acffa3] font-mono uppercase tracking-widest mt-0.5">
                    {selectedLoc.tagline}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLoc(null)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              {/* Beautiful Photographic Banner representing the location */}
              <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl relative bg-black/30 border border-white/5 shadow-inner">
                <img 
                  src={selectedLoc.image} 
                  className="w-full h-full object-cover select-none" 
                  alt={selectedLoc.name}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-sans">
                {selectedLoc.description}
              </p>

              <div className="p-3 bg-black/25 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#ffd662] font-black block">
                  💡 Ranger Fact Log
                </span>
                <p className="text-[11px] text-[#acffa3]/95 leading-relaxed font-sans italic">
                  "{selectedLoc.funFact}"
                </p>
              </div>

              {selectedLoc.sightingsToday > 0 && (
                <div className="flex items-center gap-2 text-xs text-white/55">
                  <Activity className="w-3.5 h-3.5 text-[#ffd662] animate-pulse" />
                  <span className="font-mono tracking-wider text-[10px]">
                    {selectedLoc.sightingsToday} Wild Sightings Hand-Reported Today
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
