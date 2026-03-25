// Load secret keys from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
//const Anthropic = require('@anthropic-ai/sdk');
//const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk')


const app = express();
app.use(cors());
app.use(express.json()); // This lets the server read JSON data sent from the browser

// Create the Claude client using your secret API key
//const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
//const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// This is your single "endpoint" — a URL your frontend will call
app.post('/analyze', async (req, res) => {

 try {  
  
  // Get the supplement list that the browser sent us
  const { supplements } = req.body;

  // This is your prompt — the instructions you give Claude
const prompt = `You are a knowledgeable supplement and nutrition expert.
 
Analyze the following supplements: ${supplements}
 
Perform a thorough analysis covering:
 
INTERACTIONS: Identify all known interactions between these supplements. Include both:
- Positive synergies (e.g. Vitamin D3 enhances Magnesium absorption, Vitamin C improves Iron absorption)
- Negative conflicts (e.g. Calcium blocks Iron absorption, high dose Zinc depletes Copper)
Be specific about exactly which supplements interact with each other and why.
 
REDUNDANCIES: Identify any supplements that overlap in function or nutrients, meaning the user may be doubling up unnecessarily. For example, if someone takes both a Vitamin B complex and individual B12, that is a redundancy.
 
EVIDENCE QUALITY: For each supplement listed, rate the scientific evidence supporting its most common use:
- Strong: Multiple large randomised controlled trials support its use
- Moderate: Some good studies exist but evidence is mixed or limited
- Weak: Only small or low quality studies exist
- Anecdotal: Based mainly on personal reports with little scientific backing
Give a one sentence reason for each rating.
 
RECOMMENDATIONS: Give 3 to 5 practical plain-English recommendations based on your analysis. Always include advice to consult a healthcare professional before making changes.`;
 
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "supplement_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              interactions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    supplements: { type: "array", items: { type: "string" } },
                    type: { type: "string", enum: ["positive", "negative"] },
                    description: { type: "string" }
                  },
                  required: ["supplements", "type", "description"],
                  additionalProperties: false
                }
              },
              redundancies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    supplements: { type: "array", items: { type: "string" } },
                    reason: { type: "string" }
                  },
                  required: ["supplements", "reason"],
                  additionalProperties: false
                }
              },
              evidenceQuality: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    supplement: { type: "string" },
                    rating: { type: "string", enum: ["Strong", "Moderate", "Weak", "Anecdotal"] },
                    reason: { type: "string" }
                  },
                  required: ["supplement", "rating", "reason"],
                  additionalProperties: false
                }
              },
              recommendations: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["interactions", "redundancies", "evidenceQuality", "recommendations"],
            additionalProperties: false
          }
        }
      }
    });



  // Send Claude's response back to the browser
  //res.json({ result: message.content[0].text });
  // Send Gemini response back to the browser
  //res.json({ result: result.response.text() });
  // Send Groq response back to the browser

  let rawText = completion.choices[0].message.content;
  rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  res.json({ result: rawText });

    } catch (error) {                              
    console.error('Groq error:', error.message); 
    res.status(500).json({ error: error.message });   
  }                                              


});

// Start the server on port 3001
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});