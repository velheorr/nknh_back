import { Router } from 'express';
import axios from "axios";
const router = Router();


const now = new Date();
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы от 0, поэтому +1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
};

/*
const login = process.env.SECUROS_USER
const password = process.env.SECUROS_PASSWORD
*/


router.get('/', async (req, res) => {
    const camID = '1'
    const curTime = formatDate(now)
    const cur5min = formatDate(fiveMinutesAgo)

    try {
        /*http://192.168.2.8:8899/api/v1/recognizers/1/protocol?start_time=20250826T000000&stop_time=20250826T181000&max_count=4*/
        const response = await axios.get(
            `http://${process.env.SECUROS_SRV}/api/v1/recognizers/${camID}/protocol`,
            {
                params: {
                    start_time: '20250901T145023',
                    stop_time: '20250901T150123',
                    max_count: 1,
                },
                auth: {
                    username: 'rest',
                    password: 'rest',
                },
                timeout: 5000,
            }
        );
        if (!response.data.data || response.data.data.length === 0) {
            return res.status(404).json({ error: 'Нет данных' });
        }
        const result = {
            camera_id: response.data.data[0].camera_id,
            number: response.data.data[0].number,
            tid: response.data.data[0].tid,
        };

        res.status(200).json(result);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:tid', async (req, res) => {
    const { tid } = req.params;
    try {
        const response = await axios.get(
            `http://${process.env.SECUROS_SRV}/api/v1/recognizers/1/image/${tid}`,
            {
                auth: { username: 'rest', password: 'rest' },
                responseType: 'arraybuffer',
            }
        );
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (e) {
        res.status(404).send('Изображение не найдено');
    }
});




export default router;