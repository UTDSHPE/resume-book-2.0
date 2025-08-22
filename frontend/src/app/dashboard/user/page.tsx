"use client";
import React from "react";
import DashNavbar from "@/components/navbar/dashboard";
import { ProfilePhoto } from "@/components/upload/ImageUpload";
import { NameInput } from "@/components/filterComponents/TextInput";
import { EmailInput, UTDEmailInput } from "@/components/filterComponents/Email";
import { PhoneInput } from "@/components/filterComponents/PhoneInput";
import { NumberValidator } from "@/components/filterComponents/Validator";
import { DropDown } from "@/components/filterComponents/DropDown";
import { CheckBox, CheckBoxList } from "@/components/filterComponents/CheckBox";
import { FileUpload } from "@/components/upload/FileUpload";
import { useProfileForm, Availability, GradSemester } from "@/app/hooks/useProfileForm";

import {SocialURLs,LinkInput} from '@/components/filterComponents/LinkInput'
export default function UserDashboard() {
  const { form, update, bind /* bindInput, bindNumber, bindCheckbox */ } = useProfileForm();

  return (
    <div className="w-full h-screen">
      <DashNavbar />
      <div className="flex flex-col md:flex-row">
        {/* LEFT SIDEBAR */}
        <aside className="w-full md:w-[25%] p-4 bg-white flex flex-col gap-4 h-[100vh]">
          {/* Profile Preview */}
          <div className="card bg-base-200 shadow-md p-4">
            <div className="flex flex-col text-xs items-center text-black">
              <ProfilePhoto
                photo={form.profilePhoto}
                setPhoto={(url) => update("profilePhoto", url)}
              />
            </div>
          </div>

          {/* Contact Support */}
          <div className="card bg-base-200 shadow-md p-4">
            <h3 className="font-medium mb-2 text-black">Need Help?</h3>
            <p className="text-sm text-gray-800 mb-3">
              Contact our support team if you have any questions about completing your profile.
            </p>
            <button className="btn btn-primary w-full">Contact Support</button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className="flex-1 bg-white p-4">
          <div className="card bg-base-200 shadow-md p-6 rounded-lg h-full">

            {/* Personal Information */}
            <div className="card bg-white shadow-sm p-6 rounded-lg my-2">
              <h2 className="text-black font-medium text-sm mb-4 border-b pb-2">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NameInput label="First Name" required {...bind("firstName")} />
                <NameInput label="Last Name" required {...bind("lastName")} />
                <UTDEmailInput domain="utdallas.edu" {...bind("utdEmail")} />
                <EmailInput {...bind("email")} />
                <PhoneInput label="Phone Number" {...bind("phone")} />
              </div>
            </div>

            {/* Academic Information */}
            <div className="card bg-white shadow-sm p-6 rounded-lg my-2">
              <h2 className="text-black font-medium text-sm mb-4 border-b pb-2">
                Academic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberValidator
                  min={0.0}
                  max={4.0}
                  decimal
                  headTitle="GPA"
                  value={form.gpa ?? undefined}
                  onChange={(v:number|null) => update("gpa", (v as number) ?? null)}
                />

                <NumberValidator
                  min={1971}
                  max={2100}
                  decimal={false}
                  headTitle="Graduation Year"
                  value={form.gradYear ?? undefined}
                  onChange={(v:number|null) => update("gradYear", (v as number) ?? null)}
                />

                <div className="">
                  <DropDown
                    items={[
                      "Biomedical Engineering","Computer Engineering","Computer Science","Cybersecurity","Data Science",
                      "Electrical Engineering","Mechanical Engineering","Software Engineering","Materials Science & Engineering",
                      "Systems Engineering","Business Information Technology","Other",
                    ]}
                    label="Major"
                    dataLabel=""
                    {...bind("major")}
                  />
                </div>

                <div className="">
                  <DropDown
                    items={["Spring", "Fall"]}
                    label="Graduation Semester"
                    dataLabel=""
                    value={form.gradSemester ?? undefined}
                    onChange={(v) => update("gradSemester", v as GradSemester)}
                  />
                </div>

                <div>
                  <CheckBoxList
                    title="Availability"
                    names={["Full-time", "Internship"]}
                    value={form.availability}
                    onChange={(arr) => update("availability", arr as Availability[])}
                  />
                </div>

                <div>
                  <CheckBox
                    title="U.S. Work Authorization"
                    checked={form.workAuthorized}
                    onChange={(v: boolean) => update("workAuthorized", !!v)}
                  />
                </div>
              </div>
            </div>
            {/* URL's*/}
            <div className="card bg-white shadow-sm p-6 rounded-lg my-2">
              <h2 className="text-black font-medium text-sm mb-4 border-b pb-2">
                Links
              </h2>
              <div className=" md:grid md:grid-cols-2 gap-x-4 gap-y-2">
                <LinkInput 
                platform='linkedin'
                label='LinkedIn'
                ></LinkInput>
                <LinkInput 
                platform='github'
                label='GitHub'
                ></LinkInput>
                <LinkInput 
                platform='twitter'
                label='X/Twitter'
                ></LinkInput>
                <LinkInput 
                platform='website'
                label='Personal Website/Portfolio'
                ></LinkInput>
              </div>
              
            </div>

            {/* Resume Upload */}
            <div className="card bg-white shadow-sm p-6 rounded-lg my-2">
              <h2 className="text-black font-medium text-sm mb-4 border-b pb-2">
                Resume Upload
              </h2>
              <FileUpload
                maxSizeKB={300}
                onUploaded={(url) => update("resumeUrl", url)}
              />
              {form.resumeUrl && (
                <p className="text-xs mt-2">
                  Current:{" "}
                  <a className="link" href={form.resumeUrl} target="_blank" rel="noreferrer">
                    View
                  </a>
                </p>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
