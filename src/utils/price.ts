import BigNumber from 'bignumber.js';

const ENDPOINT_PRICE_USD = 'https://api.coingecko.com/api/v3';

export async function getPrices(
  assets: string[]
): Promise<Record<string, number>> {
  const ids = assets.join(',');
  const url = `${ENDPOINT_PRICE_USD}/simple/price?ids=${ids}&vs_currencies=usd`;
  const response = await fetch(url);
  const data = await response.json();
  const prices = Object.fromEntries(
    Object.entries(data).map(priceEntry => {
      const id = priceEntry[0];
      const priceResult: any = priceEntry[1];
      return [id, priceResult.usd];
    })
  );
  return prices;
}
export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
  return new BigNumber(balance).dividedBy(new BigNumber(10).pow(decimals)).toFixed();
};
export const displayBalance = (balance: BigNumber, decimals = 18) => {
  return new BigNumber(balance).dividedBy(new BigNumber(10).pow(decimals)).toFixed();
};
