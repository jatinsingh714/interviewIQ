import axios from "axios"

export const askAi = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }

        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error("OPENROUTER_API_KEY is not configured.");
        }

        const openRouterUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1/chat/completions";

        const response = await axios.post(openRouterUrl, {
            model: 'openai/gpt-4o-mini',
            messages,
            max_tokens: 300,
            temperature: 0.5,
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
            validateStatus: null,
        });

        const getAssistantContent = (data) => {
            if (!data) return "";
            if (data?.choices && Array.isArray(data.choices) && data.choices.length > 0) {
                const choice = data.choices[0];
                if (choice?.message && typeof choice.message.content === 'string') {
                    return choice.message.content;
                }
                if (choice?.text && typeof choice.text === 'string') {
                    return choice.text;
                }
                if (choice?.delta && typeof choice.delta.content === 'string') {
                    return choice.delta.content;
                }
            }
            return null;
        };

        const extractText = (value) => {
            if (value == null) return "";
            if (typeof value === "string") return value;
            if (typeof value === "number" || typeof value === "boolean") return String(value);
            if (Array.isArray(value)) return value.map(extractText).filter(Boolean).join(" ");
            if (typeof value === "object") {
                if (typeof value.text === "string") return value.text;
                if (Array.isArray(value.parts)) return value.parts.map(extractText).filter(Boolean).join(" ");
                if (Array.isArray(value.content)) return value.content.map(extractText).filter(Boolean).join(" ");
                return Object.values(value).map(extractText).filter(Boolean).join(" ");
            }
            return "";
        };

        if (typeof response?.data === 'string') {
            const trimmed = response.data.trim();
            if (trimmed.startsWith('<') && trimmed.length > 0) {
                console.error("OpenRouter HTML response:", trimmed.slice(0, 1000));
                throw new Error("OpenRouter returned HTML instead of JSON. Use https://openrouter.ai/api/v1/chat/completions and verify OPENROUTER_API_KEY.");
            }
        }

        let content = getAssistantContent(response?.data);
        if (content === null || !content.trim()) {
            content = extractText(response?.data);
        }

        if (!content.trim()) {
            console.error("OpenRouter full response:", JSON.stringify(response?.data, null, 2));
            throw new Error("AI returned empty response.");
        }

        const cleaned = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return cleaned;
    } catch (error) {
        console.error("OpenRouter Error:", error.response?.data || error.message);
        const serverMessage = error.response?.data?.error || error.response?.data || error.message;
        throw new Error(`OpenRouter API Error: ${typeof serverMessage === 'string' ? serverMessage : JSON.stringify(serverMessage)}`);
    }
}
