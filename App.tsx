
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Heart, Sparkles, Send, Gift, Calendar, User, Camera, Music as MusicIcon, ChevronDown, Image as ImageIcon, Share2, Check, Clock, Upload, X, Loader2, Save, RotateCcw, Plus, Trash2, Sliders } from 'lucide-react';
import FloatingHearts from './components/FloatingHearts';
import TwinklingStars from './components/TwinklingStars';
import MusicPlayer, { MusicPlayerRef } from './components/MusicPlayer';
import ConfettiEffect, { ConfettiRef } from './components/ConfettiEffect';
import DynamicNebula from './components/DynamicNebula';
import { generateBirthdayMessage, generatePersonalizedImage } from './services/geminiService';
import { BirthdayProfile, GeneratedMessage } from './types';

const LOADING_PHRASES = [
  "Igniting the stars...",
  "Whispering to the AI...",
  "Consulting the cosmos...",
  "Weaving starlight into words...",
  "Aligning the planets for you...",
  "Capturing nebula dreams...",
  "Painting celestial memories...",
  "Gathering cosmic inspiration...",
  "Polishing the lunar glow...",
  "Drafting stardust sentiments...",
  "Synchronizing with pulsar beats...",
  "Bottling supernova essence...",
  "Tracing constellations of love...",
  "Orchestrating a galactic symphony...",
  "Harvesting moonlight for you...",
  "Folding space-time into a gift...",
  "Tuning frequencies of the void...",
  "Sculpting orbits around your heart...",
  "Collecting echoes from the Milky Way...",
  "Translating aurora whispers...",
  "Etching your name in cosmic dust...",
  "Brewing celestial nectar...",
  "Waking the sleeping comets...",
  "Spinning galaxies into gold...",
  "Charting a course through the stars..."
];

const LOCAL_STORAGE_KEY = 'celestial_birthday_profile_v2';

const App: React.FC = () => {
  const [step, setStep] = useState<'landing' | 'setup' | 'surprise'>('landing');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>(LOADING_PHRASES[0]);
  const [profile, setProfile] = useState<BirthdayProfile>({
    recipientName: '',
    senderName: '',
    relationship: 'Partner',
    sharedMemories: '',
    tone: 'Romantic',
    birthdayDate: new Date().toISOString().split('T')[0],
    galleryImages: [],
    starDensity: 150
  });
  const [message, setMessage] = useState<GeneratedMessage | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  
  const heroRef = useRef<HTMLDivElement>(null);
  const surpriseRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const memorialInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const confettiRef = useRef<ConfettiRef>(null);
  const musicPlayerRef = useRef<MusicPlayerRef>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) setHasSavedProfile(true);
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isLoading) {
      let phraseIndex = 0;
      interval = window.setInterval(() => {
        phraseIndex = (phraseIndex + 1) % LOADING_PHRASES.length;
        setLoadingStep(LOADING_PHRASES[phraseIndex]);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!profile.birthdayDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(profile.birthdayDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
          isPast: false
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [profile.birthdayDate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('surprise');
    
    if (sharedData) {
      try {
        const decoded = JSON.parse(atob(sharedData));
        setProfile({ 
          ...decoded.profile, 
          galleryImages: decoded.profile.galleryImages || [],
          starDensity: decoded.profile.starDensity || 150
        });
        setMessage(decoded.message);
        setStep('landing');
        setIsShared(true);
        
        if (!decoded.message.image1) {
           regenerateImages(decoded.profile, decoded.message);
        }
      } catch (e) {
        console.error("Failed to decode shared surprise", e);
      }
    }
  }, []);

  const regenerateImages = async (p: BirthdayProfile, m: GeneratedMessage) => {
    const img1Prompt = `High-quality futuristic digital art, celestial romantic theme. A beautiful cosmic symbol representing a ${p.relationship} for someone named ${p.recipientName}. Pink, purple, and indigo nebula colors, cinematic lighting, 8k resolution.`;
    const img2Prompt = `High-quality futuristic digital art, birthday celebration in space. Glowing lanterns floating in a nebula, a sense of wonder and love for ${p.recipientName} from ${p.senderName}. Cinematic atmosphere, ethereal style.`;
    
    const [img1, img2] = await Promise.all([
      generatePersonalizedImage(img1Prompt),
      generatePersonalizedImage(img2Prompt)
    ]);
    
    setMessage({ ...m, image1: img1, image2: img2 });
  };

  useEffect(() => {
    if (step === 'landing' && heroRef.current) {
      gsap.fromTo(heroRef.current.querySelectorAll('.animate-in'), 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
      );
    }
  }, [step]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'customBackground' | 'memorialImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfile(prev => ({
            ...prev,
            galleryImages: [...prev.galleryImages, reader.result as string].slice(0, 8) // Limit to 8
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setProfile(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const saveSettings = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
      setSaveSuccess(true);
      setHasSavedProfile(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error("Failed to save settings to localStorage", e);
      alert("Note: Profile might be too large for storage. Try fewer or smaller photos.");
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile({ 
          ...parsed, 
          galleryImages: parsed.galleryImages || [],
          starDensity: parsed.starDensity || 150
        });
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
  };

  const handleGenerate = async () => {
    if (!profile.recipientName || !profile.senderName) return;
    setIsLoading(true);
    
    try {
      const textPromise = generateBirthdayMessage(profile);
      
      const img1Prompt = `High-quality futuristic digital art, celestial romantic theme. A beautiful cosmic symbol representing a ${profile.relationship} for someone named ${profile.recipientName}. Pink, purple, and indigo nebula colors, cinematic lighting, 8k resolution.`;
      const img2Prompt = `High-quality futuristic digital art, birthday celebration in space. Glowing lanterns floating in a nebula, a sense of wonder and love for ${profile.recipientName} from ${profile.senderName}. Cinematic atmosphere, ethereal style.`;
      
      const [textData, img1, img2] = await Promise.all([
        textPromise,
        generatePersonalizedImage(img1Prompt),
        generatePersonalizedImage(img2Prompt)
      ]);

      setMessage({
        ...textData,
        image1: img1,
        image2: img2
      });
      
      setStep('surprise');
      setIsRevealed(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    if (musicPlayerRef.current) {
      musicPlayerRef.current.playMagicSfx();
      setTimeout(() => {
        musicPlayerRef.current?.setTrack(0);
        musicPlayerRef.current?.play();
      }, 500);
    }
    confettiRef.current?.fire();
    
    setTimeout(() => {
      if (surpriseRef.current) {
        gsap.fromTo(surpriseRef.current.querySelectorAll('.surprise-animate'),
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, stagger: 0.3, ease: 'power4.out' }
        );
      }
    }, 100);
  };

  const handleShare = async () => {
    if (!message || !profile) return;
    
    const { customBackground, memorialImage, galleryImages, ...shareableProfile } = profile;

    const sharePayload = {
      profile: shareableProfile,
      message: {
        title: message.title,
        body: message.body,
        closing: message.closing
      }
    };
    
    const encoded = btoa(JSON.stringify(sharePayload));
    const url = new URL(window.location.href);
    url.searchParams.set('surprise', encoded);
    const shareUrl = url.toString();

    const shareTitle = `✨ A Celestial Birthday Surprise for ${profile.recipientName}!`;
    const shareText = `Hey ${profile.recipientName}, ${profile.senderName} has prepared a stunning celestial surprise for you! 🌌💖`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const CountdownDisplay = () => (
    <div className="animate-in grid grid-cols-4 gap-4 mt-8 max-w-md mx-auto">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hrs', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds }
      ].map((item) => (
        <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center min-w-[70px] backdrop-blur-sm group hover:border-pink-500/50 transition-all duration-500">
          <span className="text-2xl md:text-3xl font-space font-bold text-pink-500 group-hover:scale-110 transition-transform">{item.value.toString().padStart(2, '0')}</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen text-white selection:bg-pink-500 selection:text-white relative">
      <DynamicNebula />
      <FloatingHearts />
      <ConfettiEffect ref={confettiRef} />
      {step === 'surprise' && <TwinklingStars count={profile.starDensity} speed={0.8} />}
      <MusicPlayer ref={musicPlayerRef} />

      {step === 'landing' && (
        <div ref={heroRef} className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="animate-in mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium tracking-widest uppercase">
            <Sparkles size={14} />
            {isShared ? `A Gift for ${profile.recipientName}` : 'The Ultimate Surprise'}
          </div>
          
          <h1 className="animate-in text-5xl md:text-8xl font-space font-bold mb-6 tracking-tighter">
            CELESTIAL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              BIRTHDAY
            </span>
          </h1>

          {isShared && !timeLeft.isPast && (
            <div className="animate-in mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-400/60 mb-4">Counting down to your special day</p>
              <CountdownDisplay />
            </div>
          )}

          {isShared && timeLeft.isPast && (
            <p className="animate-in text-xl text-pink-400 font-dancing mb-10 italic">The celestial alignment is perfect. Your day is here.</p>
          )}

          {!isShared && (
            <p className="animate-in max-w-xl text-gray-400 text-lg md:text-xl mb-10 font-light">
              Create an unforgettable, AI-powered romantic experience for your favorite person. Stunning visuals, emotional messages, and futuristic design.
            </p>
          )}

          <button 
            onClick={() => isShared ? setStep('surprise') : setStep('setup')}
            className="animate-in group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:pr-12"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isShared ? 'Open Your Surprise' : 'Start the Journey'} <Heart size={18} className="fill-pink-500 text-pink-500" />
            </span>
            <div className="absolute top-0 right-0 w-10 h-full bg-pink-500 translate-x-10 group-hover:translate-x-0 transition-transform flex items-center justify-center text-white">
              <Send size={18} />
            </div>
          </button>
        </div>
      )}

      {step === 'setup' && (
        <div className="relative z-10 max-w-2xl mx-auto py-20 px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-4xl font-space font-bold mb-2 flex items-center gap-3">
                Setup the Surprise <Gift className="text-pink-500" />
              </h2>
              <p className="text-gray-400">Tell us a bit about them to personalize the experience.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={saveSettings}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all"
              >
                {saveSuccess ? <Check size={14} className="text-green-400" /> : <Save size={14} />}
                {saveSuccess ? 'Saved' : 'Save Draft'}
              </button>
              {hasSavedProfile && (
                <button 
                  onClick={loadSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 rounded-full text-xs font-bold transition-all"
                >
                  <RotateCcw size={14} />
                  Load Saved
                </button>
              )}
            </div>
          </div>
          
          <div className="grid gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <User size={14} /> Recipient's Name
                </label>
                <input 
                  value={profile.recipientName}
                  onChange={e => setProfile({...profile, recipientName: e.target.value})}
                  placeholder="Who are we celebrating?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-pink-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} /> Birthday Date
                </label>
                <input 
                  type="date"
                  value={profile.birthdayDate}
                  onChange={e => setProfile({...profile, birthdayDate: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-pink-500/50 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  Relationship
                </label>
                <select 
                  value={profile.relationship}
                  onChange={e => setProfile({...profile, relationship: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-pink-500/50 appearance-none cursor-pointer"
                >
                  <option className="bg-neutral-900">Partner</option>
                  <option className="bg-neutral-900">Crush</option>
                  <option className="bg-neutral-900">Best Friend</option>
                  <option className="bg-neutral-900">Spouse</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tone</label>
                <select 
                  value={profile.tone}
                  onChange={e => setProfile({...profile, tone: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-pink-500/50 appearance-none cursor-pointer"
                >
                  <option className="bg-neutral-900">Romantic</option>
                  <option className="bg-neutral-900">Emotional</option>
                  <option className="bg-neutral-900">Futuristic</option>
                  <option className="bg-neutral-900">Poetic</option>
                </select>
              </div>
            </div>

            {/* Star Density Configuration */}
            <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={14} /> Cosmic Atmosphere
                </label>
                <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                  {profile.starDensity} Stars
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold px-1">
                  <span>Subtle Glow</span>
                  <span>Dense Nebula</span>
                </div>
                <input 
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={profile.starDensity}
                  onChange={e => setProfile({...profile, starDensity: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Adjust the density of the twinkling starfield for the background of your surprise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Upload size={14} /> Custom Atmosphere
                </label>
                <div 
                  onClick={() => bgInputRef.current?.click()}
                  className={`relative w-full border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer h-40 overflow-hidden ${
                    profile.customBackground ? 'border-pink-500/50 bg-pink-500/5' : 'border-white/10 bg-white/5 hover:border-pink-500/30'
                  }`}
                >
                  {profile.customBackground ? (
                    <img src={profile.customBackground} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon size={28} className="mx-auto text-gray-500 mb-2" />
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Atmosphere</p>
                    </div>
                  )}
                  <input type="file" ref={bgInputRef} onChange={(e) => handleFileUpload(e, 'customBackground')} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Camera size={14} /> Main Memory
                </label>
                <div 
                  onClick={() => memorialInputRef.current?.click()}
                  className={`relative w-full border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer h-40 overflow-hidden ${
                    profile.memorialImage ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10 bg-white/5 hover:border-purple-500/30'
                  }`}
                >
                  {profile.memorialImage ? (
                    <img src={profile.memorialImage} alt="Memorial Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Camera size={28} className="mx-auto text-gray-500 mb-2" />
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Core Memory</p>
                    </div>
                  )}
                  <input type="file" ref={memorialInputRef} onChange={(e) => handleFileUpload(e, 'memorialImage')} accept="image/*" className="hidden" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon size={14} /> Memory Gallery (Max 8)
                </label>
                <button 
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
                >
                  <Plus size={12} /> Add Photos
                </button>
                <input type="file" multiple ref={galleryInputRef} onChange={handleGalleryUpload} accept="image/*" className="hidden" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {profile.galleryImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {profile.galleryImages.length === 0 && (
                  <div className="col-span-full py-8 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-600 italic text-sm">
                    No gallery images added yet.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                Shared Memories & Nicknames
              </label>
              <textarea 
                value={profile.sharedMemories}
                onChange={e => setProfile({...profile, sharedMemories: e.target.value})}
                rows={4}
                placeholder="The first time we met, our favorite trip, a special song..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-pink-500/50 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                Your Name
              </label>
              <input 
                value={profile.senderName}
                onChange={e => setProfile({...profile, senderName: e.target.value})}
                placeholder="From..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-pink-500/50 transition-colors"
              />
            </div>

            <div className="relative pt-4">
              {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]/80 backdrop-blur-sm rounded-2xl border border-pink-500/20 mb-[-4px]">
                  <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                  <p className="mt-4 text-lg font-space font-bold tracking-tight text-white animate-pulse">Generating Magic</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-pink-400 font-medium">{loadingStep}</p>
                </div>
              )}
              <button 
                onClick={handleGenerate}
                disabled={isLoading || !profile.recipientName || !profile.senderName}
                className={`w-full py-5 rounded-full font-bold text-lg transition-all flex flex-col items-center justify-center gap-1 ${
                  isLoading ? 'bg-white/5 text-transparent cursor-not-allowed border border-white/5' : 'bg-pink-600 hover:bg-pink-500 shadow-xl shadow-pink-600/20 active:scale-[0.98]'
                }`}
              >
                <>Generate the Surprise <Sparkles size={20} /></>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'surprise' && message && (
        <div 
          ref={surpriseRef} 
          className="relative z-10 pb-20 transition-all duration-1000"
          style={profile.customBackground ? {
            backgroundImage: `url(${profile.customBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          } : {}}
        >
          {profile.customBackground && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none z-[-1]" />
          )}

          {!isRevealed ? (
            <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
              <div className="mb-8 p-6 bg-pink-500/20 rounded-full border-2 border-pink-500/50 animate-pulse cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(236,72,153,0.3)]" onClick={handleReveal}>
                <Gift size={64} className="text-pink-500" />
              </div>
              <h2 className="text-3xl font-space font-bold mb-4">A surprise is waiting for you...</h2>
              <button onClick={handleReveal} className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-pink-50 transition-all flex items-center gap-2 active:scale-95">
                Reveal Surprise <Heart className="fill-pink-500 text-pink-500" />
              </button>
            </section>
          ) : (
            <>
              <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 surprise-animate">
                <div className="mb-8 p-4 bg-pink-500/10 rounded-full border border-pink-500/30">
                  <Heart size={48} className="text-pink-500 fill-pink-500" />
                </div>
                <h2 className="text-3xl md:text-5xl font-dancing text-pink-400 mb-4">{message.title}</h2>
                <h3 className="text-5xl md:text-8xl font-space font-bold mb-10 tracking-tight">
                  Happy Birthday, <br />
                  <span className="text-glow-pink">{profile.recipientName}!</span>
                </h3>

                {profile.memorialImage && (
                  <div className="mt-8 max-w-lg mx-auto surprise-animate group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-[30px] blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                    <div className="relative aspect-video rounded-[24px] overflow-hidden border border-white/10">
                      <img src={profile.memorialImage} alt="The Core Memory" className="w-full h-full object-cover transition duration-700 hover:scale-105" />
                    </div>
                    <p className="mt-4 text-pink-400 font-dancing text-2xl">Our Core Memory</p>
                  </div>
                )}

                <div className="animate-bounce mt-16 text-gray-500">
                  <ChevronDown size={32} />
                </div>
              </section>

              <div className="max-w-4xl mx-auto px-6 space-y-32">
                <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 md:p-20 relative overflow-hidden group surprise-animate">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
                  <div className="relative z-10">
                    <Sparkles className="text-pink-500 mb-8" size={32} />
                    <p className="text-xl md:text-3xl font-light leading-relaxed text-gray-200 font-serif italic">"{message.body}"</p>
                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-end">
                      <p className="text-pink-400 font-dancing text-3xl">{message.closing}</p>
                      <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mt-2">Forever yours, {profile.senderName}</p>
                    </div>
                  </div>
                </section>

                {profile.galleryImages.length > 0 && (
                  <section className="surprise-animate">
                    <div className="text-center mb-12">
                      <h4 className="text-2xl font-space font-bold text-white mb-2 uppercase tracking-widest">Starlight Gallery</h4>
                      <p className="text-pink-400 font-dancing text-xl">Flickers of our shared journey</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profile.galleryImages.map((img, i) => (
                        <div key={i} className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all duration-700 shadow-2xl hover:shadow-pink-500/20">
                          <img src={img} alt={`Memory ${i}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <Heart size={16} className="text-pink-500 fill-pink-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 surprise-animate">
                  {[message.image1, message.image2].map((img, i) => (
                    <div key={i} className="aspect-video bg-neutral-900 rounded-[30px] border border-white/5 overflow-hidden group relative">
                      {img ? (
                        <img src={img} alt={`AI Visual ${i+1}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 bg-neutral-950">
                          <ImageIcon size={48} className="opacity-20" />
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-pink-400 border border-pink-500/20">AI Visual {i+1}</div>
                    </div>
                  ))}
                </section>

                <section className="text-center pb-20 surprise-animate">
                  <div className="flex flex-col items-center gap-8">
                    <div className="inline-flex gap-4 items-center px-6 py-3 bg-white/5 rounded-full border border-white/10 text-sm font-medium">
                      <Calendar size={16} className="text-pink-500" />
                      Celebrated on {new Date(profile.birthdayDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                      <button onClick={handleShare} className="flex items-center justify-center gap-2 px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-bold shadow-lg shadow-pink-600/20 transition-all active:scale-95 group">
                        {copySuccess ? <Check size={20} /> : <Share2 size={20} />}
                        {copySuccess ? 'Link Copied!' : 'Share this Surprise'}
                      </button>
                      <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold transition-all">Create New</button>
                    </div>
                    <h4 className="mt-8 text-2xl font-space font-bold opacity-80">You are the light in my world.</h4>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
