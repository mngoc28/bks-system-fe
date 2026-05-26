# Lead: Partner Discovery Entry Point Optimization

## Document Information
- **Lead ID:** L260519-partner-discovery-entry
- **Created:** 2026-05-19
- **Status:** Clarified
- **Next Step:** Completed.

---

## Original Input
> "tôi có 1 thắc mắc là trang landing chủ yếu là cho người dùng, vậy button chào mời Đăng ký chỗ nghỉ của bạn liệu có hơi nổi bật quá mức?"
> "đặt ngay trước mặt end user?"

---

## Strategic Decision
* **Selected Option:** **Option 1 (Clean B2C - Footer Only)**
* **Rationale:** Since BKS System primarily targets professional hoteliers and businesses, a consumer-facing header button is unnecessary and dilutes B2C conversion rates. By limiting organic partner onboarding discoverability to the footer, we keep the guest interface beautifully clean, matching standard OTA best practices (Booking.com/Agoda). B2B partners will continue to register directly via the targeted landing page `/become-a-partner` sent by direct sales or marketing channels.

---

## Clarified Requirements

### Problem Statement
Placing a high-emphasis partner onboarding link ("Đăng ký chỗ nghỉ của bạn") on the primary B2C consumer storefront header violates core conversion-rate-optimization (CRO) principles. It clutters the visual hierarchy for the 99% of visitors who are travelers (End-users), while hoteliers (B2B Partners) typically utilize dedicated channels (Direct Sales, B2B search, or corporate subdomains) to onboard.

### Target Personas
* **B2C Traveler (End-User):** Needs a clean, distraction-free environment to search, view properties, and finalize bookings.
* **B2B Property Owner (Partner):** Needs a professional, trustworthy introduction explaining commission structures and contract terms, accessed via targeted marketing or sales outreach.

---

## Strategic Comparison Options

| Feature | Option 1: Clean B2C (Footer Only) | Option 2: Subtle Link (Airbnb Style) | Option 3: Dynamic Contextual Header |
| :--- | :--- | :--- | :--- |
| **Header Status** | Completely removed from B2C header | Styled as borderless text next to language switcher | Shown only when URL contains B2B token |
| **CRO Impact** | **Excellent.** 100% focus on guest booking conversion | **Neutral.** Minor visual footprint | **Excellent.** Targeted specifically to prospects |
| **Acquisition** | Dependent on footer discovery and direct Sales outreach | Allows organic discovery for micro-homestays | Seamless transition from marketing ads |
| **Architecture** | High decoupling between B2C and B2B components | Low coupling, simple text routing | Medium coupling, requires query param hooks |

---

## Clarification Q&A

### Business Questions (BA Perspective)
1. **What is the target ratio of P2P (individual hosts) vs B2B (hotel chains/commercial properties)?**
   * *If B2B dominant:* Option 1 (Footer Only) is highly recommended. Commercial partners never register "impulsively" via a traveler storefront header.
2. **What are the primary conversion metrics of the public header?**
   * *Target:* User login/registration, booking status tracking, search activation.

### Technical Questions (TLA Perspective)
1. **Are there future plans to host the partner portal on a distinct subdomain (e.g. `partner.bkssystem.com`)?**
   * *Implication:* Decoupling now will prevent routing conflicts and security leaks down the line.

---

## Next Steps
- [x] Receive user preference feedback on the three options.
- [x] Implement refactoring based on selected option (e.g., stripping from `PublicHeader.tsx` and ensuring footer links remain solid).
