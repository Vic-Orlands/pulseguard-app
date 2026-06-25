import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { CustomAlertDialogProps } from "@/types/project";

export function CustomAlertDialog({
  trigger,
  title,
  description,
  onConfirm,
}: CustomAlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-[#0a0a0a] border border-zinc-800 shadow-2xl p-6 max-w-sm! rounded-xl text-white">
        <AlertDialogHeader className="mb-5 text-left flex flex-col gap-1.5">
          <AlertDialogTitle className="text-xl font-normal tracking-[-0.058em] text-white font-sans">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-zinc-400 font-sans leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex space-x-2.5 mt-2">
          <AlertDialogCancel className="flex-1 border border-zinc-800 hover:border-zinc-700 bg-transparent hover:bg-zinc-900/60 text-zinc-400 hover:text-white text-xs h-9 px-4 rounded-[5px] shadow-none font-semibold cursor-pointer transition-all duration-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-[5px] font-semibold relative transition-all duration-150 ease-in-out active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 bg-[#e2e2e2] text-black hover:opacity-90 h-9 px-4 text-xs cursor-pointer"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
