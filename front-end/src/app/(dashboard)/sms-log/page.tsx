"use client";

import { ScrollText } from "lucide-react";
import { EmptyState } from "@/components/atoms/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCrm } from "@/lib/crm-context";

export default function SmsLog() {
  const { smsLog: log } = useCrm();
  return (
    <>
      <PageHeader title="وضعیت ارسال" icon={ScrollText} />
      {log.length === 0 ? <EmptyState>هنوز پیامی ارسال نشده.</EmptyState> : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>تاریخ</TableHead><TableHead>ساعت</TableHead><TableHead>نام</TableHead><TableHead>شرکت</TableHead><TableHead>شماره</TableHead><TableHead>کانال</TableHead><TableHead>متن</TableHead><TableHead>وضعیت</TableHead></TableRow></TableHeader>
            <TableBody>
              {[...log].reverse().map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.time}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.company}</TableCell>
                  <TableCell className="ltr text-right">{item.phone}</TableCell>
                  <TableCell><Badge>{item.channel || "SMS"}</Badge></TableCell>
                  <TableCell className="max-w-48 truncate">{item.text}</TableCell>
                  <TableCell><Badge variant={item.status === "OK" ? "success" : "danger"}>{item.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
