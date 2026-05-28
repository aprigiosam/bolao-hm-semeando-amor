import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Copy, Globe2, HandHeart, Heart, MapPin, Phone, Trophy, Users } from "lucide-react";
import { FormEvent, useState } from "react";

type MatchPrediction = {
  home: string;
  away: string;
};

type StoredParticipant = {
  id: string;
  code: string;
  whatsapp: string;
  name: string;
  donationType: string;
  deliveryPoint: string;
  voucher: string;
  predictions: Record<string, MatchPrediction>;
  updatedAt: string;
  confirmed: boolean;
};

type AccessStatus = "idle" | "found" | "not-found";

type DonationRegistration = {
  name: string;
  whatsapp: string;
  deliveryPoint: string;
};

const worldCupMatches = [
  { number: 1, phase: "Grupo A", date: "11/06/2026", home: "México", away: "África do Sul", venue: "Estadio Azteca", city: "Cidade do México" },
  { number: 2, phase: "Grupo A", date: "11/06/2026", home: "Coreia do Sul", away: "Tchéquia", venue: "Estadio Akron", city: "Zapopan" },
  { number: 3, phase: "Grupo B", date: "12/06/2026", home: "Canadá", away: "Bósnia e Herzegovina", venue: "BMO Field", city: "Toronto" },
  { number: 4, phase: "Grupo D", date: "12/06/2026", home: "Estados Unidos", away: "Paraguai", venue: "SoFi Stadium", city: "Inglewood" },
  { number: 5, phase: "Grupo B", date: "13/06/2026", home: "Catar", away: "Suíça", venue: "Levi's Stadium", city: "Santa Clara" },
  { number: 6, phase: "Grupo C", date: "13/06/2026", home: "Brasil", away: "Marrocos", venue: "Gillette Stadium", city: "Foxborough" },
  { number: 7, phase: "Grupo C", date: "13/06/2026", home: "Haiti", away: "Escócia", venue: "MetLife Stadium", city: "East Rutherford" },
  { number: 8, phase: "Grupo D", date: "13/06/2026", home: "Austrália", away: "Turquia", venue: "BC Place", city: "Vancouver" },
  { number: 9, phase: "Grupo E", date: "14/06/2026", home: "Costa do Marfim", away: "Equador", venue: "Lincoln Financial Field", city: "Filadélfia" },
  { number: 10, phase: "Grupo E", date: "14/06/2026", home: "Alemanha", away: "Curaçao", venue: "NRG Stadium", city: "Houston" },
  { number: 11, phase: "Grupo F", date: "14/06/2026", home: "Países Baixos", away: "Japão", venue: "AT&T Stadium", city: "Arlington" },
  { number: 12, phase: "Grupo F", date: "14/06/2026", home: "Suécia", away: "Tunísia", venue: "Estadio BBVA", city: "Guadalupe" },
  { number: 13, phase: "Grupo G", date: "15/06/2026", home: "Irã", away: "Nova Zelândia", venue: "SoFi Stadium", city: "Inglewood" },
  { number: 14, phase: "Grupo G", date: "15/06/2026", home: "Bélgica", away: "Egito", venue: "Lumen Field", city: "Seattle" },
  { number: 15, phase: "Grupo H", date: "15/06/2026", home: "Arábia Saudita", away: "Uruguai", venue: "Hard Rock Stadium", city: "Miami Gardens" },
  { number: 16, phase: "Grupo H", date: "15/06/2026", home: "Espanha", away: "Cabo Verde", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { number: 17, phase: "Grupo I", date: "16/06/2026", home: "França", away: "Senegal", venue: "MetLife Stadium", city: "East Rutherford" },
  { number: 18, phase: "Grupo I", date: "16/06/2026", home: "Iraque", away: "Noruega", venue: "Gillette Stadium", city: "Foxborough" },
  { number: 19, phase: "Grupo J", date: "16/06/2026", home: "Argentina", away: "Argélia", venue: "Arrowhead Stadium", city: "Kansas City" },
  { number: 20, phase: "Grupo J", date: "16/06/2026", home: "Áustria", away: "Jordânia", venue: "Levi's Stadium", city: "Santa Clara" },
  { number: 21, phase: "Grupo K", date: "17/06/2026", home: "Portugal", away: "RD Congo", venue: "NRG Stadium", city: "Houston" },
  { number: 22, phase: "Grupo K", date: "17/06/2026", home: "Uzbequistão", away: "Colômbia", venue: "Estadio Azteca", city: "Cidade do México" },
  { number: 23, phase: "Grupo L", date: "17/06/2026", home: "Gana", away: "Panamá", venue: "BMO Field", city: "Toronto" },
  { number: 24, phase: "Grupo L", date: "17/06/2026", home: "Inglaterra", away: "Croácia", venue: "AT&T Stadium", city: "Arlington" },
  { number: 25, phase: "Grupo A", date: "18/06/2026", home: "Tchéquia", away: "África do Sul", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { number: 26, phase: "Grupo A", date: "18/06/2026", home: "México", away: "Coreia do Sul", venue: "Estadio Akron", city: "Zapopan" },
  { number: 27, phase: "Grupo B", date: "18/06/2026", home: "Suíça", away: "Bósnia e Herzegovina", venue: "SoFi Stadium", city: "Inglewood" },
  { number: 28, phase: "Grupo B", date: "18/06/2026", home: "Canadá", away: "Catar", venue: "BC Place", city: "Vancouver" },
  { number: 29, phase: "Grupo C", date: "19/06/2026", home: "Escócia", away: "Marrocos", venue: "Lincoln Financial Field", city: "Filadélfia" },
  { number: 30, phase: "Grupo C", date: "19/06/2026", home: "Brasil", away: "Haiti", venue: "Gillette Stadium", city: "Foxborough" },
  { number: 31, phase: "Grupo D", date: "19/06/2026", home: "Turquia", away: "Paraguai", venue: "Levi's Stadium", city: "Santa Clara" },
  { number: 32, phase: "Grupo D", date: "19/06/2026", home: "Estados Unidos", away: "Austrália", venue: "Lumen Field", city: "Seattle" },
  { number: 33, phase: "Grupo E", date: "20/06/2026", home: "Alemanha", away: "Costa do Marfim", venue: "BMO Field", city: "Toronto" },
  { number: 34, phase: "Grupo E", date: "20/06/2026", home: "Equador", away: "Curaçao", venue: "Arrowhead Stadium", city: "Kansas City" },
  { number: 35, phase: "Grupo F", date: "20/06/2026", home: "Países Baixos", away: "Suécia", venue: "NRG Stadium", city: "Houston" },
  { number: 36, phase: "Grupo F", date: "20/06/2026", home: "Tunísia", away: "Japão", venue: "Estadio BBVA", city: "Guadalupe" },
  { number: 37, phase: "Grupo G", date: "21/06/2026", home: "Bélgica", away: "Irã", venue: "SoFi Stadium", city: "Inglewood" },
  { number: 38, phase: "Grupo G", date: "21/06/2026", home: "Nova Zelândia", away: "Egito", venue: "BC Place", city: "Vancouver" },
  { number: 39, phase: "Grupo H", date: "21/06/2026", home: "Uruguai", away: "Cabo Verde", venue: "Hard Rock Stadium", city: "Miami Gardens" },
  { number: 40, phase: "Grupo H", date: "21/06/2026", home: "Espanha", away: "Arábia Saudita", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { number: 41, phase: "Grupo I", date: "22/06/2026", home: "Noruega", away: "Senegal", venue: "MetLife Stadium", city: "East Rutherford" },
  { number: 42, phase: "Grupo I", date: "22/06/2026", home: "França", away: "Iraque", venue: "Lincoln Financial Field", city: "Filadélfia" },
  { number: 43, phase: "Grupo J", date: "22/06/2026", home: "Argentina", away: "Áustria", venue: "AT&T Stadium", city: "Arlington" },
  { number: 44, phase: "Grupo J", date: "22/06/2026", home: "Jordânia", away: "Argélia", venue: "Levi's Stadium", city: "Santa Clara" },
  { number: 45, phase: "Grupo K", date: "23/06/2026", home: "Portugal", away: "Uzbequistão", venue: "NRG Stadium", city: "Houston" },
  { number: 46, phase: "Grupo K", date: "23/06/2026", home: "Colômbia", away: "RD Congo", venue: "Estadio Akron", city: "Zapopan" },
  { number: 47, phase: "Grupo L", date: "23/06/2026", home: "Inglaterra", away: "Gana", venue: "Gillette Stadium", city: "Foxborough" },
  { number: 48, phase: "Grupo L", date: "23/06/2026", home: "Panamá", away: "Croácia", venue: "BMO Field", city: "Toronto" },
  { number: 49, phase: "Grupo A", date: "24/06/2026", home: "Tchéquia", away: "México", venue: "Estadio Azteca", city: "Cidade do México" },
  { number: 50, phase: "Grupo A", date: "24/06/2026", home: "África do Sul", away: "Coreia do Sul", venue: "Estadio BBVA", city: "Guadalupe" },
  { number: 51, phase: "Grupo B", date: "24/06/2026", home: "Suíça", away: "Canadá", venue: "BC Place", city: "Vancouver" },
  { number: 52, phase: "Grupo B", date: "24/06/2026", home: "Bósnia e Herzegovina", away: "Catar", venue: "Lumen Field", city: "Seattle" },
  { number: 53, phase: "Grupo C", date: "24/06/2026", home: "Escócia", away: "Brasil", venue: "Hard Rock Stadium", city: "Miami Gardens" },
  { number: 54, phase: "Grupo C", date: "24/06/2026", home: "Marrocos", away: "Haiti", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { number: 55, phase: "Grupo D", date: "25/06/2026", home: "Turquia", away: "Estados Unidos", venue: "SoFi Stadium", city: "Inglewood" },
  { number: 56, phase: "Grupo D", date: "25/06/2026", home: "Paraguai", away: "Austrália", venue: "Levi's Stadium", city: "Santa Clara" },
  { number: 57, phase: "Grupo E", date: "25/06/2026", home: "Curaçao", away: "Costa do Marfim", venue: "Lincoln Financial Field", city: "Filadélfia" },
  { number: 58, phase: "Grupo E", date: "25/06/2026", home: "Equador", away: "Alemanha", venue: "MetLife Stadium", city: "East Rutherford" },
  { number: 59, phase: "Grupo F", date: "25/06/2026", home: "Japão", away: "Suécia", venue: "AT&T Stadium", city: "Arlington" },
  { number: 60, phase: "Grupo F", date: "25/06/2026", home: "Tunísia", away: "Países Baixos", venue: "Arrowhead Stadium", city: "Kansas City" },
  { number: 61, phase: "Grupo G", date: "26/06/2026", home: "Egito", away: "Irã", venue: "Lumen Field", city: "Seattle" },
  { number: 62, phase: "Grupo G", date: "26/06/2026", home: "Nova Zelândia", away: "Bélgica", venue: "BC Place", city: "Vancouver" },
  { number: 63, phase: "Grupo H", date: "26/06/2026", home: "Cabo Verde", away: "Arábia Saudita", venue: "NRG Stadium", city: "Houston" },
  { number: 64, phase: "Grupo H", date: "26/06/2026", home: "Uruguai", away: "Espanha", venue: "Estadio Akron", city: "Zapopan" },
  { number: 65, phase: "Grupo I", date: "26/06/2026", home: "Noruega", away: "França", venue: "Gillette Stadium", city: "Foxborough" },
  { number: 66, phase: "Grupo I", date: "26/06/2026", home: "Senegal", away: "Iraque", venue: "BMO Field", city: "Toronto" },
  { number: 67, phase: "Grupo J", date: "27/06/2026", home: "Argélia", away: "Áustria", venue: "Arrowhead Stadium", city: "Kansas City" },
  { number: 68, phase: "Grupo J", date: "27/06/2026", home: "Jordânia", away: "Argentina", venue: "AT&T Stadium", city: "Arlington" },
  { number: 69, phase: "Grupo K", date: "27/06/2026", home: "Colômbia", away: "Portugal", venue: "Hard Rock Stadium", city: "Miami Gardens" },
  { number: 70, phase: "Grupo K", date: "27/06/2026", home: "RD Congo", away: "Uzbequistão", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { number: 71, phase: "Grupo L", date: "27/06/2026", home: "Panamá", away: "Inglaterra", venue: "MetLife Stadium", city: "East Rutherford" },
  { number: 72, phase: "Grupo L", date: "27/06/2026", home: "Croácia", away: "Gana", venue: "Lincoln Financial Field", city: "Filadélfia" },
  { number: 73, phase: "Fase de 32", date: "28/06/2026", home: "2º Grupo A", away: "2º Grupo B", venue: "SoFi Stadium", city: "Inglewood" },
  { number: 74, phase: "Fase de 32", date: "29/06/2026", home: "1º Grupo E", away: "3º Grupo A/B/C/D/F", venue: "Gillette Stadium", city: "Foxborough" },
  { number: 75, phase: "Fase de 32", date: "29/06/2026", home: "1º Grupo F", away: "2º Grupo C", venue: "Estadio BBVA", city: "Guadalupe" },
  { number: 76, phase: "Fase de 32", date: "29/06/2026", home: "1º Grupo C", away: "2º Grupo F", venue: "NRG Stadium", city: "Houston" },
  { number: 77, phase: "Fase de 32", date: "30/06/2026", home: "1º Grupo I", away: "3º Grupo C/D/F/G/H", venue: "MetLife Stadium", city: "East Rutherford" },
  { number: 78, phase: "Fase de 32", date: "30/06/2026", home: "2º Grupo E", away: "2º Grupo I", venue: "AT&T Stadium", city: "Arlington" },
  { number: 79, phase: "Fase de 32", date: "30/06/2026", home: "1º Grupo A", away: "3º Grupo C/E/F/H/I", venue: "Estadio Azteca", city: "Cidade do México" },
  { number: 80, phase: "Fase de 32", date: "01/07/2026", home: "1º Grupo L", away: "3º Grupo E/H/I/J/K", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { number: 81, phase: "Fase de 32", date: "01/07/2026", home: "1º Grupo D", away: "3º Grupo B/E/F/I/J", venue: "Levi's Stadium", city: "Santa Clara" },
  { number: 82, phase: "Fase de 32", date: "01/07/2026", home: "1º Grupo G", away: "3º Grupo A/E/H/I/J", venue: "Lumen Field", city: "Seattle" },
  { number: 83, phase: "Fase de 32", date: "02/07/2026", home: "2º Grupo K", away: "2º Grupo L", venue: "BMO Field", city: "Toronto" },
  { number: 84, phase: "Fase de 32", date: "02/07/2026", home: "1º Grupo H", away: "2º Grupo J", venue: "SoFi Stadium", city: "Inglewood" },
  { number: 85, phase: "Fase de 32", date: "02/07/2026", home: "1º Grupo B", away: "3º Grupo E/F/G/I/J", venue: "BC Place", city: "Vancouver" },
  { number: 86, phase: "Fase de 32", date: "03/07/2026", home: "1º Grupo J", away: "2º Grupo H", venue: "Hard Rock Stadium", city: "Miami Gardens" },
  { number: 87, phase: "Fase de 32", date: "03/07/2026", home: "1º Grupo K", away: "3º Grupo D/E/I/J/L", venue: "Arrowhead Stadium", city: "Kansas City" },
  { number: 88, phase: "Fase de 32", date: "03/07/2026", home: "2º Grupo D", away: "2º Grupo G", venue: "AT&T Stadium", city: "Arlington" },
  { number: 89, phase: "Oitavas de final", date: "04/07/2026", home: "Vencedor Jogo 74", away: "Vencedor Jogo 77", venue: "Lincoln Financial Field", city: "Filadélfia" },
  { number: 90, phase: "Oitavas de final", date: "04/07/2026", home: "Vencedor Jogo 73", away: "Vencedor Jogo 75", venue: "NRG Stadium", city: "Houston" },
  { number: 91, phase: "Oitavas de final", date: "05/07/2026", home: "Vencedor Jogo 76", away: "Vencedor Jogo 78", venue: "MetLife Stadium", city: "East Rutherford" },
  { number: 92, phase: "Oitavas de final", date: "05/07/2026", home: "Vencedor Jogo 79", away: "Vencedor Jogo 80", venue: "Estadio Azteca", city: "Cidade do México" },
  { number: 93, phase: "Oitavas de final", date: "06/07/2026", home: "Vencedor Jogo 83", away: "Vencedor Jogo 84", venue: "AT&T Stadium", city: "Arlington" },
  { number: 94, phase: "Oitavas de final", date: "06/07/2026", home: "Vencedor Jogo 81", away: "Vencedor Jogo 82", venue: "Lumen Field", city: "Seattle" },
  { number: 95, phase: "Oitavas de final", date: "07/07/2026", home: "Vencedor Jogo 86", away: "Vencedor Jogo 88", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { number: 96, phase: "Oitavas de final", date: "07/07/2026", home: "Vencedor Jogo 85", away: "Vencedor Jogo 87", venue: "BC Place", city: "Vancouver" },
  { number: 97, phase: "Quartas de final", date: "09/07/2026", home: "Vencedor Jogo 89", away: "Vencedor Jogo 90", venue: "Gillette Stadium", city: "Foxborough" },
  { number: 98, phase: "Quartas de final", date: "10/07/2026", home: "Vencedor Jogo 93", away: "Vencedor Jogo 94", venue: "SoFi Stadium", city: "Inglewood" },
  { number: 99, phase: "Quartas de final", date: "11/07/2026", home: "Vencedor Jogo 91", away: "Vencedor Jogo 92", venue: "Hard Rock Stadium", city: "Miami Gardens" },
  { number: 100, phase: "Quartas de final", date: "11/07/2026", home: "Vencedor Jogo 95", away: "Vencedor Jogo 96", venue: "Arrowhead Stadium", city: "Kansas City" },
  { number: 101, phase: "Semifinal", date: "14/07/2026", home: "Vencedor Jogo 97", away: "Vencedor Jogo 98", venue: "AT&T Stadium", city: "Arlington" },
  { number: 102, phase: "Semifinal", date: "15/07/2026", home: "Vencedor Jogo 99", away: "Vencedor Jogo 100", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { number: 103, phase: "Disputa de 3º lugar", date: "18/07/2026", home: "Perdedor Jogo 101", away: "Perdedor Jogo 102", venue: "Hard Rock Stadium", city: "Miami Gardens" },
  { number: 104, phase: "Final", date: "19/07/2026", home: "Vencedor Jogo 101", away: "Vencedor Jogo 102", venue: "MetLife Stadium", city: "East Rutherford" },
];

const formatMatchRange = (numbers: number[]) => {
  if (numbers.length === 1) return `Jogo ${numbers[0]}`;
  return `Jogos ${numbers[0]} a ${numbers[numbers.length - 1]}`;
};

const matchSections = Array.from(new Set(worldCupMatches.map((match) => match.date))).map((date) => {
  const matches = worldCupMatches.filter((match) => match.date === date);
  const phases = Array.from(new Set(matches.map((match) => match.phase)));
  const numbers = matches.map((match) => match.number);

  return {
    date,
    title: `${date} • ${formatMatchRange(numbers)}`,
    description: phases.join(" • "),
    count: matches.length,
  };
});

const heroStadiumSlides = [
  {
    stadium: "Estadio Azteca",
    city: "Cidade do México",
    country: "México",
    label: "Abertura da Copa 2026",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Mexico%20city%20Estadio%20Azteca%20estadio%20banorte%20fifa%20world%20cup%202026%204.JPG",
  },
  {
    stadium: "Estadio Akron",
    city: "Guadalajara",
    country: "México",
    label: "Sede mexicana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Estadio%20Akron%20exterior.jpg",
  },
  {
    stadium: "Estadio BBVA",
    city: "Monterrey",
    country: "México",
    label: "Sede mexicana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Estadio%20BBVA%20Bancomer%20(1).jpg",
  },
  {
    stadium: "BC Place",
    city: "Vancouver",
    country: "Canadá",
    label: "Sede canadense",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/BC%20Place%202015%20Women's%20World%20Cup.jpg",
  },
  {
    stadium: "BMO Field",
    city: "Toronto",
    country: "Canadá",
    label: "Sede canadense",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/BMO%20Field%20June%202016.jpg",
  },
  {
    stadium: "MetLife Stadium",
    city: "Nova York/Nova Jersey",
    country: "Estados Unidos",
    label: "Palco da final",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/MetLife%20Stadium%20Exterior.jpg",
  },
  {
    stadium: "AT&T Stadium",
    city: "Dallas",
    country: "Estados Unidos",
    label: "Sede norte-americana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Arlington%20June%202020%201%20(AT%26T%20Stadium).jpg",
  },
  {
    stadium: "Mercedes-Benz Stadium",
    city: "Atlanta",
    country: "Estados Unidos",
    label: "Sede norte-americana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes-Benz%20Stadium%20Atlanta.jpg",
  },
  {
    stadium: "Gillette Stadium",
    city: "Boston",
    country: "Estados Unidos",
    label: "Sede norte-americana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Gillette%20Stadium%2002.jpg",
  },
  {
    stadium: "NRG Stadium",
    city: "Houston",
    country: "Estados Unidos",
    label: "Sede norte-americana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/NRG%20Stadium%20Houston%20Texas.jpg",
  },
  {
    stadium: "Arrowhead Stadium",
    city: "Kansas City",
    country: "Estados Unidos",
    label: "Sede norte-americana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Arrowhead%20Stadium.jpg",
  },
  {
    stadium: "SoFi Stadium",
    city: "Los Angeles",
    country: "Estados Unidos",
    label: "Sede norte-americana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/SoFi%20Stadium%202021.jpg",
  },
  {
    stadium: "Hard Rock Stadium",
    city: "Miami",
    country: "Estados Unidos",
    label: "Sede norte-americana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Hard%20Rock%20Stadium%20aerial%202020.jpg",
  },
  {
    stadium: "Lincoln Financial Field",
    city: "Filadélfia",
    country: "Estados Unidos",
    label: "Sede norte-americana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Lincoln%20Financial%20Field%20aerial%20view.jpg",
  },
  {
    stadium: "Levi's Stadium",
    city: "San Francisco Bay Area",
    country: "Estados Unidos",
    label: "Sede norte-americana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Levi%27s%20Stadium%20from%20above.jpg",
  },
  {
    stadium: "Lumen Field",
    city: "Seattle",
    country: "Estados Unidos",
    label: "Sede norte-americana",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Lumen%20Field%202020.jpg",
  },
];

const heroRotationDuration = heroStadiumSlides.length * 6;

const getMatchId = (matchNumber: number) => `jogo-${matchNumber}`;
const participantStorageKey = "hm-bolao-participants-v1";

const normalizePhone = (value: string) => value.replace(/\D/g, "");
const hasCompletePrediction = (prediction?: MatchPrediction) =>
  prediction?.home !== undefined &&
  prediction.away !== undefined &&
  prediction.home !== "" &&
  prediction.away !== "";

const predictionsFromApi = (
  rows: Array<{ match_id: number; home_score: number; away_score: number }>
) =>
  rows.reduce<Record<string, MatchPrediction>>((acc, row) => {
    acc[getMatchId(row.match_id)] = {
      home: String(row.home_score),
      away: String(row.away_score),
    };
    return acc;
  }, {});

const participantFromApi = (
  participant: {
    id: string;
    code: string;
    whatsapp: string;
    full_name: string;
    donation_type: string;
    delivery_point: string;
    voucher_code: string;
    voucher_discount: string;
    donation_confirmed: boolean;
    updated_at: string;
  },
  predictions: Record<string, MatchPrediction>
): StoredParticipant => ({
  id: participant.id,
  code: participant.code,
  whatsapp: participant.whatsapp,
  name: participant.full_name,
  donationType: participant.donation_type,
  deliveryPoint: participant.delivery_point,
  voucher: `${participant.voucher_code} - ${participant.voucher_discount}`,
  predictions,
  updatedAt: participant.updated_at,
  confirmed: participant.donation_confirmed,
});

const loadStoredParticipants = (): StoredParticipant[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(participantStorageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveStoredParticipant = (participant: StoredParticipant) => {
  const participants = loadStoredParticipants();
  const nextParticipants = [
    participant,
    ...participants.filter(
      (item) =>
        item.code !== participant.code ||
        normalizePhone(item.whatsapp) !== normalizePhone(participant.whatsapp)
    ),
  ];
  window.localStorage.setItem(participantStorageKey, JSON.stringify(nextParticipants));
};

/**
 * Design System: Esportivo Dinâmico + Solidário
 * - Cores: Amarelo ouro (#FFD700), Azul marinho (#001F3F), Vermelho vibrante (#E63946)
 * - Tipografia: Montserrat Bold para títulos, Roboto para corpo
 * - Layout: Seções com cortes diagonais, composição assimétrica
 * - Tema: Bolão da Copa com propósito solidário para a Associação Semeando Amor com a Tia Mônica
 * - Vouchers: Sistema de descontos na HM Bazar e Conveniência para doadores
 */

export default function Home() {
  const [participantCount] = useState(0);
  const [donationStep, setDonationStep] = useState<"select" | "confirm" | "success">("select");
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null);
  const [generatedVoucher, setGeneratedVoucher] = useState<{ code: string; discount: string; participationCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [guessStatus, setGuessStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [matchPredictions, setMatchPredictions] = useState<Record<string, MatchPrediction>>({});
  const [accessCode, setAccessCode] = useState("");
  const [accessWhatsApp, setAccessWhatsApp] = useState("");
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("idle");
  const [activeParticipant, setActiveParticipant] = useState<StoredParticipant | null>(null);
  const [registrationData, setRegistrationData] = useState<DonationRegistration>({
    name: "",
    whatsapp: "",
    deliveryPoint: "",
  });

  const donationTypes = [
    { 
      id: "food", 
      icon: "🥫", 
      label: "Alimentos Não Perecíveis", 
      description: "Arroz, feijão, macarrão, etc.",
      discount: "10% de desconto",
      voucherCode: "ALIMENTO10"
    },
    { 
      id: "clothes", 
      icon: "👕", 
      label: "Roupas", 
      description: "Roupas em bom estado para todas as idades",
      discount: "15% de desconto",
      voucherCode: "ROUPA15"
    },
    { 
      id: "toys", 
      icon: "🧸", 
      label: "Brinquedos", 
      description: "Brinquedos novos ou em bom estado",
      discount: "20% de desconto",
      voucherCode: "BRINQUEDO20"
    },
  ];

  const prizes = [
    { place: "1º Lugar", prize: "Prêmio principal + voucher HM", icon: "🥇" },
    { place: "2º Lugar", prize: "Prêmio surpresa + voucher HM", icon: "🥈" },
    { place: "3º Lugar", prize: "Brinde especial + voucher HM", icon: "🥉" },
  ];

  const hmAddress = "HM Bazar e Conveniência: Rua Ninho de Imarés, 115 - CEP 04896-140";
  const associationAddress = "Associação Semeando Amor: Rua Ninho de Imarés, 169 - CEP 04896-140";
  const hmWhatsApp = "+55 11 5920-4146";
  const hmWhatsAppUrl = "https://wa.me/551159204146";
  const hmInstagramUrl =
    "https://www.instagram.com/hm.bazar.conveniencia?igsh=MWlsdHlkeXh5MTl1ag%3D%3D&utm_source=qr";
  const hmMapsUrl = "https://www.google.com/maps/search/?api=1&query=Rua%20Ninho%20de%20Imar%C3%A9s%2C%20115%2004896-140";
  const selectedDonationType = donationTypes.find((d) => d.id === selectedDonation);
  const participantName = activeParticipant?.name || registrationData.name;
  const participantWhatsApp = activeParticipant?.whatsapp || registrationData.whatsapp;
  const participantDeliveryPoint = activeParticipant?.deliveryPoint || registrationData.deliveryPoint;
  const participantDonationType = activeParticipant?.donationType || selectedDonationType?.label || "";

  const openWhatsApp = (message: string) => {
    window.open(`${hmWhatsAppUrl}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const updateMatchPrediction = (matchId: string, side: keyof MatchPrediction, value: string) => {
    setMatchPredictions((current) => ({
      ...current,
      [matchId]: {
        home: current[matchId]?.home ?? "",
        away: current[matchId]?.away ?? "",
        [side]: value,
      },
    }));
  };

  const serializedMatchPredictions = JSON.stringify(
    worldCupMatches.map((match) => ({
      jogo: match.number,
      fase: match.phase,
      data: match.date,
      confronto: `${match.home} x ${match.away}`,
      estadio: match.venue,
      cidade: match.city,
      mandante: matchPredictions[getMatchId(match.number)]?.home || "",
      visitante: matchPredictions[getMatchId(match.number)]?.away || "",
    }))
  );

  const predictedCount = worldCupMatches.filter((match) =>
    hasCompletePrediction(matchPredictions[getMatchId(match.number)])
  ).length;

  const progressPercentage = Math.round((predictedCount / worldCupMatches.length) * 100);

  const handleAccessParticipant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams({
      code: accessCode.trim(),
      whatsapp: accessWhatsApp.trim(),
    });
    const response = await fetch(`/api/participants/access?${params.toString()}`);

    if (!response.ok) {
      setAccessStatus("not-found");
      setActiveParticipant(null);
      return;
    }

    const payload = await response.json();
    const predictions = predictionsFromApi(payload.predictions || []);
    const participant = participantFromApi(payload.participant, predictions);

    setAccessStatus("found");
    setActiveParticipant(participant);
    setRegistrationData({
      name: participant.name,
      whatsapp: participant.whatsapp,
      deliveryPoint: participant.deliveryPoint,
    });
    setMatchPredictions(predictions);
    setGeneratedVoucher({
      code: participant.voucher.split(" - ")[0] || participant.voucher,
      discount: participant.voucher.split(" - ")[1] || "",
      participationCode: participant.code,
    });
    setDonationStep("success");
    setTimeout(() => document.getElementById("palpite")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handlePrepareParticipation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedType = donationTypes.find((d) => d.id === selectedDonation);
    if (!selectedType) return;

    const formData = new FormData(event.currentTarget);
    const nextRegistration = {
      name: String(formData.get("nome") || "").trim(),
      whatsapp: String(formData.get("whatsapp") || "").trim(),
      deliveryPoint: String(formData.get("ponto_entrega") || ""),
    };

    setRegistrationData(nextRegistration);
    setAccessCode("");
    setAccessWhatsApp("");
    setAccessStatus("idle");
    setActiveParticipant(null);
    setGeneratedVoucher({
      code: selectedType.voucherCode,
      discount: selectedType.discount,
      participationCode: generateParticipationCode(),
    });
    setDonationStep("success");
  };

  const filledPredictionsPayload = worldCupMatches
    .reduce<Array<{ matchId: number; homeScore: number; awayScore: number }>>((acc, match) => {
      const prediction = matchPredictions[getMatchId(match.number)];
      if (!prediction?.home || !prediction?.away) return acc;

      const homeScore = Number(prediction.home);
      const awayScore = Number(prediction.away);
      if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) return acc;

      acc.push({
        matchId: match.number,
        homeScore,
        awayScore,
      });
      return acc;
    }, []);

  const handleGuessSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuessStatus("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("form-name", "palpite-bolao");

    try {
      const participantResponse = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: String(formData.get("codigo_provisorio") || ""),
          fullName: String(formData.get("nome") || ""),
          whatsapp: String(formData.get("whatsapp") || ""),
          donationType: String(formData.get("tipo_doacao") || ""),
          deliveryPoint: String(formData.get("ponto_entrega") || ""),
          voucherCode: generatedVoucher?.code || "",
          voucherDiscount: generatedVoucher?.discount || "",
        }),
      });

      if (!participantResponse.ok) {
        throw new Error("participant save failed");
      }

      const participantPayload = await participantResponse.json();
      const participantId = participantPayload.participant.id;
      const predictionsResponse = await fetch(`/api/participants/${participantId}/predictions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions: filledPredictionsPayload }),
      });

      if (!predictionsResponse.ok) {
        throw new Error("prediction save failed");
      }

      const predictionsPayload = await predictionsResponse.json();
      const predictions = predictionsFromApi(predictionsPayload.predictions || []);
      const participant = participantFromApi(participantPayload.participant, predictions);
      saveStoredParticipant(participant);
      setActiveParticipant(participant);
      setMatchPredictions(predictions);
      setAccessCode(participant.code);
      setAccessWhatsApp(participant.whatsapp);
      setAccessStatus("found");
      setGuessStatus("success");
    } catch {
      setGuessStatus("error");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateParticipationCode = () => {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BOLAO-2026-${random}`;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-yellow-400 shadow-lg">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/hm-logo.jpeg"
              alt="Logo HM Bazar e Conveniência"
              className="w-14 h-14 rounded-lg object-contain bg-white border-2 border-yellow-400"
            />
            <div>
              <h1 className="font-display text-2xl text-blue-900">Bolão Copa Solidário</h1>
              <p className="text-xs text-red-600 font-semibold">
                HM Bazar + Associação Semeando Amor
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Inscrições</p>
              <p className="font-display text-xl text-yellow-600">{participantCount === 0 ? "Em breve" : participantCount}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section com Estádios da Copa */}
      <section className="relative min-h-[560px] overflow-hidden bg-blue-950">
        <div className="absolute inset-0">
          {heroStadiumSlides.map((slide, index) => (
            <div
              key={slide.stadium}
              aria-hidden="true"
              className="hero-stadium-slide absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("${slide.image}")`,
                animationDelay: `${index * 6}s`,
                animationDuration: `${heroRotationDuration}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/82 to-blue-950/35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,215,0,0.15)_1px,transparent_1px),linear-gradient(0deg,rgba(230,57,70,0.11)_1px,transparent_1px)] bg-[size:88px_88px] opacity-35" />

        {/* Diagonal Cut Effect */}
        <svg
          className="absolute bottom-0 left-0 w-full h-24 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,50 Q300,100 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor" />
        </svg>

        {/* Hero Content */}
        <div className="relative flex min-h-[560px] items-center pb-16 pt-10">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-yellow-300 bg-blue-950/70 px-4 py-2 text-sm font-bold uppercase text-yellow-300">
                  <Trophy className="h-4 w-4" />
                  Copa do Mundo 2026 • Bolão Solidário
                </div>
                <h2 className="font-display text-5xl leading-tight text-white md:text-7xl">
                  O mundo joga, a quebrada ajuda
                </h2>
                <p className="mt-5 max-w-2xl text-xl font-semibold leading-relaxed text-yellow-100">
                  Um bolão da Copa com visual de grande torneio e efeito real na vizinhança: palpites,
                  doações confirmadas e apoio direto à Associação Semeando Amor com a Tia Mônica.
                </p>
                <div className="mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { value: "16", label: "estádios", icon: Globe2 },
                    { value: "3", label: "países", icon: MapPin },
                    { value: "104", label: "jogos", icon: Trophy },
                    { value: "1", label: "causa", icon: HandHeart },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-3 text-white backdrop-blur"
                      >
                        <Icon className="mb-2 h-4 w-4 text-yellow-300" />
                        <p className="font-display text-2xl leading-none text-yellow-300">{item.value}</p>
                        <p className="mt-1 text-xs font-bold uppercase text-blue-100">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={() => document.getElementById("doacao")?.scrollIntoView({ behavior: "smooth" })}
                    className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-lg px-8 py-6 rounded-lg transition-all duration-200 hover:scale-105 active:scale-97"
                  >
                    Participar do Bolão
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => document.getElementById("palpite")?.scrollIntoView({ behavior: "smooth" })}
                    className="border-2 border-white bg-white/10 px-8 py-6 text-lg font-bold text-white hover:bg-white hover:text-blue-900"
                  >
                    Ver Palpites
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-white/25 bg-blue-950/70 p-4 text-white shadow-2xl backdrop-blur-md">
                <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/15 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-yellow-300">Rota da Copa 2026</p>
                    <h3 className="font-display text-2xl leading-tight">Estádios em rotação</h3>
                  </div>
                  <span className="rounded-full bg-yellow-300 px-3 py-1 text-sm font-bold text-blue-950">
                    {heroStadiumSlides.length} sedes
                  </span>
                </div>

                <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {heroStadiumSlides.map((slide, index) => (
                    <div key={slide.stadium} className="rounded-lg border border-white/15 bg-white/10 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase text-yellow-300">{slide.label}</p>
                        <span className="rounded-full bg-blue-900/80 px-2 py-0.5 text-[11px] font-bold text-blue-100">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="font-display text-sm leading-tight text-white">{slide.stadium}</p>
                      <p className="mt-1 text-sm text-blue-100">
                        {slide.city} • {slide.country}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-yellow-300/40 bg-yellow-300/10 p-3">
                  <p className="text-sm font-bold text-yellow-100">
                    A imagem de fundo percorre todos os estádios. O bolão precisa parecer grande porque a causa é
                    grande.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missão Solidária */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-pink-50 border-b-4 border-red-400">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <img
              src="/assets/semeando-logo.jpeg"
              alt="Logo Associação Semeando Amor com a Tia Mônica"
              className="w-28 h-28 rounded-full object-contain bg-white border-4 border-red-200 mx-auto mb-4"
            />
            <h2 className="font-display text-4xl text-blue-900 mb-4">Nossa Missão</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Este bolão é mais que um jogo. Cada participação ajuda a{" "}
              <span className="font-bold text-red-600">
                Associação Semeando Amor com a Tia Mônica
              </span>, reunindo doações e apoio da comunidade.
            </p>
            <p className="text-base text-gray-600 italic">
              "Quando você participa, você não apenas concorre a prêmios, mas também semeia amor e esperança
              para quem mais precisa."
            </p>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <h2 className="font-display text-4xl text-blue-900 mb-16 text-center">Como Funciona</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎁",
                title: "1. Faça sua Doação",
                desc: "Doe alimentos, roupas ou brinquedos para a Associação Semeando Amor",
              },
              {
                icon: "🎟️",
                title: "2. Ganhe Voucher",
                desc: "Receba um voucher de desconto na HM Bazar e Conveniência",
              },
              {
                icon: "🏆",
                title: "3. Registre no Site",
                desc: "Preencha os placares dos jogos da Copa e aguarde a validação da doação",
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="p-8 border-2 border-yellow-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-display text-xl text-blue-900 mb-3">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Área do Participante */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
            <div>
              <h2 className="font-display text-4xl text-yellow-400 mb-4">Área do Participante</h2>
              <p className="text-yellow-100 text-lg leading-relaxed">
                Depois de registrar sua primeira participação, volte com seu WhatsApp e código provisório para
                continuar preenchendo os jogos que ainda faltam.
              </p>
            </div>

            <Card className="p-6 bg-white text-gray-900 border-4 border-yellow-400">
              <form onSubmit={handleAccessParticipant} className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                <label className="block">
                  <span className="text-sm font-bold text-blue-900">Código provisório</span>
                  <input
                    value={accessCode}
                    onChange={(event) => setAccessCode(event.target.value)}
                    className="mt-1 w-full rounded-lg border-2 border-yellow-300 px-4 py-3 text-gray-900 focus:border-blue-900 focus:outline-none"
                    placeholder="BOLAO-2026-1234"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-blue-900">WhatsApp</span>
                  <input
                    value={accessWhatsApp}
                    onChange={(event) => setAccessWhatsApp(event.target.value)}
                    className="mt-1 w-full rounded-lg border-2 border-yellow-300 px-4 py-3 text-gray-900 focus:border-blue-900 focus:outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </label>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold px-6 py-6 rounded-lg">
                  Entrar
                </Button>
              </form>

              {accessStatus === "found" && activeParticipant && (
                <div className="mt-6 rounded-lg bg-green-50 border-2 border-green-200 p-4">
                  <p className="font-bold text-green-800">
                    {activeParticipant.name}, encontramos sua participação.
                  </p>
                  <p className="text-green-700">
                    Você já preencheu {predictedCount} de {worldCupMatches.length} jogos ({progressPercentage}%).
                  </p>
                </div>
              )}

              {accessStatus === "not-found" && (
                <div className="mt-6 rounded-lg bg-red-50 border-2 border-red-200 p-4">
                  <p className="font-bold text-red-800">Não encontramos essa combinação.</p>
                  <p className="text-red-700">
                    Confira o código/WhatsApp ou registre sua doação abaixo para criar sua participação.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Registro de Doação */}
      <section id="doacao" className="py-20 bg-gradient-to-b from-red-50 to-white">
        <div className="container">
          <h2 className="font-display text-4xl text-blue-900 mb-4 text-center">Registre sua Doação</h2>
          <p className="text-gray-600 text-center mb-12 text-lg max-w-2xl mx-auto">
            Escolha o tipo de doação e receba seu voucher de desconto na HM Bazar e Conveniência
          </p>

          {donationStep === "select" && (
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              {donationTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => {
                    setSelectedDonation(type.id);
                    setDonationStep("confirm");
                  }}
                  className={`p-8 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 border-4 ${
                    selectedDonation === type.id
                      ? "bg-red-100 border-red-600 shadow-lg"
                      : "bg-white border-yellow-400 hover:border-red-400"
                  }`}
                >
                  <div className="text-6xl mb-4 text-center">{type.icon}</div>
                  <h3 className="font-display text-lg text-blue-900 mb-2 text-center">{type.label}</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">{type.description}</p>
                  <div className="bg-yellow-100 rounded-lg p-3 text-center">
                    <p className="font-bold text-yellow-700 text-lg">{type.discount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {donationStep === "confirm" && selectedDonation && (
            <form onSubmit={handlePrepareParticipation} className="max-w-2xl mx-auto bg-white border-4 border-yellow-400 rounded-lg p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">
                  {selectedDonationType?.icon}
                </div>
                <h3 className="font-display text-2xl text-blue-900 mb-2">
                  {selectedDonationType?.label}
                </h3>
                <p className="text-gray-600">
                  {selectedDonationType?.description}
                </p>
              </div>

              <div className="bg-yellow-50 border-4 border-yellow-400 rounded-lg p-6 mb-8">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 font-semibold mb-2">SEU VOUCHER DE DESCONTO</p>
                  <p className="font-display text-4xl text-yellow-600">
                    {selectedDonationType?.discount}
                  </p>
                </div>
                <p className="text-center text-gray-700 text-sm">
                  Código: <span className="font-bold">{selectedDonationType?.voucherCode}</span>
                </p>
              </div>

              <div className="mb-8 rounded-lg border-2 border-blue-200 bg-blue-50 p-5">
                <h4 className="font-display text-lg text-blue-900 mb-4">Dados para criar sua participação</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-blue-900">Nome completo</span>
                    <input
                      required
                      name="nome"
                      defaultValue={registrationData.name}
                      className="mt-1 w-full rounded-lg border-2 border-yellow-300 px-4 py-3 text-gray-900 focus:border-blue-900 focus:outline-none"
                      placeholder="Seu nome"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-blue-900">WhatsApp</span>
                    <input
                      required
                      name="whatsapp"
                      type="tel"
                      defaultValue={registrationData.whatsapp}
                      className="mt-1 w-full rounded-lg border-2 border-yellow-300 px-4 py-3 text-gray-900 focus:border-blue-900 focus:outline-none"
                      placeholder="(11) 99999-9999"
                    />
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="text-sm font-bold text-blue-900">Onde vai entregar a doação?</span>
                  <select
                    required
                    name="ponto_entrega"
                    defaultValue={registrationData.deliveryPoint}
                    className="mt-1 w-full rounded-lg border-2 border-yellow-300 px-4 py-3 text-gray-900 focus:border-blue-900 focus:outline-none"
                  >
                    <option value="">Selecione um ponto</option>
                    <option value={associationAddress}>{associationAddress}</option>
                    <option value={hmAddress}>{hmAddress}</option>
                  </select>
                </label>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
                <p className="text-gray-700 mb-4">
                  <strong>Depois deste passo:</strong>
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ O site gera seu código provisório de participação</li>
                  <li>✓ A mensagem para a HM já sai com nome, WhatsApp, doação e ponto de entrega</li>
                  <li>✓ Você registra seus palpites no site</li>
                  <li>✓ A organização valida a participação após receber a doação</li>
                  <li>✓ Use seu voucher de desconto nas próximas compras conforme o regulamento</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setDonationStep("select")}
                  type="button"
                  variant="outline"
                  className="flex-1 py-6 text-lg border-2 border-gray-300"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-lg py-6 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Gerar Código e Continuar
                </Button>
              </div>
            </form>
          )}

          {donationStep === "success" && generatedVoucher && (
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-yellow-50 border-4 border-green-500 rounded-lg p-8 text-center">
              <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-4" />
              <h3 className="font-display text-3xl text-green-700 mb-2">Mensagem pronta</h3>
              <p className="text-lg text-gray-700 mb-8">
                {participantName}, seu código foi gerado. Agora você pode avisar a HM pelo WhatsApp e registrar
                seus palpites no formulário abaixo. A participação só fica válida depois que a doação for recebida.
              </p>

              {/* Voucher Card */}
              <div className="bg-white border-4 border-yellow-400 rounded-lg p-8 mb-8 shadow-lg">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 font-semibold mb-3">SEU VOUCHER DE DESCONTO</p>
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 mb-4">
                    <p className="font-display text-4xl text-blue-900 mb-2">{generatedVoucher.discount}</p>
                    <p className="text-blue-900 font-bold text-lg">Código: {generatedVoucher.code}</p>
                  </div>
                  <button
                    onClick={() => handleCopyCode(generatedVoucher.code)}
                    className="flex items-center justify-center gap-2 mx-auto text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copiado!" : "Copiar código"}
                  </button>
                </div>

                <div className="border-t-2 border-yellow-200 pt-6">
                  <p className="text-sm text-gray-600 mb-2">CÓDIGO DE PARTICIPAÇÃO NO BOLÃO</p>
                  <p className="font-display text-3xl text-blue-900 mb-2">{generatedVoucher.participationCode}</p>
                  <button
                    onClick={() => handleCopyCode(generatedVoucher.participationCode)}
                    className="flex items-center justify-center gap-2 mx-auto text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copiado!" : "Copiar código"}
                  </button>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
                <p className="text-base text-gray-700 font-semibold mb-4">Resumo da sua participação:</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <p className="text-gray-700">
                      {participantName} • WhatsApp {participantWhatsApp}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <p className="text-gray-700">{participantDonationType}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <p className="text-gray-700">{participantDeliveryPoint}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() =>
                  openWhatsApp(
                    `Olá! Quero participar do Bolão Copa Solidário da HM Bazar em apoio à Associação Semeando Amor com a Tia Mônica.\n\nNome: ${participantName}\nWhatsApp: ${participantWhatsApp}\nDoação: ${
                      participantDonationType || "A combinar"
                    }\nVoucher: ${generatedVoucher.code} (${generatedVoucher.discount})\nCódigo provisório: ${
                      generatedVoucher.participationCode
                    }\nPonto de entrega escolhido: ${participantDeliveryPoint}\n\nVou entregar a doação e registrar meus palpites pelo site.`
                  )
                }
                className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-lg px-8 py-6 rounded-lg transition-all duration-200 hover:scale-105"
              >
                Enviar pelo WhatsApp
              </Button>

              <div id="palpite" className="mt-10 text-left bg-white border-4 border-blue-900 rounded-lg p-4 md:p-6">
                <div className="mb-6 rounded-lg bg-blue-50 border-2 border-blue-200 p-4 text-center">
                  <p className="font-display text-2xl text-blue-900">{predictedCount}/{worldCupMatches.length}</p>
                  <p className="text-sm font-bold text-gray-700">jogos com palpite preenchido</p>
                  <div className="mt-3 h-3 rounded-full bg-white border border-blue-100 overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Você pode salvar agora e voltar depois com WhatsApp + código para continuar.
                  </p>
                </div>

                <h4 className="font-display text-2xl text-blue-900 mb-2 text-center">
                  Registrar ou atualizar palpites
                </h4>
                <p className="text-gray-700 text-center mb-6">
                  Os jogos aparecem em ordem de data. Preencha só o que quiser agora; o restante fica pendente
                  para completar depois pela Área do Participante.
                </p>

                <div className="mb-6 grid gap-3 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 text-sm text-blue-950 md:grid-cols-4">
                  {[
                    "Abra uma data",
                    "Digite os placares",
                    "Salve os palpites",
                    "Volte depois com WhatsApp + código",
                  ].map((step, index) => (
                    <div key={step} className="flex items-start gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-yellow-300">
                        {index + 1}
                      </span>
                      <span className="pt-1 font-bold leading-tight">{step}</span>
                    </div>
                  ))}
                </div>

                <form name="palpite-bolao" method="POST" data-netlify="true" onSubmit={handleGuessSubmit} className="space-y-4">
                  <input type="hidden" name="form-name" value="palpite-bolao" />
                  <input type="hidden" name="bot-field" />
                  <input type="hidden" name="tipo_doacao" value={participantDonationType} />
                  <input type="hidden" name="codigo_provisorio" value={generatedVoucher.participationCode} />
                  <input type="hidden" name="voucher" value={`${generatedVoucher.code} - ${generatedVoucher.discount}`} />
                  <input type="hidden" name="nome" value={participantName} />
                  <input type="hidden" name="whatsapp" value={participantWhatsApp} />
                  <input type="hidden" name="ponto_entrega" value={participantDeliveryPoint} />

                  <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-sm text-gray-800">
                    <p className="font-bold text-green-800">Participação identificada</p>
                    <p>{participantName} • {participantWhatsApp}</p>
                    <p>{participantDeliveryPoint}</p>
                  </div>

                  <input type="hidden" name="palpites_jogos" value={serializedMatchPredictions} />

                  <div className="rounded-lg border-2 border-blue-900 overflow-hidden">
                    <div className="bg-blue-900 px-4 py-3">
                      <h5 className="font-display text-lg text-yellow-400">Jogos em ordem de data</h5>
                      <p className="text-sm text-blue-100">
                        Comece pelos primeiros jogos e avance no seu ritmo. Não precisa preencher tudo no mesmo dia.
                      </p>
                    </div>

                    <div className="divide-y divide-yellow-200">
                      {matchSections.map((section, index) => {
                        const sectionMatches = worldCupMatches.filter((match) => match.date === section.date);
                        const sectionPredictedCount = sectionMatches.filter((match) =>
                          hasCompletePrediction(matchPredictions[getMatchId(match.number)])
                        ).length;
                        return (
                          <details key={section.title} open={index === 0} className="group">
                            <summary className="flex cursor-pointer flex-col gap-1 bg-yellow-50 px-4 py-4 font-bold text-blue-900 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                              <span>{section.title}</span>
                              <span className="text-sm text-gray-600">
                                {sectionPredictedCount}/{section.count} preenchidos • {section.description}
                              </span>
                            </summary>
                            <div className="space-y-3 bg-white p-3 md:p-4">
                              {sectionMatches.map((match) => (
                                <div
                                  key={match.number}
                                  className="rounded-lg border-2 border-yellow-200 bg-white p-3 shadow-sm"
                                >
                                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-600">
                                    <span className="rounded-full bg-blue-900 px-2 py-1 text-yellow-300">
                                      Jogo {match.number}
                                    </span>
                                    <span>{match.date}</span>
                                    <span className="text-gray-400">•</span>
                                    <span>{match.venue}, {match.city}</span>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="grid grid-cols-[1fr_76px] items-center gap-3">
                                      <span className="min-w-0 rounded-lg bg-blue-50 px-3 py-3 font-bold text-blue-900">
                                        {match.home}
                                      </span>
                                      <input
                                        aria-label={`Jogo ${match.number} gols de ${match.home}`}
                                        inputMode="numeric"
                                        min={0}
                                        type="number"
                                        value={matchPredictions[getMatchId(match.number)]?.home || ""}
                                        onChange={(event) => updateMatchPrediction(getMatchId(match.number), "home", event.target.value)}
                                        className="h-12 w-full rounded-lg border-2 border-yellow-300 px-2 text-center text-xl font-bold text-gray-900 focus:border-blue-900 focus:outline-none"
                                        placeholder="0"
                                      />
                                    </label>

                                    <div className="text-center text-xs font-bold uppercase text-gray-400">x</div>

                                    <label className="grid grid-cols-[1fr_76px] items-center gap-3">
                                      <span className="min-w-0 rounded-lg bg-blue-50 px-3 py-3 font-bold text-blue-900">
                                        {match.away}
                                      </span>
                                      <input
                                        aria-label={`Jogo ${match.number} gols de ${match.away}`}
                                        inputMode="numeric"
                                        min={0}
                                        type="number"
                                        value={matchPredictions[getMatchId(match.number)]?.away || ""}
                                        onChange={(event) => updateMatchPrediction(getMatchId(match.number), "away", event.target.value)}
                                        className="h-12 w-full rounded-lg border-2 border-yellow-300 px-2 text-center text-xl font-bold text-gray-900 focus:border-blue-900 focus:outline-none"
                                        placeholder="0"
                                      />
                                    </label>
                                  </div>

                                  {matchPredictions[getMatchId(match.number)]?.home !== undefined &&
                                    matchPredictions[getMatchId(match.number)]?.away !== undefined &&
                                    matchPredictions[getMatchId(match.number)]?.home !== "" &&
                                    matchPredictions[getMatchId(match.number)]?.away !== "" && (
                                      <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-center text-sm font-bold text-green-700">
                                        Palpite: {match.home} {matchPredictions[getMatchId(match.number)]?.home} x{" "}
                                        {matchPredictions[getMatchId(match.number)]?.away} {match.away}
                                      </p>
                                    )}
                                </div>
                              ))}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-sm font-bold text-blue-900">Observações</span>
                    <textarea
                      name="observacoes"
                      rows={3}
                      className="mt-1 w-full rounded-lg border-2 border-yellow-300 px-4 py-3 text-gray-900 focus:border-blue-900 focus:outline-none"
                      placeholder="Alguma informação para a organização?"
                    />
                  </label>

                  <Button
                    type="submit"
                    disabled={guessStatus === "sending"}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-lg py-6 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    {guessStatus === "sending" ? "Salvando..." : "Salvar Palpites"}
                  </Button>

                  {guessStatus === "success" && (
                    <p className="text-center font-bold text-green-700">
                      Palpites salvos. Você pode voltar com seu WhatsApp e código para continuar depois.
                    </p>
                  )}
                  {guessStatus === "error" && (
                    <p className="text-center font-bold text-red-700">
                      Não foi possível enviar agora. Chame a HM no WhatsApp para registrar manualmente.
                    </p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pontuação */}
      <section className="py-20 bg-blue-900 relative overflow-hidden">
        {/* Diagonal Background */}
        <svg
          className="absolute top-0 left-0 w-full h-32 text-yellow-400 opacity-10"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0 L1200,60 L1200,0 Z" fill="currentColor" />
        </svg>

        <div className="container relative z-10">
          <h2 className="font-display text-4xl text-yellow-400 mb-4 text-center">Pontuação por Jogo</h2>
          <p className="text-yellow-200 text-center mb-12 text-lg max-w-3xl mx-auto">
            A pontuação será calculada a partir dos palpites de placar em cada partida. A organização confere
            os resultados oficiais e atualiza o ranking.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { score: "5 pts", title: "Placar exato", desc: "Acertou o resultado completo do jogo." },
              { score: "3 pts", title: "Resultado correto", desc: "Acertou vitória, empate ou derrota." },
              { score: "1 pt", title: "Gols de um lado", desc: "Acertou os gols de uma das equipes." },
            ].map((rule) => (
              <Card key={rule.title} className="p-6 bg-white/10 border-2 border-yellow-400/40 text-white">
                <p className="font-display text-3xl text-yellow-400 mb-2">{rule.score}</p>
                <h3 className="font-display text-lg mb-2">{rule.title}</h3>
                <p className="text-yellow-100">{rule.desc}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={() => document.getElementById("doacao")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-lg px-8 py-6 rounded-lg transition-all duration-200 hover:scale-105 active:scale-97"
            >
              Registrar Meus Palpites
            </Button>
          </div>
        </div>

        {/* Bottom Diagonal Cut */}
        <svg
          className="absolute bottom-0 left-0 w-full h-24 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,50 Q300,100 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor" />
        </svg>
      </section>

      {/* Prêmios */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="font-display text-4xl text-blue-900 mb-4 text-center">Prêmios Incríveis</h2>
          <p className="text-gray-600 text-center mb-12 text-lg">
            Os melhores colocados recebem prêmios definidos no regulamento e vouchers da HM Bazar
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {prizes.map((prize, idx) => (
              <div
                key={idx}
                className={`relative p-8 rounded-lg border-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-4 ${
                  idx === 0
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-600 md:scale-110"
                    : idx === 1
                      ? "bg-gradient-to-br from-gray-300 to-gray-400 border-gray-500"
                      : "bg-gradient-to-br from-orange-400 to-orange-500 border-orange-600"
                }`}
              >
                <div className="text-6xl mb-4 text-center">{prize.icon}</div>
                <h3 className="font-display text-2xl text-center mb-2 text-white">{prize.place}</h3>
                <p className="text-center font-bold text-white text-lg">{prize.prize}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulamento Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="font-display text-4xl text-blue-900 mb-12 text-center">Regulamento Inicial</h2>

          <Card className="border-4 border-yellow-400 overflow-hidden">
            <div className="bg-blue-900 text-white p-6">
              <div className="grid md:grid-cols-3 gap-4 font-display text-lg">
                <div>Etapa</div>
                <div>Como funciona</div>
                <div>Status</div>
              </div>
            </div>

            <div className="divide-y-2 divide-yellow-400">
              {[
                { step: "Doação", detail: "A participação começa com uma doação combinada com a organização.", status: "Obrigatória" },
                { step: "Palpite", detail: "O participante registra no site os placares dos jogos da Copa.", status: "No site" },
                { step: "Pontuação", detail: "Placar exato vale 5 pontos, resultado correto vale 3 e gols de um lado valem 1.", status: "Inicial" },
                { step: "Premiação", detail: "Os prêmios finais serão informados no regulamento oficial.", status: "A definir" },
              ].map((row) => (
                <div key={row.step} className="p-6 hover:bg-yellow-50 transition-colors">
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    <div className="font-display text-xl text-yellow-600">{row.step}</div>
                    <div className="font-semibold text-gray-900">{row.detail}</div>
                    <div className="font-display text-lg text-blue-900">{row.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Sobre a Campanha */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-pink-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-4xl text-blue-900 mb-8 text-center">
              Associação Semeando Amor com a Tia Mônica
            </h2>

            <div className="bg-white border-4 border-red-400 rounded-lg p-8 mb-8">
              <img
                src="/assets/semeando-logo.jpeg"
                alt="Logo Associação Semeando Amor com a Tia Mônica"
                className="w-32 h-32 rounded-full object-contain bg-white border-4 border-red-100 mx-auto mb-6"
              />
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                A Associação Semeando Amor com a Tia Mônica reúne doações e apoio da comunidade para ajudar
                quem precisa. A HM Bazar e Conveniência entra como ponto de divulgação, arrecadação e incentivo
                para quem participar do bolão solidário.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <Heart className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">Nossa Missão</h3>
                    <p className="text-gray-700">
                      Transformar o clima da Copa em ajuda prática para a Associação
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">Nossa Comunidade</h3>
                    <p className="text-gray-700">Clientes, amigos e familiares participando juntos</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="font-display text-lg text-blue-900 mb-4">Como Ajudar</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>📦 Doe alimentos não perecíveis</li>
                  <li>👕 Doe roupas em bom estado</li>
                  <li>🧸 Doe brinquedos para crianças</li>
                  <li>🤝 Seja voluntário em nossas ações</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promoção da Loja */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/foto-hm/hm-store-main.jpeg')",
            backgroundPosition: "center 42%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/70" />

        <div className="container relative z-10">
          <div className="max-w-2xl">
            <img
              src="/assets/hm-logo.jpeg"
              alt="Logo HM Bazar e Conveniência"
              className="w-32 h-32 rounded-xl object-contain bg-white border-4 border-yellow-400 mb-6"
            />
            <h2 className="font-display text-4xl md:text-5xl text-yellow-400 mb-6">
              HM Bazar e Conveniência
            </h2>
            <p className="text-xl text-white mb-8 leading-relaxed">
              A conveniência do bairro para o dia a dia. As doações podem ser entregues na HM Bazar ou direto
              na Associação Semeando Amor. Depois, chame no WhatsApp para confirmar sua participação.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <MapPin className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">Pontos de entrega</h3>
                  <p className="text-yellow-200">{hmAddress}</p>
                  <p className="text-yellow-200 mt-2">{associationAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">Contato</h3>
                  <p className="text-yellow-200">{hmWhatsApp}</p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => window.open(hmMapsUrl, "_blank", "noopener,noreferrer")}
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-lg px-8 py-6 rounded-lg transition-all duration-200 hover:scale-105 active:scale-97"
            >
              Visitar a Loja
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 border-t-4 border-yellow-400">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-display text-lg mb-4">Bolão Copa Solidário</h3>
              <p className="text-yellow-200">
                Promovido por HM Bazar e Conveniência em apoio à Associação Semeando Amor com a Tia Mônica.
                Doe, ganhe vouchers e participe do bolão!
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg mb-4">Informações</h3>
              <ul className="space-y-2 text-yellow-200">
                <li>
                  <a href="#doacao" className="hover:text-yellow-400 transition-colors">
                    Regulamento
                  </a>
                </li>
                <li>
                  <a href="#doacao" className="hover:text-yellow-400 transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href={hmWhatsAppUrl} target="_blank" rel="noreferrer" className="hover:text-yellow-400 transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg mb-4">Siga-nos</h3>
              <div className="flex gap-4">
                <a href={hmInstagramUrl} target="_blank" rel="noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  Instagram
                </a>
                <a href={hmWhatsAppUrl} target="_blank" rel="noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-yellow-400/30 pt-8 text-center text-yellow-200">
            <p>© 2026 HM Bazar e Conveniência | Associação Semeando Amor com a Tia Mônica</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
