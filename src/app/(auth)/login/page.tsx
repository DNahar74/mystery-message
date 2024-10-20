'use client'

import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button className="border-2 rounded-sm border-white mt-4 text-white px-3 py-1" onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button className="border-2 rounded-sm border-white mt-4 text-white px-3 py-1" onClick={() => signIn()}>Sign in</button>
    </>
  )
}