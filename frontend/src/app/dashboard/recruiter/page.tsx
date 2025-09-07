'use client';
import DashNavbar from '@/components/navbar/dashboard';
import { useState } from 'react';
import { DropDown } from '@/components/filterComponents/DropDown';
import { NumberValidator } from '@/components/filterComponents/Validator';
import { CheckBoxList, CheckBox } from '@/components/filterComponents/CheckBox';

export default function RecruiterDashboard() {
    const [workAuthorized, setWorkAuthorized] = useState(false);
    const [availability, setAvailability] = useState<string[]>([]);
    const [year, setYear] = useState<string[]>([]);
    const [semester, setSemester] = useState<string[]>([]);
    const [major,setMajor] = useState<string[]>([]);

    return (
        <div className="w-full h-screen">
            <DashNavbar />

            {/* Layout */}
            <div className="flex flex-col md:flex-row ">
                {/* Sidebar / Filters */}
                <aside className="w-full md:w-96 p-4 bg-white">
                    <div className="card bg-base-200 shadow-md h-full p-4">
                        <div className="flex flex-col gap-y-4 pb-12">
                            <CheckBoxList
                                title={"Year"}
                                names={['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduated', 'Masters', 'PhD']}
                                value = {year}
                                onChange={setYear}
                            />

                            <CheckBoxList
                                title={"Graduation Semester"}
                                names={["Fall", "Spring"]}
                                value={semester}
                                onChange={setSemester}
                            />

                            <CheckBoxList
                                title={"Major"}
                                names={[
                                    "Biomedical Engineering", "Computer Engineering", "Computer Science", "Cybersecurity", "Data Science",
                                    "Electrical Engineering", "Mechanical Engineering", "Software Engineering", "Materials Science & Engineering",
                                    "Systems Engineering", "Business Information Technology","Other"
                                ]}
                                value={major}
                                onChange={setMajor}
                            />

                            <NumberValidator
                                min={1971}
                                max={2100}
                                className="input-md"
                                headTitle="Graduation Year"
                            />

                            <NumberValidator
                                min={0.0}
                                max={4.0}
                                className=""
                                decimal={true}
                                headTitle={"GPA"}
                            />

                            <CheckBox
                                title={"U.S. Work Authorization"}
                                checked={workAuthorized}
                                onChange={setWorkAuthorized}
                            />

                            <CheckBoxList
                                title={"Availability"}
                                value={availability}
                                names={["Full-time", "Internship"]}
                                onChange={setAvailability}
                            />

                            <button className="btn btn-active btn-primary my-6 mx-28">Search</button>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 bg-white p-4">
                    <div className='card bg-base-200 shadow-md h-full'>
                        {/* Results go here */}
                    </div>
                </main>
            </div>
        </div>
    );
}
