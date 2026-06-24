# Warrantly - Design System & Component Architecture

## Overview
Warrantly is a smart digital wallet designed for managing, storing, and tracking product warranties and receipts. This document outlines the frontend engineering structure, global design tokens, and components breakdown for the React implementation.

## Design Tokens (CSS Variables)
We have implemented a strict global theme hierarchy inside `src/styles/globals.css`:
- **Primary Color:** `#4F46E5` (Brand core)
- **Status Colors:** Success (`#10B981`), Warning (`#F59E0B`), Danger (`#EF4444`)
- **Typography:** Hierarchy built around clean, scannable system fonts with strict layout utility rules.

## Component Breakdown
Following the React atomic design principles, the application isolates reusable blocks:
1. **Shared Layout Components (`src/components/`):**
   - `TopNavbar`: Provides global application status and contextual action hierarchy.
   - `BottomNavigation`: Sticky cross-application client routing core.
2. **Feature Components:**
   - `WarrantyCard`: Reusable layout encapsulating metadata mapping for single product context.
   - `ImageUploader`: Sandbox component dealing with simulated media capture flow states.

## Routing Registry
Client-side view resolution is strictly mapped using `react-router-dom`:
- `/` -> `LandingPage`
- `/login` -> `LoginPage`
- `/register` -> `RegisterPage`
- `/dashboard` -> `DashboardPage` (Main user ecosystem)
- `/add-item` -> `AddItemPage`
- `/item/:id` -> `ItemDetailsPage` (Dynamic parameter resolution)