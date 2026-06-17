import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "./utils/cn";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

type Lang = "en" | "tr";
type Provider = "openai" | "elevenlabs" | "gemini" | "xai" | "aws-polly";
type Gender = "female" | "male" | "neutral";

interface VoiceDef {
  id: string;
  name: string;
  provider: Provider;
  gender: Gender;
  tag: string; // short badge label
  opts: Record<string, unknown>; // passed directly to puter.ai.txt2speech
}

// ════════════════════════════════════════════════════════════════════════════
// VOICE CATALOG
// ════════════════════════════════════════════════════════════════════════════

const VOICES: Record<Lang, VoiceDef[]> = {
  en: [
    // ── OpenAI (best realistic quality) ──
    { id: "en-openai-nova", name: "Nova", provider: "openai", gender: "female", tag: "Recommended",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "nova", response_format: "mp3", instructions: "Speak clearly and naturally in English." } },
    { id: "en-openai-alloy", name: "Alloy", provider: "openai", gender: "neutral", tag: "Popular",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "alloy", response_format: "mp3", instructions: "Speak clearly and naturally in English." } },
    { id: "en-openai-echo", name: "Echo", provider: "openai", gender: "male", tag: "",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "echo", response_format: "mp3", instructions: "Speak clearly and naturally in English." } },
    { id: "en-openai-shimmer", name: "Shimmer", provider: "openai", gender: "female", tag: "",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "shimmer", response_format: "mp3", instructions: "Speak clearly and naturally in English." } },
    { id: "en-openai-fable", name: "Fable", provider: "openai", gender: "male", tag: "",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "fable", response_format: "mp3", instructions: "Speak clearly and naturally in English." } },
    { id: "en-openai-onyx", name: "Onyx", provider: "openai", gender: "male", tag: "Deep",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "onyx", response_format: "mp3", instructions: "Speak clearly and naturally in English." } },
    // ── ElevenLabs ──
    { id: "en-el-rachel", name: "Rachel", provider: "elevenlabs", gender: "female", tag: "Realistic",
      opts: { provider: "elevenlabs", model: "eleven_multilingual_v2", voice: "21m00Tcm4TlvDq8ikWAM", output_format: "mp3_44100_128" } },
    // ── Gemini ──
    { id: "en-gem-kore", name: "Kore", provider: "gemini", gender: "female", tag: "",
      opts: { provider: "gemini", model: "gemini-2.5-flash-preview-tts", voice: "Kore", instructions: "Speak in a clear, friendly English voice." } },
    { id: "en-gem-puck", name: "Puck", provider: "gemini", gender: "male", tag: "",
      opts: { provider: "gemini", model: "gemini-2.5-flash-preview-tts", voice: "Puck", instructions: "Speak in a clear, friendly English voice." } },
    { id: "en-gem-charon", name: "Charon", provider: "gemini", gender: "male", tag: "",
      opts: { provider: "gemini", model: "gemini-2.5-flash-preview-tts", voice: "Charon", instructions: "Speak in a clear, friendly English voice." } },
    { id: "en-gem-aoede", name: "Aoede", provider: "gemini", gender: "female", tag: "",
      opts: { provider: "gemini", model: "gemini-2.5-flash-preview-tts", voice: "Aoede", instructions: "Speak in a clear, friendly English voice." } },
    // ── xAI (Grok) ──
    { id: "en-xai-eve", name: "Eve", provider: "xai", gender: "female", tag: "Energetic",
      opts: { provider: "xai", voice: "eve", language: "en", output_format: "mp3" } },
    { id: "en-xai-ara", name: "Ara", provider: "xai", gender: "female", tag: "Warm",
      opts: { provider: "xai", voice: "ara", language: "en", output_format: "mp3" } },
    { id: "en-xai-rex", name: "Rex", provider: "xai", gender: "male", tag: "Confident",
      opts: { provider: "xai", voice: "rex", language: "en", output_format: "mp3" } },
    { id: "en-xai-sal", name: "Sal", provider: "xai", gender: "male", tag: "Smooth",
      opts: { provider: "xai", voice: "sal", language: "en", output_format: "mp3" } },
    { id: "en-xai-leo", name: "Leo", provider: "xai", gender: "male", tag: "Authoritative",
      opts: { provider: "xai", voice: "leo", language: "en", output_format: "mp3" } },
    // ── AWS Polly ──
    { id: "en-polly-ruth", name: "Ruth", provider: "aws-polly", gender: "female", tag: "Generative",
      opts: { voice: "Ruth", engine: "generative", language: "en-US" } },
    { id: "en-polly-matthew", name: "Matthew", provider: "aws-polly", gender: "male", tag: "Neural",
      opts: { voice: "Matthew", engine: "neural", language: "en-US" } },
    { id: "en-polly-joanna", name: "Joanna", provider: "aws-polly", gender: "female", tag: "Neural",
      opts: { voice: "Joanna", engine: "neural", language: "en-US" } },
    { id: "en-polly-stephen", name: "Stephen", provider: "aws-polly", gender: "male", tag: "Generative",
      opts: { voice: "Stephen", engine: "generative", language: "en-US" } },
    { id: "en-polly-amy", name: "Amy (British)", provider: "aws-polly", gender: "female", tag: "Neural",
      opts: { voice: "Amy", engine: "neural", language: "en-GB" } },
  ],
  tr: [
    // ── OpenAI (best for Turkish) ──
    { id: "tr-openai-nova", name: "Nova", provider: "openai", gender: "female", tag: "Önerilen",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "nova", response_format: "mp3", instructions: "Türkçe konuş. Doğal bir Türkçe aksanı ve telaffuz kullan." } },
    { id: "tr-openai-alloy", name: "Alloy", provider: "openai", gender: "neutral", tag: "Popüler",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "alloy", response_format: "mp3", instructions: "Türkçe konuş. Doğal bir Türkçe aksanı ve telaffuz kullan." } },
    { id: "tr-openai-echo", name: "Echo", provider: "openai", gender: "male", tag: "",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "echo", response_format: "mp3", instructions: "Türkçe konuş. Doğal bir Türkçe aksanı ve telaffuz kullan." } },
    { id: "tr-openai-shimmer", name: "Shimmer", provider: "openai", gender: "female", tag: "",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "shimmer", response_format: "mp3", instructions: "Türkçe konuş. Doğal bir Türkçe aksanı ve telaffuz kullan." } },
    { id: "tr-openai-onyx", name: "Onyx", provider: "openai", gender: "male", tag: "Derin",
      opts: { provider: "openai", model: "gpt-4o-mini-tts", voice: "onyx", response_format: "mp3", instructions: "Türkçe konuş. Doğal bir Türkçe aksanı ve telaffuz kullan." } },
    // ── ElevenLabs ──
    { id: "tr-el-rachel", name: "Rachel", provider: "elevenlabs", gender: "female", tag: "Gerçekçi",
      opts: { provider: "elevenlabs", model: "eleven_multilingual_v2", voice: "21m00Tcm4TlvDq8ikWAM", output_format: "mp3_44100_128" } },
    // ── Gemini ──
    { id: "tr-gem-kore", name: "Kore", provider: "gemini", gender: "female", tag: "",
      opts: { provider: "gemini", model: "gemini-2.5-flash-preview-tts", voice: "Kore", instructions: "Doğal ve akıcı Türkçe ile konuş." } },
    { id: "tr-gem-puck", name: "Puck", provider: "gemini", gender: "male", tag: "",
      opts: { provider: "gemini", model: "gemini-2.5-flash-preview-tts", voice: "Puck", instructions: "Doğal ve akıcı Türkçe ile konuş." } },
    { id: "tr-gem-charon", name: "Charon", provider: "gemini", gender: "male", tag: "",
      opts: { provider: "gemini", model: "gemini-2.5-flash-preview-tts", voice: "Charon", instructions: "Doğal ve akıcı Türkçe ile konuş." } },
    // ── xAI ──
    { id: "tr-xai-eve", name: "Eve", provider: "xai", gender: "female", tag: "Enerjik",
      opts: { provider: "xai", voice: "eve", language: "tr", output_format: "mp3" } },
    { id: "tr-xai-ara", name: "Ara", provider: "xai", gender: "female", tag: "Sıcak",
      opts: { provider: "xai", voice: "ara", language: "tr", output_format: "mp3" } },
    { id: "tr-xai-rex", name: "Rex", provider: "xai", gender: "male", tag: "Güvenli",
      opts: { provider: "xai", voice: "rex", language: "tr", output_format: "mp3" } },
    // ── AWS Polly (only standard for Turkish) ──
    { id: "tr-polly-filiz", name: "Filiz", provider: "aws-polly", gender: "female", tag: "Standart",
      opts: { voice: "Filiz", engine: "standard", language: "tr-TR" } },
  ],
};

const DEFAULT_VOICE: Record<Lang, string> = {
  en: "en-openai-nova",
  tr: "tr-openai-nova",
};
const PREVIEW_TEXT: Record<Lang, string> = {
  en: "Hello, this is a preview of my voice.",
  tr: "Merhaba, bu benim sesimin ön izlemesidir."
};
// ════════════════════════════════════════════════════════════════════════════
// SAMPLE TEXTS
// ════════════════════════════════════════════════════════════════════════════

const SAMPLES: Record<Lang, { icon: string; label: string; text: string }[]> = {
  en: [
    { icon: "👋", label: "Welcome", text: "Welcome to the Text to Speech tool! Simply type or paste any text, pick a realistic AI voice, and click Speak to hear it read aloud. It's completely free, with no sign-ups or API keys required." },
    { icon: "📰", label: "News", text: "Scientists have discovered a new species of deep-sea fish living near hydrothermal vents in the Pacific Ocean. The bioluminescent creature, which glows a brilliant blue in the dark, has adapted to survive extreme temperatures exceeding four hundred degrees." },
    { icon: "📖", label: "Story", text: "Once upon a time, in a quiet village at the edge of a great forest, there lived a young girl who could hear the whispers of the trees. Every evening, as the sun painted the sky in shades of orange and purple, she would sit beneath the old oak and listen." },
    { icon: "🎓", label: "Educational", text: "The human brain contains approximately eighty-six billion neurons, each connected to thousands of others through synapses. This vast network enables everything from breathing and heartbeat regulation to complex thought, creativity, and emotion." },
  ],
  tr: [
    { icon: "👋", label: "Hoş Geldin", text: "Metin okuma aracına hoş geldiniz! Herhangi bir metni yazın veya yapıştırın, gerçekçi bir yapay zeka sesi seçin ve Konuş butonuna tıklayarak sesli olarak dinleyin. Tamamen ücretsiz, kayıt veya API anahtarı gerekmez." },
    { icon: "📰", label: "Haber", text: "Bilim insanları, Pasifik Okyanusu'ndaki hidrotermal bacaların yakınında yaşayan yeni bir derin deniz balığı türü keşfetti. Karanlıkta parlak mavi ışık yayan bu canlı, dört yüz dereceyi aşan aşırı sıcaklıklarda hayatta kalacak şekilde evrim geçirmiş." },
    { icon: "📖", label: "Hikâye", text: "Bir zamanlar, büyük bir ormanın kenarındaki sessiz bir köyde, ağaçların fısıltılarını duyabilen genç bir kız yaşarmış. Her akşam, güneş gökyüzünü turuncu ve mor tonlarına boyarken, yaşlı meşenin altına oturup dinlermiş." },
    { icon: "🎓", label: "Eğitim", text: "İnsan beyni yaklaşık seksen altı milyar nöron içerir ve her biri sinapslar aracılığıyla binlerce diğer nörona bağlıdır. Bu geniş ağ, nefes almaktan kalp atışını düzenlemeye, karmaşık düşünceden yaratıcılığa ve duygulara kadar her şeyi mümkün kılar." },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// UI LABELS
// ════════════════════════════════════════════════════════════════════════════

const T: Record<string, Record<Lang, string>> = {
  title: { en: "Text to Speech", tr: "Metin Okuma" },
  subtitle: { en: "Free realistic AI voices in English & Turkish — No sign-up required", tr: "İngilizce ve Türkçe ücretsiz gerçekçi yapay zeka sesleri — Kayıt gerekmez" },
  enterText: { en: "Enter your text", tr: "Metninizi girin" },
  placeholder: { en: "Type or paste your text here…", tr: "Metninizi buraya yazın veya yapıştırın…" },
  words: { en: "words", tr: "kelime" },
  samples: { en: "Try a sample", tr: "Bir örnek deneyin" },
  speak: { en: "🔊  Speak", tr: "🔊  Konuş" },
  generating: { en: "Generating…", tr: "Oluşturuluyor…" },
  stop: { en: "Stop", tr: "Durdur" },
  clear: { en: "Clear", tr: "Temizle" },
  download: { en: "Download", tr: "İndir" },
  playing: { en: "Playing audio…", tr: "Ses oynatılıyor…" },
  voice: { en: "Choose a voice", tr: "Bir ses seçin" },
  filterProvider: { en: "Provider", tr: "Sağlayıcı" },
  filterGender: { en: "Gender", tr: "Cinsiyet" },
  all: { en: "All", tr: "Tümü" },
  female: { en: "Female", tr: "Kadın" },
  male: { en: "Male", tr: "Erkek" },
  neutral: { en: "Neutral", tr: "Nötr" },
  noVoices: { en: "No voices match your filters", tr: "Filtrelere uygun ses bulunamadı" },
  resetFilters: { en: "Reset filters", tr: "Filtreleri sıfırla" },
  free: { en: "100% Free", tr: "%100 Ücretsiz" },
  freeDesc: { en: "No API keys, no sign-up, no limits. Powered by Puter.js.", tr: "API anahtarı yok, kayıt yok, sınır yok. Puter.js ile desteklenmektedir." },
  tip1: { en: "Use punctuation for natural pauses", tr: "Doğal duraklamalar için noktalama kullanın" },
  tip2: { en: "OpenAI & ElevenLabs have the most realistic voices", tr: "OpenAI ve ElevenLabs en gerçekçi seslere sahiptir" },
  tip3: { en: "Max 3,000 characters per request", tr: "İstek başına en fazla 3.000 karakter" },
  tip4: { en: "xAI supports [pause] and [laugh] tags", tr: "xAI [pause] ve [laugh] etiketlerini destekler" },
  footer: { en: "Powered by Puter.js — Free AI voices from OpenAI, ElevenLabs, Google Gemini, xAI Grok & AWS Polly", tr: "Puter.js tarafından desteklenmektedir — OpenAI, ElevenLabs, Google Gemini, xAI Grok ve AWS Polly ücretsiz yapay zeka sesleri" },
};

// ════════════════════════════════════════════════════════════════════════════
// PROVIDER META
// ════════════════════════════════════════════════════════════════════════════

const PROV_LABEL: Record<Provider, string> = {
  openai: "OpenAI",
  elevenlabs: "ElevenLabs",
  gemini: "Gemini",
  xai: "xAI",
  "aws-polly": "AWS Polly",
};
const PROV_COLOR: Record<Provider, string> = {
  openai: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  elevenlabs: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  gemini: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  xai: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "aws-polly": "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function App() {
  // ── state ──
  const [lang, setLang] = useState<Lang>("en");
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE.en);
  const [status, setStatus] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState("");
  const [speed, setSpeed] = useState(1);
  const [provFilter, setProvFilter] = useState<Provider | "all">("all");
  const [genderFilter, setGenderFilter] = useState<Gender | "all">("all");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // ── derived ──
  const voices = VOICES[lang];
  const voice = voices.find((v) => v.id === voiceId) ?? voices[0];
  const filtered = voices.filter((v) => {
    if (provFilter !== "all" && v.provider !== provFilter) return false;
    if (genderFilter !== "all" && v.gender !== genderFilter) return false;
    return true;
  });
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readingSeconds = Math.ceil((wordCount / 150) * 60);
  const t = (key: string) => T[key]?.[lang] ?? key;

  // ── cleanup blob URLs on unmount ──
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  // ── language switch ──
  const switchLang = (l: Lang) => {
    stopAudio();
    setLang(l);
    setVoiceId(DEFAULT_VOICE[l]);
    setError("");
  };

  // ── stop ──
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setStatus("idle");
  }, []);

  // ── speak ──
  const handleSpeak = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length > 3000) {
      setError(lang === "en" ? "Text must be under 3,000 characters." : "Metin 3.000 karakterden kısa olmalıdır.");
      return;
    }

    stopAudio();
    setError("");
    setStatus("loading");

    try {
      const audio = await puter.ai.txt2speech(trimmed, { ...voice.opts });

      // Store blob URL for download
      if (audio.src) {
        blobUrlRef.current = audio.src;
      }

audioRef.current = audio;
audio.playbackRate = speed;
      audio.onended = () => setStatus("idle");
      audio.onerror = () => {
        setError(lang === "en" ? "Playback error — try another voice." : "Oynatma hatası — başka bir ses deneyin.");
        setStatus("idle");
      };

      await audio.play();
      setStatus("playing");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (lang === "en" ? "Something went wrong. Please try again." : "Bir hata oluştu. Lütfen tekrar deneyin.");
      setError(msg);
      setStatus("idle");
    }
  };
const replayAudio = async () => {
  if (!audioRef.current) return;

  audioRef.current.currentTime = 0;

  try {
    await audioRef.current.play();
    setStatus("playing");
  } catch (err) {
    console.error(err);
  }
};
const previewVoice = async (voice: VoiceDef) => {
  try {
    const audio = await puter.ai.txt2speech(
      PREVIEW_TEXT[lang],
      voice.opts
    );

    await audio.play();
  } catch (error) {
    console.error(error);
  }
};
  // ── download ──
  const handleDownload = () => {
    if (!blobUrlRef.current) return;
    const a = document.createElement("a");
    a.href = blobUrlRef.current;
    a.download = `speech-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white font-sans">
      {/* ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.07] blur-[120px]" />
        <div className="absolute top-1/2 -left-60 w-[500px] h-[500px] rounded-full bg-purple-600/[0.06] blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-sky-600/[0.05] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* ── HEADER ── */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent leading-tight">
            {t("title")}
          </h1>
          <p className="mt-3 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">{t("subtitle")}</p>

          {/* free badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-300">{t("free")}</span>
            <span className="text-xs text-emerald-400/70">— {t("freeDesc")}</span>
          </div>
        </header>

        {/* ── LANGUAGE TOGGLE ── */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-white/[0.04] border border-white/[0.08] p-1 backdrop-blur-md">
            {([
              { l: "en" as Lang, flag: "🇬🇧", label: "English" },
              { l: "tr" as Lang, flag: "🇹🇷", label: "Türkçe" },
            ]).map(({ l, flag, label }) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer",
                  lang === l
                    ? l === "en"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25"
                      : "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/25"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <span className="text-lg">{flag}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ╔═══ LEFT COLUMN (3/5) ═══╗ */}
          <div className="lg:col-span-3 space-y-5">
            {/* Text Input Card */}
            <section className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-lg p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("enterText")}</label>
                <span className={cn("text-xs font-mono", charCount > 2700 ? "text-red-400" : "text-slate-500")}>
{charCount}/3000 · {wordCount} {t("words")} · ~{readingSeconds}s                </span>
              </div>

              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setError(""); }}
                placeholder={t("placeholder")}
                rows={7}
                maxLength={3000}
                className="w-full rounded-xl bg-slate-900/60 border border-white/[0.07] p-4 text-[15px] leading-relaxed text-white placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition"
              />

              {/* char bar */}
              <div className="mt-2 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", charCount > 2700 ? "bg-red-500" : charCount > 2000 ? "bg-amber-500" : "bg-indigo-500")}
                  style={{ width: `${Math.min((charCount / 3000) * 100, 100)}%` }}
                />
              </div>

              {/* samples */}
              <div className="mt-4">
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mb-2">{t("samples")}</p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLES[lang].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => { setText(s.text); setError(""); }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all cursor-pointer"
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Controls Card */}
            <section className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-lg p-5 sm:p-6">
              {/* error */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* selected voice badge */}
              <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold", PROV_COLOR[voice.provider])}>
                    {voice.gender === "female" ? "♀" : voice.gender === "male" ? "♂" : "◎"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{voice.name}</p>
                    <p className="text-[11px] text-slate-500">{PROV_LABEL[voice.provider]} · {voice.gender === "female" ? t("female") : voice.gender === "male" ? t("male") : t("neutral")}</p>
                  </div>
                </div>
                {status === "playing" && (
                  <div className="flex items-end gap-[3px] h-5">
                    {[0,1,2,3,4].map((i) => (
                      <div key={i} className="w-[3px] rounded-full bg-gradient-to-t from-indigo-500 to-purple-400" style={{ animation: `soundbar 0.7s ease-in-out ${i * 0.12}s infinite` }} />
                    ))}
                  </div>
                )}
              </div>
<div className="mb-4">
  <div className="flex justify-between text-xs text-slate-400 mb-2">
    <span>Playback Speed</span>
    <span>{speed}x</span>
  </div>

  <input
    type="range"
    min="0.5"
    max="2"
    step="0.1"
    value={speed}
    onChange={(e) => setSpeed(Number(e.target.value))}
    className="w-full"
  />
</div>
              {/* buttons */}
              <div className="flex flex-wrap gap-3">
                {/* speak */}
                <button
                  onClick={handleSpeak}
                  disabled={!text.trim() || status === "loading"}
                  className={cn(
                    "flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer",
                    !text.trim() || status === "loading"
                      ? "bg-slate-800/60 text-slate-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 active:scale-[0.97]"
                  )}
                >
                  {status === "loading" ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t("generating")}
                    </>
                  ) : (
                    t("speak")
                  )}
                </button>

                {/* stop */}
                {status === "playing" && (
                  <button
                    onClick={stopAudio}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-all cursor-pointer active:scale-[0.97]"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
                    {t("stop")}
                  </button>
                  
                )}
{audioRef.current && (
  <button
    onClick={replayAudio}
    className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 transition-all cursor-pointer"
  >
    🔁 Replay
  </button>
)}
                {/* download */}
                {blobUrlRef.current && (
  <button
    onClick={handleDownload}
    className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-sky-500/15 text-sky-400 border border-sky-500/25 hover:bg-sky-500/25 transition-all cursor-pointer active:scale-[0.97]"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
    Download MP3
  </button>
)}

                {/* clear */}
                <button
                  onClick={() => { setText(""); setError(""); stopAudio(); }}
                  disabled={!text}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer active:scale-[0.97]",
                    !text ? "bg-slate-800/60 text-slate-600 cursor-not-allowed" : "bg-white/[0.05] text-slate-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  {t("clear")}
                </button>
              </div>

              {/* playing indicator */}
              {status === "playing" && (
                <div className="mt-5 flex items-center justify-center gap-2">
                  <div className="flex items-end gap-[2px]">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div key={i} className="w-[2.5px] rounded-full bg-gradient-to-t from-indigo-600 to-purple-400" style={{ animation: `soundbar 0.5s ease-in-out ${i * 0.06}s infinite` }} />
                    ))}
                  </div>
                  <span className="text-sm text-indigo-300 font-medium animate-pulse ml-2">{t("playing")}</span>
                </div>
              )}
            </section>

            {/* Tips */}
            <section className="rounded-2xl bg-gradient-to-br from-indigo-500/[0.07] to-purple-500/[0.07] border border-indigo-500/[0.15] p-5">
              <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                💡 {lang === "en" ? "Tips" : "İpuçları"}
              </h4>
              <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-400 leading-relaxed">
                {["tip1","tip2","tip3","tip4"].map((k) => (
                  <li key={k} className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5 shrink-0">▸</span>
                    {t(k)}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ╔═══ RIGHT COLUMN (2/5) ═══╗ */}
          <div className="lg:col-span-2 space-y-5">
            <section className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-lg p-5 sm:p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                🎙️ {t("voice")}
              </h3>

              {/* provider pills */}
              <div className="mb-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">{t("filterProvider")}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Pill active={provFilter === "all"} onClick={() => setProvFilter("all")}>{t("all")}</Pill>
                  {(Object.keys(PROV_LABEL) as Provider[]).map((p) => (
                    <Pill key={p} active={provFilter === p} onClick={() => setProvFilter(p)} color={provFilter === p ? PROV_COLOR[p] : undefined}>{PROV_LABEL[p]}</Pill>
                  ))}
                </div>
              </div>

              {/* gender pills */}
              <div className="mb-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">{t("filterGender")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { v: "all" as const, icon: "⊕", label: t("all") },
                    { v: "female" as const, icon: "♀", label: t("female") },
                    { v: "male" as const, icon: "♂", label: t("male") },
                    { v: "neutral" as const, icon: "◎", label: t("neutral") },
                  ]).map((g) => (
                    <Pill key={g.v} active={genderFilter === g.v} onClick={() => setGenderFilter(g.v)}>
                      {g.icon} {g.label}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* voice list */}
              <div className="max-h-[460px] overflow-y-auto pr-1 custom-scrollbar space-y-1">
                {filtered.length > 0 ? filtered.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoiceId(v.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer group",
                      voiceId === v.id
                        ? "bg-indigo-500/[0.12] border border-indigo-500/30 ring-1 ring-indigo-500/20"
                        : "border border-transparent hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                          voiceId === v.id ? "bg-indigo-500/25 text-indigo-300" : "bg-white/[0.05] text-slate-500 group-hover:text-slate-300"
                        )}>
                          {v.gender === "female" ? "♀" : v.gender === "male" ? "♂" : "◎"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-medium truncate", voiceId === v.id ? "text-white" : "text-slate-300 group-hover:text-white")}>
                              {v.name}
                            </span>
                            {v.tag && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300/80 font-semibold shrink-0">
                                {v.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
  <button
    onClick={(e) => {
      e.stopPropagation();
      previewVoice(v);
    }}
    className="px-2 py-1 text-[10px] rounded bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25"
  >
    ▶ Preview
  </button>

  <span
    className={cn(
      "text-[10px] px-2 py-0.5 rounded-md border font-semibold shrink-0",
      PROV_COLOR[v.provider]
    )}
  >
    {PROV_LABEL[v.provider]}
  </span>
</div>
                    </div>
                  </button>
                )) : (
                  <div className="text-center py-10">
                    <p className="text-sm text-slate-500 mb-2">{t("noVoices")}</p>
                    <button onClick={() => { setProvFilter("all"); setGenderFilter("all"); }} className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium">
                      {t("resetFilters")}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* provider info */}
            <section className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-lg p-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                {lang === "en" ? "🤖 AI Providers" : "🤖 Yapay Zeka Sağlayıcılar"}
              </h4>
              <div className="space-y-2.5 text-xs">
                {([
                  { p: "openai" as Provider, desc: lang === "en" ? "GPT-powered, most realistic & natural" : "GPT destekli, en gerçekçi ve doğal" },
                  { p: "elevenlabs" as Provider, desc: lang === "en" ? "Ultra-realistic, human-like quality" : "Ultra gerçekçi, insana yakın kalite" },
                  { p: "gemini" as Provider, desc: lang === "en" ? "Google AI with style instructions" : "Stil talimatlarıyla Google AI" },
                  { p: "xai" as Provider, desc: lang === "en" ? "Expressive with speech tags support" : "Konuşma etiketleri desteği ile ifadeli" },
                  { p: "aws-polly" as Provider, desc: lang === "en" ? "Neural & generative speech engines" : "Nöral ve üretken konuşma motorları" },
                ]).map(({ p, desc }) => (
                  <div key={p} className="flex items-start gap-2.5">
                    <span className={cn("mt-0.5 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 border", PROV_COLOR[p])}>
                      {PROV_LABEL[p][0]}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-300">{PROV_LABEL[p]}</span>
                      <span className="text-slate-500"> — {desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="text-center mt-14 text-xs text-slate-600 leading-relaxed">
          <p>{t("footer")}</p>
        </footer>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PILL COMPONENT
// ════════════════════════════════════════════════════════════════════════════

function Pill({ active, onClick, color, children }: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 text-[11px] rounded-lg border font-semibold transition-all cursor-pointer",
        active
          ? color ?? "bg-white/10 text-white border-white/20"
          : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.04]"
      )}
    >
      {children}
    </button>
  );
}
