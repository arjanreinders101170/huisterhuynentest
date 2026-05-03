export async function getContext() {
  const hour = new Date().getHours();

  let timeOfDay = "dag";
  if (hour < 11) timeOfDay = "ochtend";
  else if (hour > 18) timeOfDay = "avond";

  // simpele weer fallback (later API)
  const weather = "droog"; 

  return { timeOfDay, weather };
}