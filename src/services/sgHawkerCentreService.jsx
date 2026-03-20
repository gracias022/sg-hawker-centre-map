export const fetchHawkerCentres = async () => {
  try {
    const response = await fetch("/api/hawker-centres");
    if (!response.ok) {
      throw new Error(`Backend fetch failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data?.features ?? [];
  } catch (error) {
    console.error("Error fetching hawker centres:", error);
    throw error;
  }
};
