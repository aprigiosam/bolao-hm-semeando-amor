import express from "express";
import { createServer } from "http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";

const databaseUrl = process.env.DATABASE_URL;

if (isProduction && !databaseUrl) {
  throw new Error("DATABASE_URL is required in production");
}

const pool = new Pool({
  connectionString: databaseUrl || "postgres://bolao:bolao_dev@localhost:5433/bolao_hm",
});

type MatchPredictionPayload = {
  matchId: number;
  homeScore: number;
  awayScore: number;
};

type AppError = Error & {
  status?: number;
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function requireText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function createError(status: number, message: string): AppError {
  const error = new Error(message) as AppError;
  error.status = status;
  return error;
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function requireAdmin(req: express.Request, _res: express.Response, next: express.NextFunction) {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    next(createError(503, "admin password is not configured"));
    return;
  }

  const authHeader = String(req.headers.authorization || "");
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  const headerPassword = String(req.headers["x-admin-password"] || "");
  const bodyPassword = typeof req.body?.adminPassword === "string" ? req.body.adminPassword : "";
  const candidate = bearerToken || headerPassword || bodyPassword;

  if (candidate !== configuredPassword) {
    next(createError(401, "invalid admin password"));
    return;
  }

  next();
}

async function runMigrations() {
  const initDir = path.resolve(__dirname, "..", "db", "init");
  const files = ["001_schema.sql", "002_seed_matches.sql", "003_admin_confirmation.sql"];

  for (const file of files) {
    const sql = await fs.readFile(path.join(initDir, file), "utf-8");
    await pool.query(sql);
  }
}

async function scoreMatch(matchId: number) {
  await pool.query(
    `
      insert into prediction_scores (
        prediction_id,
        points,
        exact_score,
        correct_result,
        home_goals_hit,
        away_goals_hit,
        calculated_at
      )
      select
        pr.id,
        calculate_prediction_score(pr.home_score, pr.away_score, r.home_score, r.away_score),
        pr.home_score = r.home_score and pr.away_score = r.away_score,
        sign(pr.home_score - pr.away_score) = sign(r.home_score - r.away_score),
        pr.home_score = r.home_score,
        pr.away_score = r.away_score,
        now()
      from predictions pr
      join results r on r.match_id = pr.match_id
      where pr.match_id = $1
      on conflict (prediction_id) do update set
        points = excluded.points,
        exact_score = excluded.exact_score,
        correct_result = excluded.correct_result,
        home_goals_hit = excluded.home_goals_hit,
        away_goals_hit = excluded.away_goals_hit,
        calculated_at = now()
    `,
    [matchId]
  );
}

async function recalculateScores() {
  await pool.query("delete from prediction_scores");
  await pool.query(
    `
      insert into prediction_scores (
        prediction_id,
        points,
        exact_score,
        correct_result,
        home_goals_hit,
        away_goals_hit,
        calculated_at
      )
      select
        pr.id,
        calculate_prediction_score(pr.home_score, pr.away_score, r.home_score, r.away_score),
        pr.home_score = r.home_score and pr.away_score = r.away_score,
        sign(pr.home_score - pr.away_score) = sign(r.home_score - r.away_score),
        pr.home_score = r.home_score,
        pr.away_score = r.away_score,
        now()
      from predictions pr
      join results r on r.match_id = pr.match_id
    `
  );
}

async function startServer() {
  await runMigrations();

  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", async (_req, res, next) => {
    try {
      const result = await pool.query("select now() as now");
      res.json({ ok: true, now: result.rows[0].now });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/matches", async (_req, res, next) => {
    try {
      const result = await pool.query(`
        select
          m.id,
          m.phase,
          m.match_date,
          m.home_team,
          m.away_team,
          m.venue,
          m.city,
          m.locked_at,
          r.home_score as result_home_score,
          r.away_score as result_away_score,
          r.finished_at
        from matches m
        left join results r on r.match_id = m.id
        order by m.id
      `);
      res.json({ matches: result.rows });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/ranking", async (_req, res, next) => {
    try {
      const result = await pool.query("select * from participant_ranking limit 100");
      res.json({ ranking: result.rows });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/participants", async (req, res, next) => {
    try {
      const {
        code,
        fullName,
        whatsapp,
        donationType,
        deliveryPoint,
        voucherCode,
        voucherDiscount,
      } = req.body || {};

      if (
        !requireText(code) ||
        !requireText(fullName) ||
        !requireText(whatsapp) ||
        !requireText(donationType) ||
        !requireText(deliveryPoint)
      ) {
        throw createError(400, "missing required participant fields");
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
          String(voucherCode || "").trim(),
          String(voucherDiscount || "").trim(),
        ]
      );

      res.status(201).json({ participant: result.rows[0] });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/participants/access", async (req, res, next) => {
    try {
      const code = String(req.query.code || "").trim().toUpperCase();
      const whatsapp = normalizePhone(String(req.query.whatsapp || ""));

      if (!code || !whatsapp) {
        throw createError(400, "code and whatsapp are required");
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
        throw createError(404, "participant not found");
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
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/participants/:participantId/predictions", async (req, res, next) => {
    const participantId = req.params.participantId;
    const predictions = (req.body?.predictions || []) as MatchPredictionPayload[];

    try {
      if (!Array.isArray(predictions)) {
        throw createError(400, "predictions must be an array");
      }

      const participantResult = await pool.query("select id from participants where id = $1", [participantId]);
      if (participantResult.rowCount === 0) {
        throw createError(404, "participant not found");
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
            [participantId, prediction.matchId, prediction.homeScore, prediction.awayScore]
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
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/login", (req, res, next) => {
    try {
      const configuredPassword = getAdminPassword();
      if (!configuredPassword) {
        throw createError(503, "admin password is not configured");
      }

      if (String(req.body?.password || "") !== configuredPassword) {
        throw createError(401, "invalid admin password");
      }

      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/participants", requireAdmin, async (req, res, next) => {
    try {
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
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/participants/:participantId/confirm-donation", requireAdmin, async (req, res, next) => {
    try {
      const participantId = req.params.participantId;
      const receivedBy = String(req.body?.receivedBy || "HM Bazar").trim();
      const notes = String(req.body?.notes || "").trim();

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
        throw createError(404, "participant not found");
      }

      res.json({ participant: result.rows[0] });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/results", requireAdmin, async (req, res, next) => {
    try {
      const matchId = Number(req.body?.matchId);
      const homeScore = Number(req.body?.homeScore);
      const awayScore = Number(req.body?.awayScore);

      if (!isNonNegativeInteger(matchId) || !isNonNegativeInteger(homeScore) || !isNonNegativeInteger(awayScore)) {
        throw createError(400, "matchId, homeScore and awayScore must be non-negative integers");
      }

      const result = await pool.query(
        `
          insert into results (match_id, home_score, away_score, finished_at)
          values ($1, $2, $3, now())
          on conflict (match_id) do update set
            home_score = excluded.home_score,
            away_score = excluded.away_score,
            finished_at = now()
          returning *
        `,
        [matchId, homeScore, awayScore]
      );

      await scoreMatch(matchId);

      res.json({ result: result.rows[0] });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/recalculate-scores", requireAdmin, async (_req, res, next) => {
    try {
      await recalculateScores();
      const count = await pool.query("select count(*)::integer as count from prediction_scores");
      res.json({ ok: true, scoredPredictions: count.rows[0].count });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/ranking", requireAdmin, async (_req, res, next) => {
    try {
      const result = await pool.query("select * from participant_ranking limit 200");
      res.json({ ranking: result.rows });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api", (_req, _res, next) => {
    next(createError(404, "api route not found"));
  });

  app.use((error: AppError, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = error.status || 500;
    if (status >= 500) {
      console.error(error);
    }

    res.status(status).json({
      error: status >= 500 ? "internal server error" : error.message,
    });
  });

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
