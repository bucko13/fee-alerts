import { FormEvent, useState } from "react"
import axios from "axios"
import validator from "validator"

import Button from "@/components/button"

const checklist = [
  {
    value: "lt10sats",
    label: "Less than 10 sats/byte",
  },
  {
    value: "gt10sats",
    label: "Greater than 10 sats/byte",
  },
  {
    value: "lt50sats",
    label: "Less than 50 sats/byte",
  },
  {
    value: "gt50sats",
    label: "Greater than 50 sats/byte",
  },
]

const SubscribeForm: React.FC = () => {
  const [email, setEmail] = useState("")
  const [types, setTypes] = useState(
    checklist.reduce((acc, curr) => {
      acc[curr.value] = false
      return acc
    }, {})
  )
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState([])

  function handleUpdateTypes(val: string) {
    setTypes({
      ...types,
      [val]: !types[val],
    })
    console.log("types:", types)
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
      const res = await axios.post("/api/user", {
        email,
        types: activatedTypes,
      })
      console.log("res:", res)
      setSubmitted(true)
      setSubmitting(false)
    } catch (e) {
      setSubmitting(false)
      addError(e.message)
    }
  }

  const renderAccountTypeChecklist = () =>
    checklist.map(({ value, label }) => (
      <div key={value} className="flex items-center my-1">
        <input
          type="checkbox"
          name="alert_type"
          value={value}
          id={value}
          className="mr-3 cursor-pointer"
          checked={types[value]}
          onChange={(e) => handleUpdateTypes(e.target.value)}
        />
        <label htmlFor={value} className="cursor-pointer">
          {label}
        </label>
      </div>
    ))

  if (submitted) return <h2>Your submission was successful!</h2>

  return (
    <div className="p-10 shadow-xl rounded-md">
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
        <div className="mb-10">
          <label htmlFor="types">
            <h3 className="font-bold">Alert Types</h3>
          </label>
          <fieldset id="types">{renderAccountTypeChecklist()}</fieldset>
        </div>
        <Button
          disabled={submitting || !!errors.length}
          type="submit"
          onClick={submitHandler}
          // className="hover:cursor-pointer"
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
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
