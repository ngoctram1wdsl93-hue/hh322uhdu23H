{
  "meta": {
    "product": "ECO.NOVA Client Cabinet (B2B portal)",
    "goal": "Modern, premium, thoughtful redesign of authenticated cabinet pages (dashboard, requests, invoices, documents, notifications, profile) without breaking routes, API calls, or existing data-testids.",
    "theme": "Light-first eco brand; optional dark tokens included.",
    "tech": {
      "frontend": "React (JS files), Tailwind, shadcn/ui, lucide-react",
      "backend": "FastAPI",
      "charts": "Recharts (available)",
      "motion": "Prefer CSS transitions; optionally Framer Motion if already installed"
    }
  },
  "brand_attributes": [
    "Trustworthy & compliant (hazardous waste operator)",
    "Calm, professional, accountant-friendly",
    "Premium but not flashy",
    "Fast scanning: clear statuses, amounts, dates",
    "Eco-forward: green accents + natural neutrals"
  ],
  "design_personality": {
    "style_fusion": [
      "Swiss-style grid + strong hierarchy (clarity)",
      "Soft depth cards (premium SaaS)",
      "Bento dashboard composition (thoughtful density)",
      "Subtle eco texture (grain/noise) used sparingly"
    ],
    "avoid": [
      "Template-flat white cards with identical weight",
      "Overuse of gradients",
      "Purple accents (explicitly avoid for AI/chat; also not needed here)",
      "Center-aligned page layouts"
    ]
  },
  "typography": {
    "font_family": {
      "primary": "Mazzard (already loaded in index.css)",
      "fallback": "system-ui, -apple-system, Segoe UI, sans-serif"
    },
    "notes": [
      "Keep Mazzard to maintain existing brand consistency across marketing/admin.",
      "Use calmer weights: 500 for headings, 400 for body, 600 for KPI numbers only. (Index.css already softens bold.)"
    ],
    "scale": {
      "page_title_h1": "text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.02em]",
      "section_title": "text-sm sm:text-base font-medium text-foreground",
      "kpi_value": "text-2xl sm:text-3xl font-semibold tracking-[-0.02em]",
      "body": "text-sm sm:text-base leading-6",
      "meta": "text-xs sm:text-sm text-muted-foreground",
      "table_header": "text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
    }
  },
  "color_system": {
    "constraints": {
      "gradient_rules": {
        "prohibited": [
          "blue-500 to purple-600",
          "purple-500 to pink-500",
          "green-500 to blue-500",
          "red to pink"
        ],
        "limits": [
          "Gradients must not cover >20% of viewport",
          "No gradients on text-heavy reading areas",
          "No gradients on small UI elements (<100px)",
          "Do not stack multiple gradient layers in same viewport"
        ],
        "allowed_usage": [
          "Page header background wash (very subtle)",
          "Decorative corner glows behind hero KPI cluster",
          "Large empty-state illustration backdrop"
        ]
      }
    },
    "tokens_css_custom_properties": {
      "usage": "Define these in :root (light) and optionally in .cabinet-scope[data-theme='dark'] if you enable cabinet dark mode later.",
      "light": {
        "--background": "0 0% 99%",
        "--foreground": "222 47% 11%",
        "--card": "0 0% 100%",
        "--card-foreground": "222 47% 11%",
        "--muted": "210 20% 96%",
        "--muted-foreground": "215 16% 40%",
        "--border": "214 20% 90%",
        "--input": "214 20% 90%",
        "--ring": "152 72% 35%",
        "--radius": "1rem",
        "--primary": "158 64% 18%",
        "--primary-foreground": "0 0% 98%",
        "--accent": "152 55% 92%",
        "--accent-foreground": "158 64% 18%",
        "--success": "152 55% 35%",
        "--warning": "38 92% 50%",
        "--danger": "0 72% 51%",
        "--info": "199 89% 48%"
      },
      "dark_bonus": {
        "--background": "160 20% 6%",
        "--foreground": "0 0% 98%",
        "--card": "160 18% 10%",
        "--card-foreground": "0 0% 98%",
        "--muted": "160 14% 14%",
        "--muted-foreground": "160 8% 70%",
        "--border": "160 12% 18%",
        "--input": "160 12% 18%",
        "--ring": "152 72% 45%",
        "--primary": "152 60% 45%",
        "--primary-foreground": "160 20% 6%",
        "--accent": "152 30% 18%",
        "--accent-foreground": "0 0% 98%"
      }
    },
    "palette_hex_reference": {
      "brand_primary": "#0E5E3A",
      "brand_accent": "#5BC47A",
      "ink": "#0B1A14",
      "surface": "#FFFFFF",
      "surface_2": "#F5F7F6",
      "border": "#E6ECE8",
      "muted_text": "#5B6B63",
      "success": "#1F9D63",
      "warning": "#F59E0B",
      "danger": "#EF4444",
      "info": "#06B6D4"
    },
    "subtle_background_wash": {
      "tailwind_example": "bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(91,196,122,0.18),transparent_55%),radial-gradient(900px_500px_at_90%_0%,rgba(14,94,58,0.10),transparent_60%)]",
      "note": "Use only on top header band of dashboard/overview (keep under ~15–20% viewport height)."
    },
    "noise_texture": {
      "css_snippet": ".cabinet-noise::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"160\" height=\"160\" filter=\"url(%23n)\" opacity=\"0.06\"/></svg>');mix-blend-mode:multiply;}",
      "usage": "Apply to large header background containers only (not cards)."
    }
  },
  "layout_and_grid": {
    "app_shell": {
      "desktop": "Sidebar (fixed) + content area with max-w-[1280px] inner container and generous padding",
      "mobile": "Topbar with hamburger -> shadcn Sheet for nav; content full width with px-4",
      "content_padding": "px-4 sm:px-6 lg:px-8 py-6",
      "max_width": "max-w-[1280px]",
      "grid": {
        "dashboard": "grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6",
        "kpi_row": "col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4",
        "two_column": "col-span-12 lg:col-span-8 + col-span-12 lg:col-span-4"
      }
    },
    "spacing_system": {
      "rule": "Use 2–3x more spacing than current cabinet; prefer whitespace over borders.",
      "tokens": {
        "--space-1": "4px",
        "--space-2": "8px",
        "--space-3": "12px",
        "--space-4": "16px",
        "--space-5": "20px",
        "--space-6": "24px",
        "--space-8": "32px"
      }
    }
  },
  "components": {
    "component_path": {
      "shadcn": "/app/frontend/src/components/ui",
      "use_primary": [
        "button.jsx",
        "card.jsx",
        "badge.jsx",
        "tabs.jsx",
        "table.jsx",
        "dialog.jsx",
        "drawer.jsx",
        "sheet.jsx",
        "dropdown-menu.jsx",
        "select.jsx",
        "separator.jsx",
        "skeleton.jsx",
        "scroll-area.jsx",
        "progress.jsx",
        "tooltip.jsx",
        "sonner.jsx"
      ]
    },
    "sidebar": {
      "structure": [
        "Top: ECO.NOVA wordmark + small environment badge (e.g., 'Кабінет клієнта')",
        "Middle: grouped nav (Overview, Requests, Invoices, Documents, Notifications, Profile)",
        "Bottom: Personal manager mini-card + company/user block"
      ],
      "visual": {
        "surface": "bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-r border-border",
        "active_item": "rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm",
        "inactive_item": "text-muted-foreground hover:text-foreground hover:bg-muted",
        "icon": "lucide-react size-4 opacity-80"
      },
      "micro_interactions": [
        "Active item: subtle left indicator bar (2px) + background fill",
        "Hover: background tint only (no transform on container)",
        "Collapsed (optional): icons only with tooltip"
      ],
      "data_testids": {
        "nav_overview": "client-nav-overview",
        "nav_requests": "client-nav-requests",
        "nav_invoices": "client-nav-invoices",
        "nav_documents": "client-nav-documents",
        "nav_notifications": "client-nav-notifications",
        "nav_profile": "client-nav-profile"
      }
    },
    "topbar": {
      "elements": [
        "Breadcrumb (optional) or page title",
        "Global search (optional later)",
        "Language toggle UA/EN",
        "Notifications bell",
        "User/company dropdown"
      ],
      "visual": {
        "height": "h-14 sm:h-16",
        "surface": "sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border",
        "divider": "Separator"
      },
      "data_testids": {
        "lang-toggle": "client-topbar-language-toggle",
        "user-menu": "client-topbar-user-menu",
        "sign-out": "client-topbar-signout-button"
      }
    },
    "kpi_cards": {
      "design": {
        "container": "rounded-2xl border border-border bg-card shadow-[0_10px_30px_-18px_rgba(11,26,20,0.25)]",
        "header": "flex items-start justify-between gap-3",
        "value": "text-2xl sm:text-3xl font-semibold tracking-[-0.02em]",
        "label": "text-[11px] uppercase tracking-[0.08em] text-muted-foreground",
        "sparkline_slot": "h-10 mt-3"
      },
      "variants": {
        "neutral": "",
        "accent": "relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(600px_200px_at_20%_0%,rgba(91,196,122,0.22),transparent_60%)] before:pointer-events-none"
      },
      "recommended_kpis": [
        "Всього заявок",
        "Активні",
        "Завершені",
        "Сума договорів / або 'До сплати'"
      ]
    },
    "status_badges": {
      "rule": "Statuses must be instantly scannable; use icon + label; keep consistent across Requests/Invoices/Documents.",
      "mapping": {
        "new": {"classes": "bg-[rgba(6,182,212,0.12)] text-[rgb(8,145,178)] border border-[rgba(6,182,212,0.25)]", "icon": "Sparkles"},
        "in_progress": {"classes": "bg-[rgba(245,158,11,0.14)] text-[rgb(180,83,9)] border border-[rgba(245,158,11,0.28)]", "icon": "Loader"},
        "completed": {"classes": "bg-[rgba(31,157,99,0.14)] text-[rgb(14,94,58)] border border-[rgba(31,157,99,0.28)]", "icon": "Check"},
        "cancelled": {"classes": "bg-[rgba(239,68,68,0.12)] text-[rgb(185,28,28)] border border-[rgba(239,68,68,0.25)]", "icon": "X"},
        "paid": {"classes": "bg-[rgba(31,157,99,0.14)] text-[rgb(14,94,58)] border border-[rgba(31,157,99,0.28)]", "icon": "BadgeCheck"},
        "awaiting_payment": {"classes": "bg-[rgba(245,158,11,0.14)] text-[rgb(180,83,9)] border border-[rgba(245,158,11,0.28)]", "icon": "Clock"}
      },
      "component": "Use shadcn Badge with custom className; ensure data-testid on badge container for key statuses (e.g., invoice status)."
    },
    "timeline": {
      "use_case": "Request detail lifecycle (created → confirmed → scheduled → picked up → processed → documents issued)",
      "layout": "Vertical timeline on mobile; two-column (timeline left, details right) on desktop.",
      "visual": {
        "rail": "absolute left-[11px] top-0 bottom-0 w-px bg-border",
        "node_done": "bg-[hsl(var(--primary))] ring-4 ring-[rgba(91,196,122,0.18)]",
        "node_current": "bg-[hsl(var(--primary))] ring-4 ring-[rgba(245,158,11,0.18)]",
        "node_future": "bg-muted border border-border"
      },
      "micro_interactions": [
        "On hover (desktop): step card highlights with border tint",
        "On click: expand step details (Collapsible)"
      ],
      "data_testids": {
        "timeline": "request-detail-timeline",
        "timeline-step": "request-detail-timeline-step"
      }
    },
    "tables_and_lists": {
      "rule": "Prefer card-wrapped tables with sticky header; on mobile switch to stacked rows (key-value) or horizontal scroll with ScrollArea.",
      "shadcn": ["table.jsx", "scroll-area.jsx"],
      "row_hover": "hover:bg-muted/60",
      "empty_state": "Use UIStates.js patterns + Skeleton for loading"
    },
    "invoice_card": {
      "layout": "Card with left: invoice meta; right: amount + status + actions",
      "actions": [
        "Download PDF",
        "Copy IBAN",
        "Confirm payment"
      ],
      "iban_block": "Use a monospace-like style via Tailwind: font-mono text-sm bg-muted rounded-lg px-3 py-2 border border-border",
      "data_testids": {
        "download": "invoice-download-button",
        "copy-iban": "invoice-copy-iban-button",
        "confirm": "invoice-confirm-payment-button"
      }
    },
    "document_card": {
      "layout": "Grid cards with PDF icon, title, tags (contract/act), signature status, actions",
      "preview": "Optional: HoverCard with metadata (date, number, status)",
      "actions": ["View", "Download"],
      "data_testids": {
        "doc-card": "document-card",
        "doc-download": "document-download-button"
      }
    },
    "manager_card": {
      "placement": "Sidebar bottom (mini) + Overview page right column (full)",
      "visual": {
        "surface": "rounded-2xl border border-[rgba(14,94,58,0.18)] bg-[radial-gradient(700px_240px_at_20%_0%,rgba(91,196,122,0.22),transparent_60%)]",
        "avatar": "shadcn Avatar with fallback initials",
        "cta": "Two small buttons: Call / Email (ghost + outline)"
      },
      "data_testids": {
        "manager-card": "personal-manager-card",
        "manager-call": "personal-manager-call-button",
        "manager-email": "personal-manager-email-button"
      }
    },
    "buttons": {
      "variants": {
        "primary": "Use shadcn Button default but ensure it maps to --primary; add className: rounded-xl shadow-sm hover:shadow-md transition-[background-color,box-shadow]",
        "secondary": "outline variant with border-border; hover:bg-muted",
        "ghost": "ghost variant for icon buttons; hover:bg-muted",
        "danger": "destructive variant"
      },
      "sizes": {
        "sm": "h-9 px-3 text-sm",
        "md": "h-10 px-4",
        "lg": "h-11 px-5"
      },
      "press_motion": "active:scale-[0.98] (apply only to the button element, not parent containers)",
      "data_testids_rule": "Every Button must have data-testid (role-based, kebab-case)."
    },
    "forms": {
      "shadcn": ["form.jsx", "input.jsx", "textarea.jsx", "select.jsx", "calendar.jsx"],
      "focus": "Use ring color --ring; ensure visible focus for keyboard users",
      "validation": "Inline error text text-sm text-destructive; also toast via sonner for submit-level errors"
    },
    "loading_and_empty_states": {
      "loading": "Use shadcn Skeleton blocks matching final layout (avoid spinners-only).",
      "empty": {
        "pattern": "Card with icon, 1-line title, 1-line guidance, primary CTA",
        "example": "No requests yet → CTA 'Створити заявку'"
      },
      "data_testids": {
        "empty-state": "page-empty-state",
        "skeleton": "page-loading-skeleton"
      }
    }
  },
  "page_blueprints": {
    "ClientLayout": {
      "wireframe": [
        "Desktop: Sidebar (260px) + Topbar + Content",
        "Mobile: Topbar with hamburger -> Sheet nav; bottom safe-area padding"
      ],
      "notes": [
        "Keep existing routes and nav logic; only restyle and improve spacing.",
        "Ensure no horizontal overflow: wrap tables in ScrollArea and use min-w for columns."
      ]
    },
    "ClientOverview": {
      "header_band": "Use subtle background wash + noise overlay behind page title and KPI row (max 15–20% viewport height).",
      "sections": [
        "KPI row (4 cards) with small icons",
        "Requests activity (Recharts area chart) + Recent requests list",
        "Invoices summary (Paid vs Awaiting) + quick actions",
        "Personal manager full card"
      ],
      "recharts_spec": {
        "chart": "AreaChart with monotone curve, minimal grid, tooltip",
        "colors": {
          "stroke": "#0E5E3A",
          "fill": "rgba(91,196,122,0.22)"
        },
        "empty_state": "If no data: show empty card with guidance"
      },
      "data_testids": {
        "new-request": "overview-new-request-button",
        "kpi-total": "overview-kpi-total-requests",
        "kpi-active": "overview-kpi-active-requests",
        "kpi-completed": "overview-kpi-completed-requests",
        "recent-requests": "overview-recent-requests"
      }
    },
    "ClientRequests": {
      "layout": [
        "Top: page title + primary CTA 'Нова заявка'",
        "Filters row (status select, date range calendar, search) in a Card",
        "List: table on desktop; stacked cards on mobile"
      ],
      "status": "Use consistent status badges mapping.",
      "row_actions": "View details, download docs (if available)",
      "data_testids": {
        "new-request": "requests-new-request-button",
        "filters": "requests-filters",
        "list": "requests-list"
      }
    },
    "ClientRequestDetail": {
      "layout": [
        "Header: Request # + status badge + key meta (address, date, waste type)",
        "Main: Timeline card (left) + Details/Docs card (right) on desktop",
        "Mobile: Timeline first, then details"
      ],
      "widgets": [
        "Lifecycle timeline (Collapsible step details)",
        "Documents related to request",
        "Contact manager quick actions"
      ],
      "data_testids": {
        "status": "request-detail-status",
        "timeline": "request-detail-timeline",
        "documents": "request-detail-documents"
      }
    },
    "NewRequestModal": {
      "component": "Use shadcn Dialog on desktop; Drawer on mobile (responsive switch).",
      "steps": "Optional 2-step form (details → confirmation) using Tabs or internal stepper.",
      "data_testids": {
        "modal": "new-request-modal",
        "submit": "new-request-submit-button",
        "cancel": "new-request-cancel-button"
      }
    },
    "ClientInvoices": {
      "layout": [
        "Top summary strip: Outstanding amount + Awaiting count + Paid this month",
        "Invoice list: card-wrapped table or stacked invoice cards",
        "Right rail (desktop): IBAN instructions card + FAQ"
      ],
      "microcopy": [
        "Show IBAN + recipient + purpose template with copy buttons",
        "Explain confirmation flow (what happens after payment)"
      ],
      "data_testids": {
        "summary": "invoices-summary",
        "list": "invoices-list",
        "iban": "invoices-iban-block"
      }
    },
    "ClientDocuments": {
      "layout": [
        "Tabs: All / Contracts / Acts",
        "Grid: 1 col mobile, 2 col md, 3 col xl",
        "Each card: title, type badge, date, signature status, actions"
      ],
      "data_testids": {
        "tabs": "documents-tabs",
        "grid": "documents-grid"
      }
    },
    "ClientNotifications": {
      "layout": [
        "Left: message list (ScrollArea)",
        "Right: message detail (desktop) or drill-in (mobile)"
      ],
      "components": ["tabs.jsx (All/Unread)", "card.jsx", "scroll-area.jsx"],
      "data_testids": {
        "list": "notifications-list",
        "item": "notifications-item",
        "detail": "notifications-detail"
      }
    },
    "ClientProfile": {
      "layout": [
        "Two-column form on desktop; single column on mobile",
        "Sections: Company info, Requisites, Security"
      ],
      "components": ["form.jsx", "input.jsx", "select.jsx", "switch.jsx"],
      "data_testids": {
        "company-form": "profile-company-form",
        "save": "profile-save-button"
      }
    }
  },
  "motion_and_microinteractions": {
    "principles": [
      "Motion is functional: indicate state change, hierarchy, and feedback.",
      "No universal transition: never use transition: all.",
      "Prefer 140–220ms durations; ease-out for entrances, ease-in-out for hover."
    ],
    "hover": {
      "cards": "hover:shadow-[0_18px_50px_-28px_rgba(11,26,20,0.35)] hover:border-[rgba(14,94,58,0.22)] transition-[box-shadow,border-color,background-color]",
      "buttons": "transition-[background-color,box-shadow]",
      "rows": "transition-[background-color]"
    },
    "entrance": {
      "css": "Use existing .animate-fade-in-up for sections; stagger by 40–80ms.",
      "reduced_motion": "Respect prefers-reduced-motion: disable entrance animations"
    }
  },
  "accessibility": {
    "requirements": [
      "WCAG AA contrast for text on surfaces",
      "Visible focus rings (ring + outline) for keyboard navigation",
      "Do not rely on color alone for statuses: include icon + label",
      "Touch targets >= 44px on mobile for primary actions"
    ]
  },
  "libraries_and_installation": {
    "optional": [
      {
        "name": "framer-motion",
        "when": "Only if already present or approved; use for subtle layout transitions (Sheet open, list item expand).",
        "install": "npm i framer-motion",
        "usage": "Wrap expanding panels with motion.div; keep durations 0.18–0.24s"
      }
    ],
    "charts": {
      "recharts": "Already available; use for Overview activity chart and invoice trend mini-sparklines."
    }
  },
  "image_urls": {
    "note": "Image provider tool unavailable in this environment. Use internal brand assets or later add stock images manually.",
    "categories": [
      {
        "category": "manager_avatar",
        "description": "Personal manager avatar (optional). Prefer initials fallback via shadcn Avatar.",
        "urls": []
      },
      {
        "category": "empty_state_illustrations",
        "description": "Use simple inline SVG illustrations (eco icons: leaf, document, truck) instead of photos.",
        "urls": []
      }
    ]
  },
  "instructions_to_main_agent": [
    "PRIMARY GOAL: Redesign authenticated cabinet pages only; keep auth pages consistent (do not rewrite client-auth.css unless needed).",
    "Do NOT break existing functionality, routes, API calls, or existing data-testid attributes. If you add new interactive elements, add data-testid in kebab-case.",
    "Prefer shadcn/ui components from /app/frontend/src/components/ui (no raw HTML dropdowns/calendars/toasts).",
    "Implement mobile-first: tables -> ScrollArea or stacked cards; modals -> Dialog desktop + Drawer mobile.",
    "Use the subtle header background wash only on Overview header band; keep gradients under 20% viewport.",
    "Avoid adding .App { text-align:center } or any centered global container.",
    "Never use transition: all; use transition-[background-color,border-color,box-shadow] etc.",
    "Use lucide-react icons only (no emoji icons).",
    "If you introduce new status colors, ensure text contrast and include icon + label."
  ],
  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
