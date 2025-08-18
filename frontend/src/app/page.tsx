import Image from "next/image";
import HomeNavbar from '@/components/navbar/home';

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
            <div className="bg-primary/60 backdrop-blur-md p-8 rounded-xl shadow-lg max-w-md text-center">
              <h1 className="text-5xl font-bold mb-4">Welcome to ResumeBook</h1>
              <p className="text-lg mb-6">Connecting SHPE UTD students with recruiters.</p>
              <button className="btn btn-primary">Get Started</button>
            </div>
          </div>
        </div>

        </div>
      
      
    </div>
  );
}
