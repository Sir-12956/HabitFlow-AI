<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1qHaEa9WdgiYlpDv3D6xTEoWKJhc6pMaT

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# About this code

## Overview
HabitFlow AI is a React-based productivity application that bridges the gap between a daily To-Do List and Habit Tracking. Its core visual component is "Heatmaps" (similar to GitHub contribution graphs) that visualize consistency over time.

## Key Features
1. Dual-Mode Habit Tracking:
- Task Driven: Habits are linked to specific To-Dos. Checking off a To-Do item automatically updates the corresponding heatmap for that day.
- Manual Check-in: Users can directly click on the heatmap grid squares to log activity for habits that aren't task-specific (e.g., "Drank Water").

2. AI Integration (Google Gemini):
- AI Coach: Analyzes the user's habit logs and completed tasks to provide a "Consistency Score," a written summary of performance, actionable advice, and motivational quotes.
- Smart Task Generation: Users can ask the AI to generate specific, actionable small tasks based on a habit name (e.g., generating workout ideas for a "Fitness" habit).

3. Organization & Workflow:
- Categories: Habits are grouped into folders (Categories) which support drag-and-drop reordering.
- "Default" Logic: If a user creates a task or heatmap without specifying a category, it automatically routes to or creates a "Default" category.
- Dashboard: Shows a combined view of active tasks for the day and the visual heatmaps.

4. Customization & UX:
- Themes: Supports Light Mode, Dark Mode, and user-defined Custom Color themes.
- Localization: Fully translated support for English and Chinese.
- Persistence: All data (Todos, Habits, Categories, Settings) is saved locally to the browser's localStorage.

## Technical Stack
- Frontend: React (TypeScript), Tailwind CSS.
- Icons: Lucide-react.
- AI: @google/genai SDK.
- State: Local state management with simple persistence services.
