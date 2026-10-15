# Next.js App

This is a [Next.js](https://nextjs.org) **v16** project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and has the following features preconfigured:

- [Typescript](https://www.typescriptlang.org/) integration
- Preconfigured [eslint](https://eslint.org/)
- [Base UI](https://base-ui.com/) components (`@base-ui/react`)
- [Tailwind CSS](https://tailwindcss.com/) **v4**
- Containerize the application using Docker

## Food ordering screens

Mobile-first ordering flow built with Base UI and Tailwind, using a remote API, with sample data as a fallback.

| Route | Screen |
| --- | --- |
| `/signup` | Mobile number, "Get OTP" |
| `/verify?phone=…` | 6-digit code, resend countdown, "Continue" |
| `/` | Best sellers, offers, popular items (needs a session) |
| `/food/[id]` | Dish details, quantity, portion size, "Add to cart" (needs a session) |

Visitors without a session are sent to `/signup`. The session and the cart are kept in `localStorage`; there is no cart screen yet.

### Reusable components

All in `src/components/ui/`, each wraps a Base UI part and is used by more than one screen.

| Component | Base UI part | Used for |
| --- | --- | --- |
| `Button` | `Button` | Every button: `primary`, `soft` and `icon` variants, `sm`/`md`/`lg`, `pill`, `loading`. `render={<Link />}` makes it a link |
| `BackButton` | `Button` | The orange back arrow |
| `TextField` | `Field`, `Input` | Labelled input with prefix and error line (phone number) |
| `OtpInput` | `OTPField` | Verification code boxes, paste and backspace work |
| `QuantityStepper` | `NumberField` | The − 3 + control |
| `PortionPicker` | `RadioGroup`, `Radio` | Portion size list |

### The API

The sign-up, login and restaurant calls go to a remote API. Set its base URL in `.env.local` (copy `.env_sample`):

```
API_BASE_URL=<base url of the API>
```

The browser calls `/remote/*` on this app and `next.config.ts` forwards it to `API_BASE_URL`, so the API does not have to allow CORS. Restart the dev server after changing the variable. Without it every call fails and the sample data is used.

| Screen | Call |
| --- | --- |
| Get OTP | `POST {API_BASE_URL}/pwa/user/register` with `{ phone, dial_code }` |
| Continue | `POST {API_BASE_URL}/pwa/user/login` with `{ phone, dial_code, otp }` |
| Home, Best Seller | `GET {API_BASE_URL}/m/restaurant?city_id=118&&` |
| Home, Popular Items | `GET /api/orders`, a mock route of this app |
| Dish details | `GET /api/food-items/:id`, a mock route of this app |

The remote API has no orders or dish endpoints, so those two use the mock routes in `src/app/api/`, which serve `src/lib/api/sample-data.ts`. Real restaurants are each paired with a sample dish so the tile still opens a dish page, and the offers and location are sample data.

**The response shapes of the remote API are a guess.** It answered 502 when this was written, so `src/lib/api/remote.ts` accepts the common field names (`token`, `restaurant_name`, `images[0].url`, ...) and treats anything it cannot read as a failure. Once the API is up, check the mappers in that file against the real responses.

**Fallback.** If a call cannot be reached, times out (8 s), answers with a 5xx such as a 502, or returns something the mappers cannot read, `src/lib/api/client.ts` uses the sample data for that call instead. Signup then accepts any 6-digit code, and the home screen shows a notice that sample data is in use. 4xx answers are real answers and are shown as errors, eg. a rejected code.

`MOCK_API_FAIL=502 pnpm dev` makes the two local mock routes answer 502 as well.

## Getting Started

Start the development server by running the below command:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

