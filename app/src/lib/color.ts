import crypto from "crypto";

// prettier-ignore
const colors = [
  { border: "border-red-500", background: "bg-red-500", text: "text-red-500" },
  { border: "border-amber-500", background: "bg-amber-500", text: "text-amber-500" },
  { border: "border-orange-500", background: "bg-orange-500", text: "text-orange-500" },
  { border: "border-yellow-500", background: "bg-yellow-500", text: "text-yellow-500" },
  { border: "border-lime-500", background: "bg-lime-500", text: "text-lime-500" },
  { border: "border-green-500", background: "bg-green-500", text: "text-green-500" },
  { border: "border-emerald-500", background: "bg-emerald-500", text: "text-emerald-500" },
  { border: "border-teal-500", background: "bg-teal-500", text: "text-teal-500" },
  { border: "border-cyan-500", background: "bg-cyan-500", text: "text-cyan-500" },
  { border: "border-sky-500", background: "bg-sky-500", text: "text-sky-500" },
  { border: "border-blue-500", background: "bg-blue-500", text: "text-blue-500" },
  { border: "border-indigo-500", background: "bg-indigo-500", text: "text-indigo-500" },
  { border: "border-violet-500", background: "bg-violet-500", text: "text-violet-500" },
  { border: "border-purple-500", background: "bg-purple-500", text: "text-purple-500" },
  { border: "border-fuchsia-500", background: "bg-fuchsia-500", text: "text-fuchsia-500" },
  { border: "border-pink-500", background: "bg-pink-500", text: "text-pink-500" },
  { border: "border-rose-500", background: "bg-rose-500", text: "text-rose-500" },
] as const;

type Color = (typeof colors)[number];

export const stringToColor = (str: string): Color => {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  const hashedInt = parseInt(hash.slice(0, 12), 16);

  const color = colors[hashedInt % colors.length];
  return color;
};
