'use client'
import Link from 'next/link';
import Image from 'next/image';
import DashNavbar from '@/components/navbar/dashboard';
import {useState} from 'react';
import { DropDown } from '@/components/dropdown/page';
export default function recruiterDashboard(){
    const [drawerOpen, setDrawerOpen] = useState(true);
    return(
        <div className="w-full h-screen">
            <DashNavbar />
            <div className="w-full min-h-screen bg-[#ffffff]"></div>
            <div className="flex flex-col md:flex-row h-screen">
                {/* Sidebar / Filters */}
                <div className="w-full md:w-64 bg-gray-100 p-4">
                    <div className='flex flex-col items-center gap-y-4'>
                        <DropDown items={["Freshman","Sophomore","Junior","Senior","Graduate"]} 
                        label="Year"
                        required={true}>
                        </DropDown>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 bg-white p-4">
                    Search & Results
                </div>
            </div>

        </div>

    );
};