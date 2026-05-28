import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Search, ShieldCheck } from "lucide-react";
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

type StatusFilter = "pending" | "confirmed" | "all";

export default function Admin() {
  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receivedBy, setReceivedBy] = useState("HM Bazar");
  const [notesByParticipant, setNotesByParticipant] = useState<Record<string, string>>({});

  const loadParticipants = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ status });
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/admin/participants?${params.toString()}`);
      if (!response.ok) throw new Error("Falha ao carregar participantes");
      const payload = await response.json();
      setParticipants(payload.participants || []);
    } catch {
      setError("Não foi possível carregar os participantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadParticipants();
  }, [status]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    void loadParticipants();
  };

  const confirmDonation = async (participant: AdminParticipant) => {
    setError("");
    const response = await fetch(`/api/admin/participants/${participant.id}/confirm-donation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receivedBy,
        notes: notesByParticipant[participant.id] || "",
      }),
    });

    if (!response.ok) {
      setError("Não foi possível confirmar esta doação.");
      return;
    }

    await loadParticipants();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-blue-900 text-white border-b-4 border-yellow-400">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-yellow-400" />
            <div>
              <h1 className="font-display text-3xl">Admin do Bolão</h1>
              <p className="text-yellow-100">Confirmação manual das doações recebidas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card className="p-5 border-2 border-yellow-300 mb-6">
          <div className="grid lg:grid-cols-[auto_1fr_auto] gap-4 items-end">
            <div>
              <span className="text-sm font-bold text-blue-900">Status</span>
              <div className="mt-2 flex rounded-lg border-2 border-blue-900 overflow-hidden">
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
                      status === option.value
                        ? "bg-blue-900 text-white"
                        : "bg-white text-blue-900 hover:bg-yellow-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSearch}>
              <label className="block">
                <span className="text-sm font-bold text-blue-900">Buscar por nome, código ou WhatsApp</span>
                <div className="mt-2 flex gap-2">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-lg border-2 border-yellow-300 px-4 py-3 focus:border-blue-900 focus:outline-none"
                    placeholder="BOLAO-2026, Maria, 119..."
                  />
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-4">
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </label>
            </form>

            <label className="block">
              <span className="text-sm font-bold text-blue-900">Recebido por</span>
              <input
                value={receivedBy}
                onChange={(event) => setReceivedBy(event.target.value)}
                className="mt-2 w-full rounded-lg border-2 border-yellow-300 px-4 py-3 focus:border-blue-900 focus:outline-none"
              />
            </label>
          </div>
        </Card>

        {error && (
          <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-4 font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading && <p className="font-bold text-blue-900">Carregando...</p>}

          {!loading && participants.length === 0 && (
            <Card className="p-8 text-center border-2 border-yellow-300">
              <p className="font-bold text-gray-700">Nenhum participante encontrado.</p>
            </Card>
          )}

          {participants.map((participant) => (
            <Card key={participant.id} className="p-5 border-2 border-yellow-200">
              <div className="grid lg:grid-cols-[1fr_auto] gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-full bg-blue-900 px-3 py-1 text-sm font-bold text-yellow-300">
                      {participant.code}
                    </span>
                    {participant.donation_confirmed ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                        Confirmada
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">
                        Pendente
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-2xl text-blue-900">{participant.full_name}</h2>
                  <p className="font-bold text-gray-700">{participant.whatsapp}</p>
                  <p className="text-gray-700 mt-2">
                    <strong>Doação:</strong> {participant.donation_type}
                  </p>
                  <p className="text-gray-700">
                    <strong>Entrega:</strong> {participant.delivery_point}
                  </p>
                  <p className="text-gray-700">
                    <strong>Voucher:</strong> {participant.voucher_code} ({participant.voucher_discount})
                  </p>
                  <p className="text-gray-700">
                    <strong>Palpites salvos:</strong> {participant.predicted_matches}
                  </p>

                  {participant.donation_confirmed && (
                    <p className="mt-2 text-green-700 font-bold">
                      Recebida por {participant.donation_received_by} em{" "}
                      {new Date(participant.donation_confirmed_at || participant.created_at).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>

                {!participant.donation_confirmed && (
                  <div className="lg:w-80">
                    <label className="block">
                      <span className="text-sm font-bold text-blue-900">Observação da entrega</span>
                      <textarea
                        value={notesByParticipant[participant.id] || ""}
                        onChange={(event) =>
                          setNotesByParticipant((current) => ({
                            ...current,
                            [participant.id]: event.target.value,
                          }))
                        }
                        rows={4}
                        className="mt-2 w-full rounded-lg border-2 border-yellow-300 px-4 py-3 focus:border-blue-900 focus:outline-none"
                        placeholder="Ex: 2kg de arroz + 1 pacote de feijão"
                      />
                    </label>
                    <Button
                      onClick={() => confirmDonation(participant)}
                      className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Confirmar Doação
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
