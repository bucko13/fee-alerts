import React from "react"

type Props = {
  className?: string
}

const Container: React.FC<Props> = ({ className = "", children }) => {
  return (
    <div
      className={
        "flex items-center justify-center bg-gray-50 pt-12 px-4 sm:px-6 lg:px-8 font-mono" +
        className
      }
    >
      <div className="space-y-8 p-10 max-w-3xl">{children}</div>
    </div>
  )
}

export default Container
