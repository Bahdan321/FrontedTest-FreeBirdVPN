import apiService from './api.service';

export interface SubscriptionRequestData {
    devices: number;
    duration_months: number;
    gigabit_connection: boolean;
    all_regions: boolean;
    // promo_code?: string; // Если промокод обрабатывается на бэкенде
}

export interface SubscriptionResponse {
    status: string;
    message: string;
    user: any; // Замените 'any' на более конкретный тип пользователя, если он известен
}

class SubscriptionService {
    async createSubscription(data: SubscriptionRequestData): Promise<SubscriptionResponse> {
        // Предполагаемый эндпоинт, замените на актуальный, если он другой
        return apiService.post<SubscriptionResponse>('/v1/marzban/subscribe', data);
    }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;