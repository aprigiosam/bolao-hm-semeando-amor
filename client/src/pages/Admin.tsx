import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, RotateCw, Search, ShieldCheck, Trophy } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type AdminParticipant = {
  id: string;
  code: string;
  full_name: string;
  whatsapp: string;
  donation_type: string;
  delivery_point: string;
  voucher_code: string;
  voucher_discount: string;
  donation_confirmed: boolean;
  donation_confirmed_at: string | null;
  donation_received_by: string | null;
  donation_notes: string | null;
  created_at: string;
  predicted_matches: number;
};

type Match = {
  id: number;
  phase: string;
  match_date: string;
  home_team: string;
  away_team: string;
  result_home_score: number | null;
  result_away_score: number | null;
};

type RankingRow = {
  id: string;
  full_name: string;
  total_points: number;
  exact_scores: number;
  correct_results: number;
  scored_matches: number;
  predicted_matches: number;
};

type StatusFilter = "pending" | "confirmed" | "all";

function adminHeaders(password: string) {
  return {
    "Content-Type": "application/json",
    "x-admin-password": password,
  };
}

export default function Admin() {
  const [password, setPassword] = useState(() => window.localStorage.getItem("bolao-admin-password") || "");
  const [authenticated, setAuthenticated] = useState(false);
  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [receivedBy, setReceivedBy] = useState("HM Bazar");
  const [notesByParticipant, setNotesByParticipant] = useState<Record<string, string>>({});
  const [resultScores, setResultScores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error("login failed");
      window.localStorage.setItem("bolao-admin-password", password);
      setAuthenticated(true);
      setMessage("Acesso liberado.");
    } catch {
      setMessage("Senha inválida ou ADMIN_PASSWORD não configurado.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminData() {
    if (!authenticated) return;
    setLoading(true);
    setMessage("");

    try {
      const params = new URLSearchParams({ status });
      if (search.trim()) params.set("search", search.trim());
      const [participantsResponse, matchesResponse, rankingResponse] = await Promise.all([
        fetch(`/api/admin/participants?${params.toString()}`, { headers: adminHeaders(password) }),
        fetch("/api/matches"),
        fetch("/api/admin/ranking", { headers: adminHeaders(password) }),
      ]);

      if (!participantsResponse.ok || !matchesResponse.ok || !rankingResponse.ok) {
        throw new Error("load failed");
      }

      const participantsPayload = await participantsResponse.json();
      const matchesPayload = await matchesResponse.json();
      const rankingPayload = await rankingResponse.json();
      setParticipants(participantsPayload.participants || []);
      setMatches(matchesPayload.matches || []);
      setRanking(rankingPayload.ranking || []);
    } catch {
      setMessage("Não foi possível carregar o painel admin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAdminData();
  }, [authenticated, status]);

  async function confirmDonation(participant: AdminParticipant) {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/participants/${participant.id}/confirm-donation`, {
        method: "POST",
        headers: adminHeaders(password),
        body: JSON.stringify({
          receivedBy,
          notes: notesByParticipant[participant.id] || "",
        }),
      });
      if (!response.ok) throw new Error("confirm failed");
      setMessage("Doação confirmada.");
      await loadAdminData();
    } catch {
      setMessage("Não foi possível confirmar esta doação.");
    } finally {
      setLoading(false);
    }
  }

  async function saveResult(match: Match) {
    setLoading(true);
    setMessage("");
    try {
      const homeScore = resultScores[`${match.id}-home`] ?? match.result_home_score ?? "";
      const awayScore = resultScores[`${match.id}-away`] ?? match.result_away_score ?? "";
      const response = await fetch("/api/admin/results", {
        method: "POST",
        headers: adminHeaders(password),
        body: JSON.stringify({
          matchId: match.id,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
        }),
      });
      if (!response.ok) throw new Error("result failed");
      setMessage(`Resultado do jogo ${match.id} salvo e pontuação recalculada.`);
      await loadAdminData();
    } catch {
      setMessage("Não foi possível lançar o resultado.");
    } finally {
      setLoading(false);
    }
  }

  async function recalculateScores() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/recalculate-scores", {
        method: "POST",
        headers: adminHeaders(password),
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("recalculate failed");
      const payload = await response.json();
      setMessage(`Pontuação recalculada: ${payload.scoredPredictions} palpites pontuados.`);
      await loadAdminData();
    } catch {
      setMessage("Não foi possível recalcular a pontuação.");
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-emerald-950 p-4 text-white">
        <main className="mx-auto flex min-h-screen max-w-md items-center">
          <Card className="w-full border-emerald-700 bg-white p-6 text-slate-950">
            <ShieldCheck className="mb-4 h-10 w-10 text-emerald-800" />
            <h1 className="font-display text-3xl text-emerald-950">Admin do Bolão</h1>
            <p className="mt-2 text-slate-600">Entre com a senha configurada em ADMIN_PASSWORD.</p>
            <form onSubmit={login} className="mt-6 space-y-4">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Senha admin"
                className="w-full rounded-md border px-3 py-3"
              />
              <Button disabled={loading} className="w-full bg-emerald-800 py-6 font-black text-white hover:bg-emerald-900">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Entrar
              </Button>
            </form>
            {message && <p className="mt-4 rounded-md bg-yellow-50 p-3 font-bold text-emerald-950">{message}</p>}
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b bg-emerald-950 text-white">
        <div className="container flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-yellow-300" />
            <div>
              <h1 className="font-display text-3xl">Admin do Bolão</h1>
              <p className="text-emerald-100">Doações, resultados e ranking.</p>
            </div>
          </div>
          <Button onClick={recalculateScores} disabled={loading} className="bg-yellow-300 font-black text-emerald-950 hover:bg-yellow-200">
            <RotateCw className="mr-2 h-4 w-4" />
            Recalcular pontuação
          </Button>
        </div>
      </header>

      <main className="container space-y-8 py-8">
        {message && <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 font-bold text-emerald-950">{message}</div>}

        <Card className="border-emerald-100 bg-white p-5">
          <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-end">
            <div>
              <span className="text-sm font-bold text-emerald-950">Status</span>
              <div className="mt-2 flex overflow-hidden rounded-md border">
                {[
                  { value: "pending", label: "Pendentes" },
                  { value: "confirmed", label: "Confirmadas" },
                  { value: "all", label: "Todas" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value as StatusFilter)}
                    className={`px-4 py-3 text-sm font-bold ${
                      status === option.value ? "bg-emerald-900 text-white" : "bg-white text-emerald-950 hover:bg-emerald-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void loadAdminData();
              }}
            >
              <span className="text-sm font-bold text-emerald-950">Buscar participante</span>
              <div className="mt-2 flex gap-2">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-md border px-3 py-3"
                  placeholder="Código, nome ou WhatsApp"
                />
                <Button className="bg-yellow-300 text-emerald-950 hover:bg-yellow-200">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>

            <label className="block">
              <span className="text-sm font-bold text-emerald-950">Recebido por</span>
              <input value={receivedBy} onChange={(event) => setReceivedBy(event.target.value)} className="mt-2 w-full rounded-md border px-3 py-3" />
            </label>
          </div>
        </Card>

        <section className="grid gap-4">
          {loading && <p className="font-bold text-emerald-900">Carregando...</p>}
          {participants.map((participant) => (
            <Card key={participant.id} className="border-emerald-100 bg-white p-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-950 px-3 py-1 text-sm font-bold text-white">{participant.code}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        participant.donation_confirmed ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {participant.donation_confirmed ? "Confirmada" : "Pendente"}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-2xl text-emerald-950">{participant.full_name}</h2>
                  <p className="font-bold text-slate-700">{participant.whatsapp}</p>
                  <p className="mt-2 text-slate-700"><strong>Doação:</strong> {participant.donation_type}</p>
                  <p className="text-slate-700"><strong>Entrega:</strong> {participant.delivery_point}</p>
                  <p className="text-slate-700"><strong>Voucher:</strong> {participant.voucher_code} ({participant.voucher_discount})</p>
                  <p className="text-slate-700"><strong>Palpites salvos:</strong> {participant.predicted_matches}</p>
                </div>

                {!participant.donation_confirmed && (
                  <div>
                    <textarea
                      value={notesByParticipant[participant.id] || ""}
                      onChange={(event) =>
                        setNotesByParticipant((current) => ({ ...current, [participant.id]: event.target.value }))
                      }
                      rows={4}
                      className="w-full rounded-md border px-3 py-3"
                      placeholder="Observação da entrega"
                    />
                    <Button
                      onClick={() => confirmDonation(participant)}
                      disabled={loading}
                      className="mt-3 w-full bg-emerald-800 py-6 font-black text-white hover:bg-emerald-900"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Confirmar doação
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-emerald-100 bg-white p-5">
            <h2 className="font-display text-2xl text-emerald-950">Lançar resultados</h2>
            <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-1">
              {matches.map((match) => (
                <div key={match.id} className="rounded-lg border p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Jogo {match.id} • {match.phase}</p>
                  <div className="mt-2 grid grid-cols-[1fr_64px] items-center gap-3">
                    <span className="font-bold text-emerald-950">{match.home_team}</span>
                    <input
                      min={0}
                      type="number"
                      value={resultScores[`${match.id}-home`] ?? match.result_home_score ?? ""}
                      onChange={(event) => setResultScores((current) => ({ ...current, [`${match.id}-home`]: event.target.value }))}
                      className="h-10 rounded-md border text-center font-black"
                    />
                    <span className="font-bold text-emerald-950">{match.away_team}</span>
                    <input
                      min={0}
                      type="number"
                      value={resultScores[`${match.id}-away`] ?? match.result_away_score ?? ""}
                      onChange={(event) => setResultScores((current) => ({ ...current, [`${match.id}-away`]: event.target.value }))}
                      className="h-10 rounded-md border text-center font-black"
                    />
                  </div>
                  <Button onClick={() => saveResult(match)} disabled={loading} className="mt-3 w-full bg-rose-700 font-bold text-white hover:bg-rose-800">
                    Salvar resultado
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-emerald-100 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <h2 className="font-display text-2xl text-emerald-950">Ranking</h2>
            </div>
            <div className="space-y-3">
              {ranking.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-lg border p-3">
                  <span className="font-display text-xl text-yellow-600">{index + 1}</span>
                  <div>
                    <p className="font-bold text-emerald-950">{row.full_name}</p>
                    <p className="text-xs text-slate-500">{row.exact_scores} exatos • {row.correct_results} resultados</p>
                  </div>
                  <span className="font-display text-xl text-rose-700">{row.total_points}</span>
                </div>
              ))}
              {ranking.length === 0 && <p className="rounded-lg border border-dashed p-4 text-center font-bold text-slate-600">Sem ranking ainda.</p>}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
