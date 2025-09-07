import {ProfileForm} from '../app/types/profile'
import { FaCheck,FaXmark, FaSquareXTwitter, FaSquareGithub, FaLinkedin, FaGlobe } from "react-icons/fa6";
import LinkIconEmbed from './LinkIconEmbed';

export default function ProfileCard(
    {firstName,lastName,email,phone,gpa,gradYear,gradSemester,
    availability,workAuthorized,profilePhoto,resumeUrl,links}:ProfileForm)
{
    return(
        <div className="card bg-base-200 flex">
            <div className='flex-col'>
                {/*Top card: Avatar,name, work authorization : BEGIN */}
                <div className='flex-row flex justify-between '>
                    {/*Avatar & name */}
                    <div className="flex-row flex-nowrap items-center">
                        {/*Avatar Image */}
                        <div className="avatar">
                            <div className="w-24 rounded-full">
                                <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
                            </div>
                        </div>
                        {/* Name */}
                        <div className="font-medium text-base-content text-sm gap-x-1">
                            <p>{firstName}</p>
                            <p>{lastName}</p>
                        </div>
                    </div>
                    {/*Work authorization*/}
                    <div className="flex-row flex-nowrap items-center gap-x-1">
                        <p className='font-mdeium text-base-content text-sm'>Work Authorized:</p>
                        {workAuthorized?
                        <FaCheck size={16} className='text-base-content'></FaCheck>
                            : <FaXmark size={16} className='text-base-content'></FaXmark>}
                    </div>
                </div>
                {/*Top card: Avatar,name, work authorization : END */}
                {/*Social Links*/}
                <div className="items-start flex-row gap-x-1">
                     links.map((link)=>{
                        return <LinkIconEmbed link={}/>
                     })

                </div>
                {/*Top card: Avatar,name, work authorization : BEGIN */}
                <div>
                    <ul>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}