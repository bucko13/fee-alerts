import React from "react"
import { FormEvent, useState } from "react"
import axios from "axios"
import validator from "validator"

import Button from "@/components/button"
import AlertTypeChecklist, { typesChecklist } from "./AlertTypeChecklist"

const SubscribeForm: React.FC = () => {
  const [email, setEmail] = useState("")
  const [types, setTypes] = useState(typesChecklist)
  const [userId, setUserId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState([])

  function handleUpdateTypes(val: string) {
    setTypes({
      ...types,
      [val]: !types[val],
    })
  }

  function addError(message: string) {
    setErrors([...errors, message])
  }

  function validateForm(activatedTypes: string[]): boolean {
    const newErrors = []

    if (!email.length || !validator.isEmail(email))
      newErrors.push("Valid email required")

    if (!activatedTypes.length) {
      newErrors.push("At least one alert type must be selected")
    }

    if (newErrors.length) {
      setErrors(newErrors)
      return false
    }
    return true
  }

  async function submitHandler(e: FormEvent) {
    e.preventDefault()
    const activatedTypes = Object.keys(types).filter((type) => types[type])

    if (!validateForm(activatedTypes)) return

    setSubmitting(true)

    try {
      const {
        data: { id },
      } = await axios.post("/api/user", {
        email,
        types: activatedTypes,
      })
      setUserId(id)
      setSubmitting(false)
    } catch (e) {
      setSubmitting(false)
      addError(e.message)
    }
  }

  return (
    <div className="p-10 shadow-xl rounded-md">
      {userId ? (
        <h3>
          Your submission was successful! Update preferences here{" "}
          <a href={`/profile/${userId}`}>here</a>.
        </h3>
      ) : (
        <form onSubmit={submitHandler} onChange={() => setErrors([])}>
          <div className="mb-10">
            <label htmlFor="email">
              <h3 className="font-bold">E-mail</h3>
            </label>
            <input
              id="email"
              className="shadow border rounded w-full p-2"
              type="email"
              name="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <AlertTypeChecklist
            handleUpdateTypes={handleUpdateTypes}
            types={types}
          />
          <Button
            type="submit"
            onClick={submitHandler}
            disabled={submitting || !!errors.length || !email.length}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      )}
      {errors.length ? (
        <div className="border border-red-700 bg-red-300 p-2 my-1">
          {errors.map((error, index) => (
            <p className="font-medium" key={index}>
              {error}
            </p>
          ))}
        </div>
      ) : (
        ""
      )}
    </div>
  )
}

export default SubscribeForm
