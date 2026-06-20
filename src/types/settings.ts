import { z } from "zod";

// Zod Schema for UserForm
export const UserFormSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length >= 8,
        "New password must be at least 8 characters long"
      ),
    confirmPassword: z.string().optional(),
    avatar: z.string().optional(),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword === data.confirmPassword,
    {
      message: "New password and confirmation do not match",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => !data.newPassword || data.currentPassword !== data.newPassword,
    {
      message: "New password cannot be the same as current password",
      path: ["newPassword"],
    }
  );

export type UserFormType = z.infer<typeof UserFormSchema>;

export interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  signedInWithGithub: boolean;
}
