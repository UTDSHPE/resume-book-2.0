'use client'
import DashNavbar from "@/components/navbar/dashboard"
import { CodeInput } from "@/components/filterComponents/TextInput";

export default function redeemPage(){
 return(
    <div className="min-h-screen w-full">
        <DashNavbar/>
        <div className=' flex min-h-screen w-full bg-base-100 text-base-content '>
            <div className=' flex card card-body bg-base-200  items-center w-full mx-[10%] my-[15%] rounded-4xl' >
               <div className=' flex flex-col md:flex-row'>
                  <div className=' flex md:flex-row md:no-wrap gap-4
                  card-body bg-base-300 border-black/10 border-[4px] p-6 rounded-2xl '>
                     <CodeInput
                     label='Generate Student Code '
                     subtext="Generate and redeem your student code to get access as a student"
                     buttonLabel="Redeem"/>
                     <CodeInput
                      label='Redeem Code' 
                      subtext="Redeem a code given to you to gain admin or recruiter access"
                      buttonLabel="Redeem"/>
                     
                  </div>

               </div>
            </div>
         </div>
    </div>
 );
}