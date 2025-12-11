import { GoogleGenAI } from "@google/genai";
import { Habit, Todo } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const analyzeHabits = async (habits: Habit[], todos: Todo[]) => {
    const ai = getClient();
    if (!ai) throw new Error("API Key not found");

    // Prepare data summary for the AI
    const today = new Date().toISOString().split('T')[0];
    const recentTodos = todos.slice(-20); // Last 20 todos
    
    const summary = {
        date: today,
        habits: habits.map(h => ({
            name: h.name,
            mode: h.isManual ? "Manual Check-in" : "Task Driven",
            recentActivity: Object.entries(h.logs)
                .sort((a, b) => b[0].localeCompare(a[0])) // Sort by date desc
                .slice(0, 7) // Last 7 entries
                .reduce((acc, [date, count]) => ({ ...acc, [date]: count }), {})
        })),
        recentTasks: recentTodos.map(t => ({
            task: t.text,
            completed: t.completed,
            date: t.date
        }))
    };

    const prompt = `
    You are a world-class productivity coach using the Gemini API.
    Analyze the following user data (JSON) regarding their habits and to-do list usage.
    
    Data: ${JSON.stringify(summary)}

    Provide a response in the following JSON format ONLY (no markdown code blocks):
    {
        "score": number (0-100 based on consistency),
        "summary": "A 2-sentence summary of their recent performance.",
        "advice": "One specific, actionable piece of advice to improve their heatmaps.",
        "motivationalQuote": "A short relevant quote."
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        throw error;
    }
};

export const generateSmartTodos = async (habitName: string) => {
    const ai = getClient();
    if (!ai) throw new Error("API Key not found");

    const prompt = `
    Generate 3 specific, actionable, small to-do list items that would help someone achieve progress in the habit category: "${habitName}".
    Return ONLY a JSON array of strings. Example: ["Read 5 pages", "Organize bookshelf", "Listen to audiobook for 10 mins"].
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        return JSON.parse(response.text) as string[];
    } catch (error) {
        console.error("Gemini Task Gen Failed:", error);
        return ["Just start for 5 minutes", "Review your goals", "Prepare for tomorrow"];
    }
};