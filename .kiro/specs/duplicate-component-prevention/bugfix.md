# Bugfix Requirements Document

## Introduction

This bugfix addresses the duplicate component creation issue in the inventory management system. Currently, the POST /api/components endpoint allows creating multiple component records with identical names and categories without checking for existing components first. This results in duplicate rows in the inventory table (e.g., two separate "Raspberry Pi 5" entries) instead of a single consolidated record with combined stock quantities.

The bug causes:
- Multiple inventory rows for the same physical component type
- Split stock quantities across duplicate entries instead of consolidated totals
- User confusion when checking available stock
- Data integrity issues in the inventory system

This fix ensures that when adding a component, the system first checks for existing components with the same name and category, then either updates the existing component's stock or creates a new one as appropriate.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user adds a component with a name and category that already exists in the database THEN the system creates a new component record instead of updating the existing one

1.2 WHEN multiple components with identical names and categories are created THEN the system displays multiple rows in the inventory table for the same component type

1.3 WHEN a component is added without uniqueness validation THEN the totalStock and availableStock are split across duplicate records instead of being consolidated

1.4 WHEN a user searches for a component that has duplicates THEN the system returns multiple results for what should be a single component

### Expected Behavior (Correct)

2.1 WHEN a user adds a component with a name and category that already exists in the database THEN the system SHALL find the existing component and update its stock quantities

2.2 WHEN stock is added to an existing component THEN the system SHALL increment both totalStock and availableStock by the added quantity

2.3 WHEN stock is added to an existing component THEN the system SHALL create a StockMovement record with type "IN" documenting the stock addition

2.4 WHEN a component with a unique name and category combination is added THEN the system SHALL create a new component record with the provided details

2.5 WHEN checking for existing components THEN the system SHALL perform a case-insensitive comparison on both name and category within the same organization

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a component with a truly unique name or category is added THEN the system SHALL CONTINUE TO create a new component record as before

3.2 WHEN a component is created or updated THEN the system SHALL CONTINUE TO create an AuditLog entry recording the action

3.3 WHEN a component is created or updated THEN the system SHALL CONTINUE TO create a StockMovement entry tracking the stock change

3.4 WHEN a component is created or updated THEN the system SHALL CONTINUE TO return the complete component object in the API response

3.5 WHEN components are listed via the GET endpoint THEN the system SHALL CONTINUE TO display all components with their current stock levels

3.6 WHEN creating a component fails validation THEN the system SHALL CONTINUE TO return appropriate error responses with validation details

3.7 WHEN a user without proper authorization attempts to create a component THEN the system SHALL CONTINUE TO return a 401 Unauthorized response
