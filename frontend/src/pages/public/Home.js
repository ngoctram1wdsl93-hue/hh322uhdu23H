import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useSeo } from "@/lib/seo";
import { useLang } from "@/i18n";
import EcoCanvas from "@/components/layout/EcoCanvas";
import "./eco-cine.css";

gsap.registerPlugin(ScrollTrigger);

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

/* Real ECO.NOVA photography — licensed hazardous-waste utilization plant */
const IMG = {
  s0: "/media/sorting.jpg",             // workers sorting on conveyor (dynamic, wide)
  s1: "/media/handling.jpg",            // PPE crew + forklift handling big-bags
  s2: "/media/interior-1.jpg",          // facility interior, processing scale
  collect: "/media/loading.jpg",        // certified big-bag loading
  route: "/media/logistics.jpg",        // forklift loading onto transport
  transport: "/media/shipment-1.jpg",   // shipment / dispatch
  photo: "/media/utilization-powder.jpg", // utilization output (neutralised material)
  cta: "/media/facility.jpg",           // facility exterior
  opsBg: "/media/facility.jpg",         // operations band background
};

/* Real ECO.NOVA promo footage (own facility) */
const VIDEO = {
  heroLoop: "/media/hero-loop.mp4",     // muted aerial loop of the plant
  heroPoster: "/media/hero-poster.jpg",
  promo: "/media/promo.mp4",            // full company film
  promoPoster: "/media/promo-poster.jpg",
};

/* Real production gallery — how the company actually works */
const GALLERY = [
  { img: "/media/facility.jpg", key: "g_facility" },
  { img: "/media/sorting.jpg", key: "g_sorting" },
  { img: "/media/grinding.jpg", key: "g_grinding" },
  { img: "/media/utilization-powder.jpg", key: "g_util" },
  { img: "/media/furnace.jpg", key: "g_furnace" },
  { img: "/media/handling.jpg", key: "g_handling" },
  { img: "/media/shipment-2.jpg", key: "g_shipment" },
  { img: "/media/interior-2.jpg", key: "g_equipment" },
];

/* ── Bilingual copy (UA / EN) ─────────────────────────────────────────── */
const T = {
  uk: {
    seoTitle: "Безпечна утилізація небезпечних відходів для бізнесу • ECO.NOVA",
    seoDesc: "Ліцензований оператор. Класифікація, вивезення, утилізація та документи (акти, договори) для небезпечних відходів 1–4 класу. 80+ кодів, по всій Україні.",
    eyebrow: "Ліцензований оператор · Небезпечні відходи",
    h1: ["Чисте довкілля", "починається з", "відповідальної", "утилізації."],
    sub: "Класифікація, вивезення, утилізація та повний документальний супровід небезпечних відходів — в одній прозорій B2B-системі.",
    ctaCalc: "Розрахувати вартість",
    ctaCatalog: "Каталог відходів",
    ctaRequest: "Створити заявку",
    scene1H: "Класифікація. Збір. Транспортування.",
    scene1Label: "Кожен код — окремий ліцензійний сценарій",
    scene2H: "Прозорість на кожному етапі.",
    scene2Label: "Документи, акти та фотозвіти у захищеному кабінеті",
    railLabel: "Зроблено надійно",
    scrollHint: "Прокрутіть",
    trust: ["Ліцензія Мінекології", "Акти 1–4 клас", "ADR-транспорт", "24 області", "80+ кодів"],
    act1Kicker: "01 — Класифікація",
    act1H: ["Код. Ризик.", "Ліцензія. Рішення."],
    act1Lead: "Система визначає тип відходу, перевіряє ліцензійний допуск і формує правильний сценарій обробки — від класу небезпеки до акта утилізації.",
    codesHead: ["Код", "Тип відходу", "Клас", "Статус"],
    accepted: "Приймаємо",
    fullCatalog: "Повний довідник відходів →",
    codes: [
      { code: "18 01 03*", type: "Медичні відходи", cls: "Клас 1" },
      { code: "20 01 21*", type: "Люмінесцентні лампи", cls: "Клас 2" },
      { code: "16 06 01*", type: "Свинцеві акумулятори", cls: "Клас 1" },
      { code: "13 02 05*", type: "Відпрацьовані оливи", cls: "Клас 2" },
    ],
    act2Kicker: "02 — Операції",
    act2H: ["Процес під", "повним контролем."],
    ops: [
      { n: "01", t: "Збір", d: "Маркування, сертифікована тара та безпечне накопичення на об’єкті.", img: IMG.collect },
      { n: "02", t: "Маршрут", d: "Оптимальний логістичний план і графік вивезення по регіону.", img: IMG.route },
      { n: "03", t: "Транспорт", d: "ADR-транспорт із дозволами на перевезення небезпечних вантажів.", img: IMG.transport },
      { n: "04", t: "Фотофіксація", d: "Фото- та вагова фіксація на кожному етапі — у вашому кабінеті.", img: IMG.photo },
    ],
    manifestoEst: "ECO® Utilization Platform · Україна · Est. 2026",
    manifestoH: ["Іти далі за очікуване —", "наше покликання.", "Справжня сталість", "вимагає творчості,", "вирівняної зі суворими", "принципами та найвищими", "галузевими стандартами."],
    cells: [
      { t: "Класифікуємо", d: "895 кодів. 16 категорій. Ліцензії — у матриці прийому." },
      { t: "Вивозимо", d: "ADR-флот, маршрутизація та фотофіксація на кожному об’єкті." },
      { t: "Закриваємо", d: "Акт утилізації, екологічний звіт та архів у кабінеті клієнта." },
    ],
    act4Kicker: "04 — Документи",
    act4H: ["Документи. Акти.", "Сертифікати."],
    act4Lead: "Договори, рахунки, акти утилізації та екологічні сертифікати — з історією версій у захищеному кабінеті.",
    docs: [
      { t: "Договір", d: "Умови, обсяги, графік та відповідальність сторін." },
      { t: "Рахунок", d: "Прозоре ціноутворення за кодами відходів." },
      { t: "Акт", d: "Акт приймання-передачі та утилізації відходу." },
      { t: "Сертифікат", d: "Підтвердження знешкодження й екологічної звітності." },
    ],
    ctaKicker: "06 — Почнімо",
    ctaH: ["Готові розпочати", "відповідальну утилізацію?"],
    ctaSub: "Оберіть код відходу, вкажіть обсяг — і отримайте прозорий розрахунок із повним документальним супроводом.",
    // ── Video showcase ──
    videoKicker: "Реальне виробництво",
    videoH: ["Подивіться, як", "працює ECO.NOVA."],
    videoLead: "Власний ліцензований комплекс: приймання, сортування, переробка та термічне знешкодження небезпечних відходів — знято на нашому майданчику.",
    videoPlay: "Дивитися фільм",
    videoFacts: [
      { k: "895", v: "кодів у нацпереліку" },
      { k: "1–4", v: "класи небезпеки" },
      { k: "24", v: "області покриття" },
    ],
    // ── Production gallery ──
    galleryKicker: "03 — Виробництво",
    galleryH: ["Не рендер. Не сток.", "Наш реальний завод."],
    galleryLead: "Кожен кадр — з нашого комплексу утилізації. Так виглядає повний цикл поводження з небезпечними відходами на практиці.",
    gallery: {
      g_facility: { t: "Виробничий комплекс", d: "Ліцензований майданчик утилізації" },
      g_sorting: { t: "Сортування", d: "Розділення та ідентифікація фракцій" },
      g_grinding: { t: "Механічна переробка", d: "Подрібнення й підготовка сировини" },
      g_util: { t: "Знешкодження", d: "Перетворення відходу на інертний продукт" },
      g_furnace: { t: "Термічна обробка", d: "Високотемпературне знешкодження" },
      g_handling: { t: "Безпечне поводження", d: "ЗІЗ та контроль на кожному кроці" },
      g_shipment: { t: "Відвантаження", d: "Тарування, зважування, логістика" },
      g_equipment: { t: "Промислові лінії", d: "Обладнання для переробки" },
    },
    // ── Client access / how to start ──
    accessKicker: "05 — Ваш кабінет",
    accessH: ["Прозорість —", "у вашому кабінеті."],
    accessLead: "Клієнти працюють у захищеному онлайн-кабінеті: заявки, договори, акти, рахунки та статус кожного вивезення — цілодобово.",
    accessSteps: [
      { n: "01", t: "Реєстрація та вхід", d: "Створюєте акаунт компанії або входите через Google — доступ лише для бізнесу." },
      { n: "02", t: "Заявка на вивезення", d: "Обираєте код відходу, обсяг та об’єкт — система формує розрахунок." },
      { n: "03", t: "Договір і графік", d: "Електронний підпис договору та узгодження дати вивезення." },
      { n: "04", t: "Контроль і документи", d: "Фотозвіти, акти утилізації та історія — усе в кабінеті." },
    ],
    accessCtaClient: "Увійти в кабінет клієнта",
    accessCtaRequest: "Замовити дзвінок",
    accessNote: "Робочий доступ для операторів і менеджерів — через окремий вхід /admin.",
  },
  en: {
    seoTitle: "Safe hazardous-waste disposal for business • ECO.NOVA",
    seoDesc: "Licensed operator. Classification, collection, disposal and documents (acts, contracts) for class 1–4 hazardous waste. 80+ codes, across Ukraine.",
    eyebrow: "Licensed operator · Hazardous waste",
    h1: ["A clean environment", "begins with", "responsible", "recycling."],
    sub: "Classification, collection, disposal and full documentary support of hazardous waste — in one transparent B2B system.",
    ctaCalc: "Calculate the cost",
    ctaCatalog: "Waste catalog",
    ctaRequest: "Create a request",
    scene1H: "Classification. Collection. Transport.",
    scene1Label: "Each code is its own licensed scenario",
    scene2H: "Transparency at every step.",
    scene2Label: "Documents, acts and photo reports in a secure cabinet",
    railLabel: "Built reliably",
    scrollHint: "Scroll",
    trust: ["Ministry of Ecology licence", "Class 1–4 acts", "ADR transport", "24 regions", "80+ codes"],
    act1Kicker: "01 — Classification",
    act1H: ["Code. Risk.", "Licence. Decision."],
    act1Lead: "The system identifies the waste type, checks licence clearance and builds the right handling scenario — from hazard class to the disposal act.",
    codesHead: ["Code", "Waste type", "Class", "Status"],
    accepted: "Accepted",
    fullCatalog: "Full waste directory →",
    codes: [
      { code: "18 01 03*", type: "Medical waste", cls: "Class 1" },
      { code: "20 01 21*", type: "Fluorescent lamps", cls: "Class 2" },
      { code: "16 06 01*", type: "Lead batteries", cls: "Class 1" },
      { code: "13 02 05*", type: "Used oils", cls: "Class 2" },
    ],
    act2Kicker: "02 — Operations",
    act2H: ["A process under", "full control."],
    ops: [
      { n: "01", t: "Collection", d: "Labelling, certified containers and safe on-site accumulation.", img: IMG.collect },
      { n: "02", t: "Route", d: "An optimal logistics plan and regional collection schedule.", img: IMG.route },
      { n: "03", t: "Transport", d: "ADR transport with permits for hazardous-cargo carriage.", img: IMG.transport },
      { n: "04", t: "Photo log", d: "Photo and weight logging at every stage — in your cabinet.", img: IMG.photo },
    ],
    manifestoEst: "ECO® Utilization Platform · Ukraine · Est. 2026",
    manifestoH: ["Going beyond the expected —", "that is our calling.", "True sustainability", "demands creativity,", "aligned with strict", "principles and the highest", "industry standards."],
    cells: [
      { t: "We classify", d: "895 codes. 16 categories. Licences — in the acceptance matrix." },
      { t: "We collect", d: "ADR fleet, routing and photo logging at every site." },
      { t: "We close out", d: "Disposal act, eco report and archive in the client cabinet." },
    ],
    act4Kicker: "04 — Documents",
    act4H: ["Documents. Acts.", "Certificates."],
    act4Lead: "Contracts, invoices, disposal acts and eco certificates — with version history in a secure cabinet.",
    docs: [
      { t: "Contract", d: "Terms, volumes, schedule and the parties' responsibilities." },
      { t: "Invoice", d: "Transparent pricing by waste codes." },
      { t: "Act", d: "Acceptance-transfer and waste-disposal act." },
      { t: "Certificate", d: "Confirmation of neutralisation and eco reporting." },
    ],
    ctaKicker: "06 — Let's start",
    ctaH: ["Ready to start", "responsible recycling?"],
    ctaSub: "Pick a waste code, enter the volume — and get a transparent estimate with full documentary support.",
    // ── Video showcase ──
    videoKicker: "Real operations",
    videoH: ["See how", "ECO.NOVA works."],
    videoLead: "Our own licensed plant: intake, sorting, processing and thermal neutralisation of hazardous waste — filmed on site.",
    videoPlay: "Watch the film",
    videoFacts: [
      { k: "895", v: "codes in the register" },
      { k: "1–4", v: "hazard classes" },
      { k: "24", v: "regions covered" },
    ],
    // ── Production gallery ──
    galleryKicker: "03 — Production",
    galleryH: ["No render. No stock.", "Our actual plant."],
    galleryLead: "Every frame is from our utilization facility. This is what a full hazardous-waste handling cycle looks like in practice.",
    gallery: {
      g_facility: { t: "Production site", d: "Licensed utilization facility" },
      g_sorting: { t: "Sorting", d: "Separation and identification of fractions" },
      g_grinding: { t: "Mechanical processing", d: "Shredding and feedstock prep" },
      g_util: { t: "Neutralisation", d: "Turning waste into inert product" },
      g_furnace: { t: "Thermal treatment", d: "High-temperature neutralisation" },
      g_handling: { t: "Safe handling", d: "PPE and control at every step" },
      g_shipment: { t: "Dispatch", d: "Packing, weighing, logistics" },
      g_equipment: { t: "Industrial lines", d: "Processing equipment" },
    },
    // ── Client access / how to start ──
    accessKicker: "05 — Your cabinet",
    accessH: ["Transparency —", "in your cabinet."],
    accessLead: "Clients work in a secure online cabinet: requests, contracts, acts, invoices and the status of every collection — around the clock.",
    accessSteps: [
      { n: "01", t: "Sign up & log in", d: "Create a company account or sign in with Google — business access only." },
      { n: "02", t: "Collection request", d: "Choose a waste code, volume and site — the system builds an estimate." },
      { n: "03", t: "Contract & schedule", d: "E-sign the contract and agree the collection date." },
      { n: "04", t: "Control & documents", d: "Photo reports, disposal acts and history — all in the cabinet." },
    ],
    accessCtaClient: "Enter the client cabinet",
    accessCtaRequest: "Request a call",
    accessNote: "Operator & manager access is via a separate /admin login.",
  },
};

/* word/line split helpers (own splitter — no extra deps) */
const Word = ({ children }) => (
  <span className="word"><span>{children}</span></span>
);
const Line = ({ text }) => (
  <span style={{ display: "block" }}>
    {text.split(" ").map((w, i) => <Word key={i}>{w}</Word>)}
  </span>
);
const Words = ({ text }) => text.split(" ").map((w, i) => <Word key={i}>{w}</Word>);

export default function Home() {
  const root = useRef(null);
  const { lang } = useLang();
  const L = T[lang] || T.uk;
  const [partners, setPartners] = useState(null);

  useSeo(L.seoTitle, L.seoDesc);

  /* Fetch admin-managed partners (public site-info) */
  useEffect(() => {
    let alive = true;
    axios
      .get(`${API_URL}/api/site-info`)
      .then((r) => { if (alive) setPartners(r.data?.partners || null); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  /* Scroll-triggered left-to-right staggered reveal for partner cards */
  useEffect(() => {
    const cards = root.current
      ? Array.from(root.current.querySelectorAll(".partner-card"))
      : [];
    if (!cards.length) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(cards, {
        opacity: 0,
        x: -56,
        y: 26,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: {
          trigger: ".partners-grid",
          start: "top 82%",
          once: true,
        },
      });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partners]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const canAnimate = !reduce && !isMobile;

    if (!canAnimate) {
      const sections = Array.from(root.current?.querySelectorAll("[data-theme]") || []);
      const apply = () => {
        const line = 70;
        let theme = "dark";
        for (const s of sections) {
          const r = s.getBoundingClientRect();
          if (r.top <= line && r.bottom > line) { theme = s.dataset.theme || "light"; break; }
        }
        document.documentElement.dataset.navTheme = theme;
      };
      apply();
      window.addEventListener("scroll", apply, { passive: true });
      window.addEventListener("resize", apply);
      return () => {
        window.removeEventListener("scroll", apply);
        window.removeEventListener("resize", apply);
        document.documentElement.removeAttribute("data-nav-theme");
      };
    }

    root.current?.classList.add("cine--enhanced");
    document.documentElement.dataset.navTheme = "dark";

    let lenis = new Lenis({ duration: 1.2, lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context((self) => {
      const q = gsap.utils.selector(root);

      gsap.set(q('[data-cap] [data-reveal]'), { y: 24, opacity: 0 });
      gsap.set(q('.cine-act [data-reveal]'), { y: 34, opacity: 0 });
      gsap.utils.toArray(q('[data-reveal-group]')).forEach((g) =>
        gsap.set(g.children, { y: 34, opacity: 0 })
      );
      const cap0Spans = Array.from(q('[data-cap="0"] .word > span'));
      const restSpans = Array.from(q('.word > span')).filter((s) => !cap0Spans.includes(s));
      cap0Spans.forEach((s) => {
        const h = s.offsetHeight || 100;
        gsap.set(s, { y: h * 1.15 });
      });
      gsap.set(restSpans, { yPercent: 115 });

      gsap.to(cap0Spans, {
        y: 0, duration: 1.05, stagger: 0.05, ease: "power4.out", delay: 0.2,
      });
      gsap.to(q('[data-cap="0"] [data-reveal]'), {
        y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: "power3.out", delay: 0.5,
      });

      const hero = q(".cine-hero")[0];
      const m0 = q('[data-scene="0"] .cine-scene__img')[0];
      const m1 = q('[data-scene="1"] .cine-scene__img')[0];
      const m2 = q('[data-scene="2"] .cine-scene__img')[0];
      const media1 = q('[data-scene="1"] .cine-scene__media')[0];
      const media2 = q('[data-scene="2"] .cine-scene__media')[0];

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: () => "+=" + window.innerHeight * 6.5,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      master.to(m0, { scale: 1.12, duration: 1.2, ease: "none" }, 0);
      master.to(q('[data-cap="0"]'), { opacity: 0, duration: 0.4, ease: "power2.in", immediateRender: false }, 0.9);

      master.fromTo(media1, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.7, ease: "power3.inOut" }, 1.1);
      master.fromTo(m1, { scale: 1.18 }, { scale: 1.04, duration: 1.6, ease: "none" }, 1.1);
      master.fromTo(q('[data-cap="1"] .word > span'), { yPercent: 115 }, { yPercent: 0, duration: 0.6, stagger: 0.03, ease: "power4.out" }, 1.5);
      master.to(q('[data-cap="1"] [data-reveal]'), { opacity: 1, y: 0, duration: 0.4 }, 1.7);
      master.to(q('[data-cap="1"] .word > span'), { yPercent: -115, duration: 0.5, stagger: 0.02, ease: "power3.in" }, 2.6);
      master.to(q('[data-cap="1"] [data-reveal]'), { opacity: 0, duration: 0.3 }, 2.6);

      master.fromTo(media2, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.7, ease: "power3.inOut" }, 2.8);
      master.fromTo(m2, { scale: 1.18 }, { scale: 1.04, duration: 1.8, ease: "none" }, 2.8);
      master.fromTo(q('[data-cap="2"] .word > span'), { yPercent: 115 }, { yPercent: 0, duration: 0.6, stagger: 0.03, ease: "power4.out" }, 3.2);
      master.to(q('[data-cap="2"] [data-reveal]'), { opacity: 1, y: 0, duration: 0.4 }, 3.4);
      master.to({}, { duration: 0.7 }, 3.9);

      const fill = q(".cine-rail__fill")[0];
      if (fill) master.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", duration: master.duration() }, 0);

      gsap.utils.toArray(q(".reveal-words")).forEach((h) => {
        gsap.to(h.querySelectorAll(".word > span"), {
          yPercent: 0, duration: 0.95, stagger: 0.04, ease: "power4.out",
          scrollTrigger: { trigger: h, start: "top 86%" },
        });
      });
      gsap.utils.toArray(q(".cine-act [data-reveal]")).forEach((el) => {
        gsap.to(el, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });
      gsap.utils.toArray(q("[data-reveal-group]")).forEach((g) => {
        gsap.to(g.children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: g, start: "top 86%" } });
      });

      gsap.utils.toArray(q("[data-parallax]")).forEach((el) => {
        const sp = parseFloat(el.dataset.parallax) || 0.2;
        gsap.fromTo(el, { yPercent: -sp * 14 }, {
          yPercent: sp * 14, ease: "none",
          scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.utils.toArray(q("[data-theme]")).forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec, start: "top 64", end: "bottom 64",
          onToggle: (s) => { if (s.isActive) document.documentElement.dataset.navTheme = sec.dataset.theme; },
        });
      });

      ScrollTrigger.refresh();
    }, root);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      clearTimeout(t);
      window.removeEventListener("load", onLoad);
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      document.documentElement.removeAttribute("data-nav-theme");
    };
  }, [lang]);

  /* ── Partners (admin-managed) ─────────────────────────────────────────── */
  const partnerItems = (partners?.items || []).filter((p) => p && p.enabled !== false);
  const showPartners = (partners?.enabled !== false) && partnerItems.length > 0;
  const isUk = lang === "uk";
  const pTitle =
    (isUk ? partners?.title_uk : partners?.title_en) ||
    partners?.title_en || partners?.title_uk ||
    (isUk ? "Наші партнери" : "Our partners");
  const pSub = (isUk ? partners?.subtitle_uk : partners?.subtitle_en) || "";
  const pKicker = isUk ? "Партнерство" : "Partnership";

  return (
    <div className="cine" ref={root} data-testid="home-page">
      <EcoCanvas />

      {/* ═══ ACT 1 — PINNED HERO (cross-fade scenes) ═══ */}
      <section className="cine-hero" data-theme="dark">
        <div className="cine-hero__stage">
          {/* scene 0 */}
          <div className="cine-scene" data-scene="0">
            <div className="cine-scene__media">
              <div className="cine-scene__img" style={{ backgroundImage: `url(${IMG.s0})` }} />
              <video
                className="cine-scene__video"
                src={VIDEO.heroLoop}
                poster={VIDEO.heroPoster}
                autoPlay muted loop playsInline preload="auto"
                aria-hidden="true"
              />
            </div>
            <div className="cine-cap" data-cap="0">
              <div className="cine-cap__inner">
                <div className="cine-eyebrow" data-reveal><i />{L.eyebrow}</div>
                <h1 className="cine-h1">
                  {L.h1.map((ln, i) => <Line key={i} text={ln} />)}
                </h1>
                <p className="cine-sub" data-reveal>{L.sub}</p>
                <div className="cine-hero__cta" data-reveal>
                  <Link to="/calculator" className="cbtn cbtn--leaf" data-cursor>{L.ctaCalc}</Link>
                  <Link to="/waste" className="cbtn cbtn--dark-ghost" data-cursor>{L.ctaCatalog}</Link>
                </div>
              </div>
            </div>
          </div>

          {/* scene 1 */}
          <div className="cine-scene" data-scene="1">
            <div className="cine-scene__media"><div className="cine-scene__img" style={{ backgroundImage: `url(${IMG.s1})` }} /></div>
            <div className="cine-cap" data-cap="1">
              <div className="cine-cap__inner">
                <h2 className="cine-statement"><Words text={L.scene1H} /></h2>
                <p className="cine-scene__label" data-reveal>{L.scene1Label}</p>
              </div>
            </div>
          </div>

          {/* scene 2 */}
          <div className="cine-scene" data-scene="2">
            <div className="cine-scene__media"><div className="cine-scene__img" style={{ backgroundImage: `url(${IMG.s2})` }} /></div>
            <div className="cine-cap" data-cap="2">
              <div className="cine-cap__inner">
                <h2 className="cine-statement"><Words text={L.scene2H} /></h2>
                <p className="cine-scene__label" data-reveal>{L.scene2Label}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cine-rail">
          <div className="cine-rail__track"><div className="cine-rail__fill" /></div>
          <span className="cine-rail__label">{L.railLabel}</span>
        </div>
        <div className="cine-scrollhint" aria-hidden="true"><span>{L.scrollHint}</span></div>
      </section>

      {/* trust strip */}
      <div className="cine-trust">
        {L.trust.map((t, i, a) => (
          <React.Fragment key={t}><span>{t}</span>{i < a.length - 1 && <i />}</React.Fragment>
        ))}
      </div>

      {/* ═══ ACT 2 — CLASSIFICATION (editorial data-table) ═══ */}
      <section className="cine-act cine-class" data-theme="light">
        <div className="cine-act__head">
          <div className="cine-kicker" data-reveal><i />{L.act1Kicker}</div>
          <h2 className="cine-h2 reveal-words">
            {L.act1H.map((ln, i) => <Line key={i} text={ln} />)}
          </h2>
          <p className="cine-lead" data-reveal>{L.act1Lead}</p>
        </div>
        <div className="codes" data-reveal-group>
          <div className="codes__head"><span>{L.codesHead[0]}</span><span>{L.codesHead[1]}</span><span>{L.codesHead[2]}</span><span>{L.codesHead[3]}</span></div>
          {L.codes.map((c) => (
            <div className="codes__row" key={c.code}>
              <span className="codes__code">{c.code}</span>
              <span className="codes__type">{c.type}</span>
              <span className="codes__cls">{c.cls}</span>
              <span className="codes__status"><i />{L.accepted}</span>
            </div>
          ))}
        </div>
        <Link to="/waste" className="cine-link" data-cursor>{L.fullCatalog}</Link>
      </section>

      {/* ═══ ACT 3 — OPERATIONS (dark band + photo planes) ═══ */}
      <section className="cine-act cine-ops" data-theme="dark">
        <div className="cine-ops__bg"><div className="cine-ops__bg-img" data-parallax="0.18" style={{ backgroundImage: `url(${IMG.opsBg})` }} /></div>
        <div className="cine-act__head">
          <div className="cine-kicker cine-kicker--light" data-reveal><i />{L.act2Kicker}</div>
          <h2 className="cine-h2 cine-h2--light reveal-words">
            {L.act2H.map((ln, i) => <Line key={i} text={ln} />)}
          </h2>
        </div>
        <div className="ops-steps" data-reveal-group>
          {L.ops.map((s) => (
            <div className="ops-step" key={s.n}>
              <div className="ops-step__media"><div className="ops-step__img" data-parallax="0.12" style={{ backgroundImage: `url(${s.img})` }} /></div>
              <div className="ops-step__n">{s.n}</div>
              <h3 className="ops-step__t">{s.t}</h3>
              <p className="ops-step__d">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ACT 3.5 — PRODUCTION GALLERY (real facility photos) ═══ */}
      <section className="cine-act cine-gallery" data-theme="light" data-testid="home-gallery">
        <div className="cine-act__head">
          <div className="cine-kicker" data-reveal><i />{L.galleryKicker}</div>
          <h2 className="cine-h2 reveal-words">
            {L.galleryH.map((ln, i) => <Line key={i} text={ln} />)}
          </h2>
          <p className="cine-lead" data-reveal>{L.galleryLead}</p>
        </div>
        <div className="gallery-grid" data-reveal-group>
          {GALLERY.map((g, i) => {
            const meta = (L.gallery && L.gallery[g.key]) || {};
            return (
              <figure className={`gallery-cell gallery-cell--${i}`} key={g.key} data-cursor>
                <div className="gallery-cell__img" style={{ backgroundImage: `url(${g.img})` }} />
                <figcaption className="gallery-cell__cap">
                  <span className="gallery-cell__t">{meta.t}</span>
                  <span className="gallery-cell__d">{meta.d}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      {/* ═══ ACT 4 — MANIFESTO ═══ */}
      <section className="cine-act cine-manifesto" data-theme="light">
        <div className="cine-manifesto__mark">
          <span className="cine-manifesto__est">{L.manifestoEst}</span>
          <div className="cine-manifesto__rule" />
        </div>
        <h2 className="cine-manifesto__h reveal-words">
          {L.manifestoH.map((ln, i) => <Line key={i} text={ln} />)}
        </h2>
        <div className="cine-manifesto__three" data-reveal-group>
          {[IMG.collect, IMG.route, IMG.photo].map((img, i) => (
            <figure className="cine-manifesto__cell" key={i}>
              <div className="cine-manifesto__img" data-parallax="0.1" style={{ backgroundImage: `url(${img})` }} />
              <figcaption>
                <span className="cine-manifesto__cell-t">{L.cells[i].t}</span>
                <span className="cine-manifesto__cell-d">{L.cells[i].d}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ═══ ACT 5 — DOCUMENTS ═══ */}
      <section className="cine-act cine-docs" data-theme="light">
        <div className="cine-act__head">
          <div className="cine-kicker" data-reveal><i />{L.act4Kicker}</div>
          <h2 className="cine-h2 reveal-words">
            {L.act4H.map((ln, i) => <Line key={i} text={ln} />)}
          </h2>
          <p className="cine-lead" data-reveal>{L.act4Lead}</p>
        </div>
        <div className="docs-grid" data-reveal-group>
          {L.docs.map((d) => (
            <div className="doc-plane" key={d.t} data-parallax="0.08">
              <div className="doc-plane__tag">{d.t}</div>
              <span className="doc-plane__line" /><span className="doc-plane__line" /><span className="doc-plane__line" />
              <div className="doc-plane__seal" />
              <div className="doc-plane__desc">{d.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CLIENT ACCESS / HOW TO START (authorization flow) ═══ */}
      <section className="cine-act cine-access" data-theme="light" data-testid="home-access">
        <div className="cine-act__head">
          <div className="cine-kicker" data-reveal><i />{L.accessKicker}</div>
          <h2 className="cine-h2 reveal-words">
            {L.accessH.map((ln, i) => <Line key={i} text={ln} />)}
          </h2>
          <p className="cine-lead" data-reveal>{L.accessLead}</p>
        </div>
        <div className="access-flow">
          <div className="access-steps" data-reveal-group>
            {L.accessSteps.map((s) => (
              <div className="access-step" key={s.n}>
                <div className="access-step__n">{s.n}</div>
                <div className="access-step__body">
                  <h3 className="access-step__t">{s.t}</h3>
                  <p className="access-step__d">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <aside className="access-card" data-reveal>
            <div className="access-card__media" style={{ backgroundImage: `url(${IMG.s2})` }} />
            <div className="access-card__body">
              <div className="access-card__badge"><i />ECO.NOVA · B2B</div>
              <div className="access-card__btns">
                <Link to="/client/login" className="cbtn cbtn--leaf" data-cursor>{L.accessCtaClient}</Link>
                <Link to="/contacts" className="cbtn cbtn--ghost" data-cursor>{L.accessCtaRequest}</Link>
              </div>
              <p className="access-card__note">{L.accessNote}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══ PARTNERS — admin-managed clickable logo cards ═══ */}
      {showPartners && (
        <section className="cine-act cine-partners" data-theme="light" data-testid="home-partners">
          <div className="cine-act__head">
            <div className="cine-kicker"><i />{pKicker}</div>
            <h2 className="cine-h2">{pTitle}</h2>
            {pSub && <p className="cine-lead">{pSub}</p>}
          </div>

          <div className="partners-grid">
            {partnerItems.map((p, i) => {
              const name = (isUk ? p.name_uk : p.name_en) || p.name_en || p.name_uk || "";
              const desc = (isUk ? p.desc_uk : p.desc_en) || p.desc_en || p.desc_uk || "";
              const toAbs = (u) => (u ? (/^https?:\/\//i.test(u) ? u : `${API_URL}${u}`) : "");
              const image = toAbs(p.image_url);
              const hasLink = p.link && /^https?:\/\//i.test(p.link);

              const inner = (
                <>
                  <div className="partner-card__media">
                    {image ? (
                      <img className="partner-card__img" src={image} alt={name || "partner"} loading="lazy" />
                    ) : (
                      <div className="partner-card__img partner-card__img--empty">
                        <span>{(name || "?").charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="partner-card__content">
                    {name && <h3 className="partner-card__name">{name}</h3>}
                    {desc && <p className="partner-card__desc">{desc}</p>}
                    {hasLink && (
                      <span className="partner-card__cta">
                        {isUk ? "Перейти на сайт" : "Visit website"}
                        <i className="partner-card__arrow" aria-hidden="true">→</i>
                      </span>
                    )}
                  </div>
                </>
              );

              return hasLink ? (
                <a
                  key={p.id || i}
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="partner-card partner-card--link"
                  data-cursor
                  data-testid={`partner-card-${i}`}
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={p.id || i}
                  className="partner-card"
                  data-testid={`partner-card-${i}`}
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══ ACT 6 — CTA ═══ */}
      <section className="cine-act cine-cta" data-theme="dark">
        <div className="cine-cta__bg"><div className="cine-cta__bg-img" data-parallax="0.16" style={{ backgroundImage: `url(${IMG.cta})` }} /></div>
        <div className="cine-cta__inner">
          <div className="cine-kicker cine-kicker--light" data-reveal><i />{L.ctaKicker}</div>
          <h2 className="cine-cta__title reveal-words">
            {L.ctaH.map((ln, i) => <Line key={i} text={ln} />)}
          </h2>
          <p className="cine-cta__sub" data-reveal>{L.ctaSub}</p>
          <div className="cine-cta__btns" data-reveal>
            <Link to="/calculator" className="cbtn cbtn--leaf" data-cursor>{L.ctaCalc}</Link>
            <Link to="/contacts" className="cbtn cbtn--dark-ghost" data-cursor>{L.ctaRequest}</Link>
            <Link to="/waste" className="cbtn cbtn--dark-ghost" data-cursor>{L.ctaCatalog}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}