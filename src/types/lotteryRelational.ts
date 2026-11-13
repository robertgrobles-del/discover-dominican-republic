export interface LotteryResultRelational {
  id: string;
  draw_id: string;
  draw_date: string;
  winning_numbers: number[];
  bonus_number: number | null;
  jackpot_amount: string | null;
  is_active: boolean;
  lottery_draws: {
    id: string;
    lottery_id: string;
    slug: string;
    name: string;
    draw_days: string[];
    draw_time: string;
    ball_range_min: number;
    ball_range_max: number;
    number_of_balls: number;
    tombolas_count: number;
    has_bonus: boolean;
    bonus_name?: string | null;
    is_active: boolean;
    lotteries: {
      id: string;
      slug: string;
      name: string;
      country: string;
      logo_url: string | null;
      website_url?: string | null;
      description?: string | null;
      color_scheme?: string | null;
      is_active: boolean;
    } | null;
  } | null;
}

export interface LotteryCompanyWithDraws {
  id: string;
  slug: string;
  name: string;
  country: string;
  logo_url: string | null;
  website_url?: string | null;
  description?: string | null;
  color_scheme?: string | null;
  draws: {
    id: string;
    slug: string;
    name: string;
    draw_days: string[];
    draw_time: string;
    ball_range_min: number;
    ball_range_max: number;
    number_of_balls: number;
    tombolas_count: number;
    has_bonus: boolean;
    bonus_name?: string | null;
    schedule_description?: string | null;
    how_to_play?: string | null;
    latest_result?: {
      id: string;
      draw_date: string;
      winning_numbers: number[];
      bonus_number: number | null;
      jackpot_amount: string | null;
    } | null;
  }[];
}
