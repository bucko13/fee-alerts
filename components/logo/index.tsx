import Link from 'next/link';
import Image from 'next/image'

export default function Logo() {
  return (
    <Image src="/logo.png" width={300} height={75}/>
  )
}