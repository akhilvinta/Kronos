export const Pages = compileEnum([
  "HOME",
  "IMPORTCALENDAR",
  "SMARTSCHEDULER",
  "AVAILABILITYASTEXT",
  "UPLOADSYLLABUS",
]);

export function compileEnum(arr) {
  return arr.reduce((acc, cur) => ({ ...acc, [cur]: cur }), {});
}
