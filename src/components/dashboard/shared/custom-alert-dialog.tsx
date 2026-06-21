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
      <AlertDialogContent className="bg-card text-foreground border border-border shadow-md p-5 max-w-sm rounded-lg">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="text-sm font-bold text-foreground">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground mt-0.5">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex space-x-2.5">
          <AlertDialogCancel className="flex-1 border-border text-foreground hover:bg-muted text-xs h-8 shadow-none font-semibold cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95 text-xs h-8 shadow-none font-semibold cursor-pointer">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
