import { GoogleGenAI } from "@google/genai";
import { Habit, Todo } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const analyzeHabits = async (
    habits: Habit[], 
    todos: Todo[],
    startDate?: string,
    endDate?: string
) => {
    const ai = getClient();
    if (!ai) throw new Error("API Key not found");

    const today = new Date().toISOString().split('T')[0];
    
    // Filter Data based on date range
    let filteredHabits = habits;
    let filteredTodos = todos;

    if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-01-01');

        // Filter Todos
        filteredTodos = todos.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });

        // Filter Habit Logs
        filteredHabits = habits.map(h => {
            const newLogs: Record<string, number> = {};
            Object.entries(h.logs).forEach(([date, count]) => {
                const d = new Date(date);
                if (d >= start && d <= end) {
                    newLogs[date] = count;
                }
            });
            return { ...h, logs: newLogs };
        });
    }

    const recentTodos = filteredTodos.slice(-20); // Cap at last 20 filtered items
    
    const summary = {
        analysisPeriod: {
            start: startDate || "All time",
            end: endDate || today
        },
        habits: filteredHabits.map(h => ({
            name: h.name,
            mode: h.isManual ? "Manual Check-in" : "Task Driven",
            activity: Object.entries(h.logs)
                .sort((a, b) => b[0].localeCompare(a[0])) 
                .slice(0, 10) // Send top 10 logs in period
                .reduce((acc, [date, count]) => ({ ...acc, [date]: count }), {}),
            totalActiveDaysInPeriod: Object.keys(h.logs).length
        })),
        tasksSample: recentTodos.map(t => ({
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
        "score": number (0-100 based on consistency in the selected period),
        "summary": "A 2-sentence summary of their performance in this period.",
        "advice": "One specific, actionable piece of advice to improve.",
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

export const calculateVelocityReplanning = async (
    habitName: string,
    startDate: string,
    currentDurationDays: number,
    logs: Record<string, number>
) => {
    const ai = getClient();
    if (!ai) throw new Error("API Key not found");

    const today = new Date().toISOString().split('T')[0];
    
    // Simple calc for context to the AI
    const start = new Date(startDate);
    const now = new Date();
    const daysPassed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 3600 * 24));
    const activeDays = Object.values(logs).filter(v => v > 0).length;

    const prompt = `
    The user is tracking a habit: "${habitName}".
    - Start Date: ${startDate}
    - Current Target Duration: ${currentDurationDays} days
    - Days Passed Since Start: ${daysPassed}
    - Active Days Logged: ${activeDays}
    - Current Date: ${today}

    The user feels they might not finish on time or wants to adjust based on their actual pace (velocity).
    
    Task:
    1. Calculate their current velocity (active rate).
    2. Estimate a NEW realistic total duration (in days) to achieve a meaningful volume of work implied by the original goal (assuming the original goal meant consistent effort).
    3. If they are very behind, extend the duration significantly.
    4. Provide a very short reasoning string (max 15 words).

    Return JSON ONLY:
    {
        "newDurationDays": number,
        "reasoning": "string"
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
        return JSON.parse(response.text) as { newDurationDays: number, reasoning: string };
    } catch (error) {
        console.error("Gemini Replan Failed:", error);
        throw error;
    }
};