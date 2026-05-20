import fs from "fs";
import path from "path";
import { SongCounts, SongEntry } from "../types";

const COUNTS_FILE = path.join(process.cwd(), "data/song-counts.json");

export function initCounts(): void {
  try {
    fs.mkdirSync(path.dirname(COUNTS_FILE), { recursive: true });
    if (!fs.existsSync(COUNTS_FILE)) {
      fs.writeFileSync(COUNTS_FILE, JSON.stringify({}, null, 2));
      console.log(`Created song counts file at ${COUNTS_FILE}`);
    }
  } catch (err) {
    console.error("Failed to initialize song counts file:", err);
  }
}

export function loadCounts(): SongCounts {
  if (!fs.existsSync(COUNTS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(COUNTS_FILE, "utf8"));
  } catch {
    return {};
  }
}

export function saveCounts(counts: SongCounts): void {
  try {
    fs.mkdirSync(path.dirname(COUNTS_FILE), { recursive: true });
    fs.writeFileSync(COUNTS_FILE, JSON.stringify(counts, null, 2));
  } catch (err) {
    console.error("Failed to save song counts:", err);
  }
}

export function isNewTrack(trackId: string): boolean {
  return loadCounts()[trackId] === undefined;
}

export function totalRequests(entry: SongEntry): number {
  return Object.values(entry.requests).reduce((sum, n) => sum + n, 0);
}

export function setRequests(
  trackId: string,
  trackUrl: string,
  requests: Record<string, number>
): void {
  const counts = loadCounts();
  counts[trackId] = { url: trackUrl, requests };
  saveCounts(counts);
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function buildScoreboard(entry: SongEntry): string {
  const total = totalRequests(entry);
  const sorted = Object.entries(entry.requests).sort(([, a], [, b]) => b - a);

  const lines = sorted.map(([userId, count], i) => {
    const medal = MEDALS[i] ?? "▪️";
    const times = count === 1 ? "1 time" : `${count} times`;
    return `${medal} <@${userId}> — ${times}`;
  });

  return [
    `🎵 This track has been requested **${total} times** in this server!`,
    ...lines,
  ].join("\n");
}

export function incrementUserRequest(
  trackId: string,
  trackUrl: string,
  userId: string
): SongEntry {
  const counts = loadCounts();
  const entry = counts[trackId] ?? { url: trackUrl, requests: {} };
  entry.requests[userId] = (entry.requests[userId] ?? 0) + 1;
  counts[trackId] = entry;
  saveCounts(counts);
  return entry;
}
