'use client'
import { CodeInput, CodeOutput } from "@/components/filterComponents/TextInput";
import DashNavbar from "@/components/navbar/dashboard";
import { useState } from "react";
export default function Redeem() {
   const [input, setInput] = useState<string | null>("");
   return (

      <div className="min-h-screen w-full">
         <DashNavbar />
         <div className=' flex min-h-screen w-full bg-base-100 text-base-content '>
            <div className=' flex card card-body bg-base-200  items-center w-full mx-[10%] my-[15%] rounded-4xl' >
               <div className=' flex flex-col md:flex-row '>
                  <div className=' flex md:flex-row md:no-wrap gap-4 
                    card-body bg-base-300 border-black/10 border-[4px] p-6 rounded-2xl '>
                     <CodeInput
                        label='Redeem Code'
                        subtext="Redeem your code to get access to your respective role (admin,recruiter,student)."
                        buttonLabel="Redeem"
                        onChange={setInput}
                     />

                     <CodeOutput
                        label="Generate Student Code"
                        subtext="Generate a code for student access. For admin access or recruiter access, please reach
                            if we have not already administered one."/>

                  </div>

               </div>
            </div>
         </div>
      </div >
   )

}