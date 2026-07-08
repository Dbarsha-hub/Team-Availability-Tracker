const API_URL = "http://127.0.0.1:5000";

export async function getMembers() {
  const response = await fetch(`${API_URL}/api/users`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}
export async function updateMemberAvailability(
  id: number,
  available: boolean
) {
  const response = await fetch(
    `http://127.0.0.1:5000/api/users/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        available,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return response.json();
}