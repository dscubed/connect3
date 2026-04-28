export interface MembershipVerificationErrorOptions {
  status?: number;
  data?: Record<string, unknown>;
}

export class MembershipVerificationError extends Error {
  status: number;
  data?: Record<string, unknown>;

  constructor(
    message: string,
    { status = 400, data }: MembershipVerificationErrorOptions = {},
  ) {
    super(message);
    this.name = "MembershipVerificationError";
    this.status = status;
    this.data = data;
  }
}
