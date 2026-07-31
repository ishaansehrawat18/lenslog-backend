// Calls Google's Gemini API. Works for both plain text prompts (chatbot)
// and image+text prompts (caption suggestions) — Gemini's API accepts
// an array of "parts" that can mix text and inline base64 image data.
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// prompt: string of text to send
// imageBase64 / imageMimeType: optional, include to ask about an image
export const callGemini = async ({ prompt, imageBase64, imageMimeType }) => {
  const parts = [{ text: prompt }];

  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: imageMimeType || "image/jpeg",
        data: imageBase64,
      },
    });
  }

  const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  // Extract the plain text reply from Gemini's response shape
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini API returned no text content");
  }

  return text.trim();
};