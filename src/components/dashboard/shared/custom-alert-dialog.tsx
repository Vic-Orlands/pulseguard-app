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
      <AlertDialogContent className="pg-modal !max-w-sm p-6">
        <AlertDialogHeader className="mb-5 text-left flex flex-col gap-1.5">
          <AlertDialogTitle className="text-xl font-normal tracking-[-0.058em] text-pg-text font-sans">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-pg-muted font-sans leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex space-x-2.5 mt-2">
          <AlertDialogCancel className="flex-1 border border-pg-border hover:border-zinc-700 bg-transparent hover:bg-zinc-900/60 text-pg-subtle hover:text-pg-text text-xs h-9 px-4 rounded-[5px] shadow-none font-semibold cursor-pointer transition-all duration-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 btn-primary"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
