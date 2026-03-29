import type { User, Role } from "@/types";

/**
 * Decode a JWT access token to extract user info from claims.
 *
 * The backend puts these claims in the JWT:
 * - ClaimTypes.NameIdentifier → user ID  (claim key: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
 * - JwtRegisteredClaimNames.UniqueName → username  (claim key: "unique_name")
 * - ClaimTypes.Role → role string         (claim key: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
 */
export function jwtDecode(token: string): User {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);

    // .NET claim type URIs
    const id =
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ??
      payload["nameid"] ??
      payload["sub"];

    const username = payload["unique_name"] ?? payload["name"] ?? "User";

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      payload["role"] ??
      "Employee";

    return {
      id: Number(id),
      username: String(username),
      role: role as Role,
    };
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return {
      id: 0,
      username: "Unknown",
      role: "Employee",
    };
  }
}
