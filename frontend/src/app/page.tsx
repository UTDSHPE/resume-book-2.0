import Image from "next/image";
import HomeNavbar from '@/components/navbar/home';
import Link from 'next/link';
export default function Home() {
  return (
    
    <div className="min-h-screen w-full bg-white">
      
      <HomeNavbar/>
      <div className='flex flex-col gap-y-6'>
        {/*Container for hero and textbox inside it */}
        <div className='relative w-full '>
          <Image
            src="/utd-campus.jpg"
            alt="UTD campus"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto "
          />
          <div className="absolute inset-0 flex items-center justify-center">
            
            <div className="bg-transparent backdrop-blur-xl p-8 rounded-xl shadow-lg max-w-md text-center">
              <Image src='/chapter-logos-horizontal-pngs/SHPE_logo_horiz_University of Texas Dallas_KO.png'
                className="py-4"
                alt='SHPE UTD logo'
                width={375}
                height={150}>

              </Image>
              <h1 className="text-5xl font-bold mb-4">Welcome to ResumeBook</h1>
              <p className="text-lg mb-6 ">Connecting SHPE UTD students with our corporate partners.</p>
              <Link href='/login'>
                <button className="btn btn-ghost bg-transparent text-white ">Get Started</button>
              </Link>            
            </div>
          </div>
        </div>

        </div>
      
      
    </div>
  );
}
