# AgriBid – End-to-End Manual Test Cases Suite

This document contains a comprehensive, step-by-step manual test cases suite for testing every feature and module of the **AgriBid** platform (Next.js Frontend, Node.js/Express Backend, Supabase PostgreSQL Database, Socket.IO WebSockets, and Google Gemini AI).

---

## Pre-requisites & Test Setup

### Environment URLs
- **Web App (Frontend)**: `https://farm-easy-agri-bid-web.vercel.app` (or `http://localhost:3000`)
- **Backend API**: `https://farmeasyagribid.onrender.com/api/v1` (or `http://localhost:4000/api/v1`)
- **API Health Check**: `https://farmeasyagribid.onrender.com/health`

### Demo Test Credentials
| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@agribid.com` | `Admin@1234` | System governance & KYC review |
| **Farmer** | `farmer@agribid.com` | `Farmer@1234` | Creating products & auctions |
| **Buyer** | `buyer@agribid.com` | `Buyer@1234` | Bidding, purchasing, wishlist |
| **Logistics** | `logistics@agribid.com` | `Logistics@1234` | Managing & tracking deliveries |

---

## Test Execution Summary Matrix

| Module ID | Module Name | Total Test Cases | Primary Persona |
| :--- | :--- | :--- | :--- |
| **TC-01** | User Authentication & Security | 6 | All Users |
| **TC-02** | Farmer Product Management | 5 | Farmer |
| **TC-03** | Marketplace & Product Discovery | 6 | Buyer / Public |
| **TC-04** | Real-Time Auction & Bidding Engine | 7 | Buyer / Farmer |
| **TC-05** | Orders, Checkout & Escrow Wallet | 6 | Buyer / Farmer |
| **TC-06** | AI Advisory Hub (Google Gemini) | 5 | Farmer / Buyer |
| **TC-07** | Logistics & Live GPS Tracking | 4 | Logistics Driver |
| **TC-08** | Real-Time Direct Messaging (Chat) | 4 | Buyer & Farmer |
| **TC-09** | Admin Governance & KYC Portal | 5 | Admin |
| **TC-10** | UI Aesthetics, Dark Mode & Localisation | 4 | All Users |
| **TC-11** | Full Dashboard Sub-Pages Suite | 22 | Farmer / Buyer / Admin / Logistics |

---

## Detailed Test Cases

### Module 1: User Authentication & Security (TC-01)

#### TC-01-01: User Registration with Role Selection
- **Description**: Verify that a new user can successfully register as a Farmer, Buyer, or Logistics provider.
- **Pre-conditions**: Navigated to `/auth/register`.
- **Steps**:
  1. Open `/auth/register`.
  2. Select role **Farmer**.
  3. Enter full name `John Farmer`, email `john.farmer@test.com`, password `TestPassword123!`.
  4. Click **Register Account**.
- **Expected Result**: User account is created, JWT tokens are issued, toast welcome message appears, and user is redirected to `/dashboard/farmer`.

#### TC-01-02: User Login with Valid Credentials
- **Description**: Verify user login using email and password.
- **Pre-conditions**: Account exists in system.
- **Steps**:
  1. Open `/auth/login`.
  2. Enter email `buyer@agribid.com` and password `Buyer@1234`.
  3. Click **Sign In**.
- **Expected Result**: Successfully logs in and redirects to `/dashboard/buyer`. Profile info displays in header.

#### TC-01-03: Production Login View (Clean UI)
- **Description**: Verify login page renders cleanly without demo accounts helper box.
- **Pre-conditions**: Navigated to `/auth/login`.
- **Steps**:
  1. Inspect `/auth/login`.
- **Expected Result**: Form renders cleanly with Email and Password inputs and Sign In button.

#### TC-01-04: Forgot Password Link & Email Dispatch
- **Description**: Verify forgot password workflow.
- **Pre-conditions**: Navigated to `/auth/login`.
- **Steps**:
  1. Click **Forgot password?** link.
  2. Verify navigation to `/auth/forgot-password`.
  3. Enter email `farmer@agribid.com` and submit.
- **Expected Result**: Success notification displays indicating reset link has been dispatched without exposing email existence.

#### TC-01-05: Reset Password Link Execution
- **Description**: Verify setting a new password using token.
- **Pre-conditions**: Navigated to `/auth/reset-password?token=mocktoken&uid=user-id`.
- **Steps**:
  1. Enter new password `NewPassword123!` and confirm.
  2. Click **Reset Password**.
- **Expected Result**: Password updated message shown; user can now login with new password.

#### TC-01-06: Session Logout & Token Revocation
- **Description**: Verify user logout clears session state.
- **Pre-conditions**: User is logged in.
- **Steps**:
  1. Click user avatar menu in top right.
  2. Select **Logout**.
- **Expected Result**: User tokens are invalidated, Zustand state cleared, and redirected to `/auth/login`.

---

### Module 2: Farmer Product Management (TC-02)

#### TC-02-01: Create New Product Listing
- **Description**: Verify farmer can list a new agricultural commodity.
- **Pre-conditions**: Logged in as Farmer (`farmer@agribid.com`).
- **Steps**:
  1. Navigate to `/dashboard/farmer/products`.
  2. Click **+ Add New Product**.
  3. Enter Title: `Organic Wheat High Quality`, Category: `Grains`, Price: `$45/Quintal`, Quantity: `500`.
  4. Select **Organic Certified** checkbox.
  5. Click **Create Listing**.
- **Expected Result**: Product is saved to PostgreSQL, displayed in Farmer's product list, and visible on public marketplace.

#### TC-02-02: Product Image Upload to Supabase Storage
- **Description**: Verify uploading product images.
- **Pre-conditions**: On Product Creation modal.
- **Steps**:
  1. Click **Upload Image**.
  2. Select local image file (`wheat.jpg`).
  3. Submit product form.
- **Expected Result**: Image is uploaded to Supabase `product-images` bucket, public URL stored in database, and rendered in product preview.

#### TC-02-03: Edit Product Details & Stock Update
- **Description**: Verify updating price and available stock.
- **Pre-conditions**: Farmer has existing products listed.
- **Steps**:
  1. Click **Edit** on product card in `/dashboard/farmer/products`.
  2. Change price from `$45` to `$42`.
  3. Click **Save Changes**.
- **Expected Result**: Product details update in real-time without full page reload.

#### TC-02-04: Archive / Delete Product Listing
- **Description**: Verify archiving an inactive product listing.
- **Pre-conditions**: Existing product listed.
- **Steps**:
  1. Click **Delete/Archive** icon on product card.
  2. Confirm modal dialog.
- **Expected Result**: Product is soft-deleted/archived, disappears from public marketplace, and inventory log records deletion.

#### TC-02-05: Inventory Log Inspection
- **Description**: Verify inventory stock movements are recorded.
- **Pre-conditions**: Product created/edited.
- **Steps**:
  1. Check Farmer Dashboard inventory tab.
- **Expected Result**: Log displays timestamped record of stock adjustments.

---

### Module 3: Marketplace & Product Discovery (TC-03)

#### TC-03-01: Product Grid & Category Filtering
- **Description**: Verify filtering products by category.
- **Pre-conditions**: Navigated to `/marketplace`.
- **Steps**:
  1. Click category filter `Vegetables`.
- **Expected Result**: Product grid updates dynamically to display only items categorized as Vegetables.

#### TC-03-02: Text Search Bar Execution
- **Description**: Search for specific crop titles or locations.
- **Pre-conditions**: Navigated to `/marketplace`.
- **Steps**:
  1. Type `Basmati Rice` in search input.
  2. Press Enter or wait for debounced search.
- **Expected Result**: Results filter to show matching items containing "Basmati Rice".

#### TC-03-03: Multi-Filter Combination (Price, Organic, Location)
- **Description**: Apply simultaneous filters.
- **Pre-conditions**: Navigated to `/marketplace`.
- **Steps**:
  1. Select `Organic Only` toggle.
  2. Set Min Price `$10`, Max Price `$100`.
  3. Select State filter `Punjab`.
- **Expected Result**: Products matching ALL filter conditions are displayed correctly.

#### TC-03-04: Sort Products (Price Low to High / Popularity)
- **Description**: Test sorting functionality.
- **Pre-conditions**: Navigated to `/marketplace`.
- **Steps**:
  1. Open Sort dropdown.
  2. Select **Price: Low to High**.
- **Expected Result**: Product cards re-order in ascending price order.

#### TC-03-05: Product Detail View & Page Count Increment
- **Description**: View full product detail page.
- **Pre-conditions**: Navigated to `/marketplace`.
- **Steps**:
  1. Click on any product card.
  2. Navigate to `/marketplace/[id]`.
- **Expected Result**: Details page displays high-res images, seller name, stock, location map, and product view counter increments by 1.

#### TC-03-06: Wishlist Item Toggle (Add / Remove)
- **Description**: Bookmark products to personal wishlist.
- **Pre-conditions**: Logged in as Buyer.
- **Steps**:
  1. Click Heart icon on product card.
  2. Navigate to `/dashboard/buyer` wishlist section.
  3. Click Heart icon again to remove.
- **Expected Result**: Item adds to wishlist database, heart turns filled red, and removes cleanly when toggled off.

---

### Module 4: Real-Time Auction & Bidding Engine (TC-04)

#### TC-04-01: View Live Auction Page & Countdown Clock
- **Description**: Verify auction listing rendering and real-time countdown timer.
- **Pre-conditions**: Navigated to `/auctions`.
- **Steps**:
  1. Click on an active auction item.
  2. View `/auctions/[id]`.
- **Expected Result**: Auction title, current highest bid, seller details, bid history table, and live countdown timer (hh:mm:ss) update continuously.

#### TC-04-02: Socket.IO Room Connection
- **Description**: Verify browser connects to WebSocket auction channel.
- **Pre-conditions**: Opened active auction page `/auctions/[id]`.
- **Steps**:
  1. Inspect Browser Console network tab under WS (WebSockets).
- **Expected Result**: WebSocket connection established (`wss://farmeasyagribid.onrender.com`), sending `join_auction` event with `auctionId`.

#### TC-04-03: Place Manual Valid Bid
- **Description**: Verify placing a manual bid higher than current minimum.
- **Pre-conditions**: Logged in as Buyer with sufficient wallet funds.
- **Steps**:
  1. Enter bid amount higher than `current_bid + minimum_increment`.
  2. Click **Place Bid**.
- **Expected Result**: Bid registers, toast shows success, bid history updates instantly for all connected users in room via Socket.IO `new_bid` event.

#### TC-04-04: Reject Invalid Low Bid
- **Description**: Verify validation preventing under-bidding.
- **Pre-conditions**: On `/auctions/[id]`.
- **Steps**:
  1. Enter bid amount equal to or less than current bid.
  2. Click **Place Bid**.
- **Expected Result**: Form error or toast alert prevents submission ("Bid must be higher than current bid").

#### TC-04-05: Configure Auto-Bidding Agent
- **Description**: Verify automated max-bid functionality.
- **Pre-conditions**: On `/auctions/[id]`.
- **Steps**:
  1. Click **Set Auto-Bid**.
  2. Enter Maximum Limit `$500`.
  3. Confirm Auto-Bid.
- **Expected Result**: System automatically places increment bids whenever outbid, up to specified `$500` cap.

#### TC-04-06: Instant Buy Now during Auction
- **Description**: Purchase auction commodity immediately at Buy-Now price.
- **Pre-conditions**: Auction listing has `buy_now_price` set.
- **Steps**:
  1. Click **Buy Now for $X**.
  2. Confirm purchase dialog.
- **Expected Result**: Auction ends immediately with status `completed`, order created, and other bidders notified `auction_ended`.

#### TC-04-07: Auction Expiry & Winner Declaration
- **Description**: Verify behavior when countdown reaches 00:00:00.
- **Pre-conditions**: Active auction nearing expiration time.
- **Steps**:
  1. Allow countdown timer to reach zero.
- **Expected Result**: Bidding input disables, status changes to `Ended`, and winning bidder is declared in UI.

---

### Module 5: Orders, Checkout & Escrow Wallet (TC-05)

#### TC-05-01: Wallet Balance & Transaction History View
- **Description**: Verify digital wallet details.
- **Pre-conditions**: Logged in as Buyer or Farmer.
- **Steps**:
  1. Navigate to Dashboard Wallet section (`/dashboard/buyer/wallet`).
- **Expected Result**: Current wallet balance, pending escrow funds, and history of deposits/withdrawals display clearly via `walletApi`.

#### TC-05-02: Direct Checkout & Order Creation
- **Description**: Place order directly from product page.
- **Pre-conditions**: Logged in as Buyer.
- **Steps**:
  1. Open product page `/marketplace/[id]`.
  2. Click **Buy Now**.
  3. Specify delivery address and quantity.
  4. Confirm order.
- **Expected Result**: Order is created in `orders` table with status `pending`, funds locked in escrow, and order appears in `/dashboard/buyer/orders`.

#### TC-05-03: Order Status Progression
- **Description**: Update order through complete lifecycle.
- **Pre-conditions**: Active order created.
- **Steps**:
  1. Farmer changes status to `Confirmed` on `/dashboard/farmer/orders`.
  2. Logistics partner changes status to `In-Transit`.
  3. Mark as `Delivered`.
- **Expected Result**: Order tracking timeline updates visually with timestamps at each phase.

#### TC-05-04: Escrow Funds Settlement upon Delivery
- **Description**: Verify funds transfer upon successful delivery confirmation.
- **Pre-conditions**: Order marked `Delivered`.
- **Steps**:
  1. Buyer clicks **Confirm Receipt & Release Payment**.
- **Expected Result**: Funds move from Buyer's locked escrow to Farmer's withdrawable wallet balance (minus platform fee).

#### TC-05-05: Order Cancellation & Refund
- **Description**: Cancel pending order and refund escrow.
- **Pre-conditions**: Order in `pending` state.
- **Steps**:
  1. Buyer clicks **Cancel Order**.
  2. Enter reason.
- **Expected Result**: Order status updates to `cancelled` and escrowed funds return to Buyer's available balance.

---

### Module 6: AI Advisory Hub - Google Gemini Integration (TC-06)

#### TC-06-01: AI Price Advisor Query
- **Description**: Obtain AI-powered crop market price valuation.
- **Pre-conditions**: Navigated to `/ai`.
- **Steps**:
  1. Select **Price Advisor** tab.
  2. Select Crop `Tomatoes`, Variety `Hybrid`, Location `Nashik, Maharashtra`.
  3. Click **Get Price Analysis**.
- **Expected Result**: Google Gemini model processes query and returns fair market price estimates, seasonal trends, and recommended target price range.

#### TC-06-02: AI Crop Advisory Recommendation
- **Description**: Receive AI crop recommendations based on soil & season.
- **Pre-conditions**: Navigated to `/ai`.
- **Steps**:
  1. Select **Crop Advisor** tab.
  2. Select Soil Type `Black Soil`, Season `Kharif`, Region `Central India`.
  3. Click **Analyze Optimal Crops**.
- **Expected Result**: AI provides top recommended crops, expected yield, and resource requirements.

#### TC-06-03: AI Crop Disease Assistant Diagnosis
- **Description**: Identify plant diseases from symptoms / image description.
- **Pre-conditions**: Navigated to `/ai`.
- **Steps**:
  1. Select **Disease Assistant** tab.
  2. Describe symptoms: `Yellow spots on tomato leaves with brown edges`.
  3. Click **Diagnose Disease**.
- **Expected Result**: AI identifies likely disease (e.g., Early Blight), severity level, and recommended organic/chemical remedies.

#### TC-06-04: AI Market Demand Forecast
- **Description**: Analyze future supply and demand trends.
- **Pre-conditions**: Navigated to `/ai`.
- **Steps**:
  1. Select **Market Forecast**.
  2. Select Crop `Onions` and timeframe `Next 3 Months`.
  3. Click **Generate Forecast**.
- **Expected Result**: Returns forecasted price curve and supply advice.

#### TC-06-05: Multilingual AI Chatbot Interaction
- **Description**: Chat with AgriAI assistant in regional language.
- **Pre-conditions**: Navigated to `/ai`.
- **Steps**:
  1. Type message: `What is the best fertilizer for wheat crop?`.
  2. Select language `Hindi` or `English`.
  3. Click Send.
- **Expected Result**: AI responds in natural language with agricultural advice.

---

### Module 7: Logistics & Live GPS Tracking (TC-07)

#### TC-07-01: Logistics Dashboard View
- **Description**: Access logistics delivery management console.
- **Pre-conditions**: Logged in as Logistics Driver (`logistics@agribid.com`).
- **Steps**:
  1. Navigate to `/dashboard/logistics/deliveries`.
- **Expected Result**: Displays assigned deliveries via `logisticsApi.deliveries`, pickup coordinates, destination addresses, and status controls.

#### TC-07-02: Update Transit Status
- **Description**: Change delivery status from Pickup to In-Transit.
- **Pre-conditions**: Order assigned to driver.
- **Steps**:
  1. Click **Start Delivery / In-Transit** on order card.
- **Expected Result**: Delivery status updates to `In-Transit`, notifying buyer and seller.

#### TC-07-03: Live GPS Coordinates Broadcast via Socket.IO
- **Description**: Broadcast driver location updates in real-time.
- **Pre-conditions**: Active delivery in progress.
- **Steps**:
  1. Driver app emits `driver_location` event with `{orderId, lat, lng}`.
- **Expected Result**: Socket.IO server broadcasts `driver_location_update` event to order tracking room.

#### TC-07-04: Buyer Live Delivery Map Visualization
- **Description**: View delivery truck position on live map.
- **Pre-conditions**: Navigated to `/map` or Order Tracking page.
- **Steps**:
  1. Open tracking page for active order.
- **Expected Result**: Interactive map renders driver marker updating smoothly as location coordinates change.

---

### Module 8: Real-Time Direct Messaging / Chat System (TC-08)

#### TC-08-01: Initiate Chat Room from Product Page
- **Description**: Start direct message conversation between buyer and seller.
- **Pre-conditions**: Logged in as Buyer.
- **Steps**:
  1. Open product page `/marketplace/[id]`.
  2. Click **Contact Seller**.
- **Expected Result**: Redirects to Chat room `/dashboard/chat`, creating or loading room in `chat_rooms` table.

#### TC-08-02: Real-time Message Exchange
- **Description**: Send and receive messages instantly via WebSockets.
- **Pre-conditions**: Two browser sessions open (Buyer and Farmer in same chat room).
- **Steps**:
  1. Buyer types `Is the price negotiable for bulk purchase?` and clicks Send.
- **Expected Result**: Message appears immediately in Farmer's chat window without page refresh via Socket.IO `new_message` event and `chatApi.sendMessage`.

#### TC-08-03: Typing Indicator Broadcast
- **Description**: Show live typing indicator when user is typing.
- **Pre-conditions**: In active chat room.
- **Steps**:
  1. Start typing in message input field.
- **Expected Result**: Other user sees `Farmer is typing...` indicator via `user_typing` socket event.

#### TC-08-04: Chat History Persistence
- **Description**: Verify historical messages reload correctly.
- **Pre-conditions**: Prior chat messages exist in room.
- **Steps**:
  1. Refresh page or navigate back to chat room.
- **Expected Result**: API fetches previous chat messages ordered chronologically by timestamp via `chatApi.getMessages`.

---

### Module 9: Admin Governance & KYC Portal (TC-09)

#### TC-09-01: Admin Dashboard Overview & Metrics
- **Description**: View platform health indicators.
- **Pre-conditions**: Logged in as Admin (`admin@agribid.com`).
- **Steps**:
  1. Navigate to `/dashboard/admin`.
- **Expected Result**: Key performance indicators display total users, active listings, total GMV, completed auctions, and revenue.

#### TC-09-02: User Governance (List & Filter Users)
- **Description**: Search and inspect user accounts.
- **Pre-conditions**: On `/dashboard/admin/users`.
- **Steps**:
  1. Filter users by role `Farmer`.
  2. Search for user by name.
- **Expected Result**: User table updates to show matching user accounts and status (`pending`, `active`, `suspended`, `banned`).

#### TC-09-03: User Status Modification (Ban / Suspend Account)
- **Description**: Restrict access for policy violations.
- **Pre-conditions**: Selected user in admin panel.
- **Steps**:
  1. Click **Suspend User** or **Ban User**.
  2. Confirm action.
- **Expected Result**: User status updates in database, user session invalidated, and login blocked for suspended account.

#### TC-09-04: KYC Verification Review & Approval
- **Description**: Review submitted government IDs and approve farmer credential.
- **Pre-conditions**: Navigate to `/dashboard/admin/kyc`.
- **Steps**:
  1. Select pending KYC submission.
  2. Inspect uploaded ID document image.
  3. Click **Approve KYC**.
- **Expected Result**: Farmer profile status updates to `verified`, green verified checkmark badge appears on seller profile.

#### TC-09-05: Audit Log Inspection
- **Description**: Track administrator actions for security audit.
- **Pre-conditions**: Admin actions performed.
- **Steps**:
  1. Open Audit Logs section in Admin panel (`/dashboard/admin/audit-logs`).
- **Expected Result**: Chronological log of admin actions (KYC approvals, user status changes) displays with timestamp and admin ID via `adminApi.auditLogs`.

---

### Module 10: UI Aesthetics, Dark Mode & Localisation (TC-10)

#### TC-10-01: Dark Mode / Light Mode Theme Toggle
- **Description**: Verify theme switching across all pages.
- **Pre-conditions**: On any app page.
- **Steps**:
  1. Click Moon/Sun icon in header navigation.
- **Expected Result**: UI elements smoothly transition color scheme to dark mode (dark backgrounds, high contrast text) and remember setting across page reloads.

#### TC-10-02: Responsive Layout Adaptation (Mobile View)
- **Description**: Verify layout adapts to mobile screen resolutions (375px - 768px).
- **Pre-conditions**: Open DevTools Device Mode (iPhone / Android viewport).
- **Steps**:
  1. Resize window to mobile width.
  2. Test navigation hamburger menu, product grid, and auction cards.
- **Expected Result**: Mobile menu opens cleanly, grid adapts to single/double columns, no horizontal overflow or clipped text occurs.

#### TC-10-03: In-App Notification Center & Unread Badge
- **Description**: Receive and manage system notifications.
- **Pre-conditions**: Logged in user.
- **Steps**:
  1. Trigger an action (e.g., place bid or receive message).
  2. Open `/dashboard/notifications`.
  3. Click **Mark All as Read**.
- **Expected Result**: Red notification badge counter updates, notification list renders via `notificationApi.list`, and `notificationApi.markAllRead` executes.

#### TC-10-04: Graceful Network & API Error Handling
- **Description**: Verify fallback UI when backend API is unreachable.
- **Pre-conditions**: Offline mode simulated or invalid request sent.
- **Steps**:
  1. Attempt submitting a form with offline network connection.
- **Expected Result**: Toast alert displays user-friendly error message without crashing the application interface or unhandled console exceptions.

---

### Module 11: Full Dashboard Sub-Pages Suite (TC-11)

#### TC-11-01: Common Messaging Dashboard (`/dashboard/chat`)
- **Description**: Verify conversation room selection, message list fetching, and message sending.
- **Pre-conditions**: Logged in user.
- **Steps**:
  1. Open `/dashboard/chat`.
  2. Click a room in the conversations sidebar.
  3. Type message and click Send button.
- **Expected Result**: Room messages display chronologically and new message appends cleanly to chat view.

#### TC-11-02: Notification Center (`/dashboard/notifications`)
- **Description**: Verify notification listing and mark as read functions.
- **Pre-conditions**: Logged in user.
- **Steps**:
  1. Open `/dashboard/notifications`.
  2. Click an unread notification card.
  3. Click **Mark All as Read**.
- **Expected Result**: Single notification turns read, and all unread badges clear.

#### TC-11-03: User Account & Security Settings (`/dashboard/settings`)
- **Description**: Verify updating personal info and changing password.
- **Pre-conditions**: Logged in user.
- **Steps**:
  1. Open `/dashboard/settings`.
  2. Update Full Name or Phone Number and click Save.
  3. Enter Current Password and New Password and submit.
- **Expected Result**: Profile updates successfully and password update toast feedback displays.

#### TC-11-04: Farmer Auctions Listing (`/dashboard/farmer/auctions`)
- **Description**: Verify farmer's auction management dashboard.
- **Pre-conditions**: Logged in as Farmer.
- **Steps**:
  1. Open `/dashboard/farmer/auctions`.
- **Expected Result**: Active auctions count, total bids count, and listing cards display cleanly with "View Bids" link.

#### TC-11-05: Farmer Customer Orders (`/dashboard/farmer/orders`)
- **Description**: Verify order fulfillment and status updates.
- **Pre-conditions**: Logged in as Farmer.
- **Steps**:
  1. Open `/dashboard/farmer/orders`.
  2. Click **Confirm Order** on a pending order.
- **Expected Result**: Order status updates to `confirmed` and timeline badge updates.

#### TC-11-06: Farmer Stock Inventory (`/dashboard/farmer/inventory`)
- **Description**: Verify crop stock tracking and alert badges.
- **Pre-conditions**: Logged in as Farmer.
- **Steps**:
  1. Open `/dashboard/farmer/inventory`.
- **Expected Result**: Stock table renders with available quantities, unit measurements, and low-stock alert indicators.

#### TC-11-07: Farmer Sales Analytics (`/dashboard/farmer/analytics`)
- **Description**: Verify gross revenue and sales bar charts.
- **Pre-conditions**: Logged in as Farmer.
- **Steps**:
  1. Open `/dashboard/farmer/analytics`.
- **Expected Result**: Gross revenue card, total sales counter, and monthly sales bar chart display cleanly.

#### TC-11-08: Farmer Earnings & Payout Requests (`/dashboard/farmer/earnings`)
- **Description**: Verify balance cards and payout withdrawal request.
- **Pre-conditions**: Logged in as Farmer.
- **Steps**:
  1. Open `/dashboard/farmer/earnings`.
  2. Click **Request Payout**.
- **Expected Result**: Available balance, locked escrow balance, and transaction history table render cleanly.

#### TC-11-09: Farmer AI Advisory Portal (`/dashboard/farmer/ai`)
- **Description**: Verify navigation cards for AI services.
- **Pre-conditions**: Logged in as Farmer.
- **Steps**:
  1. Open `/dashboard/farmer/ai`.
  2. Click **Launch Price Advisor**.
- **Expected Result**: Navigates cleanly to `/ai` hub page with price advisor options.

#### TC-11-10: Farmer Product Reviews (`/dashboard/farmer/reviews`)
- **Description**: Verify customer rating scores and feedback list.
- **Pre-conditions**: Logged in as Farmer.
- **Steps**:
  1. Open `/dashboard/farmer/reviews`.
- **Expected Result**: Average rating score (out of 5.0), total reviews count, and buyer comments display via `reviewApi`.

#### TC-11-11: Farmer KYC & Land Documents (`/dashboard/farmer/documents`)
- **Description**: Verify identity document list and status badges.
- **Pre-conditions**: Logged in as Farmer.
- **Steps**:
  1. Open `/dashboard/farmer/documents`.
- **Expected Result**: Document records display with verification status badges (`verified`, `pending`).

#### TC-11-12: Buyer Orders History (`/dashboard/buyer/orders`)
- **Description**: Verify buyer purchases and live map link.
- **Pre-conditions**: Logged in as Buyer.
- **Steps**:
  1. Open `/dashboard/buyer/orders`.
  2. Click **Track Live Map**.
- **Expected Result**: Order list displays with price, seller name, status badge, and redirects to `/map`.

#### TC-11-13: Buyer Auction Bids (`/dashboard/buyer/bids`)
- **Description**: Verify auction bid status and outbid warnings.
- **Pre-conditions**: Logged in as Buyer.
- **Steps**:
  1. Open `/dashboard/buyer/bids`.
- **Expected Result**: Active bids display with `winning` or `outbid` badges and highest bid amounts.

#### TC-11-14: Buyer Wishlist (`/dashboard/buyer/wishlist`)
- **Description**: Verify wishlist listing and item deletion.
- **Pre-conditions**: Logged in as Buyer.
- **Steps**:
  1. Open `/dashboard/buyer/wishlist`.
  2. Click Trash icon on an item.
- **Expected Result**: Item removes cleanly from wishlist view.

#### TC-11-15: Buyer Digital Wallet (`/dashboard/buyer/wallet`)
- **Description**: Verify cash balance, locked escrow hold, and transaction logs.
- **Pre-conditions**: Logged in as Buyer.
- **Steps**:
  1. Open `/dashboard/buyer/wallet`.
  2. Click **Add Funds**.
- **Expected Result**: Real wallet balances display via `walletApi.get` and transaction list via `walletApi.transactions`.

#### TC-11-16: Buyer Procurement Analytics (`/dashboard/buyer/analytics`)
- **Description**: View total spend and auction savings percentage.
- **Pre-conditions**: Logged in as Buyer.
- **Steps**:
  1. Open `/dashboard/buyer/analytics`.
- **Expected Result**: Spend metrics and auction savings cards display cleanly.

#### TC-11-17: Buyer AI Intelligence Hub (`/dashboard/buyer/ai`)
- **Description**: Access buyer price valuation tools.
- **Pre-conditions**: Logged in as Buyer.
- **Steps**:
  1. Open `/dashboard/buyer/ai`.
- **Expected Result**: Renders price fair valuation and crop supply forecast launch cards.

#### TC-11-18: Admin Product Moderation (`/dashboard/admin/products`)
- **Description**: Approve or flag seller product listings.
- **Pre-conditions**: Logged in as Admin.
- **Steps**:
  1. Open `/dashboard/admin/products`.
  2. Click **Approve** on a pending product.
- **Expected Result**: Product status updates to approved.

#### TC-11-19: Admin Orders & Revenue (`/dashboard/admin/orders` & `/dashboard/admin/revenue`)
- **Description**: View platform orders and net 2.5% commission fee.
- **Pre-conditions**: Logged in as Admin.
- **Steps**:
  1. Open `/dashboard/admin/revenue`.
- **Expected Result**: Net commission collected and platform fee rate display.

#### TC-11-20: Admin Auction Governance (`/dashboard/admin/auctions`)
- **Description**: Monitor live auctions and pause active room.
- **Pre-conditions**: Logged in as Admin.
- **Steps**:
  1. Open `/dashboard/admin/auctions`.
  2. Click **Pause Auction**.
- **Expected Result**: Emergency pause action triggers.

#### TC-11-21: Admin Announcements (`/dashboard/admin/announcements`)
- **Description**: Broadcast announcement to platform users.
- **Pre-conditions**: Logged in as Admin.
- **Steps**:
  1. Open `/dashboard/admin/announcements`.
  2. Enter Title and Message and click Broadcast.
- **Expected Result**: Announcement adds to active list and toast confirms broadcast.

#### TC-11-22: Admin Security Audit Logs (`/dashboard/admin/audit-logs`)
- **Description**: Inspect security audit trail.
- **Pre-conditions**: Logged in as Admin.
- **Steps**:
  1. Open `/dashboard/admin/audit-logs`.
- **Expected Result**: Chronological security audit logs display via `adminApi.auditLogs`.

---

## Conclusion & Verification Checklist

- [x] All 11 core modules documented with step-by-step test instructions.
- [x] Pre-conditions, test steps, and exact expected outcomes specified for all 74 test cases.
- [x] Functional coverage spans Frontend (Next.js), Backend (Express), WebSockets (Socket.IO), Database (PostgreSQL/Supabase), and AI (Google Gemini).
