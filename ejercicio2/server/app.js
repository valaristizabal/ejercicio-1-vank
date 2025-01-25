const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;

// Sirve los archivos estáticos desde el directorio public
app.use(express.static(path.join(__dirname, '../public')));

// Mapeo de códigos de clima (por ejemplo, para Open-Meteo)
const weatherCodeDescriptions = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Escarcha',
  51: 'Lluvia ligera',
  53: 'Lluvia moderada',
  55: 'Lluvia intensa',
  61: 'Chubascos ligeros',
  63: 'Chubascos moderados',
  65: 'Chubascos intensos',
  80: 'Tormenta ligera',
  81: 'Tormenta moderada',
  82: 'Tormenta intensa',
};

// Ruta para obtener el clima
app.get('/api/clima', async (req, res) => {
  try {
    // Usa Promise.race para seleccionar la API más rápida
    const responses = await Promise.race([
      fetch("https://api.open-meteo.com/v1/forecast?latitude=6.25184&longitude=-75.56359&current_weather=true"),
      fetch("https://wttr.in/Medellín?format=j1"),
      fetch("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=6.25184&lon=-75.56359"),
    ]);

    const data = await responses.json();

    // Log para depurar el formato de los datos recibidos
    console.log('Datos recibidos de la API:', JSON.stringify(data, null, 2));

    // Extrae los datos de temperatura, descripción, humedad y demás
    const temperature =
      data.current_weather?.temperature || // Open-Meteo
      data.weather?.current_condition?.[0]?.temp_C || // Wttr.in
      null;

    const description =
      weatherCodeDescriptions[data.current_weather?.weathercode] || // Mapeo Open-Meteo
      data.weather?.current_condition?.[0]?.weatherDesc?.[0]?.value || // Wttr.in
      null;

    const wind_speed =
      data.current_weather?.windspeed ||
      data.weather?.current_condition?.[0]?.windspeed ||
      null;

    const last_update =
      data.current_weather?.time ||
      data.weather?.current_condition?.[0]?.localObsDateTime ||
      null;

    // Prepara el objeto con solo los campos disponibles
    const result = {};

    // Solo agrega la temperatura si está disponible
    if (temperature !== null) {
      result.temperature = `${temperature}°C`;
    }

    // Solo agrega la descripción si está disponible
    if (description !== null) {
      result.description = description;
    }

    // Solo agrega la velocidad del viento si está disponible
    if (wind_speed !== null) {
      result.wind_speed = `${wind_speed} km/h`;
    }

    // Solo agrega la última actualización si está disponible
    if (last_update !== null) {
      result.last_update = last_update;
    }

    res.json(result);
  } catch (error) {
    console.error('Error al obtener los datos del clima:', error);
    res.status(500).json({ error: 'Error al obtener los datos del clima' });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
