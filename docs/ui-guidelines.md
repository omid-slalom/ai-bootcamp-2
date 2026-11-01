# UI Guidelines - ToDo App

This document outlines the visual and interaction design standards for the ToDo application.

## Design Principles

### Rounded and Soft Edges
- All UI components should feature rounded corners to create a friendly, approachable interface
- Use a minimum border radius of 8px for standard components
- Larger components (modals, cards) can use 12-16px border radius for consistency
- Avoid sharp, angular designs throughout the interface

### Dark Green Color Palette
- Primary color: Dark green (#2D5016 or similar)
- Secondary color: Medium green (#4A7C2E or similar)
- Accent color: Light green (#A8D5BA or similar)
- Neutral backgrounds: Off-white or very light gray (#F5F5F5 or similar)
- Text: Dark gray or near-black (#333333 or similar)
- Apply the dark green palette consistently across buttons, headers, links, and active states

### Soft Animation Transitions
- All interactive actions should use smooth transitions and animations
- Standard transition duration: 200-300ms for state changes
- Use easing functions that feel natural (ease-in-out, cubic-bezier)
- Animations should provide visual feedback for:
  - Button clicks and hover states
  - Form submissions
  - Page/view transitions
  - Component appearances and disappearances
  - Loading states
- Avoid jarring or instantaneous changes; prioritize user comfort and visual continuity

## Component Guidelines

### Buttons
- Rounded corners with 8-12px border radius
- Use dark green for primary actions
- Apply smooth 200-300ms transitions on hover and active states
- Include subtle color shifts and shadows for depth

### Cards and Containers
- 12-16px border radius for prominent visual separation
- Soft shadows for depth without harsh edges
- Smooth transitions when hovering or interacting

### Forms and Inputs
- 8px border radius on input fields
- Smooth focus states with animated color transitions
- Clear, soft visual feedback for validation states

### Animations
- Page load animations: 300-500ms fade-in or slide effects
- Hover effects: 200-300ms smooth color or scale transitions
- Loading spinners: Smooth, continuous rotation without abrupt starts/stops
- Toast notifications: Slide in/out over 300ms with fade transitions

## Implementation Notes

These guidelines should be applied consistently across all UI components to maintain a cohesive, modern, and user-friendly interface.
