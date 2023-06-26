import dotenv from 'dotenv';

dotenv.config({
    path: '.env'
});

const config = process.env;

export const MqttConfig = {
    MQTT_PORT: isNaN(Number(config.MQTT_PORT)) ? 1883 : Number(config.MQTT_PORT),
    MQTT_HOST: config.MQTT_HOST || 'mqtt.fre.com.br',
    MQTT_USER: config.MQTT_USER || 'mqttfre',
    MQTT_PASSWORD: config.MQTT_PASSWORD || '32687548',
    MQTT_TOPIC: config.MQTT_TOPIC || 'fre_count/#',
    MQTT_BROKER_URL: `mqtt://${config.MQTT_HOST || 'mqtt.fre.com.br'}:${isNaN(Number(config.MQTT_PORT)) ? 1883 : Number(config.MQTT_PORT)}`
};
