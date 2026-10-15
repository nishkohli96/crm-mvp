export type DialCode = '+91';

export type SendOtpBody = { phone: string; dialCode: DialCode };
export type SendOtpResponse = { message: string; otpLength: number; resendInSeconds: number };

export type VerifyOtpBody = SendOtpBody & { otp: string };

export type User = { id: string; name: string; phone: string; dialCode: DialCode };
export type LoginResponse = { token: string; user: User };

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
  /** Price badge on the Best Seller tile */
  startingPrice: number;
  /** Dish opened when the tile is tapped */
  featuredFoodId: string;
};

export type Promotion = {
  id: string;
  title: string;
  headline: string;
  image: string;
};

export type RestaurantsResponse = {
  location: string;
  promotions: Promotion[];
  restaurants: Restaurant[];
};

export type Order = {
  id: string;
  foodItemId: string;
  name: string;
  image: string;
  placedAt: string;
  itemCount: number;
  total: number;
  driverEtaMinutes: number;
};

export type OrdersResponse = { orders: Order[] };

export type Portion = { id: string; label: string; extraPrice: number };

export type FoodItem = {
  id: string;
  restaurantName: string;
  name: string;
  description: string;
  image: string;
  price: number;
  portions: Portion[];
};
