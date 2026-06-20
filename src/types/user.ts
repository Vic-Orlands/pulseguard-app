export type PostgresNotNullString = {
  String: string;
  Valid: boolean;
};

export type UserProps = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  avatar: PostgresNotNullString;
  provider: PostgresNotNullString;
  providerId: PostgresNotNullString;
};

export type UpdateUserData = {
  name?: string;
  avatar?: string;
  password?: string;
};
