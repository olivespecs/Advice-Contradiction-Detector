import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, basename } from "path";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const PODCASTS_DIR = join(process.cwd(), "podcasts");
const DATA_DIR = join(process.cwd(), "data");
const OUTPUT_FILE = join(DATA_DIR, "claims.json");

interface EpisodeMeta {
  title?: string;
  guest?: string;
  date?: string;
  description?: string;
  url?: string;
}

interface ClaimResult {
  id: string;
  guest: string;
  episode_title: string;
  topic: string;
  claim: string;
  quote: string;
  source_file: string;
}

function loadIndex(): Record<string, EpisodeMeta> {
  const indexPath = join(process.cwd(), "index.json");
  if (!existsSync(indexPath)) return {};
  try {
    const raw = JSON.parse(readFileSync(indexPath, "utf-8"));
    const map: Record<string, EpisodeMeta> = {};
    for (const ep of raw) {
      const key = ep.filename || ep.file || ep.slug || "";
      if (key) map[key] = ep;
    }
    return map;
  } catch {
    return {};
  }
}

async function extractClaimsFromTranscript(
  content: string,
  guestName: string,
  episodeTitle: string,
  sourceFile: string,
  claimOffset: number
): Promise<ClaimResult[]> {
  const prompt = `Guest: ${guestName}
Episode: ${episodeTitle}

Transcript:
${content.slice(0, 12000)}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: `You are a research assistant analyzing podcast transcripts. Your job is to extract the most opinionated, specific, and actionable pieces of advice the guest gives — focusing on claims that could plausibly conflict with advice from other experts. Avoid vague platitudes. Prioritize concrete stances on: hiring, firing, prioritization, roadmapping, company culture, growth strategy, metrics, fundraising, AI, team structure, leadership, and product strategy.

For each claim, return a JSON array with objects having these fields:
- topic: a short 2-4 word category label (e.g. "hiring engineers", "product roadmapping", "growth strategy")
- claim: a single sentence stating the guest's position clearly and specifically (as if they would defend it in a debate)
- quote: the most relevant 1-2 sentence direct quote from the transcript that supports this claim

Return ONLY a valid JSON array. Extract 5-10 claims. No markdown, no explanation.`,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") return [];

  const raw = block.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
  const parsed = JSON.parse(raw) as Array<{ topic: string; claim: string; quote: string }>;

  return parsed.map((item, i) => ({
    id: `claim_${String(claimOffset + i + 1).padStart(3, "0")}`,
    guest: guestName,
    episode_title: episodeTitle,
    topic: item.topic,
    claim: item.claim,
    quote: item.quote,
    source_file: sourceFile,
  }));
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  if (!existsSync(PODCASTS_DIR)) {
    console.error(`❌ Podcasts directory not found at: ${PODCASTS_DIR}`);
    console.error("Clone the podcast data first:");
    console.error("  git clone https://github.com/LennysNewsletter/lennys-newsletterpodcastdata");
    process.exit(1);
  }

  const index = loadIndex();
  const files = readdirSync(PODCASTS_DIR).filter((f) => f.endsWith(".md"));

  console.log(`Found ${files.length} transcript files`);

  const allClaims: ClaimResult[] = [];
  let claimOffset = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sourceFile = `podcasts/${file}`;
    const slug = basename(file, ".md");

    const meta: EpisodeMeta = index[slug] || index[file] || {};
    const guestName = meta.guest || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const episodeTitle = meta.title || guestName;

    try {
      const content = readFileSync(join(PODCASTS_DIR, file), "utf-8");
      const claims = await extractClaimsFromTranscript(
        content,
        guestName,
        episodeTitle,
        sourceFile,
        claimOffset
      );

      allClaims.push(...claims);
      claimOffset += claims.length;

      console.log(`✅ Processed ${i + 1}/${files.length}: ${guestName} — ${claims.length} claims extracted`);

      writeFileSync(OUTPUT_FILE, JSON.stringify(allClaims, null, 2));

      // Small delay to avoid rate limits
      if (i < files.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (err) {
      console.error(`❌ Failed to process ${file}:`, err instanceof Error ? err.message : err);
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(allClaims, null, 2));
  console.log(`\n🎉 Done! ${allClaims.length} total claims saved to data/claims.json`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
