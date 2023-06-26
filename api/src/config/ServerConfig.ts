import dotenv from 'dotenv';

dotenv.config({
    path: '.env'
});

const config = process.env;

export const ServerConfig = {
    SVR_PORT: isNaN(Number(config.SVR_PORT)) ? 3000 : Number(config.SVR_PORT),
    SVR_PASSWORD: String(config.SVR_PASSWORD || 'FRE32687548#!'),
    SVR_DEV_MODE: config.SVR_DEV_MODE === 'true' ? true : false
};
