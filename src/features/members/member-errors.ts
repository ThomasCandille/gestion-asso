export class MemberPermissionError extends Error {
  constructor(message = "Action membre non autorisee.") {
    super(message);
    this.name = "MemberPermissionError";
  }
}

export class MemberRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemberRuleError";
  }
}
