#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================
user_problem_statement: |
  Deploy cloned ECO waste-utilization B2B platform (FastAPI + React + MongoDB),
  then complete a full PUBLIC-site refactor into a Floema + Corn cinematic
  one-page film-scroll. Admin/CRM/Portal/backend must NOT be touched.
  Final public routes: / (cinematic), /waste, /calculator, /contacts, /admin.

frontend:
  - task: "Cinematic Home (/) — pinned hero, split-text, clip-path scenes, parallax, header theming, WebGL dust accent"
    implemented: true
    working: "NA"
    file: "src/pages/public/Home.js, src/pages/public/eco-cine.css, src/components/layout/EcoCanvas.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Fixed header theming (PublicLayout no longer clobbers Home data-nav-theme=dark on '/'); added safe raw-canvas WebGL dust accent (mechanic #7) avoiding r3f@9+React19 crash; fixed mobile hero collapse (stage must flow) + deterministic scroll-based header theming for mobile/static fallback. Verified all 5 acts + mobile via screenshots."
  - task: "Public header/footer (EcoNav/EcoFooter) + layout, single public version"
    implemented: true
    working: "NA"
    file: "src/components/layout/PublicLayout.js, EcoNav.js, EcoFooter.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Removed dead legacy BiBi Cars public landing (entire src/components/public dir, 54 files, 0 importers). Build green. Nav links: /waste /calculator /contacts + Кабінет(/admin) + Розрахувати(/calculator)."
  - task: "Functional public pages: /waste (directory+category+code), /calculator, /contacts"
    implemented: true
    working: "NA"
    file: "src/pages/public/WasteDirectory.js, WasteCategory.js, WasteCodePage.js, Calculator.js, Contacts.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Unchanged logic; verified /waste renders categories. Need regression on calculator (search->select->calculate->request) + directory search/filter + contacts request dialog."

backend:
  - task: "Auth + waste catalog APIs (deploy smoke)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "Deployed. admin@bibi.cars/Admin12345! + manager login OK. waste catalog seeded (895 codes, 35 licenses, 70 price rules). Backend NOT modified during public refactor."
  - task: "/admin slash-admin login + role-based redirect (admin & manager) — 100% verify"
    implemented: true
    working: true
    file: "frontend/src/pages/auth/AdminLogin.js, frontend/src/context/AuthContext.js, frontend/src/components/layout/PortalLayout.js, backend/.env"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "ROOT CAUSE of prior 'auth not working' identified+fixed: PHASE SECURITY S3.4 moved admin/manager passwords out of source into BIBI_ADMIN_PASSWORD/BIBI_MANAGER_PASSWORD env vars; without them set, _seed_default_staff skipped seeding -> login 401. Added BIBI_ADMIN_EMAIL/PASSWORD + BIBI_MANAGER_EMAIL/PASSWORD to backend/.env, restarted backend. Verified end-to-end via Playwright+curl: (1) admin login -> /app (operator dashboard, admin menu); (2) manager login -> /app/cabinet (manager cabinet, manager menu); (3) /auth/me returns role=admin / role=manager correctly; (4) session persists on reload (localStorage eco_token bootstrap); (5) unauth /app -> /admin; (6) /login -> /admin; (7) logout -> /admin + post-logout /app -> /admin. ALL PASS 100%."
  - task: "Partners — public homepage section + admin editor (NEW feature)"
    implemented: true
    working: "NA"
    file: "backend/app/routers/content.py, frontend/src/pages/admin/AdminInfoPage.js, frontend/src/pages/public/Home.js, frontend/src/pages/public/eco-cine.css"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "REDESIGN v2 per user feedback: (1) public grid now 4 cards per row (repeat(4,1fr); 3 at <=1280px, 2 at <=1024, 1 at <=640); (2) cover image height reduced (clamp 150-188px) so content sits higher; (3) more spacing under description before CTA; (4) REMOVED the floating logo badge ('card-within-a-card' dead placeholder) from public cards AND removed the Logo uploader from the admin editor (logo no longer displayed); (5) added GSAP ScrollTrigger left-to-right staggered reveal animation when the section scrolls into view. Added a 4th demo partner (EcoProm) to fill the 4-up row. NEEDS RETEST."

metadata:
  created_by: "main_agent"
  version: "2.0"
  test_sequence: 1
  run_ui: true

test_plan:
  current_focus:
    - "Partners — public homepage section + admin editor (NEW feature)"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "NEW FEATURE to test: PARTNERS. Credentials: admin@eco.ua / EcoAdmin2026! (login at /admin). Test scope: (1) BACKEND: GET /api/site-info returns a 'partners' object {enabled,title_uk,title_en,subtitle_uk,subtitle_en,items[]}; PUT /api/admin/site-info with a partners payload persists items (admin token required, 403 without admin); POST /api/admin/site-info/upload-partner-logo accepts a PNG/JPG/WebP and returns {success,url} and the url is fetchable; non-raster/oversized rejected with 400. (2) ADMIN UI: /app/info/partners — toggle enable, edit section titles (UA/EN), Add partner, upload a logo from computer, fill name UA/EN + desc UA/EN + link, reorder up/down, disable a partner, delete a partner, click Save (PUT) and confirm 'Saved'. (3) PUBLIC: home page / shows the 'Our partners' / 'Наші партнери' section with cards; each enabled card is clickable and opens the link in a NEW tab (target=_blank); disabled partners are hidden. There are 3 demo partners already seeded. DO NOT test drag-and-drop / camera / voice. Public scroll animations need not be deep-tested. Admin/CRM/portal/other backend must remain untouched."
