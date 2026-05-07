import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const DATA_DIR = join(process.cwd(), "data");
const CLAIMS_FILE = join(DATA_DIR, "claims.json");
const OUTPUT_FILE = join(DATA_DIR, "contradictions.json");

interface Claim {
  id: string;
  guest: string;
  episode_title: string;
  topic: string;
  claim: string;
  quote: string;
  source_file: string;
}

interface Contradiction {
  id: string;
  topic: string;
  canonical_topic: string;
  confidence: number;
  tension_summary: string;
  guest_a: {
    name: string;
    position: string;
    quote: string;
    episode_title: string;
  };
  guest_b: {
    name: string;
    position: string;
    quote: string;
    episode_title: string;
  };
}

async function normalizeTopics(claims: Claim[]): Promise<Map<string, string>> {
  const uniqueTopics = [...new Set(claims.map((c) => c.topic))];
  console.log(`Normalizing ${uniqueTopics.length} unique topics...`);

  const prompt = `Here are topic labels from podcast transcripts. Normalize them into canonical grouped forms so similar topics merge together. Return a JSON object mapping each original topic to its canonical form. Group similar topics (e.g., "hiring engineers" and "hiring senior talent" both become "Hiring Philosophy").

Topics:
${uniqueTopics.map((t) => `- ${t}`).join("\n")}

Return ONLY a valid JSON object, no markdown.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") return new Map();

  const raw = block.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
  const parsed = JSON.parse(raw) as Record<string, string>;
  return new Map(Object.entries(parsed));
}

async function checkContradiction(
  claimA: Claim,
  claimB: Claim
): Promise<{ is_contradiction: boolean; confidence: number; tension_summary: string } | null> {
  const prompt = `Guest A (${claimA.guest}): "${claimA.claim}"
Quote: "${claimA.quote}"

Guest B (${claimB.guest}): "${claimB.claim}"
Quote: "${claimB.quote}"

Topic: ${claimA.topic}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: `You are an expert at identifying intellectual disagreements. You will be shown two pieces of advice from two different product and business experts on the same general topic. Your job is to determine whether these represent a genuine contradiction — meaning the two guests would actually disagree if they were in the same room, and one of them would push back on the other's advice.

This is NOT a contradiction if:
- they are talking about different contexts
- they are complementary (one is early-stage, the other late-stage)
- they are discussing different aspects of the same topic
- one is general and one is specific (and they don't actually conflict)

Return a JSON object with:
- is_contradiction: boolean
- confidence: number between 0 and 1
- tension_summary: one punchy sentence (under 15 words) describing what they disagree about, like "Hire for raw talent vs. culture fit first"

Return ONLY valid JSON, no markdown.`,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") return null;

  try {
    const raw = block.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  if (!existsSync(CLAIMS_FILE)) {
    console.error("❌ claims.json not found. Run extract-claims first.");
    process.exit(1);
  }

  const claims: Claim[] = JSON.parse(readFileSync(CLAIMS_FILE, "utf-8"));
  console.log(`Loaded ${claims.length} claims`);

  const topicMap = await normalizeTopics(claims);

  // Group claims by canonical topic
  const grouped = new Map<string, Claim[]>();
  for (const claim of claims) {
    const canonical = topicMap.get(claim.topic) || claim.topic;
    if (!grouped.has(canonical)) grouped.set(canonical, []);
    grouped.get(canonical)!.push(claim);
  }

  const contradictions: Contradiction[] = [];
  let contradictionCount = 0;
  let pairsTested = 0;

  for (const [canonicalTopic, topicClaims] of grouped.entries()) {
    const guestGroups = new Map<string, Claim[]>();
    for (const claim of topicClaims) {
      if (!guestGroups.has(claim.guest)) guestGroups.set(claim.guest, []);
      guestGroups.get(claim.guest)!.push(claim);
    }

    const guests = [...guestGroups.keys()];
    if (guests.length < 2) continue;

    const topicContradictions: Contradiction[] = [];
    const seenPairs = new Set<string>();

    // Test pairs of claims from different guests
    for (let i = 0; i < guests.length; i++) {
      for (let j = i + 1; j < guests.length; j++) {
        const pairKey = `${guests[i]}|${guests[j]}`;
        if (seenPairs.has(pairKey)) continue;

        const claimsA = guestGroups.get(guests[i])!;
        const claimsB = guestGroups.get(guests[j])!;

        for (const claimA of claimsA) {
          for (const claimB of claimsB) {
            pairsTested++;
            try {
              const result = await checkContradiction(claimA, claimB);
              if (result?.is_contradiction && result.confidence >= 0.65) {
                topicContradictions.push({
                  id: `contradiction_${String(contradictionCount + 1).padStart(3, "0")}`,
                  topic: claimA.topic,
                  canonical_topic: canonicalTopic,
                  confidence: result.confidence,
                  tension_summary: result.tension_summary,
                  guest_a: {
                    name: claimA.guest,
                    position: claimA.claim,
                    quote: claimA.quote,
                    episode_title: claimA.episode_title,
                  },
                  guest_b: {
                    name: claimB.guest,
                    position: claimB.claim,
                    quote: claimB.quote,
                    episode_title: claimB.episode_title,
                  },
                });
                contradictionCount++;
                seenPairs.add(pairKey);
              }
            } catch (err) {
              console.error(`Error checking pair: ${err instanceof Error ? err.message : err}`);
            }

            // Small delay to avoid rate limits
            await new Promise((r) => setTimeout(r, 100));
          }
          // Stop after finding a contradiction for this guest pair in this topic
          if (seenPairs.has(`${guests[i]}|${guests[j]}`)) break;
        }
      }
    }

    // Sort by confidence, keep top contradictions per topic
    topicContradictions.sort((a, b) => b.confidence - a.confidence);
    contradictions.push(...topicContradictions.slice(0, 3));

    if (topicContradictions.length > 0) {
      console.log(`📍 ${canonicalTopic}: ${topicContradictions.length} contradiction(s) found`);
    }

    // Save progress incrementally
    writeFileSync(OUTPUT_FILE, JSON.stringify(contradictions, null, 2));
  }

  console.log(`\n🎉 Done! Tested ${pairsTested} pairs, found ${contradictions.length} contradictions`);
  console.log(`Results saved to data/contradictions.json`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
