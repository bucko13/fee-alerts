import Image from "next/image"

export default function Logo(): React.ReactElement {
  return (
    <div className="flex justify-center">
      <a href="/">
        <Image src="/logo.png" width={300} height={75} />
      </a>
    </div>
  )
}
