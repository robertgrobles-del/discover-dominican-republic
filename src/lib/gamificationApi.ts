import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente de Gamificación y Funciones Sociales en el Backend (`/api/v1/gamification/*`, `/api/v1/social/*`, etc.)
 * Sigue la regla: El servidor decide puntos, niveles, recompensas y estados; el cliente sólo informa acciones.
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
  client_allowed: boolean;
}

export interface ActionGrantResult {
  granted: boolean;
  total_xp: number;
  coins: number;
  level: number;
  level_up: boolean;
  missions_completed: number;
  achievements_unlocked: number;
  milestones_reached: number;
  denied_reason: string | null;
}

export interface MissionItem {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  mission_type: string;
  category: string;
  icon: string;
  xp_reward: number;
  coin_reward: number;
  target_count: number;
  target_action: string;
  is_featured?: boolean;
  min_level?: number;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  expires_at?: string | null;
}

export interface AchievementItem {
  id: string;
  code?: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
  xp_reward: number;
  coin_reward: number;
  badge_color?: string;
  is_secret?: boolean;
  unlocked: boolean;
  unlocked_at?: string | null;
  progress?: number;
  target?: number;
}

export interface PrizeItem {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  image_url: string;
  prize_type: string;
  coin_cost: number;
  min_level: number;
  quantity_available: number | null;
  quantity_redeemed: number;
  is_featured: boolean;
  sponsor: string;
  valid_until: string | null;
  terms: string | null;
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

export interface LeaderboardUser {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  coins?: number;
  streak_days?: number;
  is_me?: boolean;
}

export interface CheckInResult {
  checked_in: boolean;
  streak_days: number;
  xp_earned: number;
  coins_earned: number;
  message?: string;
}

export interface PassportStampItem {
  id: string;
  stamp_title: string;
  stamp_name?: string;
  badge_url: string | null;
  entity_type: string;
  entity_id: string;
  created_at: string;
  verification_method: string;
}

export interface CollectibleItem {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  image_url: string;
  claimed?: boolean;
  claimed_at?: string | null;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  choices: string[];
  explanation?: string;
}

export interface TriviaSessionData {
  id: string;
  questions: TriviaQuestion[];
  current_index: number;
  total_questions: number;
  score: number;
  completed: boolean;
}

export interface GuildItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  motto?: string;
  badge_icon?: string;
  color?: string;
  member_count: number;
  total_xp: number;
  is_member?: boolean;
  my_role?: "leader" | "officer" | "member" | null;
}

export interface SocialPostItem {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  location_name: string | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface SocialCommentItem {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
}

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

  async getTransactions(limit = 30, cursor?: string): Promise<{ data: any[]; next_cursor?: string }> {
    const q = cursor ? `?limit=${limit}&cursor=${encodeURIComponent(cursor)}` : `?limit=${limit}`;
    const res = await fetchApi<{ data: any[]; meta: { next_cursor?: string } }>(`/gamification/me/transactions${q}`);
    return { data: res.data, next_cursor: res.meta?.next_cursor };
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

  async claimEarlyBird(): Promise<{ granted: boolean; xp: number; coins: number }> {
    const res = await fetchApi<{ data: { granted: boolean; xp: number; coins: number } }>("/gamification/early-bird", {
      method: "POST",
    });
    return res.data;
  },

  async claimStreakBonus(): Promise<{ granted: boolean; bonus: number; streak_days: number }> {
    const res = await fetchApi<{ data: { granted: boolean; bonus: number; streak_days: number } }>("/gamification/streak-bonus", {
      method: "POST",
    });
    return res.data;
  },

  async checkMilestones(): Promise<{ milestones: any[] }> {
    const res = await fetchApi<{ data: { milestones: any[] } }>("/gamification/milestones/check", {
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

  async unlockAchievement(id: string): Promise<{ unlocked: boolean; achievement: AchievementItem }> {
    const res = await fetchApi<{ data: { unlocked: boolean; achievement: AchievementItem } }>(`/gamification/achievements/${id}/unlock`, {
      method: "POST",
    });
    return res.data;
  },

  // ---------- Premios y Canjes ----------
  async getPrizes(): Promise<PrizeItem[]> {
    const res = await fetchApi<{ data: PrizeItem[] }>("/gamification/prizes");
    return res.data;
  },

  async redeemPrize(id: string, shipping?: { recipient_name: string; recipient_phone: string; shipping_address: string }): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/gamification/prizes/${id}/redeem`, {
      method: "POST",
      body: JSON.stringify(shipping || {}),
    });
    return res.data;
  },

  async getMyRedemptions(): Promise<any[]> {
    const res = await fetchApi<{ data: any[] }>("/gamification/redemptions/me");
    return res.data;
  },

  async getMyShipments(): Promise<UserRewardShipment[]> {
    const res = await fetchApi<{ data: UserRewardShipment[] }>("/gamification/shipments/me");
    return res.data || [];
  },

  // ---------- Rutas Gamificadas ----------
  async getRoutes(): Promise<any[]> {
    const res = await fetchApi<{ data: any[] }>("/gamification/routes");
    return res.data || [];
  },

  async getRouteDetail(idOrSlug: string): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/gamification/routes/${encodeURIComponent(idOrSlug)}`);
    return res.data;
  },

  async startRoute(id: string): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/gamification/routes/${id}/start`, {
      method: "POST",
    });
    return res.data;
  },

  async completeRouteCheckpoint(routeId: string, checkpointId: string, proofData?: { lat?: number; lng?: number; accuracy_m?: number; qr_code?: string; photo_media_id?: string }): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/gamification/routes/${routeId}/checkpoints/${checkpointId}/complete`, {
      method: "POST",
      body: JSON.stringify(proofData || {}),
    });
    return res.data;
  },

  // ---------- Clasificación y Ligas ----------
  async getLeaderboard(scope: "season" | "week" | "all" | "guild" = "season", limit = 20): Promise<{ rows: LeaderboardUser[]; me?: LeaderboardUser | null }> {
    const res = await fetchApi<{ data: LeaderboardUser[]; meta: { me?: LeaderboardUser | null } }>(`/gamification/leaderboard?scope=${scope}&limit=${limit}`);
    return { rows: res.data, me: res.meta?.me };
  },

  async getLeagues(): Promise<any[]> {
    const res = await fetchApi<{ data: any[] }>("/gamification/leagues");
    return res.data;
  },

  async getCurrentSeason(): Promise<any> {
    const res = await fetchApi<{ data: any }>("/gamification/seasons/current");
    return res.data;
  },

  // ---------- Pasaporte y Sellos ----------
  async getPassport(): Promise<{ stamps: PassportStampItem[]; stats: any }> {
    const res = await fetchApi<{ data: { stamps: PassportStampItem[]; stats: any } }>("/passport/me");
    return res.data;
  },

  async scanPassportQR(qrToken: string): Promise<{ stamp: PassportStampItem; message: string; game_reward: any }> {
    const res = await fetchApi<{ data: { stamp: PassportStampItem; message: string; game_reward: any } }>("/gamification/passport/scan-qr", {
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

  async getMyCollectibles(): Promise<CollectibleItem[]> {
    const res = await fetchApi<{ data: CollectibleItem[] }>("/collectibles/me");
    return res.data;
  },

  async claimCollectible(id: string): Promise<CollectibleItem> {
    const res = await fetchApi<{ data: CollectibleItem }>(`/collectibles/${id}/claim`, {
      method: "POST",
    });
    return res.data;
  },

  // ---------- Trivia Turística ----------
  async startTriviaSession(): Promise<TriviaSessionData> {
    const res = await fetchApi<{ data: TriviaSessionData }>("/trivia/session");
    return res.data;
  },

  async answerTrivia(sessionId: string, questionId: string, choice: number): Promise<{ correct: boolean; explanation?: string; score: number }> {
    const res = await fetchApi<{ data: { correct: boolean; explanation?: string; score: number } }>(`/trivia/session/${sessionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ question_id: questionId, choice }),
    });
    return res.data;
  },

  async finishTrivia(sessionId: string): Promise<{ total_score: number; xp_awarded: number; coins_awarded: number }> {
    const res = await fetchApi<{ data: { total_score: number; xp_awarded: number; coins_awarded: number } }>(`/trivia/session/${sessionId}/finish`, {
      method: "POST",
    });
    return res.data;
  },

  async getTriviaLeaderboard(limit = 20): Promise<any[]> {
    const res = await fetchApi<{ data: any[] }>(`/trivia/leaderboard?limit=${limit}`);
    return res.data;
  },

  // ---------- Gremios y Provincias ----------
  async getGuilds(): Promise<GuildItem[]> {
    const res = await fetchApi<{ data: GuildItem[] }>("/gamification/guilds");
    return res.data;
  },

  async joinGuild(guildId: string): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/gamification/guilds/${guildId}/join`, {
      method: "POST",
    });
    return res.data;
  },

  async leaveGuild(guildId: string): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/gamification/guilds/${guildId}/leave`, {
      method: "POST",
    });
    return res.data;
  },

  async getProvinces(): Promise<any[]> {
    const res = await fetchApi<{ data: any[] }>("/gamification/provinces");
    return res.data;
  },

  async recordProvinceVisit(slug: string): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/gamification/provinces/${encodeURIComponent(slug)}/visit`, {
      method: "POST",
    });
    return res.data;
  },

  // ---------- Retos de Fotos ----------
  async getPhotoChallenges(): Promise<any[]> {
    const res = await fetchApi<{ data: any[] }>("/gamification/photo-challenges");
    return res.data;
  },

  async getPhotoSubmissions(challengeId: string): Promise<any[]> {
    const res = await fetchApi<{ data: any[] }>(`/gamification/photo-challenges/${challengeId}/submissions`);
    return res.data;
  },

  async submitPhoto(challengeId: string, payload: { image_url: string; caption?: string; location_name?: string }): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/gamification/photo-challenges/${challengeId}/submissions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async votePhoto(submissionId: string): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/gamification/photo-submissions/${submissionId}/vote`, {
      method: "POST",
    });
    return res.data;
  },

  // ---------- Referidos ----------
  async getMyReferrals(): Promise<{ referral_code: string; total_referrals: number; total_xp_earned: number; referred_users: any[] }> {
    const res = await fetchApi<{ data: { referral_code: string; total_referrals: number; total_xp_earned: number; referred_users: any[] } }>("/referrals/me");
    return res.data;
  },

  async applyReferralCode(code: string): Promise<{ applied: boolean; bonus_xp: number; message: string }> {
    const res = await fetchApi<{ data: { applied: boolean; bonus_xp: number; message: string } }>("/referrals/apply", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    return res.data;
  },

  // ---------- Muro Social y Comentarios ----------
  async getSocialFeed(page = 1, perPage = 20): Promise<{ data: SocialPostItem[]; meta: any }> {
    const res = await fetchApi<{ data: SocialPostItem[]; meta: any }>(`/social/feed?page=${page}&per_page=${perPage}`);
    return res;
  },

  async createSocialPost(payload: { content: string; image_url?: string; location_name?: string }): Promise<SocialPostItem> {
    const res = await fetchApi<{ data: SocialPostItem }>("/social/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteSocialPost(postId: string): Promise<void> {
    await fetchApi(`/social/posts/${postId}`, { method: "DELETE" });
  },

  async togglePostLike(postId: string, isLiked: boolean): Promise<any> {
    const method = isLiked ? "DELETE" : "PUT";
    const res = await fetchApi<{ data: any }>(`/social/posts/${postId}/like`, { method });
    return res.data;
  },

  async getPostComments(postId: string): Promise<SocialCommentItem[]> {
    const res = await fetchApi<{ data: SocialCommentItem[] }>(`/social/posts/${postId}/comments`);
    return res.data;
  },

  async addPostComment(postId: string, content: string): Promise<SocialCommentItem> {
    const res = await fetchApi<{ data: SocialCommentItem }>(`/social/posts/${postId}/comments`, {
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
  async registerContest(slug: string, payload: { full_name: string; email: string; phone?: string; extra_entries?: number }): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/contests/${encodeURIComponent(slug)}/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async submitSurveyResponse(slug: string, answers: Record<string, any>): Promise<any> {
    const res = await fetchApi<{ data: any }>(`/surveys/${encodeURIComponent(slug)}/responses`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    return res.data;
  },

  async registerVacationDraw(payload: { name: string; email: string; phone?: string; destination_preference?: string }): Promise<any> {
    const res = await fetchApi<{ data: any }>("/vacation-registrations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // ---------- Check-in Diario y Referidos ----------
  async checkIn(): Promise<{ success: boolean; reason?: string; streak?: number; xp?: number; coins?: number; multiplier?: number }> {
    const res = await fetchApi<{ data: any }>("/gamification/check-in", { method: "POST" });
    return res.data;
  },

  async applyReferral(code: string): Promise<{ success: boolean; code?: string; xp?: number; coins?: number }> {
    const res = await fetchApi<{ data: any }>("/referrals/apply", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    return res.data;
  },

  async getMyReferral(): Promise<{ code: string; total_referrals: number; total_earnings_coins: number }> {
    const res = await fetchApi<{ data: { code: string; total_referrals: number; total_earnings_coins: number } }>("/referrals/me");
    return res.data;
  },
};
