import dotenv from 'dotenv';

dotenv.config({
    path: '.env'
});

const config = process.env;

export const MailConfig = {
    MAIL_HOST: String(config.MAIL_HOST),
    MAIL_PORT: isNaN(Number(config.MAIL_PORT)) ? 588 : Number(config.MAIL_PORT),
    MAIL_SECURE: config.MAIL_SECURE === 'true' ? true : false,
    MAIL_USER: String(config.MAIL_USER),
    MAIL_PASSWORD: String(config.MAIL_PASSWORD),
    MAIL_REJECT: config.MAIL_REJECT === 'true' ? true : false
};

