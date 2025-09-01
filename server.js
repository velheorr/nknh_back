// server.js

import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import securosRoute from './routes/securos.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Простой маршрут
app.get('/', (req, res) => {
    res.json({ message: 'Hello from Express!' });
});


app.use('/api/securos', securosRoute)


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

        app.listen(PORT, () => {
            console.log(`Сервер запущен на http://localhost:${PORT}`);
        });
    } catch (e) {
        console.error('Ошибка при запуске сервера:', e);
        process.exit(1);
    }
};

start();