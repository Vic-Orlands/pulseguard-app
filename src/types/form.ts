export type FormMode = "login" | "signup" | "forgot-password";

export type FormProps = {
  onToggleMode: (mode: FormMode) => void;
};
