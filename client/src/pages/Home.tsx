import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Copy,
  Flag,
  Gift,
  HandHeart,
  Heart,
  Loader2,
  MapPin,
  Medal,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type Match = {
  id: number;
  phase: string;
  match_date: string;
  home_team: string;
  away_team: string;
  venue: string;
  city: string;
  result_home_score: number | null;
  result_away_score: number | null;
};

type Prediction = {
  match_id: number;
  home_score: number;
  away_score: number;
};

type Participant = {
  id: string;
  code: string;
  full_name: string;
  whatsapp: string;
  donation_type: string;
  delivery_point: string;
  voucher_code: string;
  voucher_discount: string;
  donation_confirmed: boolean;
};

type RankingRow = {
  id: string;
  code: string;
  full_name: string;
  total_points: number;
  exact_scores: number;
  correct_results: number;
  scored_matches: number;
  predicted_matches: number;
};

const donationTypes = [
  {
    id: "Alimentos não perecíveis",
    label: "Alimentos",
    description: "Arroz, feijão, macarrão, leite, óleo e itens de cesta básica.",
    voucherCode: "ALIMENTO10",
    voucherDiscount: "10% de desconto",
  },
  {
    id: "Roupas em bom estado",
    label: "Roupas",
    description: "Peças limpas e em bom estado para adultos, jovens ou crianças.",
    voucherCode: "ROUPA15",
    voucherDiscount: "15% de desconto",
  },
  {
    id: "Brinquedos",
    label: "Brinquedos",
    description: "Brinquedos novos ou em bom estado para ações com crianças.",
    voucherCode: "BRINQUEDO20",
    voucherDiscount: "20% de desconto",
  },
];

const hmAddress = "HM Bazar e Conveniência - Rua Ninho de Imarés, 115";
const associationAddress = "Associação Semeando Amor - Rua Ninho de Imarés, 169";
const hmWhatsAppUrl = "https://wa.me/551159204146";

const assets = {
  hmLogo: "/assets/hm-logo.png",
  semeandoLogo: "/assets/semeando-amor-logo.png",
  hmStore: "/assets/hm-fachada.jpg",
  hmStoreMain: "/assets/foto-hm/hm-store-main.jpeg",
  hmStoreShelves: "/assets/foto-hm/hm-store-shelves.jpeg",
  stadiumHero: "/assets/brazil-fans-hero.jpg",
  community: "/assets/community.jpg",
  stadiumAzteca: "/assets/stadium-azteca.jpg",
  stadiumMetlife: "/assets/stadium-metlife.jpg",
  stadiumSofi: "/assets/stadium-sofi.jpg",
  stadiumAtt: "/assets/stadium-att.jpg",
  videoAssociacao: "/assets/video-associacao.mp4",
  semeandoInstagram: "/assets/semeando-instagram.jpg",
};

const stadiumJourney = [
  { 
    name: "Estádio Azteca", 
    city: "Cidade do México", 
    country: "México", 
    image: assets.stadiumAzteca,
    curiosity: "Primeiro estádio da história a receber três Copas do Mundo.",
    credit: "ProtoplasmaKid / Wikimedia Commons"
  },
  { 
    name: "MetLife Stadium", 
    city: "East Rutherford", 
    country: "Estados Unidos", 
    image: assets.stadiumMetlife,
    curiosity: "Será o palco da grande final da Copa do Mundo 2026.",
    credit: "PicoG / Wikimedia Commons"
  },
  { 
    name: "SoFi Stadium", 
    city: "Inglewood", 
    country: "Estados Unidos", 
    image: assets.stadiumSofi,
    curiosity: "O estádio mais caro do mundo, com uma tela LED gigante suspensa.",
    credit: "Flickr / Wikimedia Commons"
  },
  { 
    name: "AT&T Stadium", 
    city: "Arlington", 
    country: "Estados Unidos", 
    image: assets.stadiumAtt,
    curiosity: "Possui um dos maiores telões suspensos do planeta.",
    credit: "Drew Tarvin / Wikimedia Commons"
  },
];

const socialLinks = {
  hm: {
    instagram: "https://www.instagram.com/hm.bazar.conveniencia?igsh=MWlsdHlkeXh5MTl1ag%3D%3D&utm_source=qr",
    whatsapp: hmWhatsAppUrl,
  },
  associacao: {
    instagram: "https://www.instagram.com/semeandoamorcomatiamonica/",
    whatsapp: "https://wa.me/5511959305099",
  }
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function generateCode() {
  return `BOLAO-2026-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
}

function predictionKey(matchId: number, side: "home" | "away") {
  return `${matchId}-${side}`;
}

function navigateTo(path: string) {
  window.location.assign(path);
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SafeImage({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

function VisualFallback({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-[radial-gradient(circle_at_top_left,#fde047,transparent_34%),linear-gradient(135deg,#14532d,#16a34a_52%,#dc2626)] text-white ${className}`}
    >
      {children}
    </div>
  );
}

type HomeView = "home" | "sobre" | "participar" | "palpites" | "ranking";

export default function Home({ view = "home" }: { view?: HomeView }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(() => {
    try {
      const storedParticipant = window.localStorage.getItem("bolaoParticipant");
      return storedParticipant ? JSON.parse(storedParticipant) : null;
    } catch {
      return null;
    }
  });
  const [predictions, setPredictions] = useState<Record<string, string>>(() => {
    try {
      const storedPredictions = window.localStorage.getItem("bolaoPredictions");
      return storedPredictions ? JSON.parse(storedPredictions) : {};
    } catch {
      return {};
    }
  });
  const [accessCode, setAccessCode] = useState("");
  const [accessWhatsApp, setAccessWhatsApp] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("Todas");
  const [dateFilter, setDateFilter] = useState("Todas");
  const [predictionMode, setPredictionMode] = useState<"brasil" | "completo">("brasil");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const phases = useMemo(() => ["Todas", ...Array.from(new Set(matches.map((match) => match.phase)))], [matches]);
  const dates = useMemo(() => ["Todas", ...Array.from(new Set(matches.map((match) => match.match_date)))], [matches]);

  const filteredMatches = useMemo(
    () =>
      matches.filter((match) => {
        const byPhase = phaseFilter === "Todas" || match.phase === phaseFilter;
        const byDate = dateFilter === "Todas" || match.match_date === dateFilter;
        return byPhase && byDate;
      }),
    [dateFilter, matches, phaseFilter]
  );

  const brazilMatches = useMemo(
    () =>
      matches.filter(
        (match) =>
          match.home_team.toLowerCase().includes("brasil") || match.away_team.toLowerCase().includes("brasil")
      ),
    [matches]
  );

  const visiblePredictionMatches = predictionMode === "brasil" ? (brazilMatches.length > 0 ? brazilMatches : matches.slice(0, 3)) : filteredMatches;

  const predictedCount = useMemo(
    () =>
      matches.filter(
        (match) =>
          predictions[predictionKey(match.id, "home")] !== undefined &&
          predictions[predictionKey(match.id, "home")] !== "" &&
          predictions[predictionKey(match.id, "away")] !== undefined &&
          predictions[predictionKey(match.id, "away")] !== ""
      ).length,
    [matches, predictions]
  );

  const visiblePredictedCount = useMemo(
    () =>
      visiblePredictionMatches.filter(
        (match) =>
          predictions[predictionKey(match.id, "home")] !== undefined &&
          predictions[predictionKey(match.id, "home")] !== "" &&
          predictions[predictionKey(match.id, "away")] !== undefined &&
          predictions[predictionKey(match.id, "away")] !== ""
      ).length,
    [predictions, visiblePredictionMatches]
  );

  const predictionProgress = matches.length > 0 ? Math.round((predictedCount / matches.length) * 100) : 0;

  function isMatchPredicted(match: Match) {
    const home = predictions[predictionKey(match.id, "home")];
    const away = predictions[predictionKey(match.id, "away")];
    return home !== undefined && home !== "" && away !== undefined && away !== "";
  }

  async function loadPublicData() {
    const [matchesResponse, rankingResponse] = await Promise.all([fetch("/api/matches"), fetch("/api/ranking")]);
    const matchesPayload = await matchesResponse.json();
    const rankingPayload = await rankingResponse.json();
    setMatches(matchesPayload.matches || []);
    setRanking(rankingPayload.ranking || []);
  }

  useEffect(() => {
    loadPublicData()
      .catch(() => setMessage("Não foi possível carregar os dados do bolão agora."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (participant) {
      window.localStorage.setItem("bolaoParticipant", JSON.stringify(participant));
      setAccessCode(participant.code);
      setAccessWhatsApp(participant.whatsapp);
    }
  }, [participant]);

  useEffect(() => {
    if (participant) {
      window.localStorage.setItem("bolaoPredictions", JSON.stringify(predictions));
    }
  }, [participant, predictions]);

  async function createParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const donationType = String(form.get("donationType") || "");
    const donation = donationTypes.find((item) => item.id === donationType) || donationTypes[0];
    const code = generateCode();

    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          fullName: String(form.get("fullName") || ""),
          whatsapp: normalizePhone(String(form.get("whatsapp") || "")),
          donationType,
          deliveryPoint: String(form.get("deliveryPoint") || ""),
          voucherCode: donation.voucherCode,
          voucherDiscount: donation.voucherDiscount,
        }),
      });

      if (!response.ok) throw new Error("participant save failed");

      const payload = await response.json();
      setParticipant(payload.participant);
      setMessage("Participação criada. Agora fale com a HM no WhatsApp para combinar a doação e preencha seus palpites.");
      setTimeout(() => scrollToSection("top"), 50);
    } catch {
      setMessage("Não foi possível criar sua participação. Confira os dados e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function accessParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const params = new URLSearchParams({
        code: accessCode.trim(),
        whatsapp: normalizePhone(accessWhatsApp),
      });
      const response = await fetch(`/api/participants/access?${params.toString()}`);
      if (!response.ok) throw new Error("not found");

      const payload = await response.json();
      const nextPredictions = (payload.predictions || []).reduce((acc: Record<string, string>, row: Prediction) => {
        acc[predictionKey(row.match_id, "home")] = String(row.home_score);
        acc[predictionKey(row.match_id, "away")] = String(row.away_score);
        return acc;
      }, {});

      window.localStorage.setItem("bolaoParticipant", JSON.stringify(payload.participant));
      window.localStorage.setItem("bolaoPredictions", JSON.stringify(nextPredictions));
      setParticipant(payload.participant);
      setPredictions(nextPredictions);
      setMessage("Participação encontrada. Você pode continuar seus palpites.");
      navigateTo("/palpites");
    } catch {
      setMessage("Não encontrei essa combinação de código e WhatsApp.");
    } finally {
      setSaving(false);
    }
  }

  async function savePredictions(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!participant) return;

    setSaving(true);
    setMessage("");

    const payload = matches
      .map((match) => {
        const home = predictions[predictionKey(match.id, "home")];
        const away = predictions[predictionKey(match.id, "away")];
        if (home === undefined || home === "" || away === undefined || away === "") return null;
        return {
          matchId: match.id,
          homeScore: Number(home),
          awayScore: Number(away),
        };
      })
      .filter((item): item is { matchId: number; homeScore: number; awayScore: number } => item !== null);

    try {
      const response = await fetch(`/api/participants/${participant.id}/predictions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions: payload }),
      });

      if (!response.ok) throw new Error("prediction save failed");
      window.localStorage.setItem("bolaoPredictions", JSON.stringify(predictions));
      setMessage("Palpites salvos. Seus pontos entram no ranking após a confirmação da doação.");
    } catch {
      setMessage("Não foi possível salvar os palpites agora.");
    } finally {
      setSaving(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function openWhatsApp() {
    if (!participant) return;
    const messageText = `Olá! Quero confirmar minha doação para participar do Bolão Solidário HM + Semeando Amor.%0A%0ANome: ${participant.full_name}%0AWhatsApp: ${participant.whatsapp}%0ACódigo de participação: ${participant.code}%0ADoação: ${participant.donation_type}%0AEntrega: ${participant.delivery_point}`;
    window.open(`${hmWhatsAppUrl}?text=${messageText}`, "_blank", "noopener,noreferrer");
  }

  const topThree = ranking.slice(0, 3);
  const remainingRanking = ranking.slice(3);
  const showLanding = view === "home";
  const showAbout = view === "sobre";
  const showParticipation = view === "participar";
  const showPredictions = view === "palpites";
  const showRanking = view === "ranking";
  const showSocial = view === "sobre";

  return (
    <div className="min-h-screen bg-[#fffaf0] text-stone-950">
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur-xl">
        <div className="container flex items-center justify-between gap-4 py-3">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <SafeImage
              src={assets.hmLogo}
              alt="HM Bazar e Conveniência"
              className="h-11 w-11 rounded-md border border-emerald-900/10 object-contain"
              fallback={
                <VisualFallback className="h-11 w-11 rounded-md text-xs font-black">
                  HM
                </VisualFallback>
              }
            />
            <SafeImage
              src={assets.semeandoLogo}
              alt="Associação Semeando Amor"
              className="hidden h-11 w-11 rounded-md border border-rose-900/10 object-contain sm:block"
              fallback={
                <VisualFallback className="hidden h-11 w-11 rounded-md sm:flex">
                  <Heart className="h-5 w-5" />
                </VisualFallback>
              }
            />
            <div className="min-w-0">
              <p className="truncate font-display text-sm text-emerald-950 sm:text-base">Bolão Solidário</p>
              <p className="truncate text-xs font-black text-rose-700">HM + Semeando Amor</p>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-black text-emerald-950 lg:flex">
            <button onClick={() => navigateTo("/sobre")} className="hover:text-rose-700">
              Sobre
            </button>
            <button onClick={() => navigateTo("/participar")} className="hover:text-rose-700">
              Participar
            </button>
            <button onClick={() => navigateTo("/palpites")} className="hover:text-rose-700">
              Palpites
            </button>
            <button onClick={() => navigateTo("/ranking")} className="hover:text-rose-700">
              Ranking
            </button>
            <a href="/admin" className="hover:text-rose-700">
              Admin
            </a>
          </nav>

          <Button
            onClick={() => navigateTo("/participar")}
            className="bg-rose-700 px-4 font-black text-white hover:bg-rose-800"
          >
            Participar
          </Button>
        </div>
      </header>

      <main id="top">
        {showLanding && (
          <>
        <section
          className="relative isolate overflow-hidden bg-[#06351f] text-white"
          style={{
            backgroundImage: `linear-gradient(110deg, rgba(2, 44, 34, 0.92), rgba(21, 128, 61, 0.65) 46%, rgba(29, 78, 216, 0.44)), url(${assets.stadiumHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(250,204,21,0.4),transparent_30%),radial-gradient(circle_at_18%_80%,rgba(37,99,235,0.35),transparent_35%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#fffaf0] to-transparent" />
          
          <div className="container relative z-10 grid gap-12 pb-24 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-20">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-black shadow-2xl backdrop-blur-md">
                <span className="flex h-2 w-2 animate-ping rounded-full bg-yellow-400" />
                MOVIMENTO COMUNITÁRIO 2026
              </div>
              
              <h1 className="max-w-4xl font-display text-5xl leading-[0.95] text-white sm:text-7xl lg:text-8xl">
                TORÇA PELO BRASIL. <span className="text-yellow-300">AJUDE O BAIRRO.</span>
              </h1>
              
              <p className="max-w-xl text-xl font-bold leading-relaxed text-emerald-50 sm:text-2xl">
                Faça seus palpites da Copa 2026, concorra a prêmios e ajude a Associação Semeando Amor com a Tia Mônica.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={() => navigateTo("/participar")}
                  className="group h-14 bg-yellow-300 px-8 text-lg font-black text-emerald-950 shadow-[0_20px_50px_rgba(250,204,21,0.3)] hover:bg-yellow-200"
                >
                  Quero participar agora
                  <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  onClick={() => navigateTo("/ranking")}
                  variant="outline"
                  className="h-14 border-white/40 bg-white/5 px-8 text-lg font-black text-white backdrop-blur-sm hover:bg-white hover:text-emerald-950"
                >
                  Ver Ranking Solidário
                </Button>
              </div>

              {/* Social Proof Counters */}
              <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
                {[
                  { label: "Participantes", value: ranking.length || "Aberto", icon: Users },
                  { label: "Doações", value: "Solidárias", icon: HandHeart },
                  { label: "Prêmios", value: "3", icon: Gift },
                  { label: "Sorteio", value: "Ativo", icon: Sparkles },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <stat.icon className="mb-2 h-5 w-5 text-yellow-300" />
                    <p className="font-display text-2xl text-white">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[3rem] bg-yellow-400/20 blur-3xl" />
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
                   <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                      <SafeImage src={assets.hmLogo} alt="HM" className="h-16 w-16 rounded-xl bg-white p-2 shadow-lg" fallback={<div className="h-16 w-16 rounded-xl bg-emerald-800" />} />
                      <div className="h-8 w-px bg-white/20" />
                      <SafeImage src={assets.semeandoLogo} alt="Semeando" className="h-16 w-16 rounded-xl bg-white p-2 shadow-lg" fallback={<div className="h-16 w-16 rounded-xl bg-rose-800" />} />
                   </div>
                   <div className="pt-6">
                      <p className="font-display text-2xl text-white">Torcida solidária do bairro</p>
                      <p className="mt-2 text-emerald-50/80">
                        Você participa, combina a doação com a HM e acompanha seus pontos depois da confirmação.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-rose-700 py-6 text-white shadow-inner">
          <div className="container flex flex-col items-center gap-4 text-center md:flex-row md:justify-center md:text-left">
            <Heart className="h-10 w-10 animate-pulse text-yellow-300" />
            <div>
              <p className="font-display text-xl tracking-tight sm:text-2xl">❤️ A COPA TAMBÉM PODE FAZER O BEM</p>
              <p className="text-sm font-bold text-rose-100 sm:text-base">
                Sua doação ajuda ações sociais da Associação Semeando Amor e fortalece a nossa comunidade.
              </p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white backdrop-blur-sm">
              Sem apostas em dinheiro • 100% Solidário
            </div>
          </div>
        </section>
          </>
        )}

        {showAbout && (
          <>
        <section id="conheca-hm" className="bg-white py-20">
          <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-3xl shadow-xl">
                    <SafeImage src={assets.hmStoreMain} alt="HM Bazar e Conveniência Loja" className="aspect-[4/5] object-cover" fallback={<VisualFallback className="aspect-[4/5]" children={null} />} />
                  </div>
                  <div className="overflow-hidden rounded-3xl shadow-xl">
                    <SafeImage src={assets.hmStoreShelves} alt="Produtos HM" className="aspect-square object-cover" fallback={<VisualFallback className="aspect-square" children={null} />} />
                  </div>
                </div>
                <div className="pt-8">
                  <div className="overflow-hidden rounded-3xl shadow-xl">
                    <SafeImage src={assets.hmStore} alt="HM Fachada" className="aspect-[4/6] object-cover" fallback={<VisualFallback className="aspect-[4/6]" children={null} />} />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="font-black uppercase tracking-widest text-emerald-800">Apoio Local</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-emerald-950 sm:text-6xl">
                Conheça a <span className="text-blue-700">HM Bazar e Conveniência</span>
              </h2>
              <p className="mt-8 text-xl font-medium leading-relaxed text-stone-600">
                A HM Bazar e Conveniência apoia esta iniciativa para aproximar a comunidade durante a Copa do Mundo e ajudar a Associação Semeando Amor.
              </p>
              <p className="mt-4 text-stone-500">
                Mais que um comércio, a HM é um ponto de encontro no bairro. Aqui você confirma sua doação e faz parte do nosso movimento solidário.
              </p>
              
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-emerald-50 p-4">
                  <MapPin className="h-6 w-6 text-emerald-800" />
                  <p className="font-bold text-emerald-950">{hmAddress}</p>
                </div>
                <a 
                  href={hmWhatsAppUrl} 
                  target="_blank" 
                  rel="noopener"
                  className="flex items-center justify-between rounded-2xl border-2 border-emerald-900/10 p-4 transition-colors hover:bg-emerald-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-emerald-100 p-2">
                       <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-emerald-700">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.897-5.335 11.9-11.894a11.83 11.83 0 00-3.415-8.421z" />
                      </svg>
                    </div>
                    <span className="font-bold text-emerald-950">Fale com a HM</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-stone-400" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="conheca-associacao" className="bg-rose-50 py-20">
          <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-black uppercase tracking-widest text-rose-700">Coração do Projeto</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-rose-950 sm:text-6xl">
                Semeando <span className="text-rose-600">Amor</span>
              </h2>
              <div className="mt-8 space-y-6 text-xl font-medium leading-relaxed text-stone-700">
                <p>
                  A <span className="font-black text-rose-900">Associação Semeando Amor</span>, liderada pela Tia Mônica, é o refúgio e o futuro de muitas famílias do nosso bairro.
                </p>
                <p>
                  Através de atividades sociais, educacionais e esportivas, a associação transforma vidas diariamente. As doações deste bolão ajudam diretamente na manutenção dessas aulas e no acolhimento da comunidade.
                </p>
                <div className="rounded-2xl bg-white p-6 shadow-xl shadow-rose-900/5">
                  <p className="text-base text-stone-600">
                    "Futebol é alegria, e alegria compartilhada vira amor. Cada doação é um passo para um futuro melhor para nossas crianças."
                  </p>
                  <p className="mt-4 font-display text-xl text-rose-900">— Tia Mônica</p>
                </div>
              </div>
            </div>
            <div className="relative space-y-6">
              <div className="absolute -inset-4 rounded-[2rem] bg-rose-200/50 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl bg-black aspect-video">
                <video 
                  src={assets.videoAssociacao} 
                  controls 
                  preload="metadata"
                  className="h-full w-full object-cover"
                  poster={assets.community}
                >
                  Seu navegador não suporta vídeos.
                </video>
              </div>
              <a
                href={socialLinks.associacao.instagram}
                target="_blank"
                rel="noopener"
                className="relative flex items-center gap-5 rounded-[2rem] border-4 border-white bg-white p-5 shadow-xl transition-transform hover:-translate-y-1"
              >
                <SafeImage
                  src={assets.semeandoInstagram}
                  alt="Instagram da Associação Semeando Amor com a Tia Mônica"
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                  fallback={
                    <VisualFallback className="h-20 w-20 shrink-0 rounded-2xl">
                      <Heart className="h-8 w-8" />
                    </VisualFallback>
                  }
                />
                <div>
                  <p className="font-display text-xl text-rose-950">Siga a Associação</p>
                  <p className="mt-1 text-sm font-bold text-stone-600">@semeandoamorcomatiamonica</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-widest text-rose-700">Ver ações no Instagram</p>
                </div>
              </a>
            </div>
          </div>
        </section>
          </>
        )}

        {message && (
          <div className="container -mt-10 relative z-10">
            <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 font-bold text-emerald-950 shadow-lg">
              {message}
            </div>
          </div>
        )}

        {showLanding && (
          <>
        <section id="como-funciona" className="container py-12">
          <div className="max-w-2xl">
            <p className="font-black uppercase tracking-wide text-rose-700">Como funciona</p>
            <h2 className="mt-2 font-display text-3xl text-emerald-950 sm:text-4xl">Participe em três passos simples.</h2>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Flag,
                title: "Doe",
                text: "Escolha sua doação e combine a entrega com a HM pelo WhatsApp.",
              },
              {
                icon: Trophy,
                title: "Palpite",
                text: "Preencha os placares dos jogos do Brasil ou da Copa completa.",
              },
              {
                icon: HandHeart,
                title: "Acompanhe",
                text: "Depois da confirmação da doação, seus pontos entram no ranking.",
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="border-0 bg-white p-6 shadow-[0_18px_45px_rgba(20,83,45,0.10)]">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-3xl text-yellow-500">0{index + 1}</span>
                  </div>
                  <h3 className="font-display text-2xl text-emerald-950">{step.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-stone-600">{step.text}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="container py-12">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="font-black uppercase tracking-wide text-blue-700">🇧🇷 Jogos do Brasil</p>
              <h2 className="mt-2 font-display text-3xl text-emerald-950 sm:text-4xl">Primeiro, o Brasil. Depois, a Copa inteira.</h2>
              <p className="mt-4 text-lg font-medium leading-8 text-stone-700">
                Comece pelos jogos da Seleção. É o jeito mais rápido de participar, torcer e entrar no clima da Copa.
              </p>
              <Button
                onClick={() => scrollToSection(participant ? "palpites" : "participar")}
                className="mt-6 h-12 bg-blue-700 px-6 font-black text-white hover:bg-blue-800"
              >
                {participant ? "Palpitar nos jogos do Brasil" : "Fazer minha participação"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="mt-3 text-sm font-bold text-stone-500">
                Depois de participar, você já pode preencher seus palpites. A pontuação entra no ranking quando a doação for confirmada.
              </p>
            </div>
            <div className="grid gap-4">
              {(brazilMatches.length > 0 ? brazilMatches.slice(0, 3) : matches.slice(0, 3)).map((match) => (
                <div
                  key={match.id}
                  className="overflow-hidden rounded-[1.5rem] border-2 border-yellow-300 bg-white shadow-[0_18px_45px_rgba(29,78,216,0.12)]"
                >
                  <div className="bg-[linear-gradient(90deg,#16a34a,#facc15,#2563eb)] px-4 py-2 text-xs font-black uppercase text-white">
                    Próximo jogo do Brasil
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 text-center">
                    <p className="font-display text-lg text-emerald-950">{match.home_team}</p>
                    <span className="rounded-full bg-blue-700 px-3 py-2 text-xs font-black text-white">x</span>
                    <p className="font-display text-lg text-emerald-950">{match.away_team}</p>
                  </div>
                  <div className="border-t border-emerald-900/10 px-4 py-3 text-sm font-bold text-stone-600">
                    {formatDate(match.match_date)} • {match.venue}, {match.city}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(135deg,#ecfdf5,#eff6ff,#fefce8)] py-12">
          <div className="container">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-black uppercase tracking-wide text-blue-700">🏆 Premiação</p>
                <h2 className="mt-2 font-display text-3xl text-emerald-950 sm:text-4xl">Quem torce também concorre.</h2>
              </div>
              <p className="max-w-md text-sm font-bold text-stone-600">
                Os prêmios serão anunciados pela organização. O ranking já está preparado para 1º, 2º e 3º lugar.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["1º Lugar", "Prêmio principal", "bg-yellow-300 text-emerald-950"],
                ["2º Lugar", "Prêmio especial", "bg-white text-blue-800"],
                ["3º Lugar", "Prêmio da torcida", "bg-white text-emerald-950"],
              ].map(([place, prize, className]) => (
                <Card key={place} className={`border-0 p-6 shadow-xl ${className}`}>
                  <Medal className="h-9 w-9 text-rose-700" />
                  <p className="mt-5 font-display text-3xl">{place}</p>
                  <p className="mt-2 text-sm font-black uppercase">{prize}</p>
                  <p className="mt-4 rounded-2xl bg-white/45 px-4 py-3 text-sm font-bold">A definir pela campanha</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container grid gap-6 py-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="rounded-[2rem] bg-blue-700 p-6 text-white shadow-2xl sm:p-8">
            <Ticket className="h-11 w-11 text-yellow-300" />
            <h2 className="mt-5 font-display text-3xl sm:text-4xl">Mais solidariedade, mais chances no sorteio</h2>
            <p className="mt-4 text-lg font-medium leading-8 text-blue-50">
              Cada doação pode gerar um número da sorte. Isso não altera o ranking: os pontos continuam vindo apenas dos palpites.
            </p>
          </div>
          <div className="grid gap-3">
              {[
                ["1 doação", "recebe número da sorte"],
                ["Mais ajuda", "mais números para concorrer"],
                ["Ranking preservado", "pontos só pelos palpites"],
              ].map(([title, text]) => (
              <div key={title} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
                <Gift className="h-7 w-7 shrink-0 text-rose-700" />
                <div>
                  <p className="font-display text-xl text-emerald-950">{title}</p>
                  <p className="text-sm font-bold text-stone-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
          </>
        )}

        {showAbout && (
          <>
        <section id="nossa-comunidade" className="bg-emerald-50 py-24">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-16">
              <p className="font-black uppercase tracking-widest text-emerald-800">Impacto Real</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-emerald-950 sm:text-6xl">
                Nossa <span className="text-emerald-600">Comunidade</span>
              </h2>
              <p className="mt-6 max-w-2xl text-lg font-medium text-stone-600">
                O bolão é apenas o começo. Veja como a sua participação se transforma em sorrisos, aprendizado e cuidado no nosso bairro.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { title: "Ações Sociais", text: "Distribuição de cestas e apoio direto às famílias.", icon: Heart },
                { title: "Aulas & Educação", text: "Reforço escolar e oficinas para nossas crianças.", icon: Sparkles },
                { title: "Voluntariado", text: "Gente do bairro cuidando de gente do bairro.", icon: Users },
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl transition-all hover:bg-emerald-900 hover:text-white">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 transition-colors group-hover:bg-white/10 group-hover:text-yellow-300">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-3xl">{item.title}</h3>
                  <p className="mt-4 text-stone-600 group-hover:text-emerald-100">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 grid gap-6 rounded-[3rem] bg-emerald-950 p-8 text-white shadow-2xl md:grid-cols-[auto_1fr_auto] md:items-center md:p-10">
              <SafeImage
                src={assets.semeandoInstagram}
                alt="Associação Semeando Amor com a Tia Mônica"
                className="h-24 w-24 rounded-3xl border-4 border-white/20 object-cover"
                fallback={
                  <VisualFallback className="h-24 w-24 rounded-3xl">
                    <Heart className="h-9 w-9" />
                  </VisualFallback>
                }
              />
              <div>
                <p className="font-black uppercase tracking-widest text-yellow-300">Ações reais da Associação</p>
                <h3 className="mt-2 font-display text-3xl">Acompanhe o impacto no Instagram</h3>
                <p className="mt-3 max-w-2xl font-medium text-emerald-100">
                  Em vez de uma imagem genérica, este espaço leva para o perfil oficial da Semeando Amor com a Tia Mônica,
                  onde a comunidade pode ver as ações, campanhas e bastidores.
                </p>
              </div>
              <a
                href={socialLinks.associacao.instagram}
                target="_blank"
                rel="noopener"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-yellow-300 px-6 font-black text-emerald-950 transition-transform hover:-translate-y-1 hover:bg-yellow-200"
              >
                Ver Instagram
              </a>
            </div>
          </div>
        </section>

        <section id="jornada-copa" className="bg-white py-24">
          <div className="container">
            <div className="mb-16">
              <p className="font-black uppercase tracking-widest text-blue-700">Exploração</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-emerald-950 sm:text-6xl">
                A Jornada da <span className="text-yellow-500">Copa</span>
              </h2>
              <p className="mt-6 max-w-2xl text-lg font-medium text-stone-600">
                Acompanhe os palcos monumentais onde a história do futebol será escrita em 2026.
              </p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stadiumJourney.map((stadium) => (
                <Card key={stadium.name} className="group relative h-[450px] overflow-hidden border-0 shadow-2xl transition-all hover:-translate-y-2 bg-emerald-900">
                  <SafeImage
                    src={stadium.image}
                    alt={stadium.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                    fallback={<VisualFallback className="absolute inset-0 h-full w-full" children={null} />}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                    <div className="translate-y-8 transition-transform duration-500 group-hover:translate-y-0">
                      <p className="text-xs font-black uppercase tracking-widest text-yellow-400">Palco da Copa</p>
                      <h3 className="mt-2 font-display text-3xl leading-tight">{stadium.name}</h3>
                      <p className="mt-1 text-sm font-bold text-emerald-200">{stadium.city}, {stadium.country}</p>
                      
                      <div className="mt-6 border-t border-white/20 pt-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <p className="text-xs font-black uppercase tracking-widest text-yellow-500">Você sabia?</p>
                        <p className="mt-2 text-sm leading-relaxed text-emerald-50">
                          {stadium.curiosity}
                        </p>
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/45">
                          Foto: {stadium.credit}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
          </>
        )}

        {showParticipation && (
        <section id="participar" className="bg-[#fffaf0] py-24">
          <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="border-0 bg-white p-6 shadow-[0_30px_70px_rgba(20,83,45,0.15)] sm:p-10">
              {participant ? (
                <div className="space-y-7">
                  <div className="rounded-[2.5rem] bg-[linear-gradient(135deg,#14532d,#16a34a_52%,#b91c1c)] p-8 text-white shadow-xl">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-300 text-emerald-950">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <p className="mt-6 font-black uppercase tracking-widest text-yellow-300">Participação criada</p>
                    <h2 className="mt-3 font-display text-4xl leading-tight">Agora falta confirmar a doação.</h2>
                    <p className="mt-4 text-lg font-bold text-emerald-50/90">
                      Seu código está pronto. Envie uma mensagem para a HM, combine a entrega e depois preencha seus palpites.
                    </p>
                  </div>

                  <div className="rounded-[2rem] border-2 border-emerald-100 bg-emerald-50 p-6">
                    <p className="text-sm font-black uppercase tracking-widest text-rose-700">Seu código</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="rounded-2xl bg-white px-5 py-4 font-display text-3xl text-emerald-950 shadow-sm">
                        {participant.code}
                      </p>
                      <Button onClick={() => copyCode(participant.code)} variant="outline" className="h-12 rounded-2xl border-2 font-black">
                        {copied ? "Copiado!" : "Copiar"}
                      </Button>
                    </div>
                    <p className="mt-4 text-sm font-bold text-stone-700">
                      Nome: {participant.full_name} · Status:{" "}
                      {participant.donation_confirmed ? "doação confirmada" : "aguardando confirmação da doação"}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <Button onClick={openWhatsApp} className="h-16 rounded-2xl bg-emerald-800 text-lg font-black text-white hover:bg-emerald-900">
                      Confirmar doação no WhatsApp
                    </Button>
                    <Button
                      onClick={() => navigateTo("/palpites")}
                      variant="outline"
                      className="h-14 rounded-2xl border-2 border-blue-700 font-black text-blue-800 hover:bg-blue-50"
                    >
                      Ir para os palpites
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-[2.5rem] bg-[linear-gradient(135deg,#14532d,#16a34a_52%,#b91c1c)] p-8 text-white shadow-xl">
                    <p className="font-black uppercase tracking-widest text-yellow-300">Nova participação</p>
                    <h2 className="mt-4 font-display text-4xl leading-tight">Entre na torcida solidária.</h2>
                    <p className="mt-4 text-emerald-50/90">
                      Preencha seus dados, escolha sua doação e receba seu código. Depois fale com a HM no WhatsApp para combinar a entrega.
                    </p>
                  </div>

                  <form onSubmit={createParticipant} className="mt-10 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-black uppercase tracking-widest text-emerald-950">Seu nome</span>
                        <input
                          required
                          name="fullName"
                          placeholder="Como quer aparecer no ranking"
                          className="mt-2 h-14 w-full rounded-2xl border border-emerald-900/10 bg-emerald-50/30 px-5 font-bold outline-none transition-all focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/5"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-black uppercase tracking-widest text-emerald-950">Seu WhatsApp</span>
                        <input
                          required
                          name="whatsapp"
                          inputMode="tel"
                          placeholder="(11) 99999-9999"
                          className="mt-2 h-14 w-full rounded-2xl border border-emerald-900/10 bg-emerald-50/30 px-5 font-bold outline-none transition-all focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/5"
                        />
                      </label>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-black uppercase tracking-widest text-emerald-950">Tipo de doação</span>
                        <select
                          required
                          name="donationType"
                          className="mt-2 h-14 w-full appearance-none rounded-2xl border border-emerald-900/10 bg-emerald-50/30 px-5 font-bold outline-none transition-all focus:border-emerald-700 focus:bg-white"
                        >
                          {donationTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.label} - {type.voucherDiscount}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-sm font-black uppercase tracking-widest text-emerald-950">Onde vai entregar?</span>
                        <select
                          required
                          name="deliveryPoint"
                          className="mt-2 h-14 w-full appearance-none rounded-2xl border border-emerald-900/10 bg-emerald-50/30 px-5 font-bold outline-none transition-all focus:border-emerald-700 focus:bg-white"
                        >
                          <option value={hmAddress}>{hmAddress}</option>
                          <option value={associationAddress}>{associationAddress}</option>
                        </select>
                      </label>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                       <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" />
                       <p className="text-sm font-bold text-stone-700">
                          Você pode preencher seus palpites após criar a participação. Para pontuar no ranking, confirme a doação com a HM pelo WhatsApp.
                       </p>
                    </div>

                    <Button disabled={saving} className="h-16 w-full rounded-2xl bg-rose-700 text-xl font-black text-white shadow-2xl hover:bg-rose-800">
                      {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Heart className="mr-2 h-6 w-6" />}
                      Criar minha participação
                    </Button>
                  </form>
                </>
              )}
            </Card>

            <div className="space-y-8">
              <Card className="border-0 bg-emerald-950 p-8 text-white shadow-xl sm:p-10">
                <p className="font-black uppercase tracking-widest text-yellow-300">Depois de participar</p>
                <h2 className="mt-3 font-display text-3xl">O caminho é simples.</h2>
                <div className="mt-6 grid gap-3">
                  {[
                    ["1", "Guarde seu código", "Ele serve para voltar e continuar seus palpites."],
                    ["2", "Chame a HM no WhatsApp", "Combine a entrega da doação escolhida."],
                    ["3", "Preencha seus placares", "Comece pelos jogos do Brasil ou faça a Copa completa."],
                    ["4", "Acompanhe o ranking", "A pontuação vale após confirmação da doação."],
                  ].map(([step, title, text]) => (
                    <div key={step} className="flex gap-4 rounded-2xl bg-white/8 p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-300 font-black text-emerald-950">
                        {step}
                      </span>
                      <div>
                        <p className="font-black text-white">{title}</p>
                        <p className="mt-1 text-sm font-medium text-emerald-100/80">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-0 bg-white p-8 shadow-xl sm:p-10">
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/20">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="font-display text-3xl text-emerald-950">Continuar participação</h2>
                    <p className="mt-2 font-medium text-stone-600">
                      Informe seu código de participação e WhatsApp para continuar seus palpites.
                    </p>
                  </div>
                </div>
                <form onSubmit={accessParticipant} className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <input
                    value={accessCode}
                    onChange={(event) => setAccessCode(event.target.value)}
                    placeholder="Código de participação"
                    className="h-14 flex-1 rounded-2xl border border-emerald-900/10 bg-emerald-50/30 px-5 font-bold outline-none focus:border-emerald-700 focus:bg-white"
                  />
                  <input
                    value={accessWhatsApp}
                    onChange={(event) => setAccessWhatsApp(event.target.value)}
                    placeholder="WhatsApp"
                    className="h-14 w-full rounded-2xl border border-emerald-900/10 bg-emerald-50/30 px-5 font-bold outline-none focus:border-emerald-700 focus:bg-white sm:w-40"
                  />
                  <Button disabled={saving} className="h-14 bg-emerald-800 px-8 font-black text-white hover:bg-emerald-900">
                    Acessar
                  </Button>
                </form>
              </Card>

            </div>
          </div>
        </section>
        )}

        {showPredictions && (
        <section id="palpites" className="container py-24">
          <div className="mb-8 overflow-hidden rounded-[2.5rem] bg-emerald-950 text-white shadow-2xl">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="bg-[radial-gradient(circle_at_top_left,#fde047_0,transparent_32%),linear-gradient(135deg,#14532d,#1d4ed8_55%,#14532d)] p-7 sm:p-10">
                <p className="font-black uppercase tracking-widest text-yellow-300">Área de palpites</p>
                <h2 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">
                  Escolha seus placares da Copa.
                </h2>
                <p className="mt-5 max-w-xl text-lg font-bold leading-8 text-emerald-50/90">
                  Comece pelos jogos do Brasil e salve quando quiser. Você pode voltar com seu código para completar ou ajustar seus palpites.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 text-xs font-black uppercase tracking-wide text-white backdrop-blur-sm">
                    <ShieldCheck className="h-5 w-5 text-yellow-300" />
                    Não é aposta
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 text-xs font-black uppercase tracking-wide text-white backdrop-blur-sm">
                    <HandHeart className="h-5 w-5 text-yellow-300" />
                    Participação por doação
                  </div>
                </div>
              </div>

              <div className="p-7 sm:p-10">
                {participant ? (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-emerald-200">Jogando como</p>
                        <h3 className="mt-2 font-display text-3xl text-white">{participant.full_name}</h3>
                        <p className="mt-2 text-sm font-bold text-emerald-100/70">Código {participant.code}</p>
                      </div>
                      <span className="rounded-full bg-yellow-300 px-4 py-2 text-xs font-black uppercase text-emerald-950">
                        {participant.donation_confirmed ? "Confirmado" : "A confirmar"}
                      </span>
                    </div>
                    <div className="mt-8">
                      <div className="mb-3 flex items-center justify-between text-sm font-black uppercase tracking-widest text-emerald-100/80">
                        <span>{predictedCount}/{matches.length} jogos</span>
                        <span>{predictionProgress}%</span>
                      </div>
                      <div className="h-4 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-yellow-300 transition-all" style={{ width: `${predictionProgress}%` }} />
                      </div>
                      <p className="mt-4 text-sm font-bold leading-6 text-emerald-100/70">
                        Nesta visão: {visiblePredictedCount}/{visiblePredictionMatches.length} partidas preenchidas.
                      </p>
                    </div>
                    <Button
                      disabled={saving}
                      form="predictions-form"
                      className="mt-7 h-14 w-full rounded-2xl bg-rose-700 text-lg font-black text-white shadow-xl hover:bg-rose-800"
                    >
                      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      Salvar palpites
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="font-display text-3xl text-white">Primeiro faça sua participação.</p>
                    <p className="mt-3 font-bold leading-7 text-emerald-100/70">
                      Depois de receber seu código, os campos de placar ficam liberados para você preencher.
                    </p>
                    <Button
                      onClick={() => navigateTo("/participar")}
                      className="mt-7 h-14 w-full rounded-2xl bg-yellow-300 text-lg font-black text-emerald-950 hover:bg-yellow-200"
                    >
                      Fazer minha participação
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {!participant && (
            <div className="mb-8 rounded-[2rem] border-2 border-yellow-300 bg-yellow-50 p-6 shadow-xl md:flex md:items-center md:justify-between md:gap-6">
              <div>
                <p className="font-black uppercase tracking-widest text-rose-700">Antes de palpitar</p>
                <h3 className="mt-2 font-display text-2xl text-emerald-950">Faça sua participação, fale com a HM e depois volte para preencher seus placares.</h3>
                <p className="mt-2 font-bold text-stone-700">
                  A participação libera o preenchimento dos placares. A doação será confirmada pela organização para valer no ranking.
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-0">
                <Button
                  onClick={() => navigateTo("/participar")}
                  className="h-12 rounded-2xl bg-blue-700 px-6 font-black text-white hover:bg-blue-800"
                >
                  Fazer participação
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-2xl border-2 border-emerald-800 px-6 font-black text-emerald-950 hover:bg-emerald-50"
                >
                  <a href={hmWhatsAppUrl} target="_blank" rel="noopener">
                    Chamar HM no WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="mb-8 grid gap-3 rounded-[2rem] border border-stone-100 bg-white p-3 shadow-xl sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPredictionMode("brasil")}
                className={`rounded-2xl p-5 text-left transition-all ${
                  predictionMode === "brasil" ? "bg-blue-700 text-white shadow-lg" : "bg-white text-emerald-950 hover:bg-stone-50"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-widest opacity-80">Modo simples</span>
                <span className="mt-1 block font-display text-2xl">🇧🇷 Jogos do Brasil</span>
                <span className="mt-2 block text-sm font-bold opacity-80">Mais rápido para entrar no bolão.</span>
              </button>
              <button
                type="button"
                onClick={() => setPredictionMode("completo")}
                className={`rounded-2xl p-5 text-left transition-all ${
                  predictionMode === "completo" ? "bg-blue-700 text-white shadow-lg" : "bg-white text-emerald-950 hover:bg-stone-50"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-widest opacity-80">Modo completo</span>
                <span className="mt-1 block font-display text-2xl">🏆 Copa inteira</span>
                <span className="mt-2 block text-sm font-bold opacity-80">Para quem quer disputar cada ponto.</span>
              </button>
          </div>

          {predictionMode === "completo" && (
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              <label className="relative block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-emerald-950">Filtrar Fase</span>
                <select
                  value={phaseFilter}
                  onChange={(event) => setPhaseFilter(event.target.value)}
                  className="h-14 w-full appearance-none rounded-2xl border border-emerald-900/10 bg-white px-5 font-bold outline-none focus:border-emerald-700"
                >
                  {phases.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-4 right-5 h-6 w-6 text-stone-400" />
              </label>
              <label className="relative block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-emerald-950">Filtrar Data</span>
                <select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className="h-14 w-full appearance-none rounded-2xl border border-emerald-900/10 bg-white px-5 font-bold outline-none focus:border-emerald-700"
                >
                  {dates.map((date) => (
                    <option key={date} value={date}>
                      {date === "Todas" ? "Todas as Datas" : formatDate(date)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-4 right-5 h-6 w-6 text-stone-400" />
              </label>
            </div>
          )}

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-[2.5rem] bg-white shadow-inner">
              <Loader2 className="h-12 w-12 animate-spin text-rose-700" />
              <p className="font-display text-2xl text-emerald-950">Preparando o campo...</p>
            </div>
          ) : (
            <form id="predictions-form" onSubmit={savePredictions} className="grid gap-6 lg:grid-cols-2">
              {visiblePredictionMatches.map((match) => {
                const matchPredicted = isMatchPredicted(match);
                const isBrazilMatch =
                  match.home_team.toLowerCase().includes("brasil") || match.away_team.toLowerCase().includes("brasil");

                return (
                <div
                  key={match.id}
                  className={`relative overflow-hidden rounded-[2rem] border-2 bg-white shadow-sm transition-all hover:shadow-2xl ${
                    isBrazilMatch ? "border-yellow-300 ring-4 ring-yellow-400/10" : "border-stone-100"
                  }`}
                >
                  <div
                    className={`flex flex-wrap items-center gap-3 px-5 py-4 text-xs font-black ${
                      isBrazilMatch ? "bg-blue-700 text-white" : "bg-emerald-950 text-white"
                    }`}
                  >
                    <span className="rounded-lg bg-yellow-300 px-3 py-1.5 text-[10px] uppercase tracking-widest text-emerald-950">
                      {isBrazilMatch ? "Brasil em campo" : `Partida ${match.id}`}
                    </span>
                    <span className="uppercase tracking-widest opacity-90">{match.phase}</span>
                    <span
                      className={`ml-auto rounded-full px-3 py-1.5 text-[10px] uppercase tracking-widest ${
                        matchPredicted ? "bg-emerald-100 text-emerald-900" : "bg-white/10 text-white"
                      }`}
                    >
                      {matchPredicted ? "Preenchido" : "Pendente"}
                    </span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="mb-6 grid gap-3 text-xs font-bold text-stone-500 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-rose-600" />
                        <span className="uppercase tracking-widest">{match.venue}, {match.city}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 font-black text-blue-700">
                        <CalendarDays className="h-4 w-4" />
                        {formatShortDate(match.match_date)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                      <label className="block min-w-0">
                        <span className="mb-3 block min-h-12 text-right font-display text-lg leading-tight text-emerald-950 sm:text-xl">
                          {match.home_team}
                        </span>
                        <input
                          aria-label={`Placar ${match.home_team}`}
                          disabled={!participant}
                          min={0}
                          inputMode="numeric"
                          type="number"
                          value={predictions[predictionKey(match.id, "home")] || ""}
                          onChange={(event) =>
                            setPredictions((current) => ({
                              ...current,
                              [predictionKey(match.id, "home")]: event.target.value,
                            }))
                          }
                          className="h-20 w-full rounded-2xl border-2 border-stone-100 bg-stone-50 text-center font-display text-4xl text-rose-700 outline-none transition-all focus:border-rose-700 focus:bg-white disabled:opacity-40"
                        />
                      </label>
                      <span className="mb-5 font-display text-3xl text-stone-300">X</span>
                      <label className="block min-w-0">
                        <span className="mb-3 block min-h-12 text-left font-display text-lg leading-tight text-emerald-950 sm:text-xl">
                          {match.away_team}
                        </span>
                        <input
                          aria-label={`Placar ${match.away_team}`}
                          disabled={!participant}
                          min={0}
                          inputMode="numeric"
                          type="number"
                          value={predictions[predictionKey(match.id, "away")] || ""}
                          onChange={(event) =>
                            setPredictions((current) => ({
                              ...current,
                              [predictionKey(match.id, "away")]: event.target.value,
                            }))
                          }
                          className="h-20 w-full rounded-2xl border-2 border-stone-100 bg-stone-50 text-center font-display text-4xl text-rose-700 outline-none transition-all focus:border-rose-700 focus:bg-white disabled:opacity-40"
                        />
                      </label>
                    </div>
                    {!participant && (
                      <p className="mt-5 rounded-2xl bg-yellow-50 p-4 text-sm font-bold text-stone-700">
                        Crie sua participação para liberar os campos de placar.
                      </p>
                    )}
                  </div>
                </div>
                );
              })}
              {participant && visiblePredictionMatches.length > 0 && (
                <div className="lg:col-span-2">
                  <div className="rounded-[2rem] border-2 border-emerald-100 bg-white p-5 shadow-xl sm:flex sm:items-center sm:justify-between sm:gap-6">
                    <div>
                      <p className="font-display text-2xl text-emerald-950">Terminou por enquanto?</p>
                      <p className="mt-1 text-sm font-bold text-stone-600">
                        Salve seus palpites agora. Você pode voltar depois com seu código para completar ou ajustar enquanto a campanha estiver aberta.
                      </p>
                    </div>
                    <Button disabled={saving} className="mt-5 h-14 w-full rounded-2xl bg-rose-700 font-black text-white hover:bg-rose-800 sm:mt-0 sm:w-auto sm:px-8">
                      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      Salvar palpites
                    </Button>
                  </div>
                </div>
              )}
            </form>
          )}
        </section>
        )}

        {showRanking && (
        <section id="ranking" className="bg-emerald-950 py-24 text-white">
          <div className="container">
            <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-black uppercase tracking-widest text-yellow-300">Liderança</p>
                <h2 className="mt-4 font-display text-4xl sm:text-7xl">Ranking da <span className="text-white">Torcida Solidária</span></h2>
              </div>
              <p className="max-w-md text-lg font-medium text-emerald-200/70">
                Apenas participantes com doação confirmada aparecem no ranking.
              </p>
            </div>

            {ranking.length === 0 ? (
              <div className="rounded-[3rem] border border-white/10 bg-white/5 p-16 text-center shadow-2xl backdrop-blur-sm">
                 <Trophy className="mx-auto h-20 w-20 text-white/20" />
                 <p className="mt-8 font-display text-3xl text-white/50">O ranking começa com as primeiras doações confirmadas.</p>
                 <p className="mt-2 text-emerald-100/40">Depois que os resultados forem lançados, os pontos aparecem aqui.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-3">
                  {topThree.map((row, index) => (
                    <div
                      key={row.id}
                      className={`relative overflow-hidden rounded-[2.5rem] border-2 p-8 shadow-2xl transition-all hover:-translate-y-2 ${
                        index === 0
                          ? "border-yellow-300 bg-yellow-300 text-emerald-950 md:-mt-6"
                          : "border-white/20 bg-white/5 text-white backdrop-blur-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-5xl">{index + 1}º</span>
                        <Medal className={index === 0 ? "h-12 w-12 text-rose-700" : "h-12 w-12 text-yellow-300"} />
                      </div>
                      <p className="mt-8 font-display text-3xl leading-tight">{row.full_name}</p>
                      <div className={`mt-2 text-sm font-bold ${index === 0 ? "text-emerald-900" : "text-emerald-200/70"}`}>
                        {row.exact_scores} PLACARES EXATOS
                        <span className="mx-2 opacity-30">•</span>
                        {row.scored_matches} JOGOS
                      </div>
                      <p className={`mt-8 font-display text-5xl ${index === 0 ? "text-rose-700" : "text-yellow-300"}`}>
                        {row.total_points} <span className="text-xl">PTS</span>
                      </p>
                    </div>
                  ))}
                </div>

                {remainingRanking.length > 0 && (
                  <div className="mt-8 space-y-4">
                    {remainingRanking.map((row, index) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[60px_1fr_auto] items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10"
                      >
                        <span className="font-display text-2xl text-yellow-300/50">{index + 4}º</span>
                        <div>
                          <p className="font-display text-2xl text-white">{row.full_name}</p>
                          <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
                            {row.exact_scores} EXATOS • {row.scored_matches} PONTUADOS
                          </p>
                        </div>
                        <p className="font-display text-3xl text-yellow-300">{row.total_points}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        )}

        {showSocial && (
        <section id="acompanhe" className="bg-emerald-950 py-20 text-white">
          <div className="container">
            <div className="mb-12 text-center">
              <p className="font-black uppercase tracking-widest text-yellow-300">Conexão</p>
              <h2 className="mt-4 font-display text-4xl sm:text-6xl">Acompanhe a Campanha</h2>
              <p className="mx-auto mt-4 max-w-2xl text-emerald-100/70">
                Fique por dentro das doações, resultados e histórias que estamos construindo juntos.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* HM Socials */}
              <div className="rounded-[2.5rem] bg-white/5 p-8 backdrop-blur-sm border border-white/10">
                <div className="mb-8 flex items-center gap-4">
                   <SafeImage src={assets.hmLogo} alt="HM" className="h-14 w-14 rounded-xl bg-white p-2" fallback={null} />
                   <h3 className="font-display text-3xl">HM Bazar e Conveniência</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: "Instagram", icon: "Instagram", href: socialLinks.hm.instagram, color: "bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600" },
                    { label: "WhatsApp", icon: "MessageCircle", href: socialLinks.hm.whatsapp, color: "bg-emerald-600" },
                  ].map((link) => (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener" className={`flex h-14 items-center gap-3 rounded-2xl ${link.color} px-6 font-black transition-transform hover:scale-105`}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Semeando Socials */}
              <div className="rounded-[2.5rem] bg-white/5 p-8 backdrop-blur-sm border border-white/10">
                <div className="mb-8 flex items-center gap-4">
                   <SafeImage src={assets.semeandoLogo} alt="Semeando" className="h-14 w-14 rounded-xl bg-white p-2" fallback={null} />
                   <h3 className="font-display text-3xl">Semeando Amor</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: "Instagram", icon: "Instagram", href: socialLinks.associacao.instagram, color: "bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600" },
                    { label: "WhatsApp", icon: "MessageCircle", href: socialLinks.associacao.whatsapp, color: "bg-emerald-600" },
                  ].map((link) => (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener" className={`flex h-14 items-center gap-3 rounded-2xl ${link.color} px-6 font-black transition-transform hover:scale-105`}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

      </main>

      <footer className="bg-white border-t border-emerald-900/10 py-16">
        <div className="container grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4">
               <SafeImage src={assets.hmLogo} alt="HM" className="h-12 w-12" fallback={null} />
               <div className="h-8 w-px bg-stone-200" />
               <SafeImage src={assets.semeandoLogo} alt="Semeando" className="h-12 w-12" fallback={null} />
            </div>
            <p className="mt-6 max-w-sm text-stone-500 font-medium">
              Um movimento comunitário de bairro para transformar a paixão pelo futebol em solidariedade real.
            </p>
          </div>
          
          <div>
            <h4 className="font-display text-xl text-emerald-950">Links Rápidos</h4>
            <ul className="mt-6 space-y-4 font-bold text-stone-600">
              <li><button onClick={() => navigateTo("/")}>Início</button></li>
              <li><button onClick={() => navigateTo("/sobre")}>Sobre a campanha</button></li>
              <li><button onClick={() => navigateTo("/participar")}>Participar</button></li>
              <li><button onClick={() => navigateTo("/palpites")}>Palpites</button></li>
              <li><button onClick={() => navigateTo("/ranking")}>Ranking</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl text-emerald-950">Contatos</h4>
            <div className="mt-6 space-y-4 text-sm font-bold text-stone-600">
              <p className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-rose-700" />
                {hmAddress}
              </p>
              <a 
                href={socialLinks.hm.instagram} 
                target="_blank" 
                rel="noopener" 
                className="flex items-center gap-3 text-emerald-700 hover:text-emerald-900"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                @hm.bazar.conveniencia
              </a>
              <p className="flex items-center gap-3 text-rose-700">
                 <ShieldCheck className="h-5 w-5" />
                 Projeto 100% Solidário
              </p>
            </div>
          </div>
        </div>
        
        <div className="container mt-16 border-t border-stone-100 pt-8 text-center text-xs font-black uppercase tracking-widest text-stone-400">
          © 2026 HM Bazar e Conveniência & Associação Semeando Amor • Todos os direitos reservados
        </div>
      </footer>

      <Button
        onClick={() => scrollToSection("top")}
        aria-label="Voltar ao topo"
        className={`fixed right-6 z-50 h-12 w-12 rounded-full bg-emerald-900 p-0 text-white shadow-2xl hover:bg-emerald-800 ${
          participant ? "bottom-24 lg:bottom-6" : "bottom-6"
        }`}
      >
        <ArrowUp className="h-6 w-6" />
      </Button>

    </div>
  );
}
