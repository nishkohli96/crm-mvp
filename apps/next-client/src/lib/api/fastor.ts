/**
 * Request bodies and response mappers for the Fastor API
 * (https://staging.fastor.ai/v1). The responses were not available when
 * this was written (the API answered 502), so the mappers accept the common
 * field names and throw when nothing usable is found. apiRequest then uses
 * the sample data, and the screens keep working.
 */
import type { LoginResponse, Restaurant, RestaurantsResponse } from './types';
import { sampleFoodItems, sampleRestaurants } from './sample-data';

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null;
const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined);
const number = (value: unknown) => {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined;
};

/** Looks for `key` on the body, then on `body.data`. */
function pick(body: unknown, key: string): unknown {
  if (!isObject(body)) {
    return undefined;
  }
  return body[key] ?? (isObject(body.data) ? body.data[key] : undefined);
}

export const toFastorPhone = (phone: string, dialCode: string) => ({ phone, dial_code: dialCode });

export function parseLogin(payload: unknown, phone: string): LoginResponse {
  const token = text(pick(payload, 'token')) ?? text(pick(payload, 'access_token'));
  if (!token) {
    throw new Error('no token in login response');
  }
  const user = pick(payload, 'user');
  const name = isObject(user) ? text(user.name) ?? text(user.first_name) : undefined;
  return { token, user: { id: 'user', name: name ?? 'Guest', phone, dialCode: '+91' } };
}

function firstImage(item: Json): string | undefined {
  const images = item.images;
  if (Array.isArray(images) && isObject(images[0])) {
    return text(images[0].url);
  }
  return text(item.image) ?? text(item.image_url) ?? text(item.cover_image) ?? text(item.logo);
}

function cuisineOf(item: Json): string {
  const cuisines = item.cuisines;
  if (Array.isArray(cuisines) && cuisines.length > 0) {
    const first = cuisines[0];
    return (isObject(first) ? text(first.cuisine_name) ?? text(first.name) : text(first)) ?? 'Restaurant';
  }
  return text(item.cuisine) ?? 'Restaurant';
}

/**
 * The restaurant list is the only thing the Fastor API gives us. Tiles open a
 * dish page, so each restaurant is paired with a sample dish (the API has no
 * dish details endpoint). Offers and the location stay sample data too.
 */
export function parseRestaurants(payload: unknown): RestaurantsResponse {
  const list = [payload, isObject(payload) ? payload.data : undefined, isObject(payload) ? payload.results : undefined]
    .find(Array.isArray) as unknown[] | undefined;

  const restaurants = (list ?? []).flatMap((entry, index): Restaurant[] => {
    if (!isObject(entry)) {
      return [];
    }
    const name = text(entry.restaurant_name) ?? text(entry.name);
    const image = firstImage(entry);
    if (!name || !image) {
      return [];
    }
    return [{
      id: String(entry.restaurant_id ?? entry.id ?? entry._id ?? index),
      name,
      cuisine: cuisineOf(entry),
      rating: number(entry.avg_rating) ?? number(entry.rating) ?? 0,
      image,
      startingPrice: number(entry.cost_for_two) ?? number(entry.avg_cost_for_two) ?? number(entry.price),
      featuredFoodId: sampleFoodItems[index % sampleFoodItems.length].id
    }];
  });

  if (restaurants.length === 0) {
    throw new Error('no restaurants in response');
  }
  return { ...sampleRestaurants, restaurants };
}
