import { SiGitbook } from "react-icons/si";
import Link from 'next/link';

export default function HomeNavbar() {
    return (
        <div className="fixed top-0 left-0 bg-transparent min-h-24 w-full z-50 py-8 px-6">
            <div className="flex items-center justify-between">

                {/* Logo and Title */}
                <div className="flex flex-row gap-x-4  items-center z-10 bg-primary/60 backdrop-blur-md py-2 px-4 rounded-2xl">
                    <Link href='/' >
                        <SiGitbook size={40} className='text-white z-20'/>
                    </Link>
                    <Link href='/about'>
                        <button className='btn btn-dash btn-ghost z-10 hover:bg-transparent hover:border-white '>About</button>
                    </Link>
                    <Link href='/contact'>
                        <button className='btn btn-dash btn-ghost z-10 hover:bg-transparent hover:border-white '>Contact</button>
                    </Link>
                </div>

                <div className='flex flex-row gap-x-2  items-center z-10 bg-primary/60 backdrop-blur-md py-2 px-2 rounded-2xl'>
                    <Link href='/login'>
                        <button className='btn btn-dash btn-ghost z-10 hover:bg-transparent hover:border-white y'>Login</button>
                    </Link>
                    <Link href='/signup'>
                        <button className='btn btn-dash btn-ghost z-10 hover:bg-transparent hover:border-white text-white'>Signup</button>
                    </Link>
                </div>

                {/* Auth Buttons */}

            </div>
        </div>
    );
}
