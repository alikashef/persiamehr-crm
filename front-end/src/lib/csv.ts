import type { Contact } from "@/types/crm";

export function exportCSV(filename: string, headers: string[], rows: unknown[][]) {
  const lines = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
}

function parseCSVRow(line: string) {
  const cols: string[] = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      cols.push(current.trim());
      current = "";
    } else current += char;
  }
  cols.push(current.trim());
  return cols;
}

export function importContactsCSV(file: File, onDone: (contacts: Contact[]) => void, onError: (message: string) => void) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const text = String(event.target?.result || "").replace(/^\ufeff/, "");
      const lines = text.split("\n").map((line) => line.replace(/\r$/, "")).filter((line) => line.trim());
      if (lines.length < 2) {
        onError("فایل خالی است");
        return;
      }

      const headers = parseCSVRow(lines[0]);
      const hIdx = (name: string) => headers.findIndex((header) => header === name);
      const contacts: Contact[] = [];

      for (let index = 1; index < lines.length; index += 1) {
        const cols = parseCSVRow(lines[index]);
        if (!cols[hIdx("نام")] && !cols[1]) continue;
        contacts.push({
          id: Number.parseInt(cols[hIdx("کد")] || "", 10) || Date.now() + index,
          name: cols[hIdx("نام")] || "",
          company: cols[hIdx("شرکت")] || "",
          job: cols[hIdx("شغل")] || "",
          specialty: cols[hIdx("تخصص")] || "",
          phone1: cols[hIdx("موبایل")] || "",
          phone2: cols[hIdx("واتس‌اپ دوم")] || "",
          phone3: cols[hIdx("ثابت")] || "",
          cityCode: cols[hIdx("کد شهر")] || "",
          province: cols[hIdx("استان")] || "",
          city: cols[hIdx("شهر")] || "",
          nationalId: cols[hIdx("کد ملی")] || "",
          postalCode: cols[hIdx("کد پستی")] || "",
          address: cols[hIdx("آدرس")] || "",
        });
      }
      onDone(contacts);
    } catch (error) {
      onError(error instanceof Error ? error.message : "خطا در خواندن فایل");
    }
  };
  reader.readAsText(file, "UTF-8");
}
