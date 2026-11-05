import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente de Gamificación y Funciones Sociales en el Backend (`/api/v1/gamification/*`, `/api/v1/social/*`, etc.)
 * Sigue la regla: El servidor decide puntos, niveles, recompensas y estados; el cliente sólo informa acciones.
 *
 * Cada tipo copia lo que devuelve la ruta en `backend/src/modules/{game,community}`: el backend declara sus
 * respuestas como `z.any()`, así que estos tipos son el contrato. Si cambias una consulta allí, cámbialo aquí.
 */

export interface GamificationLevel {
  id?: string;
  number: number;
  level_number?: number;
  title: string;
  name?: string;
  xp_required: number;
  icon: string;
  color: string;
  marketplace_discount: number;
  perks: string[];
}

/** Respuesta real de `GET /gamification/me` (backend/src/modules/game/service.ts, `me`). */
interface ApiGamificationState {
  xp: number;
  coins: number;
  level: { number: number; title: string; icon: string } | null;
  next_level: { number: number; title: string; xp_required: number } | null;
  streak: { days: number; last_checkin: string | null; checked_in_today: boolean; multiplier: number };
  missions_completed: number;
  referrals: number;
  badges: unknown[];
  league: { name: string; slug: string; icon: string; color?: string; xp_this_week: number } | null;
  season: { xp: number; rank: number | null } | null;
}

export interface UserGamificationState {
  id?: string;
  user_id?: string;
  total_xp: number;
  current_level: number;
  coins: number;
  streak_days: number;
  last_activity_date: string | null;
  total_missions_completed: number;
  total_purchases?: number;
  total_referrals?: number;
  badges_count?: number;
  league?: { name: string; slug: string; color: string; icon: string } | null;
  rank?: number | null;
  next_level?: { number: number; title: string; xp_required: number; xp_remaining: number } | null;
}

export interface GamificationRule {
  action: string;
  description: string;
  xp: number;
  coins: number;
  daily_cap: number | null;
  cooldown_seconds: number | null;
  unique_per_ref: boolean;
  client_allowed: boolean;
}

/** `GrantResult` de `backend/src/contracts/game.ts`: lo que devuelve cualquier concesión de XP o monedas. */
export type DenyReason = "no_rule" | "inactive" | "daily_cap" | "cooldown" | "duplicate";
export interface LevelUp { from: number; to: number; title: string }
export interface GrantSummary {
  granted: { xp: number; coins: number };
  total_xp: number;
  coins: number;
  level: number;
  level_up: LevelUp | null;
  missions_completed: { id: string; name: string; xp: number; coins: number }[];
  achievements_unlocked: { id: string; name: string; icon: string }[];
  milestones_reached: { id: string; name: string; coins: number }[];
}

/** `POST /gamification/actions`. */
export interface ActionGrantResult extends GrantSummary {
  denied_reason: DenyReason | null;
}

export interface MissionItem {
  id: string;
  name: string;
  description: string | null;
  mission_type: string;
  icon: string | null;
  xp_reward: number;
  coin_reward: number;
  target_count: number;
  target_action: string;
  is_featured: boolean;
  min_level: number;
  progress: number;
  completed: boolean;
  starts_on: string | null;
  ends_on: string | null;
  image_url: string | null;
  place_name: string | null;
  province: string | null;
  difficulty: string | null;
  estimated_minutes: number | null;
  spots_left: number | null;
  requires_validation: boolean;
  is_sponsored: boolean;
  sponsor_id: string | null;
  sponsor_name: string | null;
  sponsor_logo_url: string | null;
  sponsor_reward_text: string | null;
  target_url: string | null;
  target_label: string | null;
}

/** `GET /gamification/achievements`: los secretos sin desbloquear sólo traen id, nombre «???», icono, categoría y rareza. */
export interface AchievementItem {
  id: string;
  name: string;
  short_description?: string | null;
  description?: string | null;
  icon: string;
  category: string;
  rarity: string | null;
  xp_reward?: number;
  coin_reward?: number;
  is_secret: boolean;
  unlock_condition?: string | null;
  total_unlocked?: number;
  unlocked_at?: string | null;
  unlocked: boolean;
}

export interface PrizeItem {
  id: string;
  name: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  prize_type: string;
  coin_cost: number;
  min_level: number;
  sponsor: string | null;
  valid_until: string | null;
  terms: string | null;
  is_featured: boolean;
  /** Unidades que quedan; `null` = sin límite. */
  remaining: number | null;
}

export interface RedeemResult {
  redemption_id: string;
  code: string;
  prize: string;
  coins_spent: number;
  /** El premio es físico y se creó un envío. */
  shipping: boolean;
}

export interface RedemptionItem {
  id: string;
  status: string;
  code: string;
  coins_spent: number;
  created_at: string;
  prize: string;
  prize_type: string;
}

export interface UserRewardShipment {
  id: string;
  status: "pending" | "packed" | "shipped" | "delivered";
  courier_name?: string | null;
  tracking_number?: string | null;
  shipped_at?: string | null;
  created_at: string;
  prize?: string | null;
}

export interface PublicAuthor { id: string; name: string; avatar_url: string | null }

/** `GET /gamification/leaderboard` (scopes de jugadores). */
export interface LeaderboardUser {
  rank: number;
  xp: number;
  user: PublicAuthor;
}

export interface CheckInResult {
  success: boolean;
  reason?: "already_checked_in";
  streak: number;
  xp?: number;
  coins?: number;
  multiplier?: number;
  level_up?: LevelUp | null;
  missions_completed?: GrantSummary["missions_completed"];
  achievements_unlocked?: GrantSummary["achievements_unlocked"];
}

export interface TransactionItem {
  id: string;
  type: string;
  action: string;
  xp: number;
  coins: number;
  description: string | null;
  created_at: string;
}

/** Sello de `GET /passport/me`. */
export interface PassportStampItem {
  id: string;
  type: string;
  name: string;
  image: string | null;
  verified_by: string;
  visited_at: string;
  xp_earned: number;
  coins_earned: number;
  rating: number | null;
  notes: string | null;
}

export interface PassportData {
  stamps: PassportStampItem[];
  totals: { stamps: number; by_type: Record<string, number>; provinces_visited: number; provinces_total: number };
  provinces: { province: string; visited_at: string }[];
}

export interface ScanPassportResult {
  /** Fila insertada en `passport_stamps`. */
  stamp: { id: string; entity_type: string; entity_id: string; stamp_name: string; badge_url: string | null; verification_method: string; visited_at?: string };
  message: string;
  game_reward: GrantSummary;
}

export interface CollectibleItem {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  type: string;
  rarity: string;
  image_url: string | null;
  thumbnail_url: string | null;
  unlock_condition: string | null;
  total_supply: number | null;
  remaining: number | null;
  xp_value: number;
  coin_value: number;
  season: string | null;
  is_tradeable: boolean;
  owned: boolean;
}

export interface MyCollectibleItem {
  ownership_id: string;
  id: string;
  name: string;
  rarity: string;
  image_url: string | null;
  type: string;
  acquired_at: string;
  acquisition_method: string;
  is_favorite: boolean;
  display_order: number | null;
}

export interface ClaimCollectibleResult {
  collectible: string;
  granted: { xp: number; coins: number };
  level_up: LevelUp | null;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
  image_url: string | null;
}

export interface TriviaSessionData {
  session_id: string;
  answered: number;
  questions: TriviaQuestion[];
  resumed: boolean;
}

export interface TriviaAnswerResult {
  correct: boolean;
  correct_index: number;
  explanation: string | null;
}

export interface TriviaFinishResult {
  score: number;
  total: number;
  max_streak: number;
  granted: { xp: number; coins: number };
  denied_reason: DenyReason | null;
  level_up: LevelUp | null;
  achievements_unlocked: GrantSummary["achievements_unlocked"];
}

export interface TriviaLeaderboardRow {
  rank: number;
  best_score: number;
  games: number;
  user: PublicAuthor;
}

export interface GuildItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  region: string | null;
  member_count: number;
  total_xp: number;
  is_official: boolean;
  max_members: number;
  is_member: boolean;
  my_role: string | null;
  full: boolean;
}

export interface LeagueItem {
  name: string;
  slug: string;
  icon: string;
  min_xp_week: number;
  max_xp_week: number | null;
  coin_reward: number;
  color: string | null;
}

export interface SeasonItem {
  id: string;
  name: string;
  number: number;
  starts_at: string;
  ends_at: string;
  top_rewards: unknown;
}

export interface ProvinceProgress {
  provinces: Array<{ id: string; name: string; slug: string; region: string | null; visited: boolean; visited_at: string | null }>;
  visited: number;
  total: number;
}

export interface ProvinceVisitResult {
  success: true;
  province: string;
  xp_awarded: number;
  total_provinces: number;
  level_up: LevelUp | null;
}

export interface GamifiedRoute {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  route_type: string | null;
  difficulty: string | null;
  duration_days: number | null;
  distance_km: number | null;
  total_xp_reward: number | null;
  total_coin_reward: number | null;
  image_url: string | null;
  min_level: number;
  is_featured: boolean;
  checkpoints: number;
  progress: { started: true; completed: boolean; checkpoints_completed: number; percent: number } | null;
}

export interface RouteCheckpoint {
  id: string;
  order: number;
  name: string;
  description: string | null;
  type: string | null;
  lat: number | null;
  lng: number | null;
  radius_m: number;
  xp_reward: number | null;
  coin_reward: number | null;
  task: string | null;
  photo_required: boolean;
  is_mandatory: boolean;
  has_qr: boolean;
  completed: boolean;
}

export interface GamifiedRouteDetail extends Omit<GamifiedRoute, "checkpoints" | "progress" | "is_featured"> {
  description: string | null;
  gallery: string[] | null;
  sequential: boolean;
  checkpoints: RouteCheckpoint[];
  progress: { started_at: string; checkpoints_completed: number; percent: number; is_completed: boolean; total_xp_earned: number; total_coins_earned: number } | null;
}

/** `POST /gamification/routes/:id/checkpoints/:cp/complete` (explore.ts `completeCheckpoint`). */
export interface CheckpointCompleteResult {
  checkpoint: string;
  verified_by: string;
  granted: { xp: number; coins: number };
  progress: { completed: number; total: number; percent: number };
  route_completed: boolean;
  /** Bono por terminar la ruta (sólo cuando `route_completed`). */
  completion: { xp: number; coins: number; badge: boolean } | null;
  level_up: LevelUp | null;
}

export interface PhotoChallengeItem {
  id: string;
  title: string;
  description: string | null;
  theme: string | null;
  destination: string | null;
  starts_at: string | null;
  ends_at: string | null;
  xp_reward: number;
  coin_reward: number;
  open: boolean;
  submissions: number;
}

export interface PhotoSubmissionItem {
  id: string;
  image_url: string;
  caption: string | null;
  votes: number;
  is_winner: boolean;
  voted_by_me: boolean;
  author: PublicAuthor;
  created_at: string;
}

export interface PageMeta { page: number; per_page: number; total: number; total_pages?: number }

/** Publicación de `GET /social/feed` (social.ts `toPost`). */
export interface SocialPostItem {
  id: string;
  author: PublicAuthor;
  content: string;
  media: string[];
  location: string | null;
  destination_id: string | null;
  entity_ref: { type: string; id: string } | null;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  created_at: string;
}

export interface SocialCommentItem {
  id: string;
  author: PublicAuthor;
  content: string;
  created_at: string;
}

export interface AddCommentResult {
  comment: { id: string; content: string; created_at: string };
  xp_awarded: number;
  level_up: LevelUp | null;
}

export interface ReferralInfo { code: string; total_referrals: number; total_earnings_coins: number }
export interface ApplyReferralResult { granted: { xp: number; coins: number }; level_up: LevelUp | null }

export const gamificationApi = {
  // ---------- Mi Estado ----------
  /**
   * Mi estado en el juego. La API responde `{ xp, coins, level: { number }, streak: { days, last_checkin },
   * missions_completed, referrals, badges, league, season: { rank }, next_level }`; aquí se adapta a la forma
   * que ya usan las pantallas (`total_xp`, `current_level`, `streak_days`…).
   */
  async getMyState(): Promise<UserGamificationState> {
    const res = await fetchApi<{ data: ApiGamificationState }>("/gamification/me");
    const d = res.data;
    const xp = d.xp ?? 0;
    return {
      total_xp: xp,
      current_level: d.level?.number ?? 1,
      coins: d.coins ?? 0,
      streak_days: d.streak?.days ?? 0,
      last_activity_date: d.streak?.last_checkin ?? null,
      total_missions_completed: d.missions_completed ?? 0,
      total_referrals: d.referrals ?? 0,
      badges_count: d.badges?.length ?? 0,
      league: d.league ? { name: d.league.name, slug: d.league.slug, icon: d.league.icon, color: d.league.color ?? "" } : null,
      rank: d.season?.rank ?? null,
      next_level: d.next_level ? { ...d.next_level, xp_remaining: Math.max(0, d.next_level.xp_required - xp) } : null,
    };
  },

  async getTransactions(limit = 30, cursor?: string): Promise<{ data: TransactionItem[]; next_cursor: string | null }> {
    const q = cursor ? `?limit=${limit}&cursor=${encodeURIComponent(cursor)}` : `?limit=${limit}`;
    const res = await fetchApi<{ data: TransactionItem[]; meta: { limit: number; next_cursor: string | null } }>(`/gamification/me/transactions${q}`);
    return { data: res.data, next_cursor: res.meta?.next_cursor ?? null };
  },

  async getLevels(): Promise<GamificationLevel[]> {
    const res = await fetchApi<{ data: GamificationLevel[] }>("/gamification/levels");
    return res.data.map((l) => ({
      ...l,
      level_number: l.number,
      name: l.title,
    }));
  },

  async getRules(): Promise<GamificationRule[]> {
    const res = await fetchApi<{ data: GamificationRule[] }>("/gamification/rules");
    return res.data;
  },

  // ---------- Acciones y Retención ----------
  async reportAction(action: string, refType?: string, refId?: string): Promise<ActionGrantResult> {
    const res = await fetchApi<{ data: ActionGrantResult }>("/gamification/actions", {
      method: "POST",
      body: JSON.stringify({ action, ref_type: refType, ref_id: refId }),
    });
    return res.data;
  },

  async dailyCheckIn(): Promise<CheckInResult> {
    const res = await fetchApi<{ data: CheckInResult }>("/gamification/check-in", {
      method: "POST",
    });
    return res.data;
  },

  async claimEarlyBird(): Promise<{ success: true; xp: number; level_up: LevelUp | null } | { success: false; reason: string }> {
    const res = await fetchApi<{ data: { success: true; xp: number; level_up: LevelUp | null } | { success: false; reason: string } }>("/gamification/early-bird", {
      method: "POST",
    });
    return res.data;
  },

  async claimStreakBonus(): Promise<{ success: true; coins: number; streak: number } | { success: false; reason: string; streak: number }> {
    const res = await fetchApi<{ data: { success: true; coins: number; streak: number } | { success: false; reason: string; streak: number } }>("/gamification/streak-bonus", {
      method: "POST",
    });
    return res.data;
  },

  async checkMilestones(): Promise<{ milestones_reached: GrantSummary["milestones_reached"]; coins: number }> {
    const res = await fetchApi<{ data: { milestones_reached: GrantSummary["milestones_reached"]; coins: number } }>("/gamification/milestones/check", {
      method: "POST",
    });
    return res.data;
  },

  // ---------- Misiones y Logros ----------
  async getMissions(): Promise<MissionItem[]> {
    const res = await fetchApi<{ data: MissionItem[] }>("/gamification/missions");
    return res.data;
  },

  async getMyMissions(): Promise<MissionItem[]> {
    const res = await fetchApi<{ data: MissionItem[] }>("/gamification/missions/me");
    return res.data;
  },

  async getAchievements(): Promise<AchievementItem[]> {
    const res = await fetchApi<{ data: AchievementItem[] }>("/gamification/achievements");
    return res.data;
  },

  async getMyAchievements(): Promise<AchievementItem[]> {
    const res = await fetchApi<{ data: AchievementItem[] }>("/gamification/achievements/me");
    return res.data;
  },

  /** El servidor comprueba la condición; responde los logros que quedaron desbloqueados en la evaluación. */
  async unlockAchievement(id: string): Promise<{ unlocked: GrantSummary["achievements_unlocked"]; total_xp: number; coins: number }> {
    const res = await fetchApi<{ data: { unlocked: GrantSummary["achievements_unlocked"]; total_xp: number; coins: number } }>(`/gamification/achievements/${id}/unlock`, {
      method: "POST",
    });
    return res.data;
  },

  // ---------- Premios y Canjes ----------
  async getPrizes(): Promise<PrizeItem[]> {
    const res = await fetchApi<{ data: PrizeItem[] }>("/gamification/prizes");
    return res.data;
  },

  async redeemPrize(id: string, shipping?: { recipient_name: string; recipient_phone: string; shipping_address: string }): Promise<RedeemResult> {
    const res = await fetchApi<{ data: RedeemResult }>(`/gamification/prizes/${id}/redeem`, {
      method: "POST",
      body: JSON.stringify(shipping || {}),
    });
    return res.data;
  },

  async getMyRedemptions(): Promise<RedemptionItem[]> {
    const res = await fetchApi<{ data: RedemptionItem[] }>("/gamification/redemptions/me");
    return res.data;
  },

  async getMyShipments(): Promise<UserRewardShipment[]> {
    const res = await fetchApi<{ data: UserRewardShipment[] }>("/gamification/shipments/me");
    return res.data || [];
  },

  // ---------- Rutas Gamificadas ----------
  async getRoutes(): Promise<GamifiedRoute[]> {
    const res = await fetchApi<{ data: GamifiedRoute[] }>("/gamification/routes");
    return res.data || [];
  },

  async getRouteDetail(idOrSlug: string): Promise<GamifiedRouteDetail> {
    const res = await fetchApi<{ data: GamifiedRouteDetail }>(`/gamification/routes/${encodeURIComponent(idOrSlug)}`);
    return res.data;
  },

  async startRoute(id: string): Promise<{ started: boolean; already_started: boolean }> {
    const res = await fetchApi<{ data: { started: boolean; already_started: boolean } }>(`/gamification/routes/${id}/start`, {
      method: "POST",
    });
    return res.data;
  },

  async completeRouteCheckpoint(routeId: string, checkpointId: string, proofData?: { lat?: number; lng?: number; accuracy_m?: number; qr_code?: string; photo_media_id?: string }): Promise<CheckpointCompleteResult> {
    const res = await fetchApi<{ data: CheckpointCompleteResult }>(`/gamification/routes/${routeId}/checkpoints/${checkpointId}/complete`, {
      method: "POST",
      body: JSON.stringify(proofData || {}),
    });
    return res.data;
  },

  // ---------- Clasificación y Ligas ----------
  async getLeaderboard(scope: "season" | "week" | "all" = "season", limit = 20): Promise<{ rows: LeaderboardUser[]; me: { rank: number; xp: number } | null }> {
    const res = await fetchApi<{ data: LeaderboardUser[]; meta: { scope: string; me: { rank: number; xp: number } | null } }>(`/gamification/leaderboard?scope=${scope}&limit=${limit}`);
    return { rows: res.data, me: res.meta?.me ?? null };
  },

  async getLeagues(): Promise<LeagueItem[]> {
    const res = await fetchApi<{ data: LeagueItem[] }>("/gamification/leagues");
    return res.data;
  },

  /** `null` si no hay temporada activa. */
  async getCurrentSeason(): Promise<SeasonItem | null> {
    const res = await fetchApi<{ data: SeasonItem | null }>("/gamification/seasons/current");
    return res.data;
  },

  // ---------- Pasaporte y Sellos ----------
  async getPassport(): Promise<PassportData> {
    const res = await fetchApi<{ data: PassportData }>("/passport/me");
    return res.data;
  },

  async scanPassportQR(qrToken: string): Promise<ScanPassportResult> {
    const res = await fetchApi<{ data: ScanPassportResult }>("/gamification/passport/scan-qr", {
      method: "POST",
      body: JSON.stringify({ qr_token: qrToken }),
    });
    return res.data;
  },

  // ---------- Coleccionables Digitales ----------
  async getCollectibles(): Promise<CollectibleItem[]> {
    const res = await fetchApi<{ data: CollectibleItem[] }>("/collectibles");
    return res.data;
  },

  async getMyCollectibles(): Promise<MyCollectibleItem[]> {
    const res = await fetchApi<{ data: MyCollectibleItem[] }>("/collectibles/me");
    return res.data;
  },

  async claimCollectible(id: string): Promise<ClaimCollectibleResult> {
    const res = await fetchApi<{ data: ClaimCollectibleResult }>(`/collectibles/${id}/claim`, {
      method: "POST",
    });
    return res.data;
  },

  // ---------- Trivia Turística ----------
  async startTriviaSession(): Promise<TriviaSessionData> {
    const res = await fetchApi<{ data: TriviaSessionData }>("/trivia/session");
    return res.data;
  },

  async answerTrivia(sessionId: string, questionId: string, choice: number): Promise<TriviaAnswerResult> {
    const res = await fetchApi<{ data: TriviaAnswerResult }>(`/trivia/session/${sessionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ question_id: questionId, choice }),
    });
    return res.data;
  },

  async finishTrivia(sessionId: string): Promise<TriviaFinishResult> {
    const res = await fetchApi<{ data: TriviaFinishResult }>(`/trivia/session/${sessionId}/finish`, {
      method: "POST",
    });
    return res.data;
  },

  async getTriviaLeaderboard(limit = 20): Promise<TriviaLeaderboardRow[]> {
    const res = await fetchApi<{ data: TriviaLeaderboardRow[] }>(`/trivia/leaderboard?limit=${limit}`);
    return res.data;
  },

  // ---------- Gremios y Provincias ----------
  async getGuilds(): Promise<{ guilds: GuildItem[]; my_guild: string | null }> {
    const res = await fetchApi<{ data: { guilds: GuildItem[]; my_guild: string | null } }>("/gamification/guilds");
    return res.data;
  },

  /** Responde 204 sin cuerpo. */
  async joinGuild(guildId: string): Promise<void> {
    await fetchApi(`/gamification/guilds/${guildId}/join`, { method: "POST" });
  },

  async leaveGuild(guildId: string): Promise<{ disbanded: boolean }> {
    const res = await fetchApi<{ data: { disbanded: boolean } }>(`/gamification/guilds/${guildId}/leave`, {
      method: "POST",
    });
    return res.data;
  },

  async getProvinces(): Promise<ProvinceProgress> {
    const res = await fetchApi<{ data: ProvinceProgress }>("/gamification/provinces");
    return res.data;
  },

  /** La visita se comprueba por ubicación: el servidor exige `lat`/`lng` a menos de 25 km de un punto de la provincia. */
  async recordProvinceVisit(slug: string, proof: { lat: number; lng: number; accuracy_m?: number }): Promise<ProvinceVisitResult> {
    const res = await fetchApi<{ data: ProvinceVisitResult }>(`/gamification/provinces/${encodeURIComponent(slug)}/visit`, {
      method: "POST",
      body: JSON.stringify(proof),
    });
    return res.data;
  },

  // ---------- Retos de Fotos ----------
  async getPhotoChallenges(): Promise<PhotoChallengeItem[]> {
    const res = await fetchApi<{ data: PhotoChallengeItem[] }>("/gamification/photo-challenges");
    return res.data;
  },

  async getPhotoSubmissions(challengeId: string, page = 1, perPage = 24): Promise<{ data: PhotoSubmissionItem[]; meta: PageMeta }> {
    return fetchApi<{ data: PhotoSubmissionItem[]; meta: PageMeta }>(`/gamification/photo-challenges/${challengeId}/submissions?page=${page}&per_page=${perPage}`);
  },

  /** La foto se sube antes con `/media/upload-url`; aquí se envía su `media_id`. Queda pendiente de moderación. */
  async submitPhoto(challengeId: string, payload: { media_id: string; caption?: string }): Promise<{ id: string; status: "pending_review" }> {
    const res = await fetchApi<{ data: { id: string; status: "pending_review" } }>(`/gamification/photo-challenges/${challengeId}/submissions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async votePhoto(submissionId: string): Promise<{ votes: number }> {
    const res = await fetchApi<{ data: { votes: number } }>(`/gamification/photo-submissions/${submissionId}/vote`, {
      method: "POST",
    });
    return res.data;
  },

  // ---------- Muro Social y Comentarios ----------
  async getSocialFeed(opts: { filter?: "latest" | "following" | "trending" | "province"; province_id?: string; cursor?: string | null; limit?: number } = {}): Promise<{ data: SocialPostItem[]; meta: { limit: number; next_cursor: string | null } }> {
    const q = new URLSearchParams({ filter: opts.filter ?? "latest", limit: String(opts.limit ?? 20) });
    if (opts.province_id) q.set("province_id", opts.province_id);
    if (opts.cursor) q.set("cursor", opts.cursor);
    return fetchApi<{ data: SocialPostItem[]; meta: { limit: number; next_cursor: string | null } }>(`/social/feed?${q}`);
  },

  /** `media` son URLs https (la primera es la portada). Responde sólo el id de la publicación. */
  async createSocialPost(payload: { content: string; media?: string[]; location?: string; destination_id?: string }): Promise<{ id: string }> {
    const res = await fetchApi<{ data: { id: string } }>("/social/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteSocialPost(postId: string): Promise<void> {
    await fetchApi(`/social/posts/${postId}`, { method: "DELETE" });
  },

  /** PUT/DELETE responden 204 sin cuerpo: el contador se ajusta en el cliente. */
  async togglePostLike(postId: string, isLiked: boolean): Promise<void> {
    await fetchApi(`/social/posts/${postId}/like`, { method: isLiked ? "DELETE" : "PUT" });
  },

  async getPostComments(postId: string, page = 1, perPage = 20): Promise<SocialCommentItem[]> {
    const res = await fetchApi<{ data: SocialCommentItem[]; meta: PageMeta }>(`/social/posts/${postId}/comments?page=${page}&per_page=${perPage}`);
    return res.data;
  },

  async addPostComment(postId: string, content: string): Promise<AddCommentResult> {
    const res = await fetchApi<{ data: AddCommentResult }>(`/social/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    return res.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await fetchApi(`/social/comments/${commentId}`, { method: "DELETE" });
  },

  async getMyCommentStats(): Promise<{ posts_today: number; total_comments: number }> {
    const res = await fetchApi<{ data: { posts_today: number; total_comments: number } }>("/social/me/comment-stats");
    return res.data;
  },

  // ---------- Sorteos y Encuestas ----------
  /** Exige sesión con correo verificado: el correo lo pone el servidor desde la cuenta. */
  async registerContest(slug: string, payload: { name: string; phone?: string; country?: string; age?: number; accept_rules: true }): Promise<{ id: string }> {
    const res = await fetchApi<{ data: { id: string } }>(`/contests/${encodeURIComponent(slug)}/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async submitSurveyResponse(slug: string, answers: Record<string, unknown>): Promise<{ received: true }> {
    const res = await fetchApi<{ data: { received: true } }>(`/surveys/${encodeURIComponent(slug)}/responses`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    return res.data;
  },

  /** Sin sesión, `name` y `email` son obligatorios. Fechas en `YYYY-MM-DD`. */
  async registerVacationDraw(payload: { destination_id: string; start_date: string; end_date: string; travelers?: number; notes?: string; name?: string; email?: string; phone?: string }): Promise<{ received: true }> {
    const res = await fetchApi<{ data: { received: true } }>("/vacation-registrations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // ---------- Check-in Diario y Referidos ----------
  async checkIn(): Promise<CheckInResult> {
    const res = await fetchApi<{ data: CheckInResult }>("/gamification/check-in", { method: "POST" });
    return res.data;
  },

  async applyReferral(code: string): Promise<ApplyReferralResult> {
    const res = await fetchApi<{ data: ApplyReferralResult }>("/referrals/apply", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    return res.data;
  },

  async getMyReferral(): Promise<ReferralInfo> {
    const res = await fetchApi<{ data: ReferralInfo }>("/referrals/me");
    return res.data;
  },
};
