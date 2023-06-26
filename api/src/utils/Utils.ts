export function minutes_between_now_Limit(limit: Date) {
    const diff = limit.getTime() - new Date().getTime();
    const diffMinutes = Math.floor((diff / 1000) / 60);
    return diffMinutes;
}

export function codeExpired(limit: Date) {
    const diffMin = minutes_between_now_Limit(limit);
    return diffMin < 0 ? true : false;
}
