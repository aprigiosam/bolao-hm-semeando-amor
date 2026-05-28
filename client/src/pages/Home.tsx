import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Copy, HandHeart, Heart, Loader2, MapPin, Trophy, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

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

function generateCode() {
  return `BOLAO-2026-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
}

function predictionKey(matchId: number, side: "home" | "away") {
  return `${matchId}-${side}`;
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [accessCode, setAccessCode] = useState("");
  const [accessWhatsApp, setAccessWhatsApp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

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
          whatsapp: String(form.get("whatsapp") || ""),
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
      setMessage("Participação criada. Agora preencha seus palpites e avise a HM pelo WhatsApp.");
      document.getElementById("participante")?.scrollIntoView({ behavior: "smooth" });
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
        code: accessCode,
        whatsapp: accessWhatsApp,
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
      document.getElementById("participante")?.scrollIntoView({ behavior: "smooth" });
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
      .filter(Boolean);

    try {
      const response = await fetch(`/api/participants/${participant.id}/predictions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions: payload }),
      });

      if (!response.ok) throw new Error("prediction save failed");
      setMessage("Palpites salvos. A participação vale no ranking após confirmação da doação.");
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

  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/95 backdrop-blur">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <img src="/assets/hm-logo.jpeg" alt="HM Bazar" className="h-12 w-12 rounded-md object-contain" />
            <div>
              <p className="font-display text-lg text-emerald-950">Bolão Solidário</p>
              <p className="text-xs font-bold text-rose-700">HM + Semeando Amor</p>
            </div>
          </div>
          <a href="/admin" className="text-sm font-bold text-emerald-900 hover:text-rose-700">
            Admin
          </a>
        </div>
      </header>

      <main>
        <section className="bg-[radial-gradient(circle_at_top_left,#ffe08a,transparent_32%),linear-gradient(135deg,#06351f,#0f5132_48%,#b91c1c)] text-white">
          <div className="container grid gap-8 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold">
                <HandHeart className="h-4 w-4 text-yellow-300" />
                Copa 2026 com impacto no bairro
              </div>
              <h1 className="font-display text-4xl leading-tight md:text-6xl">O mundo joga, a comunidade ajuda.</h1>
              <p className="mt-5 max-w-2xl text-lg font-medium text-emerald-50 md:text-xl">
                Faça uma doação para a Associação Semeando Amor, registre seus palpites da primeira fase da Copa e
                concorra no ranking solidário da HM Bazar.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => document.getElementById("participar")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-yellow-300 px-7 py-6 text-base font-black text-emerald-950 hover:bg-yellow-200"
                >
                  Participar agora
                </Button>
                <Button
                  onClick={() => document.getElementById("ranking")?.scrollIntoView({ behavior: "smooth" })}
                  variant="outline"
                  className="border-white bg-white/10 px-7 py-6 text-base font-black text-white hover:bg-white hover:text-emerald-950"
                >
                  Ver ranking
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Trophy, value: "72", label: "jogos da primeira fase" },
                { icon: Heart, value: "10", label: "pontos por placar exato" },
                { icon: Users, value: "1", label: "rede de solidariedade" },
                { icon: MapPin, value: "2", label: "pontos de entrega" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.label} className="border-white/20 bg-white/12 p-5 text-white backdrop-blur">
                    <Icon className="mb-5 h-7 w-7 text-yellow-300" />
                    <p className="font-display text-4xl text-yellow-300">{item.value}</p>
                    <p className="mt-1 text-sm font-bold uppercase text-emerald-50">{item.label}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container grid gap-6 py-10 md:grid-cols-3">
          {[
            ["1. Doe", "Escolha alimentos, roupas ou brinquedos e combine a entrega."],
            ["2. Palpite", "Crie seu código, preencha placares e salve quando quiser."],
            ["3. Valide", "A organização confirma a doação e libera sua pontuação no ranking."],
          ].map(([title, text]) => (
            <Card key={title} className="border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl text-emerald-950">{title}</h2>
              <p className="mt-3 text-slate-700">{text}</p>
            </Card>
          ))}
        </section>

        {message && (
          <div className="container">
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 font-bold text-emerald-950">
              {message}
            </div>
          </div>
        )}

        <section id="participar" className="container grid gap-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-rose-100 bg-white p-6">
            <h2 className="font-display text-2xl text-emerald-950">Participar agora</h2>
            <p className="mt-2 text-slate-600">A doação libera sua participação. Depois o admin confirma a entrega.</p>

            <form onSubmit={createParticipant} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-emerald-950">Nome completo</span>
                <input required name="fullName" className="mt-1 w-full rounded-md border px-3 py-3" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-emerald-950">WhatsApp</span>
                <input required name="whatsapp" inputMode="tel" className="mt-1 w-full rounded-md border px-3 py-3" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-emerald-950">Doação</span>
                <select required name="donationType" className="mt-1 w-full rounded-md border px-3 py-3">
                  {donationTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label} - {type.voucherDiscount}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-emerald-950">Ponto de entrega</span>
                <select required name="deliveryPoint" className="mt-1 w-full rounded-md border px-3 py-3">
                  <option value={hmAddress}>{hmAddress}</option>
                  <option value={associationAddress}>{associationAddress}</option>
                </select>
              </label>
              <Button disabled={saving} className="w-full bg-rose-700 py-6 font-black text-white hover:bg-rose-800">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Criar participação
              </Button>
            </form>
          </Card>

          <Card className="border-emerald-100 bg-white p-6">
            <h2 className="font-display text-2xl text-emerald-950">Já tenho código</h2>
            <form onSubmit={accessParticipant} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="BOLAO-2026-0000"
                className="rounded-md border px-3 py-3"
              />
              <input
                value={accessWhatsApp}
                onChange={(event) => setAccessWhatsApp(event.target.value)}
                placeholder="WhatsApp"
                className="rounded-md border px-3 py-3"
              />
              <Button disabled={saving} className="bg-emerald-800 px-6 font-black text-white hover:bg-emerald-900">
                Entrar
              </Button>
            </form>

            {participant && (
              <div id="participante" className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xl text-emerald-950">{participant.full_name}</p>
                    <p className="text-sm font-bold text-slate-700">{participant.code}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-black ${
                      participant.donation_confirmed ? "bg-emerald-700 text-white" : "bg-yellow-300 text-emerald-950"
                    }`}
                  >
                    {participant.donation_confirmed ? "Doação confirmada" : "Aguardando doação"}
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => copyCode(participant.code)} variant="outline" className="font-bold">
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? "Copiado" : "Copiar código"}
                  </Button>
                  <Button onClick={openWhatsApp} className="bg-emerald-800 font-bold text-white hover:bg-emerald-900">
                    Avisar HM no WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </section>

        <section className="container py-8">
          <Card className="border-emerald-100 bg-white p-5">
            <div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-2xl text-emerald-950">Palpites por jogo</h2>
                <p className="mt-1 text-slate-600">
                  {participant
                    ? `${predictedCount}/${matches.length} jogos preenchidos.`
                    : "Crie ou acesse sua participação para salvar palpites."}
                </p>
              </div>
              <Button disabled={!participant || saving} form="predictions-form" className="bg-rose-700 font-black text-white hover:bg-rose-800">
                Salvar palpites
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 p-8 font-bold text-emerald-900">
                <Loader2 className="h-5 w-5 animate-spin" />
                Carregando jogos...
              </div>
            ) : (
              <form id="predictions-form" onSubmit={savePredictions} className="mt-4 space-y-3">
                {matches.map((match) => (
                  <div key={match.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="rounded-full bg-emerald-900 px-2 py-1 text-white">Jogo {match.id}</span>
                      <span>{formatDate(match.match_date)}</span>
                      <span>{match.phase}</span>
                      <span>{match.venue}, {match.city}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_64px] items-center gap-3">
                      <span className="font-bold text-emerald-950">{match.home_team}</span>
                      <input
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
                        className="h-11 rounded-md border text-center text-lg font-black disabled:bg-slate-100"
                      />
                      <span className="font-bold text-emerald-950">{match.away_team}</span>
                      <input
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
                        className="h-11 rounded-md border text-center text-lg font-black disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                ))}
              </form>
            )}
          </Card>
        </section>

        <section id="ranking" className="container py-10">
          <div className="mb-5 flex items-center gap-3">
            <Trophy className="h-7 w-7 text-yellow-600" />
            <h2 className="font-display text-3xl text-emerald-950">Ranking público</h2>
          </div>
          <div className="space-y-3">
            {ranking.length === 0 && (
              <Card className="border-dashed p-6 text-center font-bold text-slate-600">
                O ranking aparece depois que doações forem confirmadas e resultados lançados.
              </Card>
            )}
            {ranking.map((row, index) => (
              <Card key={row.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 border-emerald-100 p-4">
                <span className="font-display text-2xl text-yellow-600">{index + 1}</span>
                <div>
                  <p className="font-bold text-emerald-950">{row.full_name}</p>
                  <p className="text-sm text-slate-500">
                    {row.exact_scores} placares exatos • {row.scored_matches} jogos pontuados
                  </p>
                </div>
                <p className="font-display text-2xl text-rose-700">{row.total_points}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t bg-emerald-950 py-8 text-white">
        <div className="container flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="font-bold">HM Bazar e Conveniência + Associação Semeando Amor com a Tia Mônica</p>
          <p className="text-sm text-emerald-100">Bolão solidário da Copa 2026.</p>
        </div>
      </footer>
    </div>
  );
}
