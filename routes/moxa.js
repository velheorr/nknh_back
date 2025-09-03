import { Router } from 'express';
import axios from "axios";
const router = Router();

const instance = axios.create({
    baseURL: 'http://192.168.2.10/api/slot/0/io/relay',
    headers: {
        'Accept': 'vdn.dac.v1',
        'Content-Type': 'application/json'
    },
    timeout: 5000,

});

// Данные: включить реле 0
const dataOn = {
    "slot": 0,
    "io": {
        "relay": [
            { "relayIndex": 0, "relayMode": 0, "relayStatus": 1, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 },
            { "relayIndex": 1, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 },
            { "relayIndex": 2, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 },
            { "relayIndex": 3, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 },
            { "relayIndex": 4, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 },
            { "relayIndex": 5, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 }
        ]
    }
};

// Данные: выключить реле 0 (все off)
const dataOff = {
    "slot": 0,
    "io": {
        "relay": [
            { "relayIndex": 0, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 },
            { "relayIndex": 1, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 },
            { "relayIndex": 2, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 },
            { "relayIndex": 3, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 },
            { "relayIndex": 4, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 },
            { "relayIndex": 5, "relayMode": 0, "relayStatus": 0, "relayTotalCount": 4294967295, "relayCurrentCount": 4294967295, "relayCurrentCountReset": 0 }
        ]
    }
};


router.get('/', async (req, res) => {
    try {
        await instance.put('', dataOn);
        res.status(200).json({ message: 'ок' });
        setTimeout(async () => {
            try {
                await instance.put('', dataOff);
                console.log('Реле выключено (через 30 сек)');
            } catch (error) {
                console.error('Ошибка при выключении реле:', error.message);
            }
        }, 30000);
    } catch (e) {
        res.status(404).send('Данных нет');
    }
});



export default router;