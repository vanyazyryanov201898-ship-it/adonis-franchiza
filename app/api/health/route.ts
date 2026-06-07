export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY ?? "";
  return Response.json({
    ANTHROPIC_API_KEY: key ? `✅ есть (начинается с: ${key.slice(0, 14)}...)` : "❌ ОТСУТСТВУЕТ",
    HIGGSFIELD_API_KEY: process.env.HIGGSFIELD_API_KEY ? "✅ есть" : "❌ нет",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ есть" : "❌ нет",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ есть" : "❌ нет",
    DEMO_PASSWORD: process.env.DEMO_PASSWORD ? "✅ есть" : "❌ нет",
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? "✅ есть" : "❌ нет",
    NODE_ENV: process.env.NODE_ENV,
  });
}
