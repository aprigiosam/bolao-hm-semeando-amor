import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl =
  process.env.DATABASE_URL || "postgres://bolao:bolao_dev@localhost:5433/bolao_hm";

const pool = new Pool({
  connectionString: databaseUrl,
});

type MatchPredictionPayload = {
  matchId: number;
  homeScore: number;
  awayScore: number;
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", async (_req, res) => {
    const result = await pool.query("select now() as now");
    res.json({ ok: true, now: result.rows[0].now });
  });

  app.get("/api/matches", async (_req, res) => {
    const result = await pool.query(`
      select
        id,
        phase,
        match_date,
        home_team,
        away_team,
        venue,
        city,
        locked_at
      from matches
      order by id
    `);
    res.json({ matches: result.rows });
  });

  app.get("/api/ranking", async (_req, res) => {
    const result = await pool.query("select * from participant_ranking limit 100");
    res.json({ ranking: result.rows });
  });

  app.get("/api/admin/participants", async (req, res) => {
    const status = String(req.query.status || "all");
    const search = String(req.query.search || "").trim();

    const filters: string[] = [];
    const params: string[] = [];

    if (status === "pending") {
      filters.push("p.donation_confirmed = false");
    }

    if (status === "confirmed") {
      filters.push("p.donation_confirmed = true");
    }

    if (search) {
      params.push(`%${search}%`);
      filters.push(
        `(p.code ilike $${params.length} or p.full_name ilike $${params.length} or p.whatsapp ilike $${params.length})`
      );
    }

    const whereClause = filters.length ? `where ${filters.join(" and ")}` : "";
    const result = await pool.query(
      `
        select
          p.*,
          count(pr.id)::integer as predicted_matches
        from participants p
        left join predictions pr on pr.participant_id = p.id
        ${whereClause}
        group by p.id
        order by p.donation_confirmed asc, p.created_at desc
      `,
      params
    );

    res.json({ participants: result.rows });
  });

  app.get("/api/participants/access", async (req, res) => {
    const code = String(req.query.code || "").trim().toUpperCase();
    const whatsapp = normalizePhone(String(req.query.whatsapp || ""));

    if (!code || !whatsapp) {
      res.status(400).json({ error: "code and whatsapp are required" });
      return;
    }

    const participantResult = await pool.query(
      `
        select *
        from participants
        where upper(code) = $1 and regexp_replace(whatsapp, '\\D', '', 'g') = $2
        limit 1
      `,
      [code, whatsapp]
    );

    if (participantResult.rowCount === 0) {
      res.status(404).json({ error: "participant not found" });
      return;
    }

    const participant = participantResult.rows[0];
    const predictionsResult = await pool.query(
      `
        select match_id, home_score, away_score
        from predictions
        where participant_id = $1
        order by match_id
      `,
      [participant.id]
    );

    res.json({
      participant,
      predictions: predictionsResult.rows,
    });
  });

  app.post("/api/participants", async (req, res) => {
    const {
      code,
      fullName,
      whatsapp,
      donationType,
      deliveryPoint,
      voucherCode,
      voucherDiscount,
    } = req.body || {};

    if (!code || !fullName || !whatsapp || !donationType || !deliveryPoint || !voucherCode) {
      res.status(400).json({ error: "missing required fields" });
      return;
    }

    const result = await pool.query(
      `
        insert into participants (
          code,
          full_name,
          whatsapp,
          donation_type,
          delivery_point,
          voucher_code,
          voucher_discount
        )
        values ($1, $2, $3, $4, $5, $6, $7)
        on conflict (code) do update set
          full_name = excluded.full_name,
          whatsapp = excluded.whatsapp,
          donation_type = excluded.donation_type,
          delivery_point = excluded.delivery_point,
          voucher_code = excluded.voucher_code,
          voucher_discount = excluded.voucher_discount
        returning *
      `,
      [
        String(code).trim().toUpperCase(),
        String(fullName).trim(),
        String(whatsapp).trim(),
        String(donationType).trim(),
        String(deliveryPoint).trim(),
        String(voucherCode).trim(),
        String(voucherDiscount || "").trim(),
      ]
    );

    res.status(201).json({ participant: result.rows[0] });
  });

  app.put("/api/participants/:participantId/predictions", async (req, res) => {
    const participantId = req.params.participantId;
    const predictions = (req.body?.predictions || []) as MatchPredictionPayload[];

    if (!Array.isArray(predictions)) {
      res.status(400).json({ error: "predictions must be an array" });
      return;
    }

    const validPredictions = predictions.filter(
      (prediction) =>
        isNonNegativeInteger(prediction.matchId) &&
        isNonNegativeInteger(prediction.homeScore) &&
        isNonNegativeInteger(prediction.awayScore)
    );

    await pool.query("begin");
    try {
      for (const prediction of validPredictions) {
        await pool.query(
          `
            insert into predictions (participant_id, match_id, home_score, away_score)
            values ($1, $2, $3, $4)
            on conflict (participant_id, match_id) do update set
              home_score = excluded.home_score,
              away_score = excluded.away_score
          `,
          [
            participantId,
            prediction.matchId,
            prediction.homeScore,
            prediction.awayScore,
          ]
        );
      }
      await pool.query("commit");
    } catch (error) {
      await pool.query("rollback");
      throw error;
    }

    const result = await pool.query(
      `
        select match_id, home_score, away_score
        from predictions
        where participant_id = $1
        order by match_id
      `,
      [participantId]
    );

    res.json({ predictions: result.rows });
  });

  app.post("/api/admin/participants/:participantId/confirm-donation", async (req, res) => {
    const participantId = req.params.participantId;
    const receivedBy = String(req.body?.receivedBy || "").trim();
    const notes = String(req.body?.notes || "").trim();

    if (!receivedBy) {
      res.status(400).json({ error: "receivedBy is required" });
      return;
    }

    const result = await pool.query(
      `
        update participants
        set
          donation_confirmed = true,
          donation_confirmed_at = now(),
          donation_received_by = $2,
          donation_notes = $3
        where id = $1
        returning *
      `,
      [participantId, receivedBy, notes]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "participant not found" });
      return;
    }

    res.json({ participant: result.rows[0] });
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = Number(process.env.PORT || 4000);
  const host = process.env.HOST || "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
