// server.js

import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import securosRoute from './routes/securos.js';
import bastionRoute from './routes/bastion.js';
import moxaRoute from './routes/moxa.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Инициализируем Socket.IO с CORS
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173", // Рекомендуется вынести в .env
        methods: ["GET", "POST"],
    },
});
// Храним подключённых пользователей (опционально)
const connectedUsers = new Set();
// Подключение сокетов
io.on("connection", (socket) => {
    console.log("Пользователь подключился:", socket.id);
    connectedUsers.add(socket.id);

    // Пример: отправка уведомления только что подключённому клиенту
    socket.emit("notification", {
        message: "Вы подключены к серверу!",
        timestamp: new Date().toISOString(),
    });

    // Слушаем отключение
    socket.on("disconnect", () => {
        console.log("Пользователь отключился:", socket.id);
        connectedUsers.delete(socket.id);
    });

    // Можно добавить свои события, например:
    // socket.on('client-event', (data) => { ... });
});



app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Простой маршрут
app.get('/', (req, res) => {
    res.json({ message: 'Hello world!' });
});


app.use('/api/securos', securosRoute)
app.use('/api/bastion', bastionRoute)
app.use('/api/moxa', moxaRoute)

// Пример API-эндпоинта, который отправляет уведомление всем клиентам
app.post('/api/notify', (req, res) => {
    const { message = "Уведомление от сервера" } = req.body;

    // Отправляем всем подключённым клиентам
    io.emit('notification', {
        message,
        timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Уведомление отправлено' });
});



const isWindows = process.platform === 'win32';
const tlsCAFile = isWindows ? process.env.TLS_CA_FILE_LOC : process.env.TLS_CA_FILE;
const tlsCertificateKeyFile = isWindows ? process.env.TLS_CRT_FILE_LOC : process.env.TLS_CRT_FILE;

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            tlsCAFile,
            tlsCertificateKeyFile
        });
        console.log('Успешное подключение к MongoDB с SSL');

        server.listen(PORT, () => {
            console.log(`Сервер запущен на http://localhost:${PORT}`);
        });
    } catch (e) {
        console.error('Ошибка при запуске сервера:', e);
        process.exit(1);
    }
};

start();