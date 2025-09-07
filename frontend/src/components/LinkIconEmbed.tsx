import { FaCheck, FaXmark, FaSquareXTwitter, FaSquareGithub, FaLinkedin, FaGlobe } from "react-icons/fa6";
import type { SocialPlatform } from "./filterComponents/LinkInput";
import Link from "next/link";


export default function LinkIconEmbed(type:SocialPlatform,url:string){
    let icon;

    switch(type){
        case "github":
            icon = <a href={url} rel="noreferrer noopener"><FaSquareGithub 
            size={16}/></a>
            break;
        case "twitter":
            icon = <a href={url} rel="noreferrer noopener"><FaSquareXTwitter
                size={16} /></a>
            break;
        case "website":
            icon = <a href={url} rel="noreferrer noopener"><FaGlobe
                size={16} /></a>
            break;
        case "linkedin":
            icon = <a href={url} rel="noreferrer noopener"><FaLinkedin
                size={16} /></a>
            break;
        default:
            icon = <div></div>
    }
    return(
        <div>{icon}</div>
    )
}