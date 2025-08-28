// components/navbar/DashNavbar.tsx
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";

export default function DashNavbar() {
    const { user, role, loading } = useAuth();

    // Build safe avatar source (always a string)
    const avatarSrc: string =
        user?.profilePhotoUrl && user.profilePhotoUrl.trim() !== ""
            ? user.profilePhotoUrl
            : "/site-assets/default-pfp.png";

    return (
        <div className="bg-primary">
            <nav className="navbar container mx-auto">
                <div className="flex-1">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/chapter-logos-horizontal-pngs/SHPE_logo_horiz_KO.png"
                            alt="SHPE logo"
                            width={140}
                            height={90}
                            className="h-auto w-[140px]"
                        />
                    </Link>
                </div>

                <div className="flex flex-row flex-nowrap gap-4 items-center">

                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-circle avatar">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                {loading ? (
                                    <div className="w-full h-full skeleton" />
                                ) : (
                                    <Image
                                        src={avatarSrc}
                                        alt="Profile picture"
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                        unoptimized
                                    />
                                )}
                            </div>
                        </div>

                        <ul
                            tabIndex={0}
                            className="menu menu-sm text-base-content dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow border-[1px] border-base-content/50"
                        >
                            <li>
                                <a className="justify-between">Profile</a>
                            </li>
                            <li>
                                <a>Logout</a>
                            </li>

                            {/* Recruiter menu */}
                            {role === "recruiter" && (
                                <>
                                    <li>
                                        <a>Search Students</a>
                                    </li>
                                    <li>
                                        <a>Saved Profiles</a>
                                    </li>
                                    <li>
                                        <a>Logout</a>
                                    </li>
                                </>
                            )}

                            {/* Admins (optional) */}
                            {role === "admin" && (
                                <>
                                    <li>
                                        <a>Manage Invites</a>
                                    </li>
                                    <li>
                                        <a>Logout</a>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}
