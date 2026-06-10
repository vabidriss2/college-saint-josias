import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { mockStudents, mockFinancialTransactions } from "./src/mockData";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      // Provide summarized context
      const studentContext = mockStudents.map(s => `${s.firstName} ${s.lastName} (Class: ${s.className}, Fees Paid: ${s.paidFees}/${s.totalFees})`).join(", ");
      const financialContext = mockFinancialTransactions.slice(0, 5).map(t => `${t.description}: ${t.amount} (${t.type})`).join(", ");

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are the AI assistant for Saint Josias Smart School. 
          Answer questions about school data, student performance, and financial reports based on the following context.
          
          Students Summary: ${studentContext}
          Recent Financial Transactions: ${financialContext}
          
          Be concise and helpful.`,
        }
      });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to communicate with AI." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
