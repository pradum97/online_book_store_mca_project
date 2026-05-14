export async function refreshAccessToken() {
  try {
    const res = await fetch("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await res.json();

    if (data?.action === "success") {
      return data.token;
    }
    return null;
  } catch (err) {
    console.error("Refresh token error:", err);
    return null;
  }
}
