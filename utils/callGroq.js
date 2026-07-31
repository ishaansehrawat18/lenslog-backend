// Groq uses an OpenAI-compatible chat completions format.

// Some Groq models (like qwen/qwen3.6-27b) are "reasoning" models that
// output their internal thinking wrapped in <think>...</think> tags
// before the actual answer. We only want the final answer, so strip
// that block out and trim whatever's left.
const stripThinking = (text) => {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Text-only chat (used by the AI chatbot widget)
export const callGroqText = async (prompt) => {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq API returned no text content");
  return stripThinking(text);
};

// Text + image (used by the caption suggestion feature)
export const callGroqVision = async ({ prompt, imageBase64, imageMimeType }) => {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "qwen/qwen3.6-27b",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${imageMimeType};base64,${imageBase64}` },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq API returned no text content");
  return stripThinking(text);
};