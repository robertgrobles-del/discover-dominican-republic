import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "public",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware for JWT Verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// Optional auth middleware (doesn't fail if not logged in)
const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

// ─── AUTHENTICATION ENDPOINTS ──────────────────────────────────────────────

app.post("/api/auth/register", async (req, res) => {
  const { email, password, display_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    // Check if email already exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Insert user and profile inside a transaction
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
        [userId, email, passwordHash]
      );
      await conn.query(
        "INSERT INTO profiles (id, display_name, travel_interests) VALUES (?, ?, ?)",
        [userId, display_name || "Explorador", JSON.stringify([])]
      );
      await conn.query(
        "INSERT INTO user_gamification (user_id, total_xp, coins, current_level, streak_days) VALUES (?, 0, 0, 1, 0)",
        [userId]
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.json({ token, user: { id: userId, email, display_name } });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const [profiles] = await pool.query("SELECT display_name FROM profiles WHERE id = ?", [user.id]);
    const displayName = profiles[0]?.display_name || "Explorador";

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, display_name: displayName } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const [profiles] = await pool.query("SELECT display_name, avatar_url FROM profiles WHERE id = ?", [req.user.id]);
    res.json({ id: req.user.id, email: req.user.email, display_name: profiles[0]?.display_name || "Explorador" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── QUERY BUILDER ENDPOINT (/api/query) ────────────────────────────────────

// Resolves the FK column pair between two tables (from -> to), reading the
// real constraints so embedded-relation selects (Supabase's `table(cols)`
// syntax) don't have to guess column-naming conventions. Cached because the
// schema doesn't change while the process is running.
const fkCache = new Map();
async function getForeignKey(fromTable, toTable) {
  const key = `${fromTable}=>${toTable}`;
  if (fkCache.has(key)) return fkCache.get(key);
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME, REFERENCED_COLUMN_NAME
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME = ?
     LIMIT 1`,
    [fromTable, toTable]
  );
  const result = rows[0] ? { column: rows[0].COLUMN_NAME, refColumn: rows[0].REFERENCED_COLUMN_NAME } : null;
  fkCache.set(key, result);
  return result;
}

// Splits a Supabase-style select spec ("id, name, destinations(name, slug)")
// into plain columns and embedded-relation nodes, recursively.
function parseSelectSpec(str) {
  const items = [];
  let depth = 0;
  let current = "";
  for (const ch of str) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      items.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) items.push(current);

  return items.map((raw) => {
    const token = raw.trim().replace(/\s+/g, " ");
    const m = token.match(/^(\w+)\s*\((.*)\)$/s);
    if (m) {
      return { type: "embed", table: m[1], children: parseSelectSpec(m[2]) };
    }
    return { type: "col", name: token };
  });
}

// Recursively builds SELECT/JOIN fragments for a select spec. `outputPrefix`
// is the dotted path ("" at the root) used to alias embedded columns so the
// flat SQL row can be unflattened back into nested objects afterwards.
async function buildEmbeddedQuery(mainTable, sqlAlias, outputPrefix, spec) {
  const selectParts = [];
  const joinParts = [];

  for (const item of spec) {
    if (item.type === "col") {
      if (item.name === "*") {
        selectParts.push(outputPrefix ? `\`${sqlAlias}\`.* ` : `\`${sqlAlias}\`.*`);
      } else if (outputPrefix) {
        selectParts.push(`\`${sqlAlias}\`.\`${item.name}\` AS \`${outputPrefix}.${item.name}\``);
      } else {
        selectParts.push(`\`${sqlAlias}\`.\`${item.name}\` AS \`${item.name}\``);
      }
    } else {
      const fk = await getForeignKey(mainTable, item.table);
      if (!fk) continue; // no known relation -> silently drop the embed
      const childAlias = `${sqlAlias}__${item.table}`;
      const childPrefix = outputPrefix ? `${outputPrefix}.${item.table}` : item.table;
      joinParts.push(
        `LEFT JOIN \`${item.table}\` AS \`${childAlias}\` ON \`${sqlAlias}\`.\`${fk.column}\` = \`${childAlias}\`.\`${fk.refColumn}\``
      );
      const nested = await buildEmbeddedQuery(item.table, childAlias, childPrefix, item.children);
      selectParts.push(...nested.selectParts);
      joinParts.push(...nested.joinParts);
    }
  }

  return { selectParts, joinParts };
}

// Reshapes a flat SQL row (with dotted-path aliases like "destinations.name")
// back into nested objects, mirroring how Supabase returns embedded relations.
function unflattenRow(row) {
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    if (!key.includes(".")) {
      result[key] = value;
      continue;
    }
    const parts = key.split(".");
    let obj = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof obj[parts[i]] !== "object" || obj[parts[i]] === null) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
  }
  return result;
}

app.post("/api/query", optionalAuthenticateToken, async (req, res) => {
  const { table, action, columns, filters, order, limit, data, single, maybeSingle } = req.body;

  // Stripping "public." prefix if it was included in the request
  const sanitizedTable = table.replace(/^public\./, "");

  try {
    if (action === "select") {
      let queryParams = [];
      let sql = "";

      // Supabase-style embedded relations ("id, name, destinations(name)")
      // need joins; plain column lists take the simple, unqualified path.
      const hasEmbed = typeof columns === "string" && columns.includes("(");
      const mainAlias = "t0";

      if (hasEmbed) {
        const spec = parseSelectSpec(columns);
        const { selectParts, joinParts } = await buildEmbeddedQuery(sanitizedTable, mainAlias, "", spec);
        sql = `SELECT ${selectParts.join(", ")} FROM \`${sanitizedTable}\` AS \`${mainAlias}\` ${joinParts.join(" ")}`;
      } else {
        const selectCols = columns === "*" || !columns ? "*" : Array.isArray(columns) ? columns.map(c => `\`${c}\``).join(", ") : columns;
        sql = `SELECT ${selectCols} FROM \`${sanitizedTable}\``;
      }

      // Append filters
      if (filters && filters.length > 0) {
        const whereClauses = [];
        const col = (name) => hasEmbed ? `\`${mainAlias}\`.\`${name}\`` : `\`${name}\``;
        for (const f of filters) {
          if (f.type === "eq") {
            whereClauses.push(`${col(f.column)} = ?`);
            queryParams.push(f.value);
          } else if (f.type === "neq") {
            whereClauses.push(`${col(f.column)} != ?`);
            queryParams.push(f.value);
          } else if (f.type === "gt") {
            whereClauses.push(`${col(f.column)} > ?`);
            queryParams.push(f.value);
          } else if (f.type === "lt") {
            whereClauses.push(`${col(f.column)} < ?`);
            queryParams.push(f.value);
          } else if (f.type === "gte") {
            whereClauses.push(`${col(f.column)} >= ?`);
            queryParams.push(f.value);
          } else if (f.type === "lte") {
            whereClauses.push(`${col(f.column)} <= ?`);
            queryParams.push(f.value);
          } else if (f.type === "like") {
            whereClauses.push(`${col(f.column)} LIKE ?`);
            queryParams.push(f.value);
          } else if (f.type === "ilike") {
            whereClauses.push(`LOWER(${col(f.column)}) LIKE LOWER(?)`);
            queryParams.push(f.value);
          } else if (f.type === "is" && f.value === null) {
            whereClauses.push(`${col(f.column)} IS NULL`);
          } else if (f.type === "is" && f.value === "not.null") {
            whereClauses.push(`${col(f.column)} IS NOT NULL`);
          } else if (f.type === "in") {
            if (Array.isArray(f.value) && f.value.length > 0) {
              const placeholders = f.value.map(() => "?").join(", ");
              whereClauses.push(`${col(f.column)} IN (${placeholders})`);
              queryParams.push(...f.value);
            } else {
              whereClauses.push("1 = 0");
            }
          }
        }
        if (whereClauses.length > 0) {
          sql += " WHERE " + whereClauses.join(" AND ");
        }
      }

      // Append order
      if (order && order.length > 0) {
        const orderClauses = order.map(o => hasEmbed
          ? `\`${mainAlias}\`.\`${o.column}\` ${o.ascending ? "ASC" : "DESC"}`
          : `\`${o.column}\` ${o.ascending ? "ASC" : "DESC"}`);
        sql += " ORDER BY " + orderClauses.join(", ");
      }

      // Append limit
      if (limit) {
        sql += " LIMIT ?";
        queryParams.push(limit);
      }

      const [rows] = await pool.query(sql, queryParams);

      // Structure nested objects for any embedded-relation columns
      let formattedRows = rows.map(row => unflattenRow(row));

      // Parse JSON fields
      formattedRows = formattedRows.map(row => {
        const item = { ...row };
        for (const key in item) {
          if (typeof item[key] === "string" && (item[key].startsWith("[") || item[key].startsWith("{"))) {
            try {
              item[key] = JSON.parse(item[key]);
            } catch (e) {}
          }
        }
        return item;
      });

      if (single || maybeSingle) {
        return res.json({ data: formattedRows[0] || null, error: null });
      }

      return res.json({ data: formattedRows, error: null });
    }

    if (action === "insert") {
      const PUBLIC_INSERT_TABLES = ["analytics_events"];
      if (!req.user && !PUBLIC_INSERT_TABLES.includes(sanitizedTable)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const records = Array.isArray(data) ? data : [data];
      const inserted = [];

      for (const rec of records) {
        const columnsList = Object.keys(rec).map(c => `\`${c}\``).join(", ");
        const placeholders = Object.keys(rec).map(() => "?").join(", ");
        const values = Object.values(rec).map(v => typeof v === "object" ? JSON.stringify(v) : v);

        const sql = `INSERT INTO \`${sanitizedTable}\` (${columnsList}) VALUES (${placeholders})`;
        await pool.query(sql, values);
        inserted.push(rec);
      }

      return res.json({ data: single ? inserted[0] : inserted, error: null });
    }

    if (action === "update") {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const setClauses = Object.keys(data).map(c => `\`${c}\` = ?`).join(", ");
      const values = Object.values(data).map(v => typeof v === "object" ? JSON.stringify(v) : v);
      let sql = `UPDATE \`${sanitizedTable}\` SET ${setClauses}`;

      let queryParams = [...values];

      // Append filters
      if (filters && filters.length > 0) {
        const whereClauses = [];
        for (const f of filters) {
          if (f.type === "eq") {
            whereClauses.push(`\`${f.column}\` = ?`);
            queryParams.push(f.value);
          }
        }
        if (whereClauses.length > 0) {
          sql += " WHERE " + whereClauses.join(" AND ");
        }
      }

      await pool.query(sql, queryParams);
      return res.json({ data, error: null });
    }

    if (action === "delete") {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      let sql = `DELETE FROM \`${sanitizedTable}\``;
      let queryParams = [];

      if (filters && filters.length > 0) {
        const whereClauses = [];
        for (const f of filters) {
          if (f.type === "eq") {
            whereClauses.push(`\`${f.column}\` = ?`);
            queryParams.push(f.value);
          }
        }
        if (whereClauses.length > 0) {
          sql += " WHERE " + whereClauses.join(" AND ");
        }
      }

      await pool.query(sql, queryParams);
      return res.json({ data: null, error: null });
    }

    return res.status(400).json({ error: "Unsupported query action" });
  } catch (error) {
    console.error(`Error querying table ${sanitizedTable}:`, error);
    res.status(500).json({ error: error.message || "Database query failed" });
  }
});

// ─── STORED PROCEDURES / RPC EXECUTORS ──────────────────────────────────────

// Helper function to award XP (translated from public.award_user_xp postgres function)
async function awardUserXp(conn, userId, xpToAward, coinsToAward, description, sourceType, sourceId) {
  // Ensure profile gamification exists
  await conn.query(
    "INSERT INTO user_gamification (user_id, total_xp, coins, current_level, streak_days) VALUES (?, 0, 0, 1, 0) ON DUPLICATE KEY UPDATE user_id=user_id",
    [userId]
  );

  // Get current gamification values
  const [gam] = await conn.query(
    "SELECT total_xp, coins, current_level, total_missions_completed FROM user_gamification WHERE user_id = ?",
    [userId]
  );
  const current = gam[0];

  const newXp = current.total_xp + xpToAward;
  const newCoins = current.coins + coinsToAward;
  let nextLvl = current.current_level;

  // Determine next level
  const [lvls] = await conn.query(
    "SELECT level_number FROM gamification_levels WHERE ? >= xp_required ORDER BY level_number DESC LIMIT 1",
    [newXp]
  );
  if (lvls.length > 0) {
    nextLvl = lvls[0].level_number;
  }

  const missionCountOffset = sourceType === "mission" ? 1 : 0;

  // Update gamification stats
  await conn.query(
    `UPDATE user_gamification 
     SET total_xp = ?, coins = ?, current_level = ?, total_missions_completed = total_missions_completed + ?, last_activity_date = CURRENT_DATE 
     WHERE user_id = ?`,
    [newXp, newCoins, nextLvl, missionCountOffset, userId]
  );

  // Log transaction
  await conn.query(
    `INSERT INTO gamification_transactions (id, user_id, transaction_type, xp_amount, coin_amount, description, source_type, source_id)
     VALUES (?, ?, 'earn', ?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), userId, xpToAward, coinsToAward, description, sourceType, sourceId]
  );

  return { newXp, newCoins, nextLvl };
}

app.post("/api/auth/update-password", authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function isAdminUser(conn, userId) {
  const [profiles] = await conn.query("SELECT role FROM profiles WHERE id = ?", [userId]);
  return profiles[0]?.role === "admin";
}

app.post("/api/rpc/:name", optionalAuthenticateToken, async (req, res) => {
  const { name } = req.params;
  const { 
    xp_to_award, coins_to_award, xp_description, source_type, source_id, target_achievement_id,
    ref_code, purchase_amount, buyer_email, p_post_id, p_content, p_province, target_prize_id,
    p_submission_id, p_limit, p_user_id, p_new_role, p_suspended, p_reason, p_xp_amount,
    p_coin_amount, p_operator_id, p_type, p_verified, p_notes, _user_id, _role
  } = req.body;

  const userId = req.user?.id;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    if (name === "award_user_xp") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const result = await awardUserXp(
        conn, userId, xp_to_award, coins_to_award, xp_description, source_type, source_id
      );
      await conn.commit();
      return res.json({ data: result, error: null });
    }

    if (name === "perform_daily_checkin") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const today = new Date().toISOString().split("T")[0];

      // Ensure stats profile exists
      await conn.query(
        "INSERT INTO user_gamification (user_id, total_xp, coins, current_level, streak_days) VALUES (?, 0, 0, 1, 0) ON DUPLICATE KEY UPDATE user_id=user_id",
        [userId]
      );

      const [gam] = await conn.query(
        "SELECT last_activity_date, streak_days FROM user_gamification WHERE user_id = ?",
        [userId]
      );
      const profile = gam[0];

      const lastAct = profile.last_activity_date ? new Date(profile.last_activity_date).toISOString().split("T")[0] : null;

      if (lastAct === today) {
        await conn.rollback();
        return res.json({ data: { success: false, message: "Ya has realizado check-in hoy." }, error: null });
      }

      // Calculate streak
      let newStreak = 1;
      if (lastAct) {
        const diffTime = Math.abs(new Date(today) - new Date(lastAct));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak = profile.streak_days + 1;
        }
      }

      const xpBonus = 10 + (newStreak * 2);
      const coinBonus = 5 + newStreak;

      await awardUserXp(conn, userId, xpBonus, coinBonus, `Check-in diario (racha: ${newStreak} días)`, "daily_checkin", null);

      await conn.query(
        "UPDATE user_gamification SET streak_days = ?, last_activity_date = ? WHERE user_id = ?",
        [newStreak, today, userId]
      );

      await conn.commit();
      return res.json({
        data: {
          success: true,
          xp_awarded: xpBonus,
          coins_awarded: coinBonus,
          streak_days: newStreak
        },
        error: null
      });
    }

    if (name === "perform_early_bird_bonus") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const now = new Date();
      const santoDomingoHour = new Date(now.toLocaleString("en-US", { timeZone: "America/Santo_Domingo" })).getHours();
      const today = now.toISOString().split("T")[0];

      if (santoDomingoHour < 5 || santoDomingoHour >= 9) {
        await conn.rollback();
        return res.json({ data: { success: false, reason: "not_early_bird_hours" }, error: null });
      }

      const [flag] = await conn.query(
        "SELECT value FROM user_flags WHERE user_id = ? AND flag_name = 'early_bird_date'",
        [userId]
      );

      if (flag.length > 0 && flag[0].value === today) {
        await conn.rollback();
        return res.json({ data: { success: false, reason: "already_claimed" }, error: null });
      }

      await awardUserXp(conn, userId, 20, 5, "🐦 Bono Madrugador (Early Bird)", "early_bird", null);

      await conn.query(
        `INSERT INTO user_flags (id, user_id, flag_name, value) 
         VALUES (?, ?, 'early_bird_date', ?) 
         ON DUPLICATE KEY UPDATE value = ?, updated_at = CURRENT_TIMESTAMP`,
        [crypto.randomUUID(), userId, today, today]
      );

      await conn.commit();
      return res.json({ data: { success: true, xp_awarded: 20 }, error: null });
    }

    if (name === "check_and_award_streak_bonus") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const [gam] = await conn.query("SELECT streak_days FROM user_gamification WHERE user_id = ?", [userId]);
      const streak = gam[0]?.streak_days || 0;

      if (![7, 14, 21, 30].includes(streak)) {
        await conn.rollback();
        return res.json({ data: { success: false, reason: "no_milestone" }, error: null });
      }

      const flagName = `streak_bonus_${streak}`;
      const [flag] = await conn.query("SELECT value FROM user_flags WHERE user_id = ? AND flag_name = ?", [userId, flagName]);

      if (flag.length > 0) {
        await conn.rollback();
        return res.json({ data: { success: false, reason: "already_awarded" }, error: null });
      }

      const bonus = streak === 7 ? 100 : streak === 14 ? 200 : streak === 21 ? 300 : 500;

      await awardUserXp(conn, userId, bonus, bonus / 5, `🔥 Bono de racha de ${streak} días`, "streak_bonus", null);

      await conn.query(
        `INSERT INTO user_flags (id, user_id, flag_name, value) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP) 
         ON DUPLICATE KEY UPDATE value = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`,
        [crypto.randomUUID(), userId, flagName]
      );

      await conn.commit();
      return res.json({ data: { success: true, xp_awarded: bonus, streak }, error: null });
    }

    if (name === "check_xp_milestones") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const [gam] = await conn.query("SELECT total_xp FROM user_gamification WHERE user_id = ?", [userId]);
      const totalXp = gam[0]?.total_xp || 0;

      const [milestones] = await conn.query(
        `SELECT m.* FROM xp_milestones m 
         WHERE m.xp_threshold <= ? 
           AND NOT EXISTS (
             SELECT 1 FROM user_xp_milestones um 
             WHERE um.user_id = ? AND um.milestone_id = m.id
           )`,
        [totalXp, userId]
      );

      const awarded = [];
      for (const m of milestones) {
        await conn.query(
          "INSERT INTO user_xp_milestones (id, user_id, milestone_id) VALUES (?, ?, ?)",
          [crypto.randomUUID(), userId, m.id]
        );
        await conn.query(
          "UPDATE user_gamification SET coins = coins + ? WHERE user_id = ?",
          [m.coin_reward, userId]
        );
        awarded.push({
          badge_icon: m.badge_icon,
          badge_name: m.badge_name,
          xp_threshold: m.xp_threshold,
          coins: m.coin_reward
        });
      }

      await conn.commit();
      return res.json({ data: awarded, error: null });
    }

    if (name === "unlock_user_achievement") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const [existing] = await conn.query(
        "SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?",
        [userId, target_achievement_id]
      );

      if (existing.length > 0) {
        await conn.rollback();
        return res.json({ data: { unlocked: false, message: "Logro ya desbloqueado" }, error: null });
      }

      const [ach] = await conn.query("SELECT name, xp_reward, coin_reward FROM achievements WHERE id = ?", [target_achievement_id]);
      const achievement = ach[0];

      await conn.query(
        "INSERT INTO user_achievements (id, user_id, achievement_id, progress, unlocked_at) VALUES (?, ?, ?, 100, CURRENT_TIMESTAMP)",
        [crypto.randomUUID(), userId, target_achievement_id]
      );

      const xp = achievement?.xp_reward || 0;
      const coins = achievement?.coin_reward || 0;

      if (xp > 0 || coins > 0) {
        await awardUserXp(conn, userId, xp, coins, `Logro desbloqueado: ${achievement.name}`, "achievement", target_achievement_id);
      }

      await conn.query("UPDATE achievements SET total_unlocked = total_unlocked + 1 WHERE id = ?", [target_achievement_id]);

      await conn.commit();
      return res.json({
        data: {
          unlocked: true,
          name: achievement.name,
          xp_reward: xp,
          coin_reward: coins
        },
        error: null
      });
    }

    if (name === "get_my_comment_stats") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const [stats] = await conn.query(
        "SELECT COUNT(DISTINCT post_id) AS posts_today FROM social_comments WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE()",
        [userId]
      );
      const [total] = await conn.query(
        "SELECT COUNT(*) AS total_comments FROM social_comments WHERE user_id = ?",
        [userId]
      );
      const postsToday = stats[0]?.posts_today || 0;
      const totalComments = total[0]?.total_comments || 0;
      await conn.commit();
      return res.json({
        data: {
          posts_today: postsToday,
          total_comments: totalComments,
          limit_reached: postsToday >= 3,
          remaining: Math.max(0, 3 - postsToday)
        },
        error: null
      });
    }

    if (name === "post_comment") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      if (!p_content || p_content.trim().length < 3) {
        await conn.rollback();
        return res.json({ data: { success: false, error: "content_too_short" }, error: null });
      }
      const [existing] = await conn.query(
        "SELECT id FROM social_comments WHERE user_id = ? AND post_id = ?",
        [userId, p_post_id]
      );
      if (existing.length > 0) {
        await conn.rollback();
        return res.json({ data: { success: false, error: "already_commented" }, error: null });
      }
      const [stats] = await conn.query(
        "SELECT COUNT(DISTINCT post_id) AS posts_today FROM social_comments WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE()",
        [userId]
      );
      const postsToday = stats[0]?.posts_today || 0;
      if (postsToday >= 3) {
        await conn.rollback();
        return res.json({ data: { success: false, error: "daily_limit_reached" }, error: null });
      }
      const commentId = crypto.randomUUID();
      await conn.query(
        "INSERT INTO social_comments (id, user_id, post_id, content) VALUES (?, ?, ?, ?)",
        [commentId, userId, p_post_id, p_content.trim()]
      );
      await awardUserXp(conn, userId, 15, 5, "Comentaste en una publicación social", "social_comment", p_post_id);
      await conn.commit();
      return res.json({
        data: {
          success: true,
          xp_awarded: 15,
          coins_awarded: 5,
          posts_today: postsToday + 1
        },
        error: null
      });
    }

    if (name === "get_province_stats") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const [visits] = await conn.query(
        "SELECT province FROM province_visits WHERE user_id = ?",
        [userId]
      );
      const list = visits.map(v => v.province);
      await conn.commit();
      return res.json({
        data: {
          total: list.length,
          provinces: list
        },
        error: null
      });
    }

    if (name === "record_province_visit") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const [existing] = await conn.query(
        "SELECT id FROM province_visits WHERE user_id = ? AND province = ?",
        [userId, p_province]
      );
      if (existing.length > 0) {
        await conn.rollback();
        return res.json({ data: { success: false, error: "already_visited" }, error: null });
      }
      await conn.query(
        "INSERT INTO province_visits (id, user_id, province) VALUES (?, ?, ?)",
        [crypto.randomUUID(), userId, p_province]
      );
      await awardUserXp(conn, userId, 25, 10, `Visitaste la provincia de ${p_province}`, "province_visit", p_province);
      const [visits] = await conn.query(
        "SELECT COUNT(*) AS total_provinces FROM province_visits WHERE user_id = ?",
        [userId]
      );
      await conn.commit();
      return res.json({
        data: {
          success: true,
          xp_awarded: 25,
          coins_awarded: 10,
          total_provinces: visits[0]?.total_provinces || 1
        },
        error: null
      });
    }

    if (name === "has_role") {
      const targetUserId = _user_id || userId;
      if (!targetUserId) {
        await conn.commit();
        return res.json({ data: false, error: null });
      }
      const [roles] = await conn.query(
        "SELECT id FROM user_roles WHERE user_id = ? AND role = ?",
        [targetUserId, _role]
      );
      await conn.commit();
      return res.json({ data: roles.length > 0, error: null });
    }

    if (name === "redeem_user_prize") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const [prizes] = await conn.query(
        "SELECT coin_cost, min_level FROM gamification_prizes WHERE id = ? AND is_active = true",
        [target_prize_id]
      );
      const prize = prizes[0];
      if (!prize) {
        await conn.rollback();
        return res.status(400).json({ error: "Premio no encontrado o inactivo" });
      }
      const [gam] = await conn.query(
        "SELECT coins, current_level FROM user_gamification WHERE user_id = ?",
        [userId]
      );
      const profile = gam[0];
      if (!profile) {
        await conn.rollback();
        return res.status(400).json({ error: "Perfil de gamificación no encontrado" });
      }
      if (profile.coins < prize.coin_cost) {
        await conn.rollback();
        return res.status(400).json({ error: "Monedas insuficientes" });
      }
      if (profile.current_level < prize.min_level) {
        await conn.rollback();
        return res.status(400).json({ error: "Nivel insuficiente para este premio" });
      }
      await conn.query(
        "UPDATE user_gamification SET coins = coins - ? WHERE user_id = ?",
        [prize.coin_cost, userId]
      );
      const redemptionCode = `PRZ-${crypto.randomUUID().replace(/-/g, "").substring(0, 10).toUpperCase()}`;
      await conn.query(
        `INSERT INTO user_prize_redemptions (id, user_id, prize_id, coins_spent, redemption_code, status) 
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [crypto.randomUUID(), userId, target_prize_id, prize.coin_cost, redemptionCode]
      );
      await conn.query(
        `INSERT INTO gamification_transactions (id, user_id, transaction_type, coin_amount, description, source_type, source_id)
         VALUES (?, ?, 'spend', ?, 'Canje de premio', 'prize_redemption', ?)`,
        [crypto.randomUUID(), userId, -prize.coin_cost, target_prize_id]
      );
      await conn.commit();
      return res.json({ data: redemptionCode, error: null });
    }

    if (name === "track_ambassador_sale") {
      const [ambassadors] = await conn.query(
        "SELECT id FROM ambassadors WHERE referral_code = ?",
        [ref_code]
      );
      const ambassador = ambassadors[0];
      if (!ambassador) {
        await conn.commit();
        return res.json({ data: null, error: null });
      }
      const commEarned = parseFloat((purchase_amount * 0.08).toFixed(2));
      await conn.query(
        `INSERT INTO ambassador_referrals (id, ambassador_id, referred_email, sale_amount, commission_earned, status) 
         VALUES (?, ?, ?, ?, ?, 'approved')`,
        [crypto.randomUUID(), ambassador.id, buyer_email, purchase_amount, commEarned]
      );
      await conn.query(
        `UPDATE ambassadors 
         SET sales_count = COALESCE(sales_count, 0) + 1,
             total_earned = COALESCE(total_earned, 0.00) + ?,
             pending_payout = COALESCE(pending_payout, 0.00) + ? 
         WHERE id = ?`,
        [commEarned, commEarned, ambassador.id]
      );
      await conn.commit();
      return res.json({ data: null, error: null });
    }

    if (name === "get_season_leaderboard") {
      const limitVal = parseInt(p_limit || "20", 10);
      const [seasons] = await conn.query(
        "SELECT id FROM gamification_seasons WHERE is_active = true LIMIT 1"
      );
      const activeSeasonId = seasons[0]?.id;
      if (!activeSeasonId) {
        await conn.commit();
        return res.json({ data: [], error: null });
      }
      const [leaderboard] = await conn.query(
        `SELECT 
           ROW_NUMBER() OVER (ORDER BY uls.xp_this_season DESC) AS \`rank\`,
           p.id AS user_id,
           p.display_name,
           p.avatar_url,
           uls.xp_this_season,
           uls.league_slug,
           COALESCE(gl.icon, '🌱') AS level_icon,
           COALESCE(ug.total_missions_completed, 0) AS missions
         FROM user_league_stats uls
         JOIN profiles p ON p.id = uls.user_id
         LEFT JOIN user_gamification ug ON ug.user_id = uls.user_id
         LEFT JOIN gamification_levels gl ON gl.level_number = ug.current_level
         WHERE uls.season_id = ?
         ORDER BY uls.xp_this_season DESC
         LIMIT ?`,
        [activeSeasonId, limitVal]
      );
      await conn.commit();
      return res.json({ data: leaderboard, error: null });
    }

    if (name === "vote_photo_submission") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const [existing] = await conn.query(
        "SELECT id FROM photo_votes WHERE submission_id = ? AND user_id = ?",
        [p_submission_id, userId]
      );
      if (existing.length > 0) {
        await conn.rollback();
        return res.json({ data: { success: false, reason: "already_voted" }, error: null });
      }
      await conn.query(
        "INSERT INTO photo_votes (id, submission_id, user_id) VALUES (?, ?, ?)",
        [crypto.randomUUID(), p_submission_id, userId]
      );
      await conn.query(
        "UPDATE photo_submissions SET votes = votes + 1 WHERE id = ?",
        [p_submission_id]
      );
      await conn.commit();
      return res.json({ data: { success: true }, error: null });
    }

    if (name === "admin_update_user_role") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const isAdmin = await isAdminUser(conn, userId);
      if (!isAdmin) {
        await conn.rollback();
        return res.json({ data: { success: false, error: "unauthorized" }, error: null });
      }
      if (!["user", "admin", "partner", "moderator"].includes(p_new_role)) {
        await conn.rollback();
        return res.json({ data: { success: false, error: "invalid_role" }, error: null });
      }
      await conn.query(
        "UPDATE profiles SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [p_new_role, p_user_id]
      );
      if (["user", "admin", "moderator"].includes(p_new_role)) {
        await conn.query("DELETE FROM user_roles WHERE user_id = ?", [p_user_id]);
        await conn.query(
          "INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)",
          [crypto.randomUUID(), p_user_id, p_new_role]
        );
      }
      await conn.commit();
      return res.json({ data: { success: true, role: p_new_role }, error: null });
    }

    if (name === "admin_toggle_user_suspended") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const isAdmin = await isAdminUser(conn, userId);
      if (!isAdmin) {
        await conn.rollback();
        return res.json({ data: { success: false, error: "unauthorized" }, error: null });
      }
      const suspendedVal = p_suspended === true || p_suspended === "true" || p_suspended === 1;
      await conn.query(
        "UPDATE profiles SET is_suspended = ?, suspension_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [suspendedVal, suspendedVal ? p_reason : null, p_user_id]
      );
      await conn.commit();
      return res.json({ data: { success: true, suspended: suspendedVal }, error: null });
    }

    if (name === "admin_award_xp_to_user") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const isAdmin = await isAdminUser(conn, userId);
      if (!isAdmin) {
        await conn.rollback();
        return res.json({ data: { success: false, error: "unauthorized" }, error: null });
      }
      const xpVal = parseInt(p_xp_amount || "0", 10);
      const coinVal = parseInt(p_coin_amount || "0", 10);
      const reasonVal = p_reason || "Admin adjustment";
      await conn.query(
        `UPDATE user_gamification 
         SET total_xp = GREATEST(0, total_xp + ?),
             coins    = GREATEST(0, coins + ?),
             updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [xpVal, coinVal, p_user_id]
      );
      const [gam] = await conn.query(
        "SELECT total_xp, coins FROM user_gamification WHERE user_id = ?",
        [p_user_id]
      );
      await conn.query(
        `INSERT INTO gamification_transactions (id, user_id, transaction_type, xp_amount, coin_amount, description, source_type)
         VALUES (?, ?, 'earn', ?, ?, ?, 'admin')`,
        [crypto.randomUUID(), p_user_id, xpVal, coinVal, reasonVal]
      );
      await conn.commit();
      return res.json({
        data: {
          success: true,
          new_xp: gam[0]?.total_xp || 0,
          new_coins: gam[0]?.coins || 0
        },
        error: null
      });
    }

    if (name === "admin_toggle_operator_verified") {
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const isAdmin = await isAdminUser(conn, userId);
      if (!isAdmin) {
        await conn.rollback();
        return res.json({ data: { success: false, error: "unauthorized" }, error: null });
      }
      const verifiedVal = p_verified === true || p_verified === "true" || p_verified === 1;
      const statusVal = verifiedVal ? "verified" : "rejected";
      if (p_type === "tour_operator") {
        await conn.query(
          `UPDATE tour_operators 
           SET is_verified = ?, 
               verification_status = ?, 
               verified_at = ?, 
               verification_notes = ? 
           WHERE id = ?`,
          [verifiedVal, statusVal, verifiedVal ? new Date() : null, p_notes, p_operator_id]
        );
      } else if (p_type === "travel_agency") {
        await conn.query(
          `UPDATE travel_agencies 
           SET is_verified = ?, 
               verification_status = ?, 
               verified_at = ?, 
               verification_notes = ? 
           WHERE id = ?`,
          [verifiedVal, statusVal, verifiedVal ? new Date() : null, p_notes, p_operator_id]
        );
      } else {
        await conn.rollback();
        return res.json({ data: { success: false, error: "invalid_type" }, error: null });
      }
      await conn.commit();
      return res.json({ data: { success: true, verified: verifiedVal }, error: null });
    }

    await conn.rollback();
    return res.status(400).json({ error: `Procedure ${name} not found or unsupported` });
  } catch (error) {
    await conn.rollback();
    console.error(`Error calling procedure ${name}:`, error);
    res.status(500).json({ error: error.message || "Procedure call failed" });
  } finally {
    conn.release();
  }
});

// Run Server
app.listen(port, () => {
  console.log(`Backend server running on http://127.0.0.1:${port}`);
});
