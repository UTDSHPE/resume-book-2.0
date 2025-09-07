import { FaSquareXTwitter, FaSquareGithub, FaLinkedin, FaGlobe } from "react-icons/fa6";
import type { SocialPlatform } from "./filterComponents/LinkInput";

export default function LinkIconEmbed({platform,url,}: 
{ platform: SocialPlatform; url: string }) 
{
    switch (platform) {
        case "github":
            return (
                <a href={url} target="_blank" rel="noreferrer noopener">
                    <FaSquareGithub size={16} />
                </a>
            );
        case "twitter":
            return (
                <a href={url} target="_blank" rel="noreferrer noopener">
                    <FaSquareXTwitter size={16} />
                </a>
            );
        case "website":
            return (
                <a href={url} target="_blank" rel="noreferrer noopener">
                    <FaGlobe size={16} />
                </a>
            );
        case "linkedin":
            return (
                <a href={url} target="_blank" rel="noreferrer noopener">
                    <FaLinkedin size={16} />
                </a>
            );
        default:
            return null;
    }
}
