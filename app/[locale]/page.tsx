import { redirect } from 'next/navigation';
import React from 'react'

const page = () => {
  redirect('/en/login');
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
        <h1 className='text-4xl font-bold text-red-500'>Redirecting...</h1>

    </div>
  )
}

export default page