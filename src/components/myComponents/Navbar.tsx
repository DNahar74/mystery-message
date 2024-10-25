//todo: (1) CSS needs to be added

'use client'

import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

const Navbar = () => {
  const router = useRouter();

  const {data: session} = useSession();
  const user: User = session?.user as User;

  return (
    <nav className='p-4 md:p-6 shadow-md'>
      <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
        <a className='text-xl font-bold mb-4 md:mb-0' href="#">Mystery Message</a>
        {
          session ? (
            <>
            <span className='mr-24'>Welcome, {user?.username || user?.email}!</span>
            <Button className='w-full md:w-auto' onClick={() => signOut()}>Logout</Button>
            </>
          ) : (
            <Button className='w-full md:w-auto' onClick={() => router.replace('/login')}>Login</Button>
          ) 
        }
      </div>
    </nav>
  )
}

export default Navbar