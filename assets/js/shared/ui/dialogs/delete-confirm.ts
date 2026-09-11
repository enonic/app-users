export type DeleteTarget = {
  key: string;
  /** What has to be typed back to delete this one. */
  name: string;
  /** The name shown in the confirmation question. */
  displayName: string;
};

export function deleteExpectation(targets: readonly DeleteTarget[]): string | number {
  const [only] = targets;

  return targets.length === 1 && only !== undefined ? only.name : targets.length;
}
