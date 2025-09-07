-- Order Management Database Schema
-- Created by: google-workspace-architect
-- Date: 2025-09-07
-- Purpose: Google Sheets structure for trade automation system

-- Main Order Management Table Structure
-- Sheet Name: Order_Management

-- Column Definitions:
-- A: Order_ID (Primary Key) - Format: ORD-YYYY-MM-DD-XXX
-- B: Client_Name (Text, Required)
-- C: Client_Email (Email validation)
-- D: Client_Phone (Text)
-- E: Product_Description (Text, Required)
-- F: Quantity (Number, Min: 1)
-- G: Unit_Price (Currency)
-- H: Total_Amount (Formula: =F*G)
-- I: Order_Date (Date, Auto-filled)
-- J: Delivery_Date (Date, Required)
-- K: Status (Dropdown: Pending/Processing/Production/Shipped/Delivered)
-- L: Drive_Folder_Link (URL, Auto-generated)
-- M: Tracking_Number (Text)
-- N: Notes (Text, Optional)

-- Data Validation Rules:
-- Order_ID: Custom formula to ensure uniqueness
-- Client_Email: Email format validation
-- Quantity: Integer >= 1
-- Unit_Price: Currency format, >= 0
-- Delivery_Date: Must be future date
-- Status: Dropdown list only

-- Conditional Formatting:
-- Status = "Delivered" → Green background
-- Status = "Pending" → Yellow background  
-- Delivery_Date < TODAY() and Status != "Delivered" → Red background

-- Protected Ranges:
-- Order_ID column (auto-generated)
-- Total_Amount column (formula)
-- Drive_Folder_Link column (auto-generated)