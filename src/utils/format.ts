//@ts-ignore
import numeral from 'numeral';
export function formatNum(num: string | number | null) {
  if (num === null) {
    return null;
  }
  return Number((Number(num) / 100).toFixed(4))
}

export function formatPercent(num: string | number) {
  return numeral(num).format('0,0.00%')
}
