# Bulk PRN Import Feature - Complete Guide

## Overview

The Bulk PRN Import feature allows Lab Assistants, HODs, and Admins to upload a CSV file containing student email-to-PRN mappings. This is the recommended way to link Microsoft SSO accounts to student PRNs for students who are already enrolled.

## Features

✅ CSV file upload with validation
✅ Client-side parsing with preview
✅ Duplicate PRN detection
✅ Batch update with detailed results
✅ Automatic verification (`isPrnVerified: true`)
✅ Audit logging
✅ Error reporting with details

## Access Control

**Who can import**: OWNER, ADMIN, HOD, LAB_ASSISTANT

**Navigation**: Sidebar → "Import PRN List"

## CSV Format

### Required Headers

```csv
email,prn,department,year
```

### Field Descriptions

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `email` | ✅ Yes | Student's email address | `student@sies.edu` |
| `prn` | ✅ Yes | Student's PRN (8 alphanumeric) | `123A7009` |
| `department` | ❌ Optional | Department name | `Computer Engineering` |
| `year` | ❌ Optional | Academic year | `TE` |

### Sample CSV

```csv
email,prn,department,year
student1@sies.edu,123A7001,Computer Engineering,TE
student2@sies.edu,123A7002,Electronics Engineering,BE
student3@sies.edu,123A7003,Information Technology,SE
```

### Download Sample

Click "Download Sample CSV" button on the import page to get a template file.

## Import Process

### Step 1: Navigate to Import Page

1. Login as LAB_ASSISTANT, HOD, or ADMIN
2. Click "Import PRN List" in the sidebar
3. You'll see the import interface

### Step 2: Prepare CSV File

1. Export student data from your student management system
2. Ensure columns match the required format
3. Verify email addresses match Microsoft SSO emails
4. Verify PRNs are exactly 8 alphanumeric characters

### Step 3: Upload CSV

1. Click the upload area or drag-and-drop your CSV file
2. The file will be parsed automatically
3. You'll see a preview of valid and invalid records

### Step 4: Review Preview

**Valid Records Table**:
- Shows first 10 records
- Displays email, PRN, department, year
- These will be imported

**Invalid Records Section** (if any):
- Shows row number and data
- Lists specific errors for each record
- These will be skipped

### Step 5: Upload to Database

1. Review the preview carefully
2. Click "Upload to Database" button
3. Wait for the upload to complete
4. Review the results

### Step 6: Review Results

**Success Card**:
- Shows count of successful updates
- Shows count of failed updates
- Lists any errors with details

## Validation Rules

### Email Validation

- Must be a valid email format
- Must match an existing user in the database
- Case-insensitive matching

### PRN Validation

- Must be exactly 8 alphanumeric characters
- Must be unique (not already assigned to another user)
- Automatically converted to uppercase

### User Existence

- User must exist in the database (must have logged in at least once)
- User must not already have a different PRN assigned

## What Happens During Import

For each valid record:

1. **Find User**: Look up user by email
2. **Check PRN**: Verify PRN is not taken by another user
3. **Update User**: Set PRN, department, year
4. **Set Verified**: Set `isPrnVerified: true`
5. **Log Action**: Create audit log entry

## API Endpoint

### POST `/api/users/bulk-import`

**Request Body**:
```json
{
  "students": [
    {
      "email": "student1@sies.edu",
      "prn": "123A7001",
      "department": "Computer Engineering",
      "year": "TE"
    }
  ]
}
```

**Response**:
```json
{
  "message": "Bulk import completed",
  "results": {
    "success": 45,
    "failed": 2,
    "errors": [
      {
        "email": "student99@sies.edu",
        "error": "User not found in database"
      },
      {
        "email": "student100@sies.edu",
        "error": "PRN 123A7099 is already assigned to another user"
      }
    ]
  }
}
```

## Common Errors

### "User not found in database"

**Cause**: Student has not logged in yet

**Solution**: 
- Ask student to login once with Microsoft SSO
- Then re-import their record

### "PRN is already assigned to another user"

**Cause**: Duplicate PRN in your CSV or database

**Solution**:
- Check for duplicate PRNs in your CSV
- Verify PRN is correct
- Check if PRN is already assigned in the database

### "Invalid email format"

**Cause**: Email is not a valid email address

**Solution**: Fix the email format in your CSV

### "Missing PRN"

**Cause**: PRN field is empty

**Solution**: Add PRN value in your CSV

## Best Practices

### Before Import

1. **Backup Database**: Always backup before bulk operations
2. **Test with Small File**: Test with 5-10 records first
3. **Verify Emails**: Ensure emails match Microsoft SSO emails
4. **Check PRN Format**: Verify all PRNs are 8 alphanumeric characters
5. **Remove Duplicates**: Check for duplicate PRNs in your CSV

### During Import

1. **Review Preview**: Carefully review the preview table
2. **Check Invalid Records**: Fix invalid records before uploading
3. **Monitor Progress**: Wait for upload to complete
4. **Review Results**: Check success/failure counts

### After Import

1. **Verify Results**: Check a few random students in the database
2. **Test Scanning**: Test barcode scanning with imported students
3. **Document Issues**: Note any errors for future reference
4. **Update Records**: Re-import any failed records after fixing issues

## Troubleshooting

### Issue: CSV not parsing

**Symptoms**: Error message "Failed to parse CSV"

**Solutions**:
- Ensure file is valid CSV format
- Check for special characters in data
- Verify headers match exactly: `email,prn,department,year`
- Try opening in Excel and re-saving as CSV

### Issue: All records showing as invalid

**Symptoms**: No valid records in preview

**Solutions**:
- Check CSV headers are correct
- Verify email format is valid
- Ensure PRN field is not empty
- Check for extra spaces in data

### Issue: Upload button disabled

**Symptoms**: Cannot click "Upload to Database"

**Solutions**:
- Ensure there are valid records in preview
- Check if upload already completed
- Refresh page and try again

### Issue: Some records failed

**Symptoms**: Failed count > 0 in results

**Solutions**:
- Review error list for specific issues
- Fix issues in CSV
- Re-upload only failed records

## Database Schema

### User Model

```prisma
model User {
  prn            String?   @unique
  department     String?
  year           String?
  isPrnVerified  Boolean   @default(false)
  // ... other fields
}
```

### Audit Log

```prisma
model AuditLog {
  userId    String
  action    String  // "BULK_IMPORT_PRN"
  resource  String  // "USER_TABLE"
  details   String? // JSON with import statistics
  createdAt DateTime @default(now())
}
```

## Security

### Authorization

- Only OWNER, ADMIN, HOD, LAB_ASSISTANT can access
- Session validation on every request
- Role check before processing

### Data Validation

- Email format validation
- PRN uniqueness check
- User existence verification
- Duplicate prevention

### Audit Trail

- All imports logged with:
  - Who performed the import
  - When it was performed
  - How many records were processed
  - Success/failure counts

## Performance

### Limits

- **File Size**: No hard limit, but recommend < 1MB
- **Record Count**: No hard limit, but recommend < 1000 records per batch
- **Processing Time**: ~1-2 seconds per 100 records

### Optimization Tips

1. **Split Large Files**: Break files > 1000 records into smaller batches
2. **Remove Duplicates**: Pre-process CSV to remove duplicates
3. **Validate Locally**: Check data quality before uploading
4. **Off-Peak Hours**: Import during low-traffic times

## Related Features

### Bulk Import vs Self-Service Onboarding

| Feature | Bulk Import | Self-Service |
|---------|-------------|--------------|
| Who enters data | Lab staff | Student |
| Verification status | Verified (`true`) | Unverified (`false`) |
| When to use | Known students | New/unknown students |
| Batch processing | Yes | No |

### Integration with Verification System

- Bulk import sets `isPrnVerified: true`
- Students can immediately issue components
- No verification step needed during scanning
- Recommended for all enrolled students

## Files Modified

### New Files

- `src/app/users/import/page.tsx` - Import page
- `src/components/users/bulk-import-client.tsx` - Import UI component
- `src/app/api/users/bulk-import/route.ts` - Import API endpoint

### Modified Files

- `src/components/layout/sidebar.tsx` - Added "Import PRN List" link
- `prisma/schema.prisma` - Added `isPrnVerified` field

## Dependencies

### NPM Packages

```json
{
  "papaparse": "^5.4.1",
  "@types/papaparse": "^5.3.7"
}
```

### Installation

```bash
npm install papaparse @types/papaparse
```

## Testing

### Test Scenarios

1. **Valid CSV**: Upload CSV with all valid records
2. **Invalid Emails**: Upload CSV with invalid email formats
3. **Duplicate PRNs**: Upload CSV with duplicate PRNs
4. **Missing Users**: Upload CSV with emails not in database
5. **Mixed Valid/Invalid**: Upload CSV with both valid and invalid records
6. **Large File**: Upload CSV with 500+ records
7. **Special Characters**: Upload CSV with special characters in names

### Expected Results

1. Valid records should be imported successfully
2. Invalid records should be listed in errors
3. Duplicate PRNs should be rejected
4. Missing users should be reported
5. Mixed files should show both success and failure counts
6. Large files should process without timeout
7. Special characters should be handled correctly

## Support

For issues or questions:
1. Check this guide first
2. Review error messages carefully
3. Check audit logs for details
4. Contact system administrator

## Changelog

### Version 1.0 (Current)

- Initial implementation
- CSV upload with validation
- Client-side parsing
- Batch update API
- Audit logging
- Error reporting

## Future Enhancements

1. **Excel Support**: Accept .xlsx files in addition to CSV
2. **Template Generator**: Generate CSV template from existing data
3. **Dry Run Mode**: Preview changes without committing
4. **Rollback**: Undo recent imports
5. **Scheduled Imports**: Automatic imports from external systems
6. **Email Notifications**: Notify students when their PRN is imported

## Summary

The Bulk PRN Import feature provides a fast, reliable way to link student emails to PRNs. It's the recommended method for onboarding known students and ensures they can immediately use the system without additional verification steps.

**Key Benefits**:
- ✅ Fast batch processing
- ✅ Automatic verification
- ✅ Detailed error reporting
- ✅ Audit trail
- ✅ User-friendly interface
- ✅ Validation and safety checks
