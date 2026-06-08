# Barcode/QR Code Scanning Guide

## Current Implementation

### How It Works Now

Both pages currently use **keyboard input** to capture barcode/QR code data from a **physical barcode scanner** (USB scanner).

#### Page 1: Issue Components (`/issue-components`)
**Purpose**: Lab assistants scan student ID to issue approved components

**Current Flow**:
1. Lab assistant focuses on the barcode input field
2. Scans student ID card with USB barcode scanner
3. Scanner types the PRN (e.g., "123A7009") into the input field
4. Scanner automatically presses "Enter"
5. System looks up student by PRN
6. Displays approved requests for that student
7. Lab assistant clicks "Issue" to hand over components

**Key Code**:
```typescript
// Auto-submit on Enter key
const handleBarcodeKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key !== 'Enter') return
  e.preventDefault()
  const prn = barcodeValue.trim()
  // Lookup student by PRN...
}
```

#### Page 2: Return Components (`/parts-issued`)
**Purpose**: Lab assistants scan student ID to process component returns

**Current Flow**:
1. Lab assistant focuses on the PRN input field
2. Scans student ID card with USB barcode scanner
3. Scanner types the PRN into the input field
4. Lab assistant presses "Fetch Active" button (or Enter)
5. System displays all active checkouts for that student
6. Lab assistant clicks "Return" for each component being returned

**Key Code**:
```typescript
const lookupByPrn = async (e: FormEvent) => {
  e.preventDefault()
  if (!prn.trim()) return
  // Fetch student and their issued parts...
}
```

---

## Student ID Card Analysis

Based on your SIES GST student ID card:

### Data Available:
- **Student Name**: CHAFALE SOHAM SANTOSH
- **PRN (Primary Key)**: 123A7009
- **Department**: Electronics and Computer Science
- **Batch**: 2023-2027
- **QR Code**: Contains encoded data (likely includes PRN)
- **Barcode**: Linear barcode at bottom (encodes PRN: 123A7009)

### PRN as Primary Key:
✅ **YES** - PRN acts as the unique identifier:
- Stored in database: `users.prn` (unique field)
- Used for lookups: `/api/users/search?q=123A7009`
- Used for returns: `/api/parts-issued?prn=123A7009`

---

## Current Limitations

### ❌ What Doesn't Work:
1. **No mobile camera scanning** - Requires physical USB barcode scanner
2. **Desktop-only workflow** - Can't use smartphones/tablets
3. **Hardware dependency** - Need to purchase barcode scanners
4. **Single workstation** - Limited to where scanner is connected

### ⚠️ Current Workarounds:
- Manual typing of PRN (slow, error-prone)
- Manual search by name (requires typing, slower)

---

## Proposed Solution: Mobile Camera Scanning

### Why Add Camera Scanning?

1. **No Hardware Cost** - Use existing smartphones/tablets
2. **Flexibility** - Lab assistants can scan from anywhere
3. **Backup Method** - Works if barcode scanner breaks
4. **Mobile-First** - Better for on-the-go operations
5. **QR Code Support** - Can scan both barcode and QR code

### Technical Approach

We'll use **`react-qr-barcode-scanner`** or **`html5-qrcode`** library to:
- Access device camera
- Scan QR codes and barcodes
- Extract PRN from scanned data
- Auto-populate the input field

---

## Implementation Plan

### Phase 1: Add Camera Scanning Component

Create a reusable `<BarcodeScanner>` component:

```typescript
interface BarcodeScannerProps {
  onScan: (prn: string) => void
  onError?: (error: string) => void
}
```

**Features**:
- Camera permission request
- Real-time scanning
- Support for QR codes and barcodes
- Extract PRN from scanned data
- Visual feedback (scanning indicator)
- Error handling

### Phase 2: Integrate into Issue Components Page

Add camera scanning option:
```
[Barcode Scanner Input] ← Existing
        or
[📷 Scan with Camera] ← New button
        or
[Manual Search] ← Existing
```

### Phase 3: Integrate into Return Components Page

Add camera scanning option:
```
[Scan PRN and press Enter] ← Existing
[📷 Scan with Camera] ← New button
```

### Phase 4: PRN Extraction Logic

Handle different barcode formats:
- **Linear Barcode**: Direct PRN (e.g., "123A7009")
- **QR Code**: May contain JSON or formatted data
  - Extract PRN from structured data
  - Parse and validate

---

## Technical Requirements

### Libraries Needed:
```bash
npm install html5-qrcode
# or
npm install react-qr-barcode-scanner
```

### Browser Permissions:
- Camera access (`navigator.mediaDevices.getUserMedia`)
- HTTPS required (camera API only works on secure origins)

### Mobile Compatibility:
- ✅ iOS Safari (iOS 11+)
- ✅ Android Chrome
- ✅ Android Firefox
- ✅ Desktop Chrome/Edge/Firefox

---

## User Experience Flow

### Issue Components (with Camera):

1. Lab assistant opens `/issue-components` on mobile/tablet
2. Clicks "📷 Scan with Camera" button
3. Browser requests camera permission
4. Camera view opens with scanning overlay
5. Lab assistant points camera at student ID barcode/QR code
6. System automatically detects and extracts PRN
7. Camera closes, PRN populates input field
8. System looks up student and shows approved requests
9. Lab assistant clicks "Issue" to complete

### Return Components (with Camera):

1. Lab assistant opens `/parts-issued` on mobile/tablet
2. Clicks "📷 Scan with Camera" button
3. Camera view opens
4. Scans student ID
5. System extracts PRN and fetches active checkouts
6. Lab assistant clicks "Return" for each component

---

## Security Considerations

### Camera Access:
- Request permission only when needed
- Show clear explanation of why camera is needed
- Allow users to deny and use manual input instead

### Data Privacy:
- No images are stored or uploaded
- Only PRN is extracted and used
- Camera stream is closed immediately after scan

### HTTPS Requirement:
- Camera API requires HTTPS in production
- Works on `localhost` for development
- Vercel deployment automatically uses HTTPS

---

## Fallback Strategy

### Multi-Method Support:
1. **Primary**: USB Barcode Scanner (fastest, most reliable)
2. **Secondary**: Mobile Camera Scanning (flexible, no hardware)
3. **Tertiary**: Manual Input (always available)

### Progressive Enhancement:
- Detect camera availability
- Show camera button only if supported
- Graceful degradation to manual input

---

## Database Schema (Already Supports This)

```prisma
model User {
  id    String  @id @default(cuid())
  name  String?
  prn   String? @unique  // ← PRN is unique, perfect for scanning
  // ...
}
```

✅ **No database changes needed** - PRN is already the unique identifier

---

## API Endpoints (Already Exist)

### Student Lookup:
```
GET /api/users/search?q=123A7009
```

### Issued Parts Lookup:
```
GET /api/parts-issued?prn=123A7009
```

✅ **No API changes needed** - Endpoints already accept PRN

---

## Benefits Summary

### For Lab Assistants:
- ✅ Faster scanning (no typing)
- ✅ Fewer errors (no typos)
- ✅ Mobile flexibility
- ✅ Works without hardware

### For Institution:
- ✅ Lower cost (no scanner purchase)
- ✅ Scalable (any device with camera)
- ✅ Future-proof (camera tech improving)
- ✅ Better tracking (faster workflows)

### For Students:
- ✅ Faster service (quick scans)
- ✅ Less waiting time
- ✅ Better experience

---

## Next Steps

1. **Create Spec** for camera scanning feature
2. **Choose Library** (html5-qrcode recommended)
3. **Build Scanner Component** (reusable)
4. **Integrate into Issue Components** page
5. **Integrate into Return Components** page
6. **Test on Mobile Devices** (iOS/Android)
7. **Deploy to Vercel** (HTTPS enabled)

---

## Testing Plan

### Test Scenarios:
1. ✅ Scan barcode with USB scanner (existing)
2. ✅ Scan barcode with mobile camera (new)
3. ✅ Scan QR code with mobile camera (new)
4. ✅ Manual PRN input (existing)
5. ✅ Camera permission denied (fallback)
6. ✅ Invalid PRN scanned (error handling)
7. ✅ Multiple scans in sequence (workflow)

### Test Devices:
- iPhone (Safari)
- Android phone (Chrome)
- iPad/Tablet
- Desktop with webcam
- Desktop without camera (fallback)

---

**Status**: 📋 Ready for Implementation

**Priority**: 🔥 High (eliminates hardware dependency)

**Estimated Effort**: 2-3 days

**Last Updated**: May 2, 2026
