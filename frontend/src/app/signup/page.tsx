'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase'; 
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa6";
export default function signUpPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleCustomSignup = async () => {
        window.location.href ='https://yjsky4tmql.execute-api.us-east-1.amazonaws.com/prod/auth/linkedin';
        const token = '';
        const router = useRouter();
        try {
            await signInWithCustomToken(auth, token);
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to sign in with custom token');
        }
    };
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (err: any) {
            alert(err.message);
        }
      };

    const handleGoogleSignUp = async () => {
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
                <form onSubmit={handleSignup} className="flex flex-col gap-4 p-6 max-w-md mx-auto" >
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
                        border border-gray-300 mt-4 mb-2 py-2 px-4 focus:outline-none focus:ring-2 shadow-sm rounded-md mx-auto text-sm font-medium' type="submit">Signup with Email</button>
                        <div className='mx-auto text-gray-500 text-sm font-medium'>
                            or continue with
                        </div>
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black border border-gray-300 px-4 py-2 rounded-sm shadow-sm focus:outline-none focus:ring-2 mx-auto my-2"
                        >
                            <FcGoogle size={20} />
                            <span className="text-sm font-medium">Signup with Google</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleCustomSignup}
                            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black border border-gray-300 px-4 py-2 rounded-sm shadow-sm focus:outline-none focus:ring-2 mx-auto my-2"
                        >
                            <FaLinkedin size={20} className='text-[#0077B5]' />
                            <span className="text-sm font-medium">Signup with LinkedIn</span>
                            </button>
    
                    </div>
                </form>
            </div>
        );
}