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
    const { user, ts } = req.query;

    const data = {
        user: {},
        ts: {}
    }
    if (user){
        console.log(user)
        try {
            const response = await instance.get(`http://${process.env.BASTION_IP}/api/GetPassesByCardCode?srvCode=${process.env.BASTION_SRVCODE}&cardCode=000028FBC024`, {
                headers: {
                    'Cookie': authCookie, // Явно передаём куку
                }
            });
            data.user = {
                card: response.data[0].cardCode,
                name: `${response.data[0].personData.name} ${response.data[0].personData.firstName} ${response.data[0].personData.secondName}`,
                dep: response.data[0].personData.dep,
                post: response.data[0].personData.post,
                personCat: response.data[0].personData.personCat,
            }

        } catch (e) {
            res.status(404).send('Данных нет');
        }
    }

    if (ts){
        console.log(ts)
        try {
            const response = await instance.get(`http://${process.env.BASTION_IP}/api/GetPassesByCardCode?srvCode=${process.env.BASTION_SRVCODE}&cardCode=000028F72FF4`, {
                headers: {
                    'Cookie': authCookie, // Явно передаём куку
                }
            });
            data.ts = {
                card: response.data[0].cardCode,
                auto: response.data[0].personData.name,
                number: response.data[0].personData.firstName,
                dep: response.data[0].personData.dep,
                post: response.data[0].personData.post,
                personCat: response.data[0].personData.personCat,
                driver: response.data[0].personData.addField1,
            }

        } catch (e) {
            res.status(404).send('Данных нет');
        }
    }

    console.log(data)
    res.send(data);

    /*try {
        const response = await instance.get(`http://${process.env.BASTION_IP}/api/GetPassesByCardCode?srvCode=${process.env.BASTION_SRVCODE}&cardCode=000028F72FF4`, {
            headers: {
                'Cookie': authCookie, // Явно передаём куку
            }
        });


        res.send(response.data[0]);
    } catch (e) {
        res.status(404).send('Изображение не найдено');
    }*/
});



export default router;