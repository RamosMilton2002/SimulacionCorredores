const express = require('express');
const app = express();
app.use(express.json());

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

// Ruta principal para simular la carrera
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

    // Enviar respuesta con los resultados
    res.send(`
        <h1>Resultados de la Carrera</h1>
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

// Servidor en escucha
app.listen(3001, () => {
    console.log('Servidor iniciado en http://localhost:3001');
});
