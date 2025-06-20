export type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string | undefined;
  company?: string | undefined;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type UserProps = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserData = {
  name?: string;
  password?: string;
};
