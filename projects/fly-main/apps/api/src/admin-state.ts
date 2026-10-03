/** Late-bound DB flag shared between main.ts and the admin module. */
let dbAvailable = false;

export function setAdminDbAvailable(v: boolean): void {
  dbAvailable = v;
}

export function adminDbAvailable(): boolean {
  return dbAvailable;
}
