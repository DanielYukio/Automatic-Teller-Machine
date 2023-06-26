export function Log(description: string, log: any): { description: string, log: string } {

    const title = '[FREAccessCounter]';
    const datetime = `[${new Date().toLocaleString()}]`;

    let message = '';

    switch (typeof log) {
        case 'string':
            message += log;
            break;
        case 'object':
            if (log.error && typeof log.error === 'string') {
                message += log.error;
            } else if (log.message && typeof log.message === 'string') {
                message += log.message;
            } else {
                message += JSON.stringify(log);
            }
            break;
        default:
            message += JSON.stringify(log);
            break;
    }

    if (message && description) {

        console.log(`${title}-${datetime}: ${description} - ${message}`);
        return { description, log: message };

    } else if (!message && description) {

        console.log(`${title}-${datetime}: ${description}`);
        return { description, log: '' };

    } else {

        console.log(`${title}-${datetime}: ${message}`);
        return { description, log: message };

    }
}
