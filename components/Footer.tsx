import React from "react"

type Props = {
  className?: string
}

const Container: React.FC<Props> = ({ className = "", children }) => {
  return (
    <div
      className={"flex items-center justify-center font-mono p-6" + className}
    >
      <div className="space-y-8">{children}</div>
    </div>
  )
}

export default Container
