const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3003;

// Cambiar la ruta de la carpeta estática a "../public" desde el directorio "server"
app.use(express.static(path.join(__dirname, '../public')));  // Sirve archivos estáticos

app.use(express.json());  // Para manejar solicitudes JSON

async function crearArchivo(nombre, contenido) {
  try {
    await fs.writeFile(path.join(__dirname, `../${nombre}.txt`), contenido);
    return `Archivo ${nombre}.txt creado`;
  } catch (error) {
    console.error(`Error al crear ${nombre}.txt:`, error);
    throw error;
  }
}

// Ruta para crear los archivos
app.post('/crear-archivos', async (req, res) => {
  const { cantidad, contenido } = req.body;
  let arregloPromesas = [];

  for (let i = 1; i <= cantidad; i++) {
    arregloPromesas.push(crearArchivo(String(i), contenido));
  }

  try {
    await Promise.all(arregloPromesas);
    res.json({ mensaje: `${cantidad} archivos creados exitosamente.` });
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al crear los archivos' });
  }
});

// Ruta para cargar el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
