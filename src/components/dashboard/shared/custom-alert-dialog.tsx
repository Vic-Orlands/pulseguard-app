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
  confirmLabel = "Continue",
  variant = "default",
}: CustomAlertDialogProps) {
  const isDanger = variant === "danger";
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent
        className={
          isDanger
            ? "max-w-sm border-0 bg-[#3b1111] p-6 text-white shadow-[0_32px_90px_rgba(80,0,0,0.45)]"
            : "pg-modal !max-w-sm p-6"
        }
      >
        <AlertDialogHeader className="mb-5 flex flex-col gap-1.5 text-left">
          <AlertDialogTitle
            className={`text-xl font-normal tracking-[-0.058em] font-sans ${
              isDanger ? "text-white" : "text-pg-text"
            }`}
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            className={`text-xs font-sans leading-relaxed ${
              isDanger ? "text-red-100/80" : "text-pg-muted"
            }`}
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 flex space-x-2.5">
          <AlertDialogCancel
            className={
              isDanger
                ? "flex-1 h-9 rounded-[5px] border-0 bg-white/10 text-xs font-semibold text-white shadow-none hover:bg-white/15"
                : "flex-1 border border-pg-border/60 bg-transparent hover:bg-pg-surface text-pg-subtle hover:text-pg-text text-xs h-9 px-4 rounded-[5px] shadow-none font-semibold cursor-pointer transition-all duration-200"
            }
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={() => {
              void onConfirm();
            }}
            className={
              isDanger
                ? "flex-1 h-9 rounded-[5px] border-0 bg-white text-xs font-semibold text-red-800 shadow-none hover:bg-red-50"
                : "flex-1 btn-primary"
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
