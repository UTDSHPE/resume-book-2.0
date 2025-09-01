'use client'

interface LoadingSpinnerProp{
    label:string,
}
export default function LoadingSpinner({label}:LoadingSpinnerProp){
    return(
        <>
            <div className="bg-white flex flex-col flex-nowrap text-wrap items-center  min-h-screen w-full">
                <p className="text-base-content font-medium text-sm">{label}</p>
                <span className="loading loading-spinner mx-auto loading-xl text-primary"></span>
                
            </div>
        </>
    )
}