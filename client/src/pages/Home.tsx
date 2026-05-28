import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Copy,
  HandHeart,
  Heart,
  Loader2,
  MapPin,
  Medal,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Utensils,
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
  stadiumHero: "/assets/stadium-hero.jpg",
  community: "/assets/community.jpg",
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

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [accessCode, setAccessCode] = useState("");
  const [accessWhatsApp, setAccessWhatsApp] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("Todas");
  const [dateFilter, setDateFilter] = useState("Todas");
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
      setAccessCode(payload.participant.code);
      setAccessWhatsApp(payload.participant.whatsapp);
      setMessage("Sua participação foi criada. Agora salve seus palpites e combine a entrega da doação com a HM.");
      scrollToSection("participante");
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

      setParticipant(payload.participant);
      setPredictions(nextPredictions);
      setMessage("Participação encontrada. Você pode continuar seus palpites.");
      scrollToSection("participante");
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
      setMessage("Palpites salvos. Sua pontuação aparece no ranking após a confirmação da doação.");
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
    const messageText = `Olá! Quero confirmar minha participação no Bolão Solidário HM + Semeando Amor.%0A%0ANome: ${participant.full_name}%0AWhatsApp: ${participant.whatsapp}%0ACódigo: ${participant.code}%0ADoação: ${participant.donation_type}%0AEntrega: ${participant.delivery_point}`;
    window.open(`${hmWhatsAppUrl}?text=${messageText}`, "_blank", "noopener,noreferrer");
  }

  const topThree = ranking.slice(0, 3);
  const remainingRanking = ranking.slice(3);

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
            <button onClick={() => scrollToSection("como-funciona")} className="hover:text-rose-700">
              Como funciona
            </button>
            <button onClick={() => scrollToSection("participar")} className="hover:text-rose-700">
              Participar
            </button>
            <button onClick={() => scrollToSection("ranking")} className="hover:text-rose-700">
              Ranking
            </button>
            <a href="/admin" className="hover:text-rose-700">
              Admin
            </a>
          </nav>

          <Button
            onClick={() => scrollToSection("participar")}
            className="bg-rose-700 px-4 font-black text-white hover:bg-rose-800"
          >
            Participar
          </Button>
        </div>
      </header>

      <main id="top">
        <section
          className="relative isolate overflow-hidden bg-[#06351f] text-white"
          style={{
            backgroundImage: `linear-gradient(115deg, rgba(4, 42, 24, 0.92), rgba(22, 101, 52, 0.72) 48%, rgba(185, 28, 28, 0.72)), url(${assets.stadiumHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fffaf0] to-transparent" />
          <div className="container relative grid gap-8 pb-20 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-24 lg:pt-20">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-black shadow-2xl backdrop-blur">
                <HandHeart className="h-4 w-4 text-yellow-300" />
                Copa 2026 com solidariedade no bairro
              </div>
              <h1 className="max-w-4xl font-display text-4xl leading-tight text-white sm:text-5xl lg:text-7xl">
                Bolão Solidário da Copa 2026
              </h1>
              <p className="mt-5 max-w-2xl text-lg font-bold text-emerald-50 sm:text-xl">
                Doe, participe e ajude a Associação Semeando Amor
              </p>
              <p className="mt-4 max-w-2xl text-base text-white/86 sm:text-lg">
                Um bolão da HM para transformar cada palpite em apoio real para ações sociais da comunidade.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => scrollToSection("participar")}
                  className="h-13 bg-yellow-300 px-7 text-base font-black text-emerald-950 shadow-xl hover:bg-yellow-200"
                >
                  Participar agora
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => scrollToSection("ranking")}
                  variant="outline"
                  className="h-13 border-white/70 bg-white/10 px-7 text-base font-black text-white shadow-xl hover:bg-white hover:text-emerald-950"
                >
                  Ver ranking
                  <Trophy className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/20 bg-white/14 p-4 shadow-2xl backdrop-blur-md sm:p-5">
              <div className="rounded-[1.5rem] bg-white p-4 text-emerald-950 shadow-xl">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["72", "jogos"],
                    ["10", "pontos placar exato"],
                    ["1", "causa solidária"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl bg-emerald-50 p-4 text-center">
                      <p className="font-display text-4xl text-rose-700">{value}</p>
                      <p className="mt-1 text-xs font-black uppercase text-emerald-900">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-[linear-gradient(135deg,#fef3c7,#dcfce7)] p-5">
                  <p className="font-display text-xl">O jogo começa com uma doação.</p>
                  <p className="mt-2 text-sm font-semibold text-stone-700">
                    A organização confirma a entrega e libera sua participação no ranking público.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {message && (
          <div className="container -mt-10 relative z-10">
            <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 font-bold text-emerald-950 shadow-lg">
              {message}
            </div>
          </div>
        )}

        <section id="como-funciona" className="container py-12">
          <div className="max-w-2xl">
            <p className="font-black uppercase tracking-wide text-rose-700">Como funciona</p>
            <h2 className="mt-2 font-display text-3xl text-emerald-950 sm:text-4xl">Simples para participar, forte para ajudar.</h2>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Utensils,
                title: "Doe",
                text: "Escolha alimentos, roupas ou brinquedos e combine a entrega na HM ou na Associação.",
              },
              {
                icon: Trophy,
                title: "Palpite",
                text: "Crie seu código, marque os placares dos jogos da primeira fase e salve quando quiser.",
              },
              {
                icon: Medal,
                title: "Acompanhe o ranking",
                text: "Depois da confirmação da doação, seus pontos aparecem no ranking público.",
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

        <section className="bg-white py-12">
          <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="overflow-hidden rounded-[2rem] shadow-2xl">
              <SafeImage
                src={assets.community}
                alt="Comunidade apoiada pela Associação Semeando Amor"
                className="h-[320px] w-full object-cover sm:h-[420px]"
                fallback={
                  <VisualFallback className="h-[320px] w-full sm:h-[420px]">
                    <div className="text-center">
                      <Users className="mx-auto h-12 w-12 text-yellow-200" />
                      <p className="mt-3 font-display text-2xl">Comunidade</p>
                    </div>
                  </VisualFallback>
                }
              />
            </div>
            <div>
              <p className="font-black uppercase tracking-wide text-rose-700">A causa</p>
              <h2 className="mt-2 font-display text-3xl text-emerald-950 sm:text-4xl">
                Semeando Amor com a Tia Mônica
              </h2>
              <p className="mt-5 text-lg font-medium leading-8 text-stone-700">
                A Associação Semeando Amor realiza ações sociais que acolhem famílias, crianças e vizinhos do bairro.
                Neste bolão, a Copa vira ponto de encontro: cada doação fortalece uma rede local de cuidado.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-emerald-50 p-5">
                  <Heart className="h-6 w-6 text-rose-700" />
                  <p className="mt-3 font-black text-emerald-950">Doações com destino claro</p>
                  <p className="mt-1 text-sm text-stone-600">Alimentos, roupas e brinquedos para ações sociais.</p>
                </div>
                <div className="rounded-2xl bg-yellow-50 p-5">
                  <ShieldCheck className="h-6 w-6 text-emerald-800" />
                  <p className="mt-3 font-black text-emerald-950">Confirmação pela organização</p>
                  <p className="mt-1 text-sm text-stone-600">A participação entra no ranking após validação.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container grid gap-8 py-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <p className="font-black uppercase tracking-wide text-rose-700">HM apoia essa causa</p>
            <h2 className="mt-2 font-display text-3xl text-emerald-950 sm:text-4xl">Um ponto de encontro para o bairro.</h2>
            <p className="mt-5 text-lg font-medium leading-8 text-stone-700">
              A HM Bazar e Conveniência recebe participantes, ajuda na organização das entregas e conecta a campanha
              com quem vive a comunidade no dia a dia.
            </p>
            <div className="mt-6 space-y-3">
              {[hmAddress, associationAddress].map((address) => (
                <div key={address} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-rose-700" />
                  <p className="font-bold text-emerald-950">{address}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] shadow-2xl">
            <SafeImage
              src={assets.hmStore}
              alt="Fachada da HM Bazar e Conveniência"
              className="h-[320px] w-full object-cover sm:h-[420px]"
              fallback={
                <VisualFallback className="h-[320px] w-full sm:h-[420px]">
                  <div className="text-center">
                    <Sparkles className="mx-auto h-12 w-12 text-yellow-200" />
                    <p className="mt-3 font-display text-2xl">HM Bazar</p>
                  </div>
                </VisualFallback>
              }
            />
          </div>
        </section>

        <section id="participar" className="bg-[linear-gradient(180deg,#fffaf0,#ecfdf5)] py-12">
          <div className="container grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="border-0 bg-white p-5 shadow-[0_22px_60px_rgba(20,83,45,0.14)] sm:p-7">
              <div className="rounded-3xl bg-[linear-gradient(135deg,#14532d,#16a34a_52%,#b91c1c)] p-5 text-white">
                <p className="font-black uppercase text-yellow-200">Participar agora</p>
                <h2 className="mt-2 font-display text-3xl">Entre no bolão fazendo o bem.</h2>
                <p className="mt-3 text-sm font-medium text-white/88">
                  Preencha seus dados, escolha o tipo de doação e guarde seu código. A equipe confirma a entrega para
                  liberar sua pontuação.
                </p>
              </div>

              <form onSubmit={createParticipant} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-black text-emerald-950">Nome completo</span>
                  <input
                    required
                    name="fullName"
                    placeholder="Seu nome para o ranking"
                    className="mt-2 h-12 w-full rounded-xl border border-emerald-900/15 bg-emerald-50/50 px-4 font-bold outline-none focus:border-emerald-700 focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-black text-emerald-950">WhatsApp</span>
                  <input
                    required
                    name="whatsapp"
                    inputMode="tel"
                    placeholder="(11) 99999-9999"
                    className="mt-2 h-12 w-full rounded-xl border border-emerald-900/15 bg-emerald-50/50 px-4 font-bold outline-none focus:border-emerald-700 focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-black text-emerald-950">Doação</span>
                  <select
                    required
                    name="donationType"
                    className="mt-2 h-12 w-full rounded-xl border border-emerald-900/15 bg-emerald-50/50 px-4 font-bold outline-none focus:border-emerald-700 focus:bg-white"
                  >
                    {donationTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label} - {type.voucherDiscount}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-black text-emerald-950">Ponto de entrega</span>
                  <select
                    required
                    name="deliveryPoint"
                    className="mt-2 h-12 w-full rounded-xl border border-emerald-900/15 bg-emerald-50/50 px-4 font-bold outline-none focus:border-emerald-700 focus:bg-white"
                  >
                    <option value={hmAddress}>{hmAddress}</option>
                    <option value={associationAddress}>{associationAddress}</option>
                  </select>
                </label>
                <div className="rounded-2xl bg-yellow-50 p-4 text-sm font-bold text-stone-700">
                  A doação será conferida pela organização. Depois disso, seu nome aparece oficialmente no ranking.
                </div>
                <Button disabled={saving} className="h-13 w-full bg-rose-700 text-base font-black text-white hover:bg-rose-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-5 w-5" />}
                  Criar participação
                </Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="border-0 bg-white p-5 shadow-[0_18px_45px_rgba(20,83,45,0.10)] sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-800 text-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl text-emerald-950">Já tenho código</h2>
                    <p className="mt-1 text-sm font-medium text-stone-600">
                      Continue seus palpites usando o código gerado e o WhatsApp cadastrado.
                    </p>
                  </div>
                </div>
                <form onSubmit={accessParticipant} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={accessCode}
                    onChange={(event) => setAccessCode(event.target.value)}
                    placeholder="BOLAO-2026-0000"
                    className="h-12 rounded-xl border border-emerald-900/15 bg-emerald-50/50 px-4 font-bold outline-none focus:border-emerald-700 focus:bg-white"
                  />
                  <input
                    value={accessWhatsApp}
                    onChange={(event) => setAccessWhatsApp(event.target.value)}
                    placeholder="WhatsApp"
                    className="h-12 rounded-xl border border-emerald-900/15 bg-emerald-50/50 px-4 font-bold outline-none focus:border-emerald-700 focus:bg-white"
                  />
                  <Button disabled={saving} className="h-12 bg-emerald-800 px-6 font-black text-white hover:bg-emerald-900">
                    Entrar
                  </Button>
                </form>
              </Card>

              {participant && (
                <div
                  id="participante"
                  className="rounded-[2rem] border border-emerald-200 bg-white p-5 shadow-[0_18px_45px_rgba(20,83,45,0.10)] sm:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-black uppercase text-rose-700">Seu cartão do bolão</p>
                      <h3 className="mt-1 font-display text-2xl text-emerald-950">{participant.full_name}</h3>
                      <p className="mt-2 text-sm font-black text-stone-600">{participant.code}</p>
                    </div>
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-black ${
                        participant.donation_confirmed ? "bg-emerald-700 text-white" : "bg-yellow-300 text-emerald-950"
                      }`}
                    >
                      {participant.donation_confirmed ? "Doação confirmada" : "Aguardando confirmação"}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Button onClick={() => copyCode(participant.code)} variant="outline" className="h-12 font-black">
                      <Copy className="h-4 w-4" />
                      {copied ? "Código copiado" : "Copiar código"}
                    </Button>
                    <Button onClick={openWhatsApp} className="h-12 bg-emerald-800 font-black text-white hover:bg-emerald-900">
                      Avisar HM no WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="container py-12">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-black uppercase tracking-wide text-rose-700">Palpites</p>
              <h2 className="mt-2 font-display text-3xl text-emerald-950 sm:text-4xl">Escolha os placares da Copa.</h2>
              <p className="mt-2 text-sm font-bold text-stone-600">
                {participant
                  ? `${predictedCount}/${matches.length} jogos preenchidos.`
                  : "Crie ou acesse sua participação para salvar seus palpites."}
              </p>
            </div>
            <Button
              disabled={!participant || saving}
              form="predictions-form"
              className="h-12 bg-rose-700 px-7 font-black text-white hover:bg-rose-800"
            >
              Salvar palpites
            </Button>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-2">
            <label className="relative block">
              <span className="mb-2 block text-xs font-black uppercase text-emerald-950">Filtrar por fase</span>
              <select
                value={phaseFilter}
                onChange={(event) => setPhaseFilter(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-emerald-900/15 bg-white px-4 font-bold outline-none focus:border-emerald-700"
              >
                {phases.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-3 right-4 h-5 w-5 text-emerald-900" />
            </label>
            <label className="relative block">
              <span className="mb-2 block text-xs font-black uppercase text-emerald-950">Filtrar por data</span>
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-emerald-900/15 bg-white px-4 font-bold outline-none focus:border-emerald-700"
              >
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {date === "Todas" ? "Todas" : formatDate(date)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-3 right-4 h-5 w-5 text-emerald-900" />
            </label>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 rounded-2xl bg-white p-8 font-bold text-emerald-900 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando jogos...
            </div>
          ) : (
            <form id="predictions-form" onSubmit={savePredictions} className="grid gap-4 lg:grid-cols-2">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="overflow-hidden rounded-[1.5rem] border border-emerald-900/10 bg-white shadow-[0_14px_34px_rgba(20,83,45,0.08)]"
                >
                  <div className="flex flex-wrap items-center gap-2 bg-emerald-950 px-4 py-3 text-xs font-black text-white">
                    <span className="rounded-full bg-yellow-300 px-3 py-1 text-emerald-950">Jogo {match.id}</span>
                    <span>{match.phase}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-100">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatShortDate(match.match_date)}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="mb-4 flex items-start gap-2 text-sm font-bold text-stone-500">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                      <span>
                        {match.venue}, {match.city}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1fr_76px] items-center gap-3">
                      <span className="min-w-0 rounded-xl bg-emerald-50 px-4 py-3 font-black text-emerald-950">
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
                        className="h-14 rounded-xl border border-emerald-900/20 text-center text-2xl font-black text-rose-700 outline-none focus:border-rose-700 disabled:bg-stone-100 disabled:text-stone-400"
                      />
                      <span className="min-w-0 rounded-xl bg-emerald-50 px-4 py-3 font-black text-emerald-950">
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
                        className="h-14 rounded-xl border border-emerald-900/20 text-center text-2xl font-black text-rose-700 outline-none focus:border-rose-700 disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </form>
          )}
        </section>

        <section id="ranking" className="bg-emerald-950 py-12 text-white">
          <div className="container">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-black uppercase tracking-wide text-yellow-300">Ranking</p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl">Quem está liderando o bem?</h2>
              </div>
              <p className="max-w-md text-sm font-medium text-emerald-100">
                Só entram no ranking participantes com doação confirmada pela organização.
              </p>
            </div>

            {ranking.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-8 text-center font-bold text-emerald-50">
                O ranking aparece depois que doações forem confirmadas e resultados lançados.
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  {topThree.map((row, index) => (
                    <div
                      key={row.id}
                      className={`rounded-[1.5rem] border p-5 shadow-2xl ${
                        index === 0
                          ? "border-yellow-300 bg-yellow-300 text-emerald-950 md:-mt-4"
                          : "border-white/20 bg-white/10 text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-4xl">{index + 1}º</span>
                        <Medal className={index === 0 ? "h-8 w-8 text-rose-700" : "h-8 w-8 text-yellow-300"} />
                      </div>
                      <p className="mt-5 font-display text-xl">{row.full_name}</p>
                      <p className={index === 0 ? "mt-1 text-sm font-bold text-emerald-900" : "mt-1 text-sm font-bold text-emerald-100"}>
                        {row.exact_scores} exatos • {row.scored_matches} jogos pontuados
                      </p>
                      <p className="mt-5 font-display text-4xl text-rose-700">{row.total_points}</p>
                    </div>
                  ))}
                </div>

                {remainingRanking.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {remainingRanking.map((row, index) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4"
                      >
                        <span className="font-display text-xl text-yellow-300">{index + 4}º</span>
                        <div>
                          <p className="font-black text-white">{row.full_name}</p>
                          <p className="text-sm text-emerald-100">
                            {row.exact_scores} placares exatos • {row.scored_matches} jogos pontuados
                          </p>
                        </div>
                        <p className="font-display text-2xl text-yellow-300">{row.total_points}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-white py-8">
        <div className="container grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-3">
            <SafeImage
              src={assets.hmLogo}
              alt="HM Bazar e Conveniência"
              className="h-12 w-12 rounded-md border object-contain"
              fallback={<VisualFallback className="h-12 w-12 rounded-md text-xs font-black">HM</VisualFallback>}
            />
            <SafeImage
              src={assets.semeandoLogo}
              alt="Associação Semeando Amor"
              className="h-12 w-12 rounded-md border object-contain"
              fallback={
                <VisualFallback className="h-12 w-12 rounded-md">
                  <Heart className="h-5 w-5" />
                </VisualFallback>
              }
            />
            <div>
              <p className="font-display text-emerald-950">HM + Semeando Amor</p>
              <p className="text-sm font-bold text-stone-600">Bolão Solidário da Copa 2026.</p>
            </div>
          </div>
          <div className="space-y-1 text-sm font-bold text-stone-700 md:text-right">
            <a href={hmWhatsAppUrl} className="block text-rose-700 hover:text-rose-800">
              WhatsApp da HM
            </a>
            <p>{hmAddress}</p>
            <p>{associationAddress}</p>
            <p className="text-emerald-900">Futebol, bairro e solidariedade jogando juntos.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
