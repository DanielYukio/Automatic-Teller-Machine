import dotenv from 'dotenv';

dotenv.config({
    path: '.env'
});

const config = process.env;

export const DBConfig = {
    DB_PORT: isNaN(Number(config.DB_PORT)) ? 3307 : Number(config.DB_PORT),
    DB_HOST: config.DB_HOST || '127.0.0.1',
    DB_USER: config.DB_USER || 'root',
    DB_PASSWORD: config.DB_PASSWORD || '',
    DB_NAME: config.DB_NAME || 'AUTO_TELLER_MACHINE_DB',
};

export const DatabaseURL = `mysql://${DBConfig.DB_USER}:${DBConfig.DB_PASSWORD}@${DBConfig.DB_HOST}:${DBConfig.DB_PORT}/${DBConfig.DB_NAME}`;
