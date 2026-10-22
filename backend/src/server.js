import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import { testConnection } from './database/db.js';
import { seedDatabase } from './database/seed.js';
import { asegurarUsuarios } from './controllers/authController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares Globales
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware de Logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Endpoint de Salud / Verificación
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ok',
    proyecto: 'URABÁ-PAÍS (COOPI - HIAS - FADV - HI)',
    version: '3.0.0 (PostgreSQL)',
    architecture: {
      layers: ['schemas', 'repositories', 'services', 'controllers'],
      database: 'PostgreSQL (uraba_pais_db)',
      server: 'Express.js'
    },
    timestamp: new Date().toISOString()
  });
});

// Montar Rutas API
app.use('/api', apiRouter);

// Manejador de Rutas No Encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejador Global de Errores (500)
app.use((err, req, res, next) => {
  console.error('[Error Global]:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

// Iniciar Servidor con conexión a PostgreSQL
async function startServer() {
  try {
    // 1. Verificar conexión a PostgreSQL
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ No se pudo conectar a PostgreSQL. Verifica la configuración en .env');
      process.exit(1);
    }

    // 2. Ejecutar datos semilla (idempotente)
    await seedDatabase();
    await asegurarUsuarios();
    // 3. Iniciar Express
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  Servidor URABÁ PAÍS v1.2`);
      console.log(`  Base de Datos: uraba_pais_db`);
      console.log(`  Puerto: http://localhost:${PORT}`);
      console.log(`  Endpoints:`);
      console.log(`    - GET    /api/health`);
      console.log(`    - GET    /api/municipios`);
      console.log(`    - GET    /api/lineas-trabajo`);
      console.log(`    - GET    /api/lineas-trabajo/con-programas`);
      console.log(`    - GET    /api/programas`);
      console.log(`    - GET    /api/beneficiarios`);
      console.log(`    - GET    /api/beneficiarios/:id  (Ficha 360)`);
      console.log(`    - POST   /api/beneficiarios`);
      console.log(`    - POST   /api/programas/vincular`);
      console.log(`    - GET    /api/programas/participaciones`);
      console.log(`    - GET    /api/atenciones`);
      console.log(`    - POST   /api/atenciones`);
      console.log(`    - GET    /api/seguimientos`);
      console.log(`    - POST   /api/seguimientos`);
      console.log(`    - PATCH  /api/seguimientos/:id/toggle`);
      console.log(`    - GET    /api/reportes/metricas`);
      console.log(`    - GET    /api/reportes/resumen`);
      console.log(`    - GET    /api/database/status`);
      console.log(`=======================================================`);
    });

  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

startServer();

export { app };
export default app;
