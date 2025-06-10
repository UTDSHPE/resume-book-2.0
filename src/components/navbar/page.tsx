import { SiGitbook } from "react-icons/si";
import Link from 'next/link';

export default function Navbar() {
    return (
        <div className="bg-blue-950 min-h-24 w-full border-b-2 border-gray-300 py-8 px-6">
            <div className="flex items-center justify-between">

                {/* Logo and Title */}
                <Link href='/' className='flex flex-row flex-nowrap gap-x-3 pt-1'>
                    <SiGitbook size={36} />
                    <h3 className="text-3xl font-semibold text-white">
                        ResumeBook
                    </h3>
                </Link>

                {/* SHPE Logo */}
                <a
                    href='https://shpe-utd-website.netlify.app/'
                    target='_blank'
                    rel='noopener noreferrer'>
                    <img
                        src='/chapter-logos-horizontal-pngs/SHPE_logo_horiz_University of Texas Dallas_KO.png'
                        alt='UTD SHPE logo'
                        className="h-14 w-auto"
                    />
                </a>

                {/* Auth Buttons */}
                <div className='flex flex-row flex-nowrap gap-x-6 font-semibold'>
                    <a
                        href='/api/auth/login'
                        className='px-6 py-3 bg-gradient-to-tr from-blue-500 via-blue-600 to-indigo-500 text-white rounded-2xl hover:bg-blue-400'
                    >
                        Login
                    </a>
                    <a
                        href='/api/auth/login?screen_hint=signup'
                        className='px-6 py-3 bg-amber-50 text-black rounded-2xl hover:bg-white'
                    >
                        Sign Up
                    </a>
                </div>

            </div>
        </div>
    );
}
