import { getFeeAlertType, AlertType } from "../pages/api/fees"
import { getFeeFixtures } from "./fixtures"

describe("fees", () => {
  describe("getFeeAlertType", () => {
    const OLD_ENV = process.env
    const low = 12
    const high = 50
    beforeEach(() => {
      jest.resetModules()
      process.env = { ...OLD_ENV }
      process.env.LOW_FEE = low.toString()
      process.env.HIGH_FEE = high.toString()
    })

    afterAll(() => {
      process.env = OLD_ENV
    })

    test.each(getFeeFixtures(low, high))("%s", (_name, test, expected) => {
      const result = getFeeAlertType(test[0], test[1])
      expect(result).toEqual(expected)
    })
  })
})
