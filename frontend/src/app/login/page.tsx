'use client'
import { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAuth, signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link'
//Images for Login
import { FcGoogle } from "react-icons/fc";
import { MdMailOutline } from "react-icons/md";
import { FaLinkedin } from "react-icons/fa6";


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading,setLoading] = useState(false);
    const router = useRouter();

    const handleLinkedInLogin = async () => {
        window.location.href = 'https://yjsky4tmql.execute-api.us-east-1.amazonaws.com/prod/auth/linkedin';
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push('/dashboard');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-200 via-blue-700 to-indigo-800">
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 p-6 max-w-md mx-auto" >
                {/*Container for elements */}
                <div className=' flex flex-col gap-y-2 mx-auto border-[2px] rounded-md border-gray-300 py-16 px-12 bg-white '>
                    <img
                        src='/chapter-logos-horizontal-pngs/SHPE_logo_horiz_University of Texas Dallas_PMS.png'
                        className='  w-auto self-center my-10'/>

                    <h1 className='text-gray-800 font-medium'>Email Address</h1>
                    <input className='flex text-gray-500 border-[2px] border-gray-200 py-1 px-1 rounded-md' type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <h1 className='text-gray-800 font-medium'>Password</h1>
                    <input className='flex text-gray-500 border-[2px] border-gray-200 py-1 px-1 rounded-md' type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    
                    <button className='flex bg-gradient-to-tr from-blue-500 via-blue-600 to-indigo-500
                    border border-gray-300 mt-4 mb-2 py-2 px-4 focus:outline-none focus:ring-2 shadow-sm rounded-md mx-auto text-sm font-medium' type="submit">Login with Email</button>
                    <div className='mx-auto text-gray-500 text-sm font-medium'>
                        or continue with
                    </div>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black border border-gray-300 px-4 py-2 rounded-sm shadow-sm focus:outline-none focus:ring-2 mx-auto my-2"
                    >
                        <FcGoogle size={20} />
                        <span className="text-sm font-medium">Login with Google</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleLinkedInLogin}
                        className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black border border-gray-300 px-4 py-2 rounded-sm shadow-sm focus:outline-none focus:ring-2 mx-auto my-2"
                    >
                        <FaLinkedin size={20} className='text-[#0077B5]' />
                        <span className="text-sm font-medium">Login with LinkedIn</span>
                    </button>
                    <div className='text-sm text-center text-gray-600'>
                        Don't have an account?{' '}
                        <Link href='/login/signup' className='text-blue-500 hover:underline font-medium'>
                        Sign up
                        </Link>
                    </div>
                </div>

            </form>
        </div>
    );
}
