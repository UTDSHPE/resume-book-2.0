import { FaCheck, FaXmark } from "react-icons/fa6";
import { SocialPlatform, Links } from "./filterComponents/LinkInput";
import type { ProfileForm } from "../app/types/profile";
import LinkIconEmbed from "./LinkIconEmbed";

export default function ProfileCard({
    firstName,
    lastName,
    workAuthorized,
    links,
}: ProfileForm) {
    return (
        <div className="card bg-base-200 flex">
            <div className="flex-col">
                {/* Top card: Avatar, name, work authorization */}
                <div className="flex-row flex justify-between">
                    {/* Avatar & name */}
                    <div className="flex-row flex-nowrap items-center">
                        <div className="avatar">
                            <div className="w-24 rounded-full">
                                <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
                            </div>
                        </div>
                        <div className="font-medium text-base-content text-sm gap-x-1">
                            <p>{firstName}</p>
                            <p>{lastName}</p>
                        </div>
                    </div>

                    {/* Work authorization */}
                    <div className="flex-row flex-nowrap items-center gap-x-1">
                        <p className="font-medium text-base-content text-sm">Work Authorized:</p>
                        {workAuthorized ? (
                            <FaCheck size={16} className="text-base-content" />
                        ) : (
                            <FaXmark size={16} className="text-base-content" />
                        )}
                    </div>
                </div>

                {/* Social Links */}
                <div className="flex flex-row gap-x-2 mt-2">
                    {(Object.entries(links) as [SocialPlatform, string][])
                        .filter(([, url]) => url && url.trim() !== "")
                        .map(([platform, url]) => (
                            <LinkIconEmbed key={platform} platform={platform} url={url} />
                        ))}
                </div>
            </div>
        </div>
    );
}
