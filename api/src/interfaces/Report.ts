export interface IDailyReport {
    date: any;
    desjejum: number;
    lancheM: number;
    almoco: number;
    lancheT: number;
    jantar: number;
    ceia: number;
    totalDay: number;
}

export interface ITotalReport {
    dailyReports: IDailyReport[];
    TotalDesjejum: number;
    TotalLancheM: number;
    TotalAlmoco: number;
    TotalLancheT: number;
    TotalJantar: number;
    TotalCeia: number;
    TotalMeals: number;
}
