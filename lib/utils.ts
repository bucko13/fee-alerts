export type AlertType = "ltlow" | "gtlow" | "lthigh" | "gthigh"

export const getFeeAlertType = (
  currentFee: number,
  prevFee: number
): AlertType | void => {
  const LOW_FEE = +process.env.LOW_FEE
  const HIGH_FEE = +process.env.HIGH_FEE
  if (currentFee >= HIGH_FEE && prevFee <= LOW_FEE) return "gthigh"
  if (currentFee <= LOW_FEE && prevFee > LOW_FEE) return "ltlow"
  if (currentFee > LOW_FEE && prevFee <= LOW_FEE) return "gtlow"
  if (currentFee >= HIGH_FEE && prevFee < HIGH_FEE) return "gthigh"
  if (currentFee < HIGH_FEE && prevFee >= HIGH_FEE) return "lthigh"
  return null
}

export const getProfileUrl = (id: string): string => {
  const VERCEL_URL = process.env.VERCEL_URL
  const API_ORIGIN = process.env.API_ORIGIN

  let base: string
  if (API_ORIGIN && API_ORIGIN.includes("http")) {
    base = API_ORIGIN
  } else {
    base = VERCEL_URL ? `https://${VERCEL_URL}` : `https://txfees.watch`
  }

  return new URL(`profile/${id}`, base).href
}
