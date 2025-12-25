import React from "react";
import { Pagination, AccordionList } from "./dynamic-components";

interface IChildren {
  children: React.ReactNode;
}

function AccordionLayout({ children }: IChildren) {
  return (
    <div className="card bg-base-200 shadow-md h-full p-4 flex flex-col items-center gap-3">
      {children}
    </div>
  );
}

function AccordionSearch() {
  return (
    <AccordionLayout>
      <AccordionList />
      <Pagination />
    </AccordionLayout>
  );
}

export default AccordionSearch;
