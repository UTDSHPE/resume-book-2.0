import { GiBlackBook } from "react-icons/gi";
import Link from 'next/link'
import Bookshelf from '@/assets/bookshelf.svg';

export default function Navbar() {
    return (
        <div className="bg-blue-950 min-h-24 w-full border-b-2 border-gray-300 py-8 px-8">
            <div className="flex items-center justify-between">

                <Link href='/' className='flex flex-row flex-nowrap gap-x-3'>
                   
                    <Bookshelf className='text-white h-14 w-auto'/>
                    <h3 className="pt-1 text-2xl">
                         ResumeBook
                    </h3>
                </Link>
                    
                <a 
                        href='https://shpe-utd-website.netlify.app/'
                        target='_blank'
                        rel='noopener noreferrer'>
                        <img src='/chapter-logos-horizontal-pngs/SHPE_logo_horiz_University of Texas Dallas_KO.png'
                        alt='UTD SHPE logo' className="h-14 w-auto"/>
                </a>
                <div className='flex flex-row flex-nowrap gap-x-4'>
                    <Link href='/login' className='px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-400'>
                    Login
                    </Link>
                </div>
                    
            </div>


        </div>
    );
  }