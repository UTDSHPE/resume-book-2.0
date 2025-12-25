import { X } from "lucide-react";

function ExitBtn() {}

export function Modal() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-150 h-200 bg-zinc-800 rounded-xl p-4">
        <h2 className="text-lg font-bold">Modal Title</h2>
        <p className="mt-2">Modal content goes here.</p>
      </div>
    </div>
  );
}
