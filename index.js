const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const DB_FILE = 'carreras.json';

// Función para leer la "base de datos"
const readDB = () => {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(DB_FILE));
};

// Función para escribir en la "base de datos"
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Genera un número aleatorio entre min y max
const randomSpeed = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Simula el avance de los corredores en cada hora
const simulateRace = (corredores, distancia) => {
    let tiempo = 0;
    let posiciones = corredores.map(c => ({ ...c, posicion: 0 }));
    let ganador = null;

    while (!ganador) {
        tiempo++;
        posiciones.forEach(corredor => {
            corredor.posicion += corredor.velocidad; // Avance por hora
            if (corredor.posicion >= distancia && !ganador) {
                ganador = corredor;
            }
        });
    }

    return { tiempo, posiciones, ganador };
};

// Ruta para crear una nueva carrera con parámetros de consulta
app.get('/', (req, res) => {
    const { numCorredores, distancia } = req.query;

    // Validar parámetros
    if (!numCorredores || !distancia || numCorredores <= 0 || distancia <= 0) {
        return res.status(400).send('Por favor, proporcione parámetros válidos: numCorredores y distancia.');
    }

    // Crear corredores con velocidades aleatorias
    const corredores = Array.from({ length: parseInt(numCorredores) }, (_, i) => ({
        id: i + 1,
        velocidad: randomSpeed(5, 15), // Velocidad aleatoria entre 5 y 15 km/h
    }));

    // Simular la carrera
    const { tiempo, posiciones, ganador } = simulateRace(corredores, parseFloat(distancia));

    // Crear nueva carrera
    const nuevaCarrera = {
        id: Date.now(),
        numCorredores: parseInt(numCorredores),
        distancia: parseFloat(distancia),
        tiempo,
        posiciones,
        ganador,
    };

    // Guardar la carrera en la "base de datos"
    const carreras = readDB();
    carreras.push(nuevaCarrera);
    writeDB(carreras);

    res.send(`
        <h1>Carrera Creada y Guardada</h1>
        <p>ID de la Carrera: ${nuevaCarrera.id}</p>
        <p>Distancia: ${distancia} km</p>
        <p>Tiempo total: ${tiempo} horas</p>
        <h2>Posiciones finales:</h2>
        <ul>
            ${posiciones
                .map(c => `<li>Corredor ${c.id}: ${c.posicion.toFixed(2)} km (Velocidad: ${c.velocidad} km/h)</li>`)
                .join('')}
        </ul>
        <h2>Ganador:</h2>
        <p>Corredor ${ganador.id} con una velocidad de ${ganador.velocidad} km/h.</p>
    `);
});

// Ruta para obtener todas las carreras
app.get('/carreras', (req, res) => {
    const carreras = readDB();
    res.json(carreras);
});

// Ruta para obtener una carrera específica por ID
app.get('/carreras/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const carreras = readDB();
    const carrera = carreras.find(c => c.id === id);

    if (!carrera) {
        return res.status(404).json({ error: 'Carrera no encontrada.' });
    }

    res.json(carrera);
});

// Ruta para eliminar una carrera
app.delete('/carreras/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const carreras = readDB();
    const nuevasCarreras = carreras.filter(c => c.id !== id);

    if (carreras.length === nuevasCarreras.length) {
        return res.status(404).json({ error: 'Carrera no encontrada.' });
    }

    writeDB(nuevasCarreras);
    res.status(204).send(); // No Content
});

// Servidor en escucha
app.listen(3001, () => {
    console.log('Servidor iniciado en http://localhost:3001');
});
