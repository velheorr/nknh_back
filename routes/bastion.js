import { Router } from 'express';
import axios from "axios";
const router = Router();

const instance = axios.create({
    baseURL: 'http://192.168.2.172:5005',
    withCredentials: true, // ⚠️ Это ключевое: позволяет сохранять и отправлять куки
});
let authCookie = null;
// Функция входа и получения куки
const login = async () => {
    try {
        const response = await instance.post('/api/Login', {
            Opername: 'web',
            Password: 'web',
        });

        // Извлекаем куку из заголовка Set-Cookie
        const setCookie = response.headers['set-cookie'];
        if (setCookie) {
            authCookie = setCookie.map(cookie => cookie.split(';')[0]).join('; '); // Убираем флаги (например, HttpOnly, Path)
            /*console.log('Кука сохранена:', authCookie);*/
        } else {
            console.log('Кука не получена');
        }

        /*console.log('Авторизация успешна:', response.data);*/
        return response.data;
    } catch (error) {
        console.error('Ошибка входа:', error.response?.data || error.message);
        throw error;
    }
};



router.get('/', async (req, res) => {
    await login(); // Войти и получить куку
    const { id } = req.query;
    let card = id === undefined ? '000028FBC024' : id

    /*card for test - user 000028FBC024   ts   000028F72FF4*/

    try {
        const response = await instance.get(`http://${process.env.BASTION_IP}/api/GetPassesByCardCode?srvCode=${process.env.BASTION_SRVCODE}&cardCode=${card}`, {
            headers: {
                'Cookie': authCookie, // передаём куку
            }
        });
        if (response.data[0].personData.personCat === "4 Транспорт"){
            const data = {
                type: 'car',
                card: response.data[0].cardCode,
                auto: response.data[0].personData.name,
                number: response.data[0].personData.firstName,
                dep: response.data[0].personData.dep,
                post: response.data[0].personData.post,
                personCat: response.data[0].personData.personCat,
                driver: response.data[0].personData.addField1,
            }
            res.send(data);
        } else {
            const data = {
                type: 'user',
                card: response.data[0].cardCode,
                name: `${response.data[0].personData.name} ${response.data[0].personData.firstName} ${response.data[0].personData.secondName}`,
                dep: response.data[0].personData.dep,
                post: response.data[0].personData.post,
                personCat: response.data[0].personData.personCat,
            }
            res.send(data);
        }
    } catch (e) {
        res.status(404).send('Данных нет');
    }
});



export default router;