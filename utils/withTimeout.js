export async function withTimeout(promise, timeout = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Query timed out")), timeout)
    ),
  ]);
}