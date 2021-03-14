import cn from "clsx"
import { ButtonHTMLAttributes } from "react"

const Button: React.FC = ({
  onClick = console.log,
  className = "",
  children = null,
  type = null,
  disabled = false,
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "min-w-full",
      "bg-black",
      "text-white",
      "p-2",
      "rounded",
      "uppercase",
      "text-sm",
      "font-bold",
      {
        [className]: Boolean(className),
        "cursor-default": Boolean(disabled),
        "bg-opacity-25": Boolean(disabled),
      }
    )}
  >
    {children}
  </button>
)

export default Button
