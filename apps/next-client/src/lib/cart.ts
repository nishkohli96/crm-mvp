const STORAGE_KEY = 'fastor.cart';

export type CartLine = {
  foodItemId: string;
  name: string;
  portionId: string;
  quantity: number;
  unitPrice: number;
};

/** There is no cart screen yet, lines are only kept in localStorage. */
export function addToCart(line: CartLine) {
  try {
    const lines = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartLine[];
    const same = lines.find(
      item => item.foodItemId === line.foodItemId && item.portionId === line.portionId
    );
    if (same) {
      same.quantity += line.quantity;
    } else {
      lines.push(line);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* storage blocked: the confirmation still shows, the line is not kept */
  }
}
