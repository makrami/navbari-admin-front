# Segment Component Documentation

## Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Props and Types](#props-and-types)
4. [Component States](#component-states)
5. [UI Structure](#ui-structure)
6. [Interactions and Behaviors](#interactions-and-behaviors)
7. [Animations and Transitions](#animations-and-transitions)
8. [Controller Responsibilities](#controller-responsibilities)
9. [Reusability Guidelines](#reusability-guidelines)
10. [Usage Examples](#usage-examples)

---

## Overview

The **Segment Component** (`SegmentDetails`) is a comprehensive, reusable UI component designed to represent individual segments within a shipment workflow. It provides a collapsible card interface with multiple states, edit capabilities, progress tracking, and rich information display.

### Key Features

- **Expandable/Collapsible**: Toggle between collapsed and expanded states
- **Multiple Display Modes**: Read-only, editable, and locked states
- **Progress Tracking**: Visual progress indicators for segment stages
- **Form Editing**: Inline form fields for segment data modification
- **Cargo Management**: Integration with cargo declaration modal
- **Status Indicators**: Visual badges for assignment and logistics status
- **Current Segment Highlighting**: Special styling for active/current segments
- **Accessibility**: ARIA attributes and keyboard navigation support

### File Location

- **Main Component**: `src/pages/shipment/segments/components/SegmentDetails.tsx`
- **Header Component**: `src/pages/shipment/segments/components/SegmentHeader.tsx`
- **Supporting Components**: Located in `src/pages/shipment/segments/components/`

---

## Component Architecture

### Component Hierarchy

```
SegmentDetails (Main Container)
├── SegmentHeader (Clickable Header)
│   ├── ChevronDown Icon (Expand/Collapse Indicator)
│   ├── Step Number Badge
│   ├── Place → Next Place Navigation
│   ├── Distance Indicator (Current Segment Only)
│   ├── Completion Check Icon
│   ├── Cargo Declaration Button (Conditional)
│   ├── Assignee Avatar & Name
│   ├── Action Icons (Current Segment Only)
│   └── More Options Menu Icon
├── SegmentProgress (Collapsed State - Optional)
├── Status Badges (Assignment & Logistics)
├── Expandable Content Area
│   ├── Custom Children (Optional)
│   ├── SegmentProgress (Expanded State - Non-Current)
│   ├── Edit Form (Editable Mode)
│   │   ├── FieldBoxSelect (FROM)
│   │   ├── FieldBoxSelect (TO)
│   │   ├── DateTimePickerField (START)
│   │   ├── DateTimePickerField (EST. FINISH)
│   │   ├── BaseFeeField
│   │   └── SegmentActions (Reset, Save, Save & Declare)
│   ├── CargoAssignmentsList (When Cargo Companies Assigned)
│   └── SegmentInfoSummary (Read-Only Mode)
│       ├── Estimated Arrival Card
│       ├── Time Cards (Start/Finish)
│       ├── Vehicle & Company Info
│       ├── FinancialSection
│       └── DocumentsSection
├── Vertical Spine Notch (Visual Connector)
├── Current Segment Indicator (Red Dot)
└── CargoDeclarationModal (Overlay)
```

### Sub-Components

1. **SegmentHeader**: Handles header display, toggle interaction, and action buttons
2. **SegmentProgress**: Displays progress stages with icons and status
3. **SegmentInfoSummary**: Shows read-only segment information
4. **SegmentActions**: Provides form action buttons (Reset, Save, Save & Declare)
5. **FieldBoxSelect**: Custom select field with search capability
6. **DateTimePickerField**: Date/time input field
7. **BaseFeeField**: Numeric input for base fee
8. **CargoAssignmentsList**: Displays assigned cargo companies
9. **CargoDeclarationModal**: Modal for cargo company selection

---

## Props and Types

### SegmentDetails Props

```typescript
type SegmentDetailsProps = {
  className?: string; // Additional CSS classes
  data: SegmentData; // Required: Segment data object
  defaultOpen?: boolean; // Default: false - Initial expanded state
  open?: boolean; // Controlled open state
  onToggle?: () => void; // Controlled toggle handler
  children?: ReactNode; // Custom content to render in expanded area
  onSave?: (update: Partial<SegmentData>) => void; // Save callback
  editable?: boolean; // Default: false - Enable edit mode
  locked?: boolean; // Default: false - Lock segment (disabled)
  showStatuses?: boolean; // Default: true - Show status badges
};
```

### SegmentData Type

```typescript
export type SegmentData = {
  // Core Identification
  step: number; // Required: Segment step number
  place: string; // Required: Origin/current location

  // Status Flags
  isCompleted?: boolean; // Completion status
  isCurrent?: boolean; // Current/active segment indicator
  isPlaceholder?: boolean; // Placeholder segment flag

  // Progress Tracking
  progressStage?: SegmentProgressStage; // Current progress stage
  datetime?: string; // Timestamp for progress stage

  // Navigation
  nextPlace?: string; // Destination/next location
  distance?: string; // Distance to destination

  // Assignment Information
  assigneeName?: string; // Driver/assignee name
  assigneeAvatarUrl?: string; // Assignee avatar image URL

  // Timing Information
  startAt?: string; // Planned start time
  estFinishAt?: string; // Estimated finish time

  // Logistics Information
  vehicleLabel?: string; // Vehicle identifier
  localCompany?: string; // Local company name
  baseFeeUsd?: number; // Base fee in USD

  // Status Tracking
  assignmentStatus?: SegmentAssignmentStatus; // Assignment phase status
  logisticsStatus?: SegmentLogisticsStatus; // Logistics operation status
  hasDisruption?: boolean; // Disruption/error indicator

  // Documents
  documents?: Array<{
    id: string | number;
    name: string;
    sizeLabel: string;
    status: "pending" | "approved" | "rejected";
    author?: string;
    thumbnailUrl?: string;
  }>;

  // Cargo Companies
  cargoCompanies?: CargoCompany[]; // Assigned cargo companies
};
```

### SegmentProgressStage Type

```typescript
type SegmentProgressStage =
  | "start" // Initial state
  | "to_origin" // En route to origin
  | "in_origin" // At origin location
  | "loading" // Loading cargo
  | "in_customs" // Customs processing
  | "to_dest" // En route to destination
  | "delivered"; // Delivery completed
```

### Status Types

```typescript
// Assignment Status
type SegmentAssignmentStatus =
  | "UNASSIGNED"
  | "PENDING_ASSIGNMENT"
  | "ASSIGNED"
  | "READY_TO_START";

// Logistics Status
type SegmentLogisticsStatus =
  | "AT_ORIGIN"
  | "IN_TRANSIT"
  | "LOADING"
  | "DELIVERED"
  | "CANCELLED";
```

---

## Component States

### 1. Expand/Collapse State

**Controlled vs Uncontrolled:**

- **Controlled**: Provide `open` and `onToggle` props
- **Uncontrolled**: Use `defaultOpen` prop for initial state

**State Management:**

```typescript
const [internalOpen, setInternalOpen] = useState(defaultOpen);
const isControlled =
  controlledOpen !== undefined && controlledOnToggle !== undefined;
const open = isControlled ? controlledOpen : internalOpen;
```

**Visual Indicators:**

- ChevronDown icon rotates 180° when expanded
- Content area animates height transition
- Header background changes (white when open)

### 2. Edit Mode State

**Editable State (`editable={true}`):**

- Shows form fields instead of read-only summary
- Enables "Cargo Declaration" button in header
- Displays action buttons (Reset, Save, Save & Declare)
- Shows validation errors on invalid input
- Border changes to dotted blue (`border-dotted border-blue-500`)

**Read-Only State (`editable={false}`):**

- Displays `SegmentInfoSummary` component
- Shows `CargoAssignmentsList` if cargo companies assigned
- No form fields visible
- Standard border styling

### 3. Locked State

**Locked State (`locked={true}`):**

- Disables all interactions
- Reduces opacity to 60%
- Changes background to `bg-slate-50`
- Removes border (`border-transparent`)
- Prevents toggle action
- Cursor changes to `not-allowed`

**Locking Logic:**

- Typically locked when previous segments are incomplete
- Used for sequential workflow enforcement

### 4. Current Segment State

**Current Segment (`isCurrent={true}`):**

- Special header styling with green badge
- Shows "CURRENT SEGMENT" label
- Displays distance indicator with MapPinned icon
- Shows action icons (MessagesSquare, MapPin) in header
- Red dot indicator on left edge (`-left-[4px]`)
- Different progress display logic (hidden when expanded)

### 5. Completion State

**Completed (`isCompleted={true}`):**

- Green checkmark icon in header
- "Cargo Declaration" button hidden
- Edit mode disabled
- Progress stage typically "delivered"

### 6. Placeholder State

**Placeholder (`isPlaceholder={true}`):**

- Minimal rendering
- Hides `nextPlace` in header
- Used for empty/unassigned segments

### 7. Form Validation State

**Validation Errors:**

- Triggered when required fields are empty
- Fields show error styling
- `showErrors` state controls error display
- Required fields: `toValue`, `startAt`, `estFinishAt`, `baseFee`

---

## UI Structure

### Header Layout (SegmentHeader)

```
┌─────────────────────────────────────────────────────────────┐
│ [▼] #1  │  New York → Los Angeles [📍 24 KM]  │ [✓] │ [👤] │
│         │                                    │     │ Name │
│         │                                    │     │ [💬][📍]│
│         │                                    │     │ [⋮] │
└─────────────────────────────────────────────────────────────┘
```

**Left Section:**

- ChevronDown icon (expand/collapse)
- Step number badge
  - Normal: `#1` (text-slate-400)
  - Current: Green badge with "CURRENT SEGMENT" label

**Center Section:**

- Origin place (bold)
- ArrowRight icon
- Destination place (bold)
- Distance indicator (current segment only)
- Completion checkmark (if completed)

**Right Section:**

- Cargo Declaration button (conditional)
- Assignee avatar & name
- Action icons (current segment only)
  - MessagesSquare (blue background)
  - MapPin (green background)
- MoreVertical menu icon

### Content Area Layout

**Collapsed State:**

- SegmentProgress component (if `progressStage` exists)
- Status badges (if `showStatuses={true}`)

**Expanded State - Edit Mode:**

```
┌─────────────────────────────────────┐
│ FROM          │ TO                 │
│ [Select...]   │ [Select...]        │
├─────────────────────────────────────┤
│ START         │ EST. FINISH        │
│ [Date/Time]   │ [Date/Time]        │
├─────────────────────────────────────┤
│ BASE FEE                            │
│ [$ Amount]                          │
├─────────────────────────────────────┤
│           [Reset] [Save] [Save & Declare] │
└─────────────────────────────────────┘
```

**Expanded State - Read-Only Mode:**

- SegmentInfoSummary component
- Or CargoAssignmentsList (if cargo companies assigned)

### Border Colors

Border color determined by `getBorderColor()`:

- **Locked**: `border-transparent`
- **Editable**: `border-dotted border-blue-500`
- **In Origin**: `border-yellow-600`
- **Delivered**: `border-green-600`
- **Default**: `border-slate-200`

### Visual Indicators

**Vertical Spine Notch:**

- Absolute positioned on left edge
- `left-[26px]`, full height
- `bg-slate-200`, rounded-full
- Width: `12px`
- Z-index: `-z-10`

**Current Segment Red Dot:**

- Absolute positioned: `-left-[4px] -top-1`
- Size: `10px`
- `bg-red-500`, `border-2 border-white`
- Only visible when `isCurrent={true}`

---

## Interactions and Behaviors

### 1. Toggle Expand/Collapse

**Trigger:**

- Click on header (when not locked)
- Programmatic via `onToggle` callback

**Behavior:**

- Smooth height transition (300ms ease-in-out)
- Chevron icon rotates
- Header background changes
- Content visibility toggles

**Accessibility:**

- `role="button"` on header (when not locked)
- `aria-controls` links to content area
- `aria-disabled` when locked
- `aria-hidden` on content when collapsed

### 2. Form Editing

**Field Interactions:**

- **FieldBoxSelect**: Click to open dropdown, search functionality
- **DateTimePickerField**: Date/time picker interaction
- **BaseFeeField**: Numeric input with validation

**Form Actions:**

- **Reset**: Clears all fields, hides errors
- **Save**: Validates fields, calls `onSave` with updates, closes segment
- **Save & Declare**: Validates, opens cargo modal, saves on selection

**Validation:**

- All fields required (non-empty after trim)
- Error state shown on invalid submission
- Fields highlight errors individually

### 3. Cargo Declaration

**Trigger:**

- "Cargo Declaration" button in header (when collapsed, editable, has nextPlace, not completed)
- "Save & Declare" button in form

**Flow:**

1. Click button → Opens `CargoDeclarationModal`
2. Select cargo companies → Modal closes
3. `onSave` called with cargo companies
4. Segment closes automatically
5. After 10 seconds (if driver assigned): Updates assignee info, marks completed

**Button Visibility:**

```typescript
showCargoButton =
  !open && editable && Boolean(data.nextPlace) && !data.isCompleted;
```

### 4. Status Badge Display

**Conditions:**

- Only shown when `showStatuses={true}`
- Displayed when `assignmentStatus` or `logisticsStatus` exists
- Shown below header, above content area

**Styling:**

- Assignment: `bg-slate-100 text-slate-700`
- Logistics: `bg-emerald-100 text-emerald-700`
- Small text: `text-[11px]`

### 5. Progress Display Logic

**Collapsed State:**

- Shows `SegmentProgress` if `progressStage` exists and segment is closed

**Expanded State:**

- Shows custom `children` if provided
- Otherwise shows `SegmentProgress` if:
  - Not current segment (`!data.isCurrent`)
  - Has `progressStage`
  - Not locked

**Current Segment:**

- Progress hidden when expanded (replaced by form or summary)

### 6. Locked Segment Behavior

**Prevented Actions:**

- Cannot toggle expand/collapse
- Cannot edit
- Cannot interact with buttons
- Visual feedback: reduced opacity, disabled cursor

**Use Cases:**

- Sequential workflow enforcement
- Previous segments incomplete
- Read-only data sources

---

## Animations and Transitions

### 1. Expand/Collapse Animation

**Implementation:**

```css
transition-[grid-template-rows] duration-300 ease-in-out
grid-rows-[1fr]  /* Expanded */
grid-rows-[0fr]  /* Collapsed */
```

**Duration:** 300ms
**Easing:** ease-in-out
**Property:** grid-template-rows (height animation)

### 2. Chevron Rotation

**Implementation:**

```css
transition-transform
rotate-180  /* Expanded */
rotate-0    /* Collapsed */
```

**Duration:** Inherited from transition
**Easing:** Default

### 3. Hover States

**Buttons:**

- Cargo Declaration: `hover:bg-blue-200` (implied)
- Action buttons: `hover:bg-blue-700`, `hover:bg-slate-50`
- Chat button: `hover:bg-blue-300`

**Transitions:**

- Color transitions: `transition-colors`
- Transform transitions: `transition-transform`

### 4. Visual State Changes

**Header Background:**

- Open: `bg-white`
- Closed + Editable: `bg-blue-100 rounded-xl`
- Locked: `bg-slate-50 rounded-xl opacity-60`

**Border:**

- Dynamic border color changes based on status
- No transition (instant)

---

## Controller Responsibilities

### Parent Component Responsibilities

1. **State Management:**

   - Manage segment data state
   - Handle save operations
   - Control open/closed state (if controlled)
   - Track edited segments

2. **Data Transformation:**

   - Convert domain data to `SegmentData` format
   - Calculate `isCurrent` based on index
   - Determine `locked` state based on workflow
   - Compute `progressStage` from shipment state

3. **Business Logic:**

   - Validate segment sequence
   - Handle cargo company assignment
   - Update assignee information
   - Mark segments as completed
   - Handle new shipment creation

4. **Event Handling:**
   - Process `onSave` updates
   - Handle segment selection
   - Manage multiple segment states
   - Coordinate with shipment-level actions

### SegmentDetails Internal Responsibilities

1. **Form State:**

   - Manage form field values
   - Handle validation
   - Track error states
   - Reset form on demand

2. **UI State:**

   - Manage expand/collapse (if uncontrolled)
   - Control cargo modal visibility
   - Track pending updates

3. **Data Presentation:**
   - Format dates/times
   - Display status badges
   - Show progress indicators
   - Render appropriate content based on mode

### Example Controller Pattern

```typescript
// Parent component managing segments
function ShipmentContainer({ shipment }) {
  const [segments, setSegments] = useState(shipment.segments);
  const [openSegmentId, setOpenSegmentId] = useState<string | null>(null);

  const handleSegmentSave = (
    segmentId: string,
    update: Partial<SegmentData>
  ) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === segmentId ? { ...s, ...update } : s))
    );
    // Additional business logic...
  };

  const handleToggle = (segmentId: string) => {
    setOpenSegmentId((prev) => (prev === segmentId ? null : segmentId));
  };

  return segments.map((segment) => (
    <SegmentDetails
      key={segment.id}
      data={convertToSegmentData(segment)}
      open={openSegmentId === segment.id}
      onToggle={() => handleToggle(segment.id)}
      onSave={(update) => handleSegmentSave(segment.id, update)}
      editable={!isReadOnly && !segment.isCompleted}
      locked={isLocked(segment)}
    />
  ));
}
```

---

## Reusability Guidelines

### 1. Data Format Requirements

**Required Fields:**

- `step`: Number (required)
- `place`: String (required)

**Optional but Recommended:**

- `nextPlace`: For navigation display
- `isCurrent`: For current segment styling
- `progressStage`: For progress display
- `assigneeName` & `assigneeAvatarUrl`: For assignee display

### 2. State Management Patterns

**Controlled vs Uncontrolled:**

- Use **controlled** when managing multiple segments
- Use **uncontrolled** for standalone segments
- Don't mix both patterns

**Best Practice:**

```typescript
// Controlled (recommended for lists)
<SegmentDetails
  open={isOpen}
  onToggle={handleToggle}
  data={segmentData}
/>

// Uncontrolled (standalone)
<SegmentDetails
  defaultOpen={false}
  data={segmentData}
/>
```

### 3. Edit Mode Configuration

**When to Enable Edit Mode:**

- User has permission to edit
- Segment is not completed
- Segment is not locked
- No cargo companies assigned (or allow reassignment)

**Example:**

```typescript
editable={
  hasEditPermission &&
  !segment.isCompleted &&
  !segment.isLocked &&
  !segment.cargoCompanies?.length
}
```

### 4. Locking Logic

**Common Locking Scenarios:**

- Previous segments incomplete
- Sequential workflow requirement
- Read-only data source
- User lacks permissions

**Example:**

```typescript
locked={
  !hasPermission ||
  isReadOnlySource ||
  (isSequential && !allPreviousCompleted)
}
```

### 5. Custom Content Injection

**Using `children` Prop:**

- Overrides default content rendering
- Useful for custom layouts
- Maintains expand/collapse behavior

**Example:**

```typescript
<SegmentDetails data={data}>
  <CustomSegmentContent />
</SegmentDetails>
```

### 6. Styling Customization

**Using `className` Prop:**

- Applied to root container
- Use for spacing, positioning
- Don't override critical layout classes

**Example:**

```typescript
<SegmentDetails data={data} className="mb-4 shadow-lg" />
```

### 7. Status Badge Configuration

**Show Statuses:**

- Set `showStatuses={false}` to hide badges
- Useful for simplified views
- Default: `true`

### 8. Progress Stage Mapping

**Mapping Domain Data:**

- Convert domain status to `SegmentProgressStage`
- Handle undefined/null cases
- Provide fallback for unknown stages

**Example Helper:**

```typescript
function getProgressStage(status: string): SegmentProgressStage {
  const mapping = {
    at_origin: "in_origin",
    loading: "loading",
    in_transit: "to_dest",
    delivered: "delivered",
  };
  return mapping[status] || "start";
}
```

### 9. Cargo Company Integration

**Cargo Declaration Flow:**

1. User clicks "Cargo Declaration" or "Save & Declare"
2. Modal opens with company selection
3. `onSave` called with selected companies
4. Component updates to show `CargoAssignmentsList`
5. Optional: Auto-assign driver after delay

**Data Structure:**

```typescript
cargoCompanies: [{
  id: string;
  name: string;
  logoUrl: string;
  admin?: string;
  drivers?: Array<{
    name: string;
    avatarUrl: string;
  }>;
}]
```

### 10. Document Handling

**Document Structure:**

- Array of document objects
- Each document has: `id`, `name`, `sizeLabel`, `status`
- Optional: `author`, `thumbnailUrl`

**Status Values:**

- `"pending"`: Awaiting review
- `"approved"`: Accepted
- `"rejected"`: Declined

---

## Usage Examples

### Example 1: Basic Read-Only Segment

```typescript
import SegmentDetails from "./segments/components/SegmentDetails";

const segmentData = {
  step: 1,
  place: "New York",
  nextPlace: "Los Angeles",
  isCompleted: false,
  isCurrent: true,
  progressStage: "in_transit",
  assigneeName: "John Doe",
  assigneeAvatarUrl: "/avatars/john.jpg",
  distance: "2,500 KM",
  startAt: "2024-01-15 08:00",
  estFinishAt: "2024-01-16 18:00",
  vehicleLabel: "Truck HD320",
  localCompany: "Sendm Co.",
};

<SegmentDetails
  data={segmentData}
  defaultOpen={false}
  editable={false}
  locked={false}
/>;
```

### Example 2: Editable Segment with Save Handler

```typescript
const handleSave = (update: Partial<SegmentData>) => {
  console.log("Segment updated:", update);
  // Update state, call API, etc.
  updateSegment(segmentId, update);
};

<SegmentDetails
  data={segmentData}
  editable={true}
  onSave={handleSave}
  defaultOpen={true}
/>;
```

### Example 3: Controlled Segment in List

```typescript
const [openSegmentId, setOpenSegmentId] = useState<string | null>(null);

{
  segments.map((segment) => (
    <SegmentDetails
      key={segment.id}
      data={convertToSegmentData(segment)}
      open={openSegmentId === segment.id}
      onToggle={() =>
        setOpenSegmentId((prev) => (prev === segment.id ? null : segment.id))
      }
      editable={canEdit(segment)}
      locked={isLocked(segment)}
      onSave={(update) => handleSegmentSave(segment.id, update)}
    />
  ));
}
```

### Example 4: Locked Sequential Segment

```typescript
const isLocked = (segment, allSegments) => {
  const index = allSegments.findIndex((s) => s.id === segment.id);
  if (index === 0) return false;

  // Lock if previous segment not completed
  const previous = allSegments[index - 1];
  return !previous.isCompleted;
};

<SegmentDetails
  data={segmentData}
  editable={true}
  locked={isLocked(segmentData, allSegments)}
  onSave={handleSave}
/>;
```

### Example 5: Custom Content Segment

```typescript
<SegmentDetails data={segmentData} defaultOpen={true}>
  <div className="custom-content">
    <h3>Custom Segment View</h3>
    <p>This replaces the default content</p>
  </div>
</SegmentDetails>
```

### Example 6: Segment with Status Badges

```typescript
const segmentData = {
  // ... other fields
  assignmentStatus: "ASSIGNED",
  logisticsStatus: "IN_TRANSIT",
};

<SegmentDetails data={segmentData} showStatuses={true} />;
```

### Example 7: Completed Segment

```typescript
const completedSegment = {
  step: 3,
  place: "Los Angeles",
  isCompleted: true,
  progressStage: "delivered",
  // ... other fields
};

<SegmentDetails
  data={completedSegment}
  editable={false} // Edit disabled for completed segments
/>;
```

### Example 8: Placeholder Segment

```typescript
const placeholderSegment = {
  step: 2,
  place: "Chicago",
  isPlaceholder: true,
  editable: true,
};

<SegmentDetails
  data={placeholderSegment}
  editable={true}
  onSave={handleSave}
/>;
```

---

## Best Practices

### 1. Performance

- Use `React.memo` for SegmentDetails if rendering many segments
- Memoize data transformation functions
- Avoid inline object creation in render

### 2. Accessibility

- Always provide meaningful `headerId`
- Ensure keyboard navigation works
- Use proper ARIA attributes
- Test with screen readers

### 3. Error Handling

- Validate data before passing to component
- Handle missing required fields gracefully
- Provide fallback values for optional fields

### 4. Testing

- Test all interaction states
- Verify form validation
- Test controlled vs uncontrolled modes
- Verify accessibility compliance

### 5. Maintenance

- Keep SegmentData type in sync with usage
- Document custom implementations
- Update this documentation when adding features
- Follow existing patterns for consistency

---

## Related Components

- **SegmentProgress**: Progress stage visualization
- **SegmentInfoSummary**: Read-only information display
- **CargoDeclarationModal**: Cargo company selection
- **FieldBoxSelect**: Custom select field
- **DateTimePickerField**: Date/time input
- **BaseFeeField**: Numeric fee input

---

## Version History

- **v1.0** (Current): Initial comprehensive implementation
  - Expand/collapse functionality
  - Edit mode with form fields
  - Progress tracking
  - Cargo declaration integration
  - Current segment highlighting
  - Status badges
  - Document display

---

## Support and Questions

For questions or issues related to the Segment component:

1. Review this documentation
2. Check component source code
3. Review usage examples in `src/pages/shipment/`
4. Consult with the development team

---

**Last Updated:** 2024
**Component Version:** 1.0
**Maintainer:** Development Team
