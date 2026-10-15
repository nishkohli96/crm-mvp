const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2
});

const rupeesWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

/** 349 -> "₹349.00", or "₹349" when `whole` is set (small badges). */
export function formatPrice(amount: number, whole = false) {
  return (whole ? rupeesWhole : rupees).format(amount);
}

/** Indian mobile number: 10 digits starting with 6-9. */
export function isValidPhone(phone: string) {
  return (/^[6-9]\d{9}$/).test(phone);
}

/** "9876543210" -> "98765 43210" */
export function formatPhone(phone: string) {
  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
}

/** ISO date -> "29 Nov, 01:20 pm" in Indian time, so server and browser agree. */
export function formatOrderDate(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata'
  });
  const time = date
    .toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    })
    .toLowerCase();
  return `${day}, ${time}`;
}

/** 30 -> "00:30" */
export function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
