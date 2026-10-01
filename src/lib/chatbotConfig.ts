type ChatbotEnvironment = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

export function getChatbotConfig(env: ChatbotEnvironment) {
  const supabaseUrl = env.VITE_SUPABASE_URL;

  return {
    supabaseUrl,
    publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
    chatUrl: supabaseUrl ? `${supabaseUrl}/functions/v1/chat-turistico` : null,
  };
}
