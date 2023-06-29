import { IUserMenu } from "../_interfaces"

export class MenuUtils {
    private constructor() { }

    public static getMenu(): IUserMenu[] {
        return [
            {
                label: 'Dashboard',
                url: '/dashboard',
                icon: 'dashboard',
            },
            {
                label: 'Transações',
                url: '/transaction',
                icon: 'import_export',
            },
        ]
    }
}