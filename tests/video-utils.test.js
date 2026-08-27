import { describe, expect, it } from "vitest";

import {
  formatDuration,
  isVideoFile,
  nextIndex,
  previousIndex,
  readableVideoTitle,
  safeFilename,
} from "../lib/video-utils.js";

describe("Vin Vid Player video utilities", () => {
  it("recognizes common video containers and MIME types", () => {
    expect(isVideoFile("clip.MP4")).toBe(true);
    expect(isVideoFile("camera-roll.mkv")).toBe(true);
    expect(isVideoFile("download.bin", "video/mp4")).toBe(true);
    expect(isVideoFile("cover.jpg", "image/jpeg")).toBe(false);
  });

  it("turns filenames into titles and keeps extensions separate", () => {
    expect(readableVideoTitle("my-first_clip-2026.mp4")).toBe("my first clip 2026");
    expect(readableVideoTitle(".mp4")).toBe("Untitled video");
  });

  it("formats video duration for short and long media", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(125)).toBe("2:05");
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("navigates the library without producing invalid indexes", () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(2, 3)).toBe(-1);
    expect(nextIndex(2, 3, true)).toBe(0);
    expect(previousIndex(0, 3)).toBe(2);
    expect(previousIndex(0, 0)).toBe(-1);
  });

  it("creates safe durable filenames", () => {
    expect(safeFilename("holiday video (1).mp4")).toBe("holiday_video_1_.mp4");
    expect(safeFilename("///", "fallback.mp4")).toBe("fallback.mp4");
  });
});
