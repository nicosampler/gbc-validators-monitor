import { RateLimiterMemory } from "rate-limiter-flexible";

// Create a rate limiter per second
const limiterPerSecond = new RateLimiterMemory({
  points: Number(process.env.GNOSISSCAN_API_REQUEST_PER_SECOND),
  duration: 1, // Per second
  keyPrefix: "per-second",
});

// Create a rate limiter per day
const limiterPerDay = new RateLimiterMemory({
  points: Number(process.env.GNOSISSCAN_API_REQUEST_PER_DAY),
  duration: 60 * 60 * 24, // Per day
  keyPrefix: "per-day",
});

// Function to limit requests
export async function limitRequests<T>(fn: () => Promise<T>): Promise<T> {
  try {
    // Consume a point from both rate limiters
    await Promise.all([
      limiterPerSecond.consume("per-second-key", 1),
      limiterPerDay.consume("per-day-key", 1),
    ]);

    return fn();
  } catch (err: any) {
    if (err.msBeforeNext) {
      // Delay the request if it exceeds the limit
      await new Promise((resolve) => setTimeout(resolve, err.msBeforeNext));
      return limitRequests(fn);
    }
    throw err;
  }
}
