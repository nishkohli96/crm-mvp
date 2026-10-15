/**
 * Dummy data. The mock API routes in src/app/api serve it, and the app falls
 * back to it when the API is unreachable or answers with a 5xx (eg. 502), so
 * the signup flow, restaurants and food details always work.
 */
import type {
  FoodItem,
  LoginResponse,
  OrdersResponse,
  Portion,
  RestaurantsResponse,
  SendOtpResponse
} from './types';

/** The OTP the mock API accepts. The fallback accepts any 6 digits. */
export const MOCK_OTP = '123456';

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=75`;

const IMAGES = {
  sushi: photo('1579871494447-9811cf80d66c'),
  butterChicken: photo('1565557623262-b51c2513a641'),
  penne: photo('1621996346565-e3dbc646d9a9'),
  cake: photo('1578985545062-69928b1d9587'),
  pizza: photo('1565299624946-b28f40a0ae38'),
  pizzaHero: photo('1574071318508-1cdbab80d002'),
  burger: photo('1568901346375-23c9450c58cd'),
  shake: photo('1572490122747-3968b75cc699')
};

export const sampleSendOtp: SendOtpResponse = {
  message: 'OTP sent',
  otpLength: 6,
  resendInSeconds: 30
};

export const sampleLogin = (phone: string): LoginResponse => ({
  token: `sample-token-${phone}`,
  user: { id: 'user-1', name: 'Karan', phone, dialCode: '+91' }
});

export const sampleRestaurants: RestaurantsResponse = {
  location: 'Model Town, New Delhi',
  promotions: [
    {
      id: 'promo-pizza',
      title: 'Experience our delicious new dish',
      headline: '30% OFF',
      image: IMAGES.pizza
    },
    {
      id: 'promo-delivery',
      title: 'Free delivery on your first three orders',
      headline: 'FREE DELIVERY',
      image: IMAGES.butterChicken
    },
    {
      id: 'promo-dessert',
      title: 'Treat yourself to something sweet',
      headline: '20% OFF',
      image: IMAGES.cake
    }
  ],
  restaurants: [
    {
      id: 'rest-sakura',
      name: 'Sakura Sushi House',
      cuisine: 'Japanese',
      rating: 4.6,
      image: IMAGES.sushi,
      startingPrice: 349,
      featuredFoodId: 'food-sushi'
    },
    {
      id: 'rest-tandoor',
      name: 'Tandoor Tales',
      cuisine: 'North Indian',
      rating: 4.5,
      image: IMAGES.butterChicken,
      startingPrice: 289,
      featuredFoodId: 'food-butter-chicken'
    },
    {
      id: 'rest-pasta',
      name: 'Pasta Fresca',
      cuisine: 'Italian',
      rating: 4.4,
      image: IMAGES.penne,
      startingPrice: 249,
      featuredFoodId: 'food-penne'
    },
    {
      id: 'rest-cake',
      name: 'The Cake Studio',
      cuisine: 'Desserts',
      rating: 4.7,
      image: IMAGES.cake,
      startingPrice: 199,
      featuredFoodId: 'food-cake'
    },
    {
      id: 'rest-fire',
      name: 'Fire & Dough',
      cuisine: 'Pizza',
      rating: 4.5,
      image: IMAGES.pizza,
      startingPrice: 329,
      featuredFoodId: 'food-pizza'
    },
    {
      id: 'rest-smash',
      name: 'Smash Burger Co.',
      cuisine: 'Burgers',
      rating: 4.3,
      image: IMAGES.burger,
      startingPrice: 179,
      featuredFoodId: 'food-burger'
    }
  ]
};

export const sampleOrders: OrdersResponse = {
  orders: [
    {
      id: 'order-1',
      foodItemId: 'food-shake',
      name: 'Oreo Chocolate Shake',
      image: IMAGES.shake,
      placedAt: '2026-11-29T07:50:00.000Z',
      itemCount: 2,
      total: 240,
      driverEtaMinutes: 8
    },
    {
      id: 'order-2',
      foodItemId: 'food-burger',
      name: 'Double Cheese Burger',
      image: IMAGES.burger,
      placedAt: '2026-10-17T07:50:00.000Z',
      itemCount: 1,
      total: 179,
      driverEtaMinutes: 14
    }
  ]
};

const servingPortions: Portion[] = [
  { id: 'regular', label: 'Regular (1 person)', extraPrice: 0 },
  { id: 'large', label: 'Large (2 people)', extraPrice: 90 },
  { id: 'family', label: 'Family (4 people)', extraPrice: 210 }
];

export const sampleFoodItems: FoodItem[] = [
  {
    id: 'food-pizza',
    restaurantName: 'Fire & Dough',
    name: 'Wood-fired Neapolitan Pizza',
    description:
      'Hand-stretched dough baked in a wood-fired oven, topped with San Marzano tomato sauce, fresh mozzarella and basil.',
    image: IMAGES.pizzaHero,
    price: 329,
    portions: [
      { id: 'personal', label: 'Personal (4 Slices)', extraPrice: 0 },
      { id: 'medium', label: 'Medium (8 Slices)', extraPrice: 120 },
      { id: 'familiar', label: 'Familiar (10 Slices)', extraPrice: 240 },
      { id: 'jumbo', label: 'Jumbo (12 Slices)', extraPrice: 400 }
    ]
  },
  {
    id: 'food-sushi',
    restaurantName: 'Sakura Sushi House',
    name: 'Salmon Roll Platter',
    description:
      'Eight pieces of salmon and cream cheese rolls with pickled ginger, wasabi and soy sauce.',
    image: IMAGES.sushi,
    price: 349,
    portions: servingPortions
  },
  {
    id: 'food-butter-chicken',
    restaurantName: 'Tandoor Tales',
    name: 'Butter Chicken with Garlic Naan',
    description:
      'Tandoori chicken simmered in a creamy tomato and butter gravy, served with fresh garlic naan.',
    image: IMAGES.butterChicken,
    price: 289,
    portions: servingPortions
  },
  {
    id: 'food-penne',
    restaurantName: 'Pasta Fresca',
    name: 'Penne Arrabbiata',
    description:
      'Penne tossed in a slow-cooked spicy tomato sauce with garlic, chilli and parmesan.',
    image: IMAGES.penne,
    price: 249,
    portions: servingPortions
  },
  {
    id: 'food-cake',
    restaurantName: 'The Cake Studio',
    name: 'Chocolate Drip Cake',
    description:
      'Three layers of dark chocolate sponge with whipped ganache and a chocolate drip.',
    image: IMAGES.cake,
    price: 199,
    portions: [
      { id: 'slice', label: 'Slice', extraPrice: 0 },
      { id: 'half-kg', label: 'Half kg', extraPrice: 450 },
      { id: 'one-kg', label: 'One kg', extraPrice: 850 }
    ]
  },
  {
    id: 'food-burger',
    restaurantName: 'Smash Burger Co.',
    name: 'Double Cheese Burger',
    description:
      'Two smashed patties, melted cheddar, pickles and house sauce in a toasted brioche bun.',
    image: IMAGES.burger,
    price: 179,
    portions: [
      { id: 'single', label: 'Single patty', extraPrice: 0 },
      { id: 'double', label: 'Double patty', extraPrice: 70 },
      { id: 'combo', label: 'Double with fries', extraPrice: 130 }
    ]
  },
  {
    id: 'food-shake',
    restaurantName: 'The Cake Studio',
    name: 'Oreo Chocolate Shake',
    description:
      'Thick chocolate shake blended with Oreo cookies, topped with whipped cream and chocolate sauce.',
    image: IMAGES.shake,
    price: 120,
    portions: [
      { id: 'small', label: 'Small (250 ml)', extraPrice: 0 },
      { id: 'regular', label: 'Regular (350 ml)', extraPrice: 40 },
      { id: 'large', label: 'Large (500 ml)', extraPrice: 80 }
    ]
  }
];

export const findFoodItem = (id: string) => sampleFoodItems.find(item => item.id === id);
