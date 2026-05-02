# Special Parts Request Feature - Complete

## Overview
Added a comprehensive special parts request system that allows students to request components not available in the inventory. Students can provide product links, upload images, add descriptions, and specify pricing information.

## Database Changes

### New Model: SpecialPartRequest
```prisma
model SpecialPartRequest {
  id              String   @id @default(cuid())
  studentId       String
  partName        String
  description     String
  quantity        Int      @default(1)
  estimatedPrice  Float?
  websiteUrl      String?
  imageUrls       String?  // JSON array of image URLs
  purpose         String
  projectId       String?
  status          String   @default("PENDING")
  reviewedBy      String?
  reviewedAt      DateTime?
  rejectionReason String?
  notes           String?  // Admin notes
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Status Flow
- **PENDING**: Initial submission
- **UNDER_REVIEW**: Being reviewed by admin/HOD
- **APPROVED**: Request approved for ordering
- **REJECTED**: Request rejected with reason
- **ORDERED**: Component has been ordered
- **RECEIVED**: Component received and added to inventory

## API Endpoints

### POST /api/special-requests
Create a new special part request
- **Auth**: Student only
- **Body**:
  ```json
  {
    "partName": "ESP32-CAM Module",
    "description": "WiFi + Bluetooth camera module...",
    "quantity": 2,
    "estimatedPrice": 450.00,
    "websiteUrl": "https://robu.in/product/esp32-cam",
    "imageUrls": ["base64_image_1", "base64_image_2"],
    "purpose": "For IoT surveillance project",
    "projectId": "optional_project_id"
  }
  ```

### GET /api/special-requests
Get special requests (filtered by student for STUDENT role)
- **Query Params**:
  - `status`: Filter by status
  - `page`: Page number
  - `limit`: Items per page

## Pages Created

### 1. `/requests/special` - Create Special Request
**Features:**
- Part name and detailed description
- Quantity selector
- Optional estimated price input
- Website URL field for product links
- Image upload (up to 5 images)
  - Drag & drop or click to upload
  - Image preview with remove option
  - Supports PNG, JPG up to 10MB
- Purpose field (required, min 10 chars)
- Project selection (optional)
- Real-time validation
- Responsive design

**Validation:**
- Part name: min 3 characters
- Description: min 10 characters
- Purpose: min 10 characters
- Quantity: 1-100
- Website URL: valid URL format (optional)
- Images: max 5 images

### 2. `/requests/special-list` - View Special Requests
**Features:**
- List all special requests by the student
- Filter by status (ALL, PENDING, UNDER_REVIEW, APPROVED, REJECTED, ORDERED, RECEIVED)
- Status badges with color coding
- Display all request details:
  - Part name and description
  - Quantity and estimated price
  - Submission and review dates
  - Purpose
  - Product link (clickable)
  - Image gallery
  - Rejection reason (if rejected)
  - Admin notes (if any)
- Quick action to create new special request
- Empty state with call-to-action

## Navigation Updates

### Student Sidebar
Added new menu item:
- **Special Requests** (Sparkles icon)
  - Links to `/requests/special-list`
  - Shows all special requests with status
  - Button to create new special request

## UI/UX Features

### Special Request Form
- Clean, modern card-based layout
- Three-column responsive grid
- Info banner explaining the feature
- Section-based organization:
  - Part Details
  - Product Link
  - Product Images
  - Request Details
- Guidelines card with best practices
- Real-time character count for text fields
- Visual feedback for validation
- Disabled submit until all required fields are valid
- Loading state during submission

### Special Requests List
- Card-based layout for each request
- Color-coded status badges with icons
- Grid layout for key information
- Expandable image gallery
- Highlighted rejection reasons and admin notes
- Responsive design for all screen sizes
- Empty state with helpful message

## Image Handling

### Current Implementation
- Images stored as base64 in database (imageUrls field as JSON array)
- Client-side preview generation
- Max 5 images per request
- File size limit: 10MB per image

### Production Recommendation
For production, consider:
- Upload to cloud storage (AWS S3, Cloudinary, etc.)
- Store only URLs in database
- Implement image compression
- Add CDN for faster loading
- Implement lazy loading for image galleries

## Status Colors

| Status | Color | Icon |
|--------|-------|------|
| PENDING | Yellow | Clock |
| UNDER_REVIEW | Blue | Eye |
| APPROVED | Green | CheckCircle |
| REJECTED | Red | XCircle |
| ORDERED | Purple | Package |
| RECEIVED | Green | CheckCircle |

## Future Enhancements

### For Students
- Edit pending requests
- Cancel pending requests
- Add comments/updates to requests
- Notification when status changes
- Request history and analytics

### For Admin/HOD
- Admin dashboard to review special requests
- Approve/reject with notes
- Update status (ordered, received)
- Bulk actions
- Export requests to CSV
- Integration with procurement system
- Price comparison tools
- Vendor management

### Technical
- Cloud storage integration for images
- Email notifications on status changes
- SMS notifications for urgent updates
- Request templates for common parts
- Auto-suggest based on previous requests
- Integration with supplier APIs
- Price tracking and alerts

## Testing Instructions

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Sign in as student**:
   - Email: `demo.student@sies.edu`
   - Password: `student123`

3. **Navigate to Special Requests**:
   - Click "Special Requests" in sidebar
   - Click "New Special Request" button

4. **Create a special request**:
   - Fill in part name (e.g., "ESP32-CAM Module")
   - Add description with specifications
   - Set quantity
   - Add estimated price (optional)
   - Paste product URL (optional)
   - Upload 1-5 images
   - Enter purpose
   - Select project (optional)
   - Submit

5. **View requests**:
   - Check the special requests list
   - Filter by status
   - View all details including images

## Files Created/Modified

### Created:
- `prisma/migrations/20260128193331_add_special_part_requests/migration.sql`
- `src/app/api/special-requests/route.ts`
- `src/app/requests/special/page.tsx`
- `src/app/requests/special-list/page.tsx`
- `SPECIAL_PARTS_REQUEST_FEATURE.md`

### Modified:
- `prisma/schema.prisma` - Added SpecialPartRequest model
- `src/components/layout/sidebar.tsx` - Added "Special Requests" menu item

## Status
✅ Complete and ready for testing

## Notes
- Image storage uses base64 encoding (suitable for demo/development)
- For production, implement cloud storage solution
- Admin review interface can be added in future iteration
- All validation is in place for data integrity
