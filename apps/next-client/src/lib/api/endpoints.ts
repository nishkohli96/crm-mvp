import { apiRequest, ApiError, FASTOR_BASE } from './client';
import { parseLogin, parseRestaurants, toFastorPhone } from './fastor';
import {
  findFoodItem,
  sampleLogin,
  sampleOrders,
  sampleRestaurants,
  sampleSendOtp
} from './sample-data';
import type {
  FoodItem,
  LoginResponse,
  OrdersResponse,
  RestaurantsResponse,
  SendOtpBody,
  SendOtpResponse,
  VerifyOtpBody
} from './types';

/** Signup and login both start here: sends a 6-digit code to the phone. */
export const sendOtp = ({ phone, dialCode }: SendOtpBody) =>
  apiRequest<SendOtpResponse>('/pwa/user/register', () => sampleSendOtp, {
    method: 'POST',
    base: FASTOR_BASE,
    body: toFastorPhone(phone, dialCode),
    /* only whether it worked matters, the screen uses the default resend timer */
    parse: () => sampleSendOtp
  });

/** Exchanges the code for a session. The fallback accepts any code, the form already needs 6 digits. */
export const verifyOtp = ({ phone, dialCode, otp }: VerifyOtpBody) =>
  apiRequest<LoginResponse>('/pwa/user/login', () => sampleLogin(phone), {
    method: 'POST',
    base: FASTOR_BASE,
    body: { ...toFastorPhone(phone, dialCode), otp },
    parse: payload => parseLogin(payload, phone)
  });

export const getRestaurants = () =>
  apiRequest<RestaurantsResponse>('/m/restaurant?city_id=118&&', () => sampleRestaurants, {
    base: FASTOR_BASE,
    parse: parseRestaurants
  });

export const getOrders = () => apiRequest<OrdersResponse>('/orders', () => sampleOrders);

export const getFoodItem = (id: string) =>
  apiRequest<FoodItem>(`/food-items/${encodeURIComponent(id)}`, () => {
    const item = findFoodItem(id);
    if (!item) {
      throw new ApiError(404, 'We could not find this dish');
    }
    return item;
  });
