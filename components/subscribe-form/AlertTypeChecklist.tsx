export const typesValues = [
  {
    value: "ltlow",
    label: `Less than ${process.env.NEXT_PUBLIC_LOW_FEE || 10} sats/byte`,
  },
  {
    value: "gtlow",
    label: `Greater than ${process.env.NEXT_PUBLIC_LOW_FEE || 10} sats/byte`,
  },
  {
    value: "lthigh",
    label: `Less than ${process.env.NEXT_PUBLIC_HIGH_FEE || 50} sats/byte`,
  },
  {
    value: "gthigh",
    label: `Greater than ${process.env.NEXT_PUBLIC_HIGH_FEE || 50} sats/byte`,
  },
]

const initTypes: { [key: string]: boolean } = {}
export const typesChecklist = typesValues.reduce((acc, curr) => {
  acc[curr.value] = false
  return acc
}, initTypes)

type ChecklistProps = {
  handleUpdateTypes: (value: string) => void
  types: { [key: string]: boolean }
}

const AlertTypeChecklist = ({
  handleUpdateTypes,
  types,
}: ChecklistProps): React.ReactElement => (
  <div className="mb-10">
    <label htmlFor="types">
      <h3 className="font-bold">Alert Types</h3>
      {typesValues.map(({ value, label }) => (
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
      ))}
    </label>
    <fieldset id="types"></fieldset>
  </div>
)

export default AlertTypeChecklist
