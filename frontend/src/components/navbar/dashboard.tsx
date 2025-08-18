
import Link from 'next/link';
import Image from 'next/image';

export default function DashNavbar(){
    return(
        
            <div className="navbar bg-primary shadow-sm py-4">
                <div className="flex-1">
                    <Link href='/' className='flex items-center gap-2'>
                        <Image src='/chapter-logos-horizontal-pngs/SHPE_logo_horiz_KO.png'
                            alt='SHPE logo'
                            width={140}
                            height={90}
                        />
                    </Link>
                </div>
                <div className="flex gap-2">
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-circle avatar"
                        >
                            <div className="w-10 rounded-full">
                                <img
                                    alt="User avatar"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                />
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
                        >
                            <li>
                                <a className="justify-between">
                                    Profile
                                </a>
                            </li>
                            <li><a>Settings</a></li>
                            <li><a>Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
    );
}