export function formatNaira(amount: number): string {
  const rounded = Math.round(amount);
  return `₦${rounded.toLocaleString('en-NG')}`;
}

export function parseNairaInput(val: string): number {
  const clean = val.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}
