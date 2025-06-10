import express from "express"
import axios from "axios"

const router=express.Router()

router.post("/", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const response = await axios.post(
      "https://models.github.ai/inference/chat/completions",
      {
        model: "openai/gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: `Correct the grammar of this sentence: "${text}". Only return the corrected sentence. If the sentence is already correct or meaningless, return nothing.`,
          },
        ],
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Extract corrected sentence
    const correctedSentence = response.data.choices?.[0]?.message?.content?.trim();

    if (!correctedSentence) {
      return res.status(500).json({ error: "Model did not return a response" });
    }

    // ✅ Send corrected result to frontend
    res.status(200).json({ corrected: correctedSentence });

  } catch (error) {
    console.error("Grammar correction failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Grammar check failed" });
  }
});

export default router;
