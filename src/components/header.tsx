"use client"

import { ShowIfAuthenticated, SignOut } from "@/components/auth-components"
import Image from "next/image"

const Header = () => {
  return (
    <header>
      <div className="flex items-center gap-2">
        <Image
          src="/ph.jpeg"
          alt="PH"
          width={30}
          height={30}
          className="rounded-md"
        />

        <h1 className="text-2xl font-bold">Mentorsip Program</h1>
        <ShowIfAuthenticated>
          <SignOut className="ml-auto" />
        </ShowIfAuthenticated>
      </div>
    </header>
  )
}

export default Header
