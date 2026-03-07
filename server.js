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
A user is taking the following supplements: ${supplements}

Please analyze this supplement stack and return a structured report with exactly these four sections:

1. INTERACTIONS: List any known interactions between these supplements (positive synergies or negative conflicts). Be specific about which supplements interact with each other.

2. REDUNDANCIES: Identify any supplements that overlap in function or nutrients, meaning the user may be doubling up unnecessarily.

3. EVIDENCE QUALITY: For each supplement listed, rate the scientific evidence supporting its common use as: Strong / Moderate / Weak / Anecdotal. Give a one-sentence reason for each rating.

4. RECOMMENDATIONS: Give 3 to 5 practical, plain-English recommendations based on the above analysis.

Important: Always remind the user to consult a healthcare professional before making changes.`;

  // Call Claude with the prompt
  //const message = await client.messages.create({
    //model: 'claude-sonnet-4-6',
    //max_tokens: 1500,
    //messages: [{ role: 'user', content: prompt }]
  //});

    //Call Google Gemini with a prompt
    //const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
   // const result = await model.generateContent(prompt);
  
    //Call groq with a prompt 
    const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }]
    });



  // Send Claude's response back to the browser
  //res.json({ result: message.content[0].text });
  // Send Gemini response back to the browser
  //res.json({ result: result.response.text() });
  // Send Groq response back to the browser
  res.json({ result: completion.choices[0].message.content });

    } catch (error) {                              
    console.error('Groq error:', error.message); 
    res.status(500).json({ error: error.message });   
  }                                              


});

// Start the server on port 3001
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});