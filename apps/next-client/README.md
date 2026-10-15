# Next.js App

This is a [Next.js](https://nextjs.org) **v16** project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and has the following features preconfigured:

- [Typescript](https://www.typescriptlang.org/) integration
- Preconfigured [eslint](https://eslint.org/)
- [Base UI](https://base-ui.com/) components (`@base-ui/react`)
- [Tailwind CSS](https://tailwindcss.com/) **v4**
- Containerize the application using Docker

## Fastor food ordering screens

Mobile-first ordering flow built with Base UI and Tailwind, running on a dummy API.

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

### The dummy API

The app calls `/api/*`, served by route handlers in `src/app/api/` from the data in `src/lib/api/sample-data.ts`.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register` | Send the OTP to a mobile number |
| `POST /api/auth/login` | Verify the OTP, returns a token and the user. The mock accepts `123456` only |
| `GET /api/restaurants` | Location, offers and the restaurant list |
| `GET /api/orders` | The popular items / orders list |
| `GET /api/food-items/:id` | Dish details with portion sizes |

**Fallback.** If the API cannot be reached, times out (8 s) or answers with a 5xx such as a 502, `src/lib/api/client.ts` uses the sample data for that call instead. Signup then accepts any 6-digit code, and the home screen shows a notice that sample data is in use. 4xx answers are real answers and are shown as errors: a wrong code on a working API is rejected, an unknown dish shows "We could not find this dish".

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Call another API instead of `/api`. It has to return the same JSON shapes as `src/lib/api/types.ts` |
| `MOCK_API_FAIL=502` | Make every mock route answer 502, to try the fallback. Restart the dev server after setting it |

```bash
MOCK_API_FAIL=502 pnpm dev
```

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

