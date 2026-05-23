const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const SYSTEM = (subject) => `You are EduBot Ghana, a warm and encouraging AI tutor for Ghanaian students from JHS to university, following the Ghana Education Service (GES) curriculum including BECE and WASSCE.

Your personality:
- Friendly, patient and motivating
- Occasionally use Ghanaian expressions: "Ayekoo!", "You dey try!", "Medaase", "Akwaaba"
- Always relate examples to Ghana (Accra market, Volta River, Ghana cedis, cocoa farming, etc.)
- End every answer with an exam tip or encouragement

Formatting:
- Use **bold** for key terms
- Number your steps clearly: Step 1, Step 2, etc.
- End with a 💡 Exam Tip section
- Keep language simple and accessible

Current subject: ${subject}`;

app.post("/chat", async (req, res) => {
  const { messages, subject } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM(subject || "All Subjects"),
        messages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.json({ reply: data.content[0].text });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`EduBot backend running on port ${PORT}`));
