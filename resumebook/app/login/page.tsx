'use client'
import React from 'react'
import Login from '@/app/components/login'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side — login form */}
      <div className="flex w-full flex-col items-center justify-center bg-white lg:w-1/2">
        <Login />
      </div>

      {/* Right side — cover image (hidden on small screens) */}
      <div className="relative hidden lg:block lg:w-1/2">
        <img
          src="/utd-campus.jpg"
          alt="UTD Campus"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-3xl font-bold leading-tight">
            SHPE Resume Book
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Connecting talented engineers with industry leaders since 1974.
          </p>
        </div>
      </div>
    </div>
  )
}
