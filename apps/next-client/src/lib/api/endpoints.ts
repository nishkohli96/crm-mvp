import { apiRequest, ApiError } from './client';
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
export const sendOtp = (body: SendOtpBody) =>
  apiRequest<SendOtpResponse>('/auth/register', () => sampleSendOtp, {
    method: 'POST',
    body
  });

/** Exchanges the code for a session. The fallback accepts any code, the form already needs 6 digits. */
export const verifyOtp = (body: VerifyOtpBody) =>
  apiRequest<LoginResponse>('/auth/login', () => sampleLogin(body.phone), {
    method: 'POST',
    body
  });

export const getRestaurants = () =>
  apiRequest<RestaurantsResponse>('/restaurants', () => sampleRestaurants);

export const getOrders = () => apiRequest<OrdersResponse>('/orders', () => sampleOrders);

export const getFoodItem = (id: string) =>
  apiRequest<FoodItem>(`/food-items/${encodeURIComponent(id)}`, () => {
    const item = findFoodItem(id);
    if (!item) {
      throw new ApiError(404, 'We could not find this dish');
    }
    return item;
  });
