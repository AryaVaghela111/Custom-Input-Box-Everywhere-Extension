chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type === "llmRequest") {
    console.log("🛰️ background received llmRequest with text:", msg.text);

    const prompt = msg.text;

    try {
      const apiKey = "YOUR API KEY"; 

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const body = JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      });

      console.log("🌐 Sending to Gemini:", body);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body
      });

      console.log("✅ Gemini response status:", response.status);
      const data = await response.json();
      console.log("🌟 Gemini FULL JSON:", JSON.stringify(data, null, 2));

      console.log("🌟 Gemini JSON:", data);

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "(no reply from Gemini)";

      chrome.tabs.sendMessage(sender.tab.id, {
        type: "llmResponse",
        text
      });

      console.log("✅ Sent llmResponse back to content.js");

    } catch (err) {
      console.error("❌ Gemini API error", err);
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "llmResponse",
        text: `❌ Gemini error: ${err.message}`
      });
    }
  }
});
