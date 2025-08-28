import { IoIosRefresh } from "react-icons/io";
import { CodeInput } from "./filterComponents/TextInput";
interface GenerateCodeProps{
    label:string;
    roles:string [];
}
interface RedeemCodeProps{
    label:string;
    code:string;
}

export const GenerateCode = () =>{
    const invokeURL = process.env.NEXT_PUBLIC_API_GATEWAY_INVOKE_URL;
    return(
        <></>
    )
}
export const RedeemCode=()=>{
    
    <div className="card w-96 bg-base-100 card-md shadow-sm">
        <div className="card-body">
            <h2 className="card-title">Enter your code</h2>
            <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
            <div className="justify-end card-actions">
                <button className="btn btn-primary mx-auto">Buy Now</button>
            </div>
        </div>
    </div>

    
}