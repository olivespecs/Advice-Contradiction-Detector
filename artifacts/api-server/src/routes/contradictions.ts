import { Router } from "express";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  ListContradictionsQueryParams,
  GetContradictionParams,
} from "@workspace/api-zod";

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

// GET /api/contradictions
router.get("/", (req, res) => {
  const parseResult = ListContradictionsQueryParams.safeParse(req.query);
  const params = parseResult.success ? parseResult.data : {};

  let contradictions = loadContradictions();

  if (params.topic) {
    const topicLower = params.topic.toLowerCase();
    contradictions = contradictions.filter(
      (c: { canonical_topic: string }) =>
        c.canonical_topic?.toLowerCase().includes(topicLower)
    );
  }

  if (params.confidence === "high") {
    contradictions = contradictions.filter(
      (c: { confidence: number }) => c.confidence >= 0.8
    );
  }

  if (params.guest) {
    const guestLower = params.guest.toLowerCase();
    contradictions = contradictions.filter(
      (c: { guest_a: { name: string }; guest_b: { name: string } }) =>
        c.guest_a?.name?.toLowerCase().includes(guestLower) ||
        c.guest_b?.name?.toLowerCase().includes(guestLower)
    );
  }

  res.json(contradictions);
});

// GET /api/contradictions/:id
router.get("/:id", (req, res) => {
  const parseResult = GetContradictionParams.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { id } = parseResult.data;
  const contradictions = loadContradictions();
  const contradiction = contradictions.find(
    (c: { id: string }) => c.id === id
  );

  if (!contradiction) {
    res.status(404).json({ error: "Contradiction not found" });
    return;
  }

  res.json(contradiction);
});

export default router;
