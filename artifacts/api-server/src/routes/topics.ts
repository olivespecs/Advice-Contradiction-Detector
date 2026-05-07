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

// GET /api/topics
router.get("/", (_req, res) => {
  const contradictions = loadContradictions();

  const topicMap = new Map<string, number>();
  for (const c of contradictions) {
    const topic = c.canonical_topic || c.topic;
    if (topic) {
      topicMap.set(topic, (topicMap.get(topic) ?? 0) + 1);
    }
  }

  const topics = Array.from(topicMap.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));

  res.json(topics);
});

export default router;
