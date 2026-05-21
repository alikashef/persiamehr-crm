export const MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const todaySh = () => new Date().toLocaleDateString("fa-IR-u-nu-latn");

export const parseSh = (value?: string) => {
  const parts = (value || "").split("/");
  return {
    y: Number.parseInt(parts[0] || "", 10) || 1403,
    m: Number.parseInt(parts[1] || "", 10) || 1,
    d: Number.parseInt(parts[2] || "", 10) || 1,
  };
};

export const fmtSh = ({ y, m, d }: { y: number; m: number; d: number }) =>
  `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;

export const nowTime = () =>
  new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });

let idCounter = Date.now();
export const uid = () => (++idCounter).toString(36);
