export const IPIFY_API_URL = "https://api.ipify.org/?format=json";


export const getIPAddress = async (timeoutMs = 3000): Promise<string> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(IPIFY_API_URL, { signal: controller.signal });
        if (!response.ok) {
            console.error(`Failed to fetch IP address: ${response.status}`);
            return "";
        }

        const data = (await response.json()) as { ip?: string };
        return data?.ip ?? "";
    } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") {
            console.error("IP fetch aborted due to timeout");
        } else {
            console.error("Error fetching IP address:", error);
        }

        return "";
    } finally {
        clearTimeout(id);
    }
};

export const getUserAccessAddress = getIPAddress;
