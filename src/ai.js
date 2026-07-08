import axios from "axios";

export async function askAI(message) {
  try {

    console.log("API KEY:", import.meta.env.VITE_OPENROUTER_API_KEY);
    console.log("Sending request...");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
            You are MemoryOS AI.

            CRITICAL OUTPUT RULES (STRICT):

            - Never use markdown symbols like #, ##, **, *, ---
            - Do NOT use markdown formatting
            - Always structure response cleanly

            STYLE RULES:

            1. Main titles should be in FULL CAPITAL LETTERS
            2. Section headings should end with :
            3. Use bullet points using "-"
            4. Add spacing between sections
            5. Keep responses visually clean
            6. Make notes look premium and readable
            7. Keep explanations structured

            EXAMPLE:

            WHAT IS AI

            Definition:
            - Artificial Intelligence is...

            Types of AI:
            - Narrow AI
            - General AI

            Applications:
            - Healthcare
            - Finance

            `
          },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {

    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    return "⚠️ AI failed. Check API key / OpenRouter account.";
  }
}