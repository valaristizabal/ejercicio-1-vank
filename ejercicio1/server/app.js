require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3002;


// Configuración de Gemini API
const geminisApiKey = process.env.GEMINI_API_KEY;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Endpoint para resumir texto
app.post('/summarize', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    // Configuración para la solicitud a la API de Gemini
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminisApiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Por favor, resume el siguiente texto en español: ${text}`, // Ajustado para español
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Revisar toda la respuesta de la API
    console.log('Respuesta de la API:', response.data);

    // Verificar candidatos y extraer el contenido
    const candidates = response.data.candidates;
    if (candidates && candidates.length > 0) {
      const firstCandidate = candidates[0];
      const summary = firstCandidate.content?.parts?.[0]?.text || 'No summary provided'; // Ajustamos el acceso

      // Devolver el resumen al cliente
      return res.json({ summary });
    }

    // Si no se encuentra un resumen válido
    res.status(500).json({ error: 'Summary not found in API response' });
  } catch (error) {
    console.error('Error al interactuar con la API de Geminis:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
