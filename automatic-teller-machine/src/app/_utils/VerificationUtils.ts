export function isInvalidSession(msg: string) {
    return msg.toUpperCase().includes('TOKEN DE ACESSO')
        || msg.toUpperCase().includes('SUA SESSÃO EXPIROU')
        || msg.toUpperCase().includes('USUÁRIO BLOQUEADO');
}

export function isDesktopWidth(): boolean {
    return window.innerWidth > 1023 ? true : false;
}