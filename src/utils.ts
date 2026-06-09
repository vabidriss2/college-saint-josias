/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DRC Currency display converter
 * Standard Rate: 1 USD = 2500 FC
 */
export function formatCurrency(usdAmount: number): string {
  const rate = 2500;
  const fcAmount = Math.round(usdAmount * rate);
  
  // Format numbers nicely with spaces
  const formatUSD = usdAmount.toLocaleString("fr-FR") + " $";
  const formatFC = fcAmount.toLocaleString("fr-FR") + " FC";
  
  return `${formatUSD} (${formatFC})`;
}

/**
 * Simple compact formatter
 */
export function formatCurrencyCompact(usdAmount: number): string {
  const rate = 2500;
  const fcAmount = Math.round(usdAmount * rate);
  return `${usdAmount} $ / ${fcAmount.toLocaleString("fr-FR")} FC`;
}

/**
 * Active single currency formatter based on toggle state
 */
export function formatByCurrency(usdAmount: number, currency: "USD" | "CDF", rate: number = 2500): string {
  if (currency === "CDF") {
    const fcAmount = Math.round(usdAmount * rate);
    return fcAmount.toLocaleString("fr-FR") + " FC";
  }
  return usdAmount.toLocaleString("fr-FR") + " $";
}
