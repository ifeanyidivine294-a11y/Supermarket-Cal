import { Sale } from '../types';
import { formatNaira } from './format';

export function generateReceiptText(sale: Sale): string {
  const dateFormatted = new Date(sale.createdAt).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const itemsList = sale.items
    .map((item, idx) => {
      const variation = [item.sizeLabel, item.colourName].filter(Boolean).join(' / ');
      const desc = variation ? `${item.name} (${variation})` : item.name;
      return `${idx + 1}. ${desc}\n   ${item.quantity} × ${formatNaira(item.unitPrice)} = ${formatNaira(item.lineTotal)}`;
    })
    .join('\n');

  const discountLine =
    sale.discountAmount > 0
      ? `Discount (${sale.discountType === 'percentage' ? `${sale.discountValue}%` : 'Fixed'}): -${formatNaira(sale.discountAmount)}\n`
      : '';

  return `*TRUSTED SUPERMARKETCAL*
_Shop Smart. Pay Less._
Asaba, Delta State, Nigeria
----------------------------------
*Receipt No:* ${sale.receiptNumber}
*Date & Time:* ${dateFormatted}
*Cashier/Staff:* ${sale.salespersonName} (${sale.salespersonRole})
*Pricing Mode:* ${sale.pricingMode === 'retail' ? 'Retail' : 'Small Business'}
----------------------------------
*ITEMS PURCHASED:*
${itemsList}
----------------------------------
*Subtotal:* ${formatNaira(sale.subtotal)}
${discountLine}*Grand Total:* ${formatNaira(sale.grandTotal)}
*Amount Paid:* ${formatNaira(sale.amountPaid)}
*Change Returned:* ${formatNaira(sale.change)}
----------------------------------
Thank you for shopping with us!
Quality Products... Better Value...`;
}

export function shareReceiptOnWhatsApp(sale: Sale) {
  const text = generateReceiptText(sale);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
