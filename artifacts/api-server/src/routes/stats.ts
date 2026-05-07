import { Router } from "express";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "..", "data");

function loadContradictions() {
  const filePath = join(DATA_DIR, "contradictions.json");
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

// GET /api/stats
router.get("/", (_req, res) => {
  const contradictions = loadContradictions();

  const guests = new Set<string>();
  const topicConfidenceMap = new Map<string, number[]>();

  for (const c of contradictions) {
    if (c.guest_a?.name) guests.add(c.guest_a.name);
    if (c.guest_b?.name) guests.add(c.guest_b.name);

    const topic = c.canonical_topic || c.topic;
    if (topic) {
      if (!topicConfidenceMap.has(topic)) topicConfidenceMap.set(topic, []);
      topicConfidenceMap.get(topic)!.push(c.confidence || 0);
    }
  }

  let highestConfidenceTopic = "";
  let highestAvg = 0;
  for (const [topic, confidences] of topicConfidenceMap.entries()) {
    const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    if (avg > highestAvg) {
      highestAvg = avg;
      highestConfidenceTopic = topic;
    }
  }

  res.json({
    total_contradictions: contradictions.length,
    total_guests_featured: guests.size,
    total_topics: topicConfidenceMap.size,
    highest_confidence_topic: highestConfidenceTopic,
  });
});

export default router;
