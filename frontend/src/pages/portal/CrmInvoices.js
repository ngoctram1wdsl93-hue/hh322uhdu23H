// IBAN-first Invoices / Payments (contract -> issue IBAN -> client proof -> confirm)
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Plus, AlertTriangle, CheckCircle2, Clock, Search, FileDown, ExternalLink, Sparkles, History, FileSignature, Upload, Landmark, ShieldCheck, XCircle, Send, BadgeCheck } from "lucide-react";
import { CrmAPI, FilesAPI, openStoredFile } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSeo } from "@/lib/seo";
import { fmtDate } from "@/lib/portalMeta";
import { PageHeader, StatCard, EmptyState, TableSkeleton } from "@/components/portal/PortalUI";
import DocumentTimeline from "@/components/portal/DocumentTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const money = (v, c = "UAH") => `${Number(v || 0).toLocaleString("uk-UA", { maximumFractionDigits: 2 })} ${c}`;
const absUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_BASE}${u}`);

const STATUS_MAP = {
  paid: { c: "#065F46", b: "#A7F3D0", bg: "#ECFDF5", l: "Оплачено" },
  awaiting_confirmation: { c: "#1E40AF", b: "#BFDBFE", bg: "#EFF6FF", l: "На перевірці" },
  sent: { c: "#92400E", b: "#FDE68A", bg: "#FFFBEB", l: "До сплати" },
  pending: { c: "#475569", b: "#E2E8F0", bg: "#F8FAFC", l: "Чернетка" },
  overdue: { c: "#991B1B", b: "#FECACA", bg: "#FEF2F2", l: "Прострочено" },
  cancelled: { c: "#475569", b: "#E2E8F0", bg: "#F1F5F9", l: "Скасовано" },
};
function StatusPill({ s }) {
  const m = STATUS_MAP[s] || { c: "#475569", b: "#E2E8F0", bg: "#F1F5F9", l: s || "—" };
  return <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium" style={{ color: m.c, borderColor: m.b, background: m.bg }}>{m.l}</span>;
}

function CustomerPicker({ value, onPick }) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  // debounced search against /api/customers (RBAC-aware: manager sees own)
  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await CrmAPI.customersList({ q: search || undefined, limit: 20 });
        if (active) setItems(r.items || r.data || []);
      } catch { if (active) setItems([]); } finally { if (active) setLoading(false); }
    }, 250);
    return () => { active = false; clearTimeout(t); };
  }, [search]);

  const choose = (c) => {
    setSelected(c);
    onPick(c.id);
    setOpen(false);
    setSearch("");
  };

  const label = selected
    ? `${selected.companyName || selected.name || selected.id}`
    : (value ? value : "");

  return (
    <div className="relative">
      <Input
        value={open ? search : label}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Почніть вводити назву компанії, ім'я або email…"
        data-testid="inv-customer"
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg" data-testid="inv-customer-list">
          {loading ? (
            <div className="px-3 py-2 text-sm text-slate-500">Пошук…</div>
          ) : items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">Клієнтів не знайдено</div>
          ) : items.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => choose(c)}
              className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-emerald-50"
              data-testid="inv-customer-option"
            >
              <span className="text-sm font-medium text-slate-800">{c.companyName || c.name || c.id}</span>
              <span className="text-xs text-slate-500">{[c.name, c.email].filter(Boolean).join(" · ") || c.id}</span>
            </button>
          ))}
        </div>
      )}
      {selected && !open && (
        <p className="mt-1 text-xs text-emerald-700">Обрано: {selected.companyName || selected.name} · <span className="font-mono">{selected.id}</span></p>
      )}
    </div>
  );
}

function InvoiceDialog({ open, onOpenChange, onSaved }) {
  const navigate = useNavigate();
  const [f, setF] = useState({ customerId: "", amount: "", currency: "UAH", dueDate: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [req, setReq] = useState(null);
  useEffect(() => {
    if (open) {
      setF({ customerId: "", amount: "", currency: "UAH", dueDate: "", description: "" });
      CrmAPI.billingRequisites().then((r) => setReq(r.requisites || null)).catch(() => setReq(null));
    }
  }, [open]);

  const currencyReady = !!(req && (req.currencies || []).includes(f.currency));

  const submit = async () => {
    if (!f.customerId.trim()) return toast.error("Оберіть клієнта зі списку");
    if (!Number(f.amount) || Number(f.amount) <= 0) return toast.error("Сума має бути > 0");
    setBusy(true);
    try {
      await CrmAPI.managerInvoiceCreate({
        customerId: f.customerId.trim(),
        currency: f.currency,
        dueDate: f.dueDate ? new Date(f.dueDate).toISOString() : null,
        items: [{ name: f.description.trim() || "Послуга утилізації", price: Number(f.amount), qty: 1 }],
      });
      toast.success("Рахунок створено");
      onOpenChange(false); onSaved && onSaved();
    } catch (e) { toast.error(e?.response?.data?.detail || "Не вдалося створити"); } finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="inv-dialog">
        <DialogHeader><DialogTitle>Новий рахунок</DialogTitle><DialogDescription>Оберіть клієнта, вкажіть суму, валюту та термін оплати.</DialogDescription></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Клієнт *</Label><CustomerPicker value={f.customerId} onPick={(id) => setF((p) => ({ ...p, customerId: id }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Сума *</Label><Input type="number" value={f.amount} onChange={(e) => setF((p) => ({ ...p, amount: e.target.value }))} data-testid="inv-amount" /></div>
            <div className="grid gap-1.5"><Label>Валюта</Label>
              <Select value={f.currency} onValueChange={(v) => setF((p) => ({ ...p, currency: v }))}>
                <SelectTrigger data-testid="inv-currency"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="UAH">UAH</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          {req && !currencyReady && (
            <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800" data-testid="inv-req-warning">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Реквізити для валюти <b>{f.currency}</b> не налаштовані. Виставити рахунок (IBAN) не вдасться, доки не додано рахунок цієї валюти.</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 w-full gap-1.5 border-amber-300 bg-white text-amber-900 hover:bg-amber-100 sm:w-auto sm:self-start"
                onClick={() => { onOpenChange(false); navigate("/app/settings?section=requisites"); }}
                data-testid="inv-req-warning-cta"
              >
                <Landmark className="h-3.5 w-3.5" /> Налаштувати реквізити в CRM
              </Button>
            </div>
          )}
          <div className="grid gap-1.5"><Label>До сплати</Label><Input type="date" value={f.dueDate} onChange={(e) => setF((p) => ({ ...p, dueDate: e.target.value }))} data-testid="inv-due" /></div>
          <div className="grid gap-1.5"><Label>Опис (позиція)</Label><Input value={f.description} onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))} placeholder="Напр., Утилізація 18 01 03* / 50 кг" /></div>
        </div>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Скасувати</Button><Button onClick={submit} disabled={busy} data-testid="inv-submit">{busy ? "Збереження…" : "Створити"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Step({ n, title, done, children }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{done ? "✓" : n}</span>
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function ManageDrawer({ invoice, onClose, onChanged }) {
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [signer, setSigner] = useState("");
  const [file, setFile] = useState(null);
  const [onlineLink, setOnlineLink] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const inv = invoice;

  const loadContract = useCallback(async () => {
    if (!inv) return;
    setLoading(true);
    try {
      const r = await CrmAPI.invoiceContract(inv.id);
      setContract(r.contract || null);
      setSigned(!!r.signed);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [inv]);

  useEffect(() => { loadContract(); }, [loadContract]);

  if (!inv) return null;
  const issued = ["sent", "awaiting_confirmation", "paid", "overdue"].includes(inv.status);
  const claim = inv.payment_claim || {};

  const sendOnline = async () => {
    setBusy("online");
    try {
      const r = await CrmAPI.invoiceContractSendOnline(inv.id);
      if (r.already_signed) { toast.success("Договір вже підписано"); }
      else {
        const token = r.view_token || r.contract?.view_token;
        if (token) { setOnlineLink(`${window.location.origin}/contract/${token}`); toast.success("Договір надіслано на e-підпис"); }
      }
      loadContract();
    } catch (e) { toast.error(e?.response?.data?.detail || "Не вдалося надіслати на підпис"); } finally { setBusy(""); }
  };

  const offlineSign = async () => {
    if (!file) return toast.error("Прикріпіть підписаний файл договору");
    setBusy("offline");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("signed_full_name", signer);
      await CrmAPI.invoiceContractOfflineSign(inv.id, fd);
      toast.success("Договір позначено як підписаний (офлайн)");
      setFile(null); setSigner("");
      loadContract();
    } catch (e) { toast.error(e?.response?.data?.detail || "Не вдалося зберегти"); } finally { setBusy(""); }
  };

  const issueIban = async () => {
    setBusy("issue");
    try {
      await CrmAPI.invoiceIssueIban(inv.id);
      toast.success("Рахунок виставлено (IBAN). Клієнт бачить реквізити в кабінеті.");
      onChanged && onChanged();
    } catch (e) {
      const detail = e?.response?.data?.detail || "Не вдалося виставити рахунок";
      const isReqErr = /реквізит|requisite|не налаштован/i.test(detail);
      if (isReqErr) {
        toast.error(detail, {
          description: "Додайте банківські реквізити для цієї валюти, щоб виставляти IBAN-рахунки.",
          action: { label: "Налаштувати", onClick: () => navigate("/app/settings?section=requisites") },
          duration: 10000,
        });
      } else {
        toast.error(detail);
      }
    } finally { setBusy(""); }
  };

  const confirmPay = async () => {
    setBusy("confirm");
    try {
      await CrmAPI.invoiceConfirmPayment(inv.id, { note: "Кошти надійшли" });
      toast.success("Оплату підтверджено. Замовлення прийнято в роботу.");
      onChanged && onChanged();
    } catch (e) { toast.error(e?.response?.data?.detail || "Помилка"); } finally { setBusy(""); }
  };

  const rejectPay = async () => {
    setBusy("reject");
    try {
      await CrmAPI.invoiceRejectPayment(inv.id, { reason: rejectReason || "Платіж не знайдено" });
      toast.success("Оплату відхилено, рахунок повернено до сплати");
      onChanged && onChanged();
    } catch (e) { toast.error(e?.response?.data?.detail || "Помилка"); } finally { setBusy(""); }
  };

  const req = inv.requisites || {};

  return (
    <Dialog open={!!inv} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto" data-testid="inv-manage-drawer">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Рахунок {inv.number || inv.id?.slice(-8)} <StatusPill s={inv.status} /></DialogTitle>
          <DialogDescription>Клієнт: {inv.customerId || "—"} · {money(inv.amount || inv.total, inv.currency || "UAH")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1 — contract */}
          <Step n={1} title="Договір" done={signed}>
            {loading ? <div className="text-sm text-slate-500">Завантаження…</div> : signed ? (
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <BadgeCheck className="h-4 w-4" /> Договір підписано{contract?.signed_offline ? " (офлайн)" : " (e-підпис)"}
                {contract?.signed_file_url && <a className="ml-2 text-emerald-700 underline" href={absUrl(contract.signed_file_url)} target="_blank" rel="noreferrer">переглянути файл</a>}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Спершу договір має бути підписаний — лише після цього можна виставити рахунок на оплату.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Send className="h-3.5 w-3.5" /> Онлайн e-підпис</div>
                    <Button size="sm" variant="secondary" className="w-full gap-1.5" onClick={sendOnline} disabled={busy === "online"} data-testid="inv-contract-online">{busy === "online" ? "…" : "Надіслати на e-підпис"}</Button>
                    {onlineLink && <a className="mt-2 block break-all text-xs text-blue-600 underline" href={onlineLink} target="_blank" rel="noreferrer">{onlineLink}</a>}
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Upload className="h-3.5 w-3.5" /> Офлайн (підписаний файл)</div>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-2 block w-full text-xs" data-testid="inv-contract-file" />
                    <Input value={signer} onChange={(e) => setSigner(e.target.value)} placeholder="Хто підписав (ПІБ)" className="mb-2 h-8 text-xs" />
                    <Button size="sm" className="w-full gap-1.5" onClick={offlineSign} disabled={busy === "offline"} data-testid="inv-contract-offline"><FileSignature className="h-3.5 w-3.5" />{busy === "offline" ? "…" : "Позначити підписаним"}</Button>
                  </div>
                </div>
              </div>
            )}
          </Step>

          {/* Step 2 — issue IBAN */}
          <Step n={2} title="Виставлення рахунку (IBAN)" done={issued}>
            {issued ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-emerald-700"><Landmark className="h-4 w-4" /> Рахунок виставлено по IBAN</div>
                {req.iban && (
                  <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                    <div><b>Отримувач:</b> {req.legal_name} (ЄДРПОУ {req.edrpou})</div>
                    <div className="font-mono"><b>IBAN:</b> {req.iban} ({req.currency})</div>
                    <div><b>Банк:</b> {req.bank_name} · МФО {req.mfo}</div>
                    {inv.payment_purpose && <div><b>Призначення:</b> {inv.payment_purpose}</div>}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">{signed ? "Реквізити обраної валюти будуть зафіксовані на рахунку та показані клієнту." : "Доступно після підписання договору."}</p>
                <Button className="gap-1.5" onClick={issueIban} disabled={!signed || busy === "issue"} data-testid="inv-issue-iban"><Landmark className="h-4 w-4" />{busy === "issue" ? "…" : "Виставити рахунок (IBAN)"}</Button>
              </div>
            )}
          </Step>

          {/* Step 3 — confirm payment */}
          <Step n={3} title="Підтвердження оплати" done={inv.status === "paid"}>
            {inv.status === "paid" ? (
              <div className="flex items-center gap-2 text-sm text-emerald-700"><ShieldCheck className="h-4 w-4" /> Оплату підтверджено{inv.order_id ? ` · замовлення ${inv.order_id}` : ""}</div>
            ) : inv.status === "awaiting_confirmation" ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
                  <div><b>Платник:</b> {claim.payer || "—"}</div>
                  {claim.note && <div><b>Коментар:</b> {claim.note}</div>}
                  {claim.submitted_at && <div><b>Заявлено:</b> {fmtDate(claim.submitted_at)}</div>}
                  {claim.proof_url && <a className="mt-1 inline-flex items-center gap-1 text-blue-700 underline" href={absUrl(claim.proof_url)} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /> Переглянути підтвердження оплати</a>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={confirmPay} disabled={busy === "confirm"} data-testid="inv-confirm-payment"><CheckCircle2 className="h-4 w-4" />{busy === "confirm" ? "…" : "Підтвердити оплату"}</Button>
                  <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Причина відхилення" className="h-9 max-w-[220px] text-xs" />
                  <Button variant="secondary" className="gap-1.5" onClick={rejectPay} disabled={busy === "reject"} data-testid="inv-reject-payment"><XCircle className="h-4 w-4" />Відхилити</Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Очікуємо, доки клієнт сплатить та надішле підтвердження.</p>
            )}
          </Step>
        </div>

        <DialogFooter><Button variant="secondary" onClick={onClose}>Закрити</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CrmInvoices() {
  useSeo("Рахунки · CRM", "Рахунки / Оплата по IBAN · договір, виставлення, підтвердження.");
  const { user } = useAuth();
  const canCreate = ["admin", "master_admin", "owner", "team_lead", "manager"].includes(user?.role);
  const [list, setList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [dialog, setDialog] = useState(false);
  const [manage, setManage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, a, o] = await Promise.all([
        CrmAPI.managerInvoicesMy().catch(() => CrmAPI.invoicesManager()),
        CrmAPI.invoiceAnalytics().catch(() => ({})),
        CrmAPI.invoicesOverdue().catch(() => ({})),
      ]);
      setList(m.items || m.data || []);
      setAnalytics(a.analytics || null);
      setOverdue(o.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // keep the manage drawer in sync with refreshed list
  useEffect(() => {
    if (manage) {
      const fresh = list.find((x) => x.id === manage.id);
      if (fresh && fresh !== manage) setManage(fresh);
    }
  }, [list]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => ({
    all: list.length,
    sent: list.filter((x) => x.status === "sent").length,
    awaiting: list.filter((x) => x.status === "awaiting_confirmation").length,
    pending: list.filter((x) => x.status === "pending").length,
    paid: list.filter((x) => x.status === "paid").length,
  }), [list]);

  const filtered = useMemo(() => {
    let r = list;
    if (tab === "awaiting") r = r.filter((x) => x.status === "awaiting_confirmation");
    else if (tab !== "all") r = r.filter((x) => x.status === tab);
    if (q.trim()) {
      const ql = q.toLowerCase();
      r = r.filter((x) => (x.id || "").toLowerCase().includes(ql) || (x.number || "").toLowerCase().includes(ql) || (x.customerId || "").toLowerCase().includes(ql));
    }
    return r;
  }, [list, tab, q]);

  const [pdfBusy, setPdfBusy] = useState(null);
  const [historyInv, setHistoryInv] = useState(null);
  const generatePdf = async (inv) => {
    setPdfBusy(inv.id);
    try {
      const r = await FilesAPI.generateInvoice(inv.id);
      toast.success("PDF рахунку згенеровано");
      setList((prev) => prev.map((x) => (x.id === inv.id ? { ...x, file_id: r.file?.url || x.file_id } : x)));
      if (r.file?.id) openStoredFile(r.file.id);
    } catch (e) { toast.error(e?.response?.data?.detail || "Не вдалося згенерувати PDF"); } finally { setPdfBusy(null); }
  };

  const ana = analytics || {};
  return (
    <div data-testid="portal-crm-invoices">
      <PageHeader title="Рахунки" subtitle="Договір → виставлення IBAN → підтвердження оплати" actions={canCreate && <Button onClick={() => setDialog(true)} className="gap-2" data-testid="inv-create-button"><Plus className="h-4 w-4" /> Новий рахунок</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Receipt} label="Усього" value={ana.total ?? list.length} testid="inv-kpi-total" />
        <StatCard icon={Clock} label="На перевірці" value={counts.awaiting} testid="inv-kpi-awaiting" />
        <StatCard icon={CheckCircle2} label="Оплачено" value={ana.paid ?? counts.paid} testid="inv-kpi-paid" />
        <StatCard icon={AlertTriangle} label="Прострочено" value={ana.overdue ?? overdue.length} testid="inv-kpi-overdue" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all" data-testid="inv-tab-all">Усі ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending" data-testid="inv-tab-pending">Чернетки ({counts.pending})</TabsTrigger>
            <TabsTrigger value="sent" data-testid="inv-tab-sent">До сплати ({counts.sent})</TabsTrigger>
            <TabsTrigger value="awaiting" data-testid="inv-tab-awaiting">На перевірці ({counts.awaiting})</TabsTrigger>
            <TabsTrigger value="paid" data-testid="inv-tab-paid">Оплачено ({counts.paid})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук за №/ID/клієнтом…" className="pl-9" data-testid="inv-search" />
        </div>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-white">
        {loading ? <div className="p-4"><TableSkeleton rows={6} /></div>
          : filtered.length === 0 ? <EmptyState icon={Receipt} title="Рахунків немає" hint="Створіть перший рахунок або змініть фільтр." action={canCreate && <Button onClick={() => setDialog(true)} className="gap-2"><Plus className="h-4 w-4" /> Створити</Button>} testid="inv-empty" />
          : (
            <Table>
              <TableHeader><TableRow><TableHead>№</TableHead><TableHead>Клієнт</TableHead><TableHead className="text-right">Сума</TableHead><TableHead>Створено</TableHead><TableHead>Статус</TableHead><TableHead className="w-[260px] text-right">Дії</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map((inv) => (
                <TableRow key={inv.id} data-testid="inv-row">
                  <TableCell className="font-mono text-xs text-slate-700">{inv.number || inv.id?.slice(-8)}</TableCell>
                  <TableCell className="text-sm text-slate-600">{inv.customerId || "—"}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-slate-900">{money(inv.amount || inv.total, inv.currency || "UAH")}</TableCell>
                  <TableCell className="text-sm text-slate-500">{fmtDate(inv.created_at)}</TableCell>
                  <TableCell><StatusPill s={inv.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" className="gap-1.5" onClick={() => setManage(inv)} data-testid="inv-manage">
                        {inv.status === "awaiting_confirmation" ? <><ShieldCheck className="h-3.5 w-3.5" /> Перевірити</> : <><FileSignature className="h-3.5 w-3.5" /> Керувати</>}
                      </Button>
                      <Button variant="ghost" size="icon" title="Історія" onClick={() => setHistoryInv(inv)} data-testid="inv-open-history"><History className="h-4 w-4" /></Button>
                      {inv.file_id && <Button variant="ghost" size="icon" title="Відкрити PDF" onClick={() => openStoredFile(inv.file_id)}><ExternalLink className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="icon" title="Згенерувати PDF" onClick={() => generatePdf(inv)} disabled={pdfBusy === inv.id} data-testid="inv-generate-pdf">{pdfBusy === inv.id ? <FileDown className="h-4 w-4 animate-pulse" /> : <Sparkles className="h-4 w-4" />}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
      </div>

      <InvoiceDialog open={dialog} onOpenChange={setDialog} onSaved={load} />
      <ManageDrawer invoice={manage} onClose={() => setManage(null)} onChanged={load} />

      <Dialog open={!!historyInv} onOpenChange={(o) => !o && setHistoryInv(null)}>
        <DialogContent className="max-w-2xl" data-testid="inv-history-dialog">
          <DialogHeader>
            <DialogTitle>Історія документа · {historyInv?.number || historyInv?.id}</DialogTitle>
            <DialogDescription>Життєвий цикл, версії та переходи статусів цього рахунку.</DialogDescription>
          </DialogHeader>
          {historyInv && <div className="pt-2"><DocumentTimeline entityType="invoice" entityId={historyInv.id} onChanged={load} /></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
