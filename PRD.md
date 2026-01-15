# Planning Guide

A professional task management system with user authentication, role-based access, and enterprise-grade architecture following clean separation of concerns and service-layer patterns.

**Experience Qualities**: 
1. **Professional** - Enterprise-grade interface that feels polished and trustworthy for business use
2. **Efficient** - Fast, responsive interactions with immediate feedback and minimal friction
3. **Structured** - Clear organization and hierarchy that scales from personal to team workflows

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a full-featured task management system with authentication, role-based permissions, multiple views (board, list, calendar), real-time updates, and a clean service-layer architecture that demonstrates enterprise patterns including domain logic separation, repository patterns, and background processing simulation.

## Essential Features

### User Authentication & Authorization
- **Functionality**: User login with GitHub OAuth, session management, role-based access control
- **Purpose**: Secure access and personalized experience with owner/admin capabilities
- **Trigger**: Landing on app without authentication, or clicking profile/logout
- **Progression**: Unauthenticated state → Login prompt → GitHub OAuth flow → Authenticated dashboard → Profile menu for logout
- **Success criteria**: Users can authenticate, see personalized content, and admins see additional controls

### Task Management (CRUD)
- **Functionality**: Create, read, update, delete tasks with rich metadata (title, description, status, priority, assignee, due date)
- **Purpose**: Core workflow for managing work items with full lifecycle
- **Trigger**: Click "New Task" button or edit existing task
- **Progression**: Task list view → Click new/edit → Modal form → Fill details → Save → Optimistic UI update → Server sync → Success toast
- **Success criteria**: Tasks persist, update immediately, sync reliably, and show validation errors

### Multi-View Layouts
- **Functionality**: Switch between Kanban board, list view, and calendar view of same data
- **Purpose**: Different perspectives for different workflows (planning vs execution vs scheduling)
- **Trigger**: Click view toggle buttons in header
- **Progression**: Current view → Click alternate view → Smooth transition → Data re-rendered in new layout → View preference saved
- **Success criteria**: All views show same data, transitions are smooth, preference persists

### Task Filtering & Search
- **Functionality**: Filter by status, priority, assignee, search by text
- **Purpose**: Focus on relevant subset of tasks in large projects
- **Trigger**: Type in search box or select filter options
- **Progression**: Full task list → Enter filter criteria → Instant results update → Clear filters to reset
- **Success criteria**: Filters combine logically, search is instant, results are accurate

### Background Processing Simulation
- **Functionality**: Simulated async operations (notifications, email, exports) with progress tracking
- **Purpose**: Demonstrate service-layer patterns for background jobs
- **Trigger**: Actions that trigger background work (bulk operations, exports)
- **Progression**: Trigger action → Job queued toast → Background processing → Completion notification
- **Success criteria**: Jobs queue properly, progress is visible, completion is confirmed

## Edge Case Handling
- **Empty States**: Friendly illustrations and CTAs when no tasks exist in current filter/view
- **Loading States**: Skeleton screens during data fetch, spinners for mutations
- **Error Recovery**: Toast notifications with retry options, offline detection with queue
- **Validation**: Inline field validation, required field enforcement, date logic checks
- **Concurrent Edits**: Optimistic updates with rollback on conflict, last-write-wins strategy
- **Large Datasets**: Virtual scrolling for 1000+ tasks, pagination for list view
- **Permission Denied**: Graceful degradation for non-owner features, read-only mode

## Design Direction
The design should evoke **enterprise productivity software** - trustworthy, professional, and efficient. Think Linear, Notion, or Height - modern SaaS tools that balance beautiful design with serious functionality. The interface should feel substantial and purposeful, with strong information hierarchy and confident use of space.

## Color Selection
A sophisticated productivity theme with deep purples and crisp contrasts.

- **Primary Color**: Deep Purple `oklch(0.45 0.15 285)` - Conveys focus, creativity, and premium quality. Used for primary actions and key interactive elements.
- **Secondary Colors**: 
  - Slate backgrounds `oklch(0.98 0.005 270)` for cards and surfaces
  - Deep charcoal `oklch(0.25 0.01 270)` for headers and emphasis
  - Soft lavender `oklch(0.92 0.04 285)` for subtle highlights
- **Accent Color**: Vibrant Magenta `oklch(0.60 0.20 330)` - High energy for CTAs, notifications, and success states
- **Foreground/Background Pairings**: 
  - Background (Off-white #FAFBFC `oklch(0.98 0.005 270)`): Deep Purple text (#5C3D91 `oklch(0.45 0.15 285)`) - Ratio 7.2:1 ✓
  - Primary (Deep Purple #5C3D91): White text (#FFFFFF `oklch(1 0 0)`) - Ratio 6.8:1 ✓
  - Accent (Vibrant Magenta #D946A8): White text (#FFFFFF) - Ratio 4.9:1 ✓
  - Card (Slate #F8F9FB): Dark Charcoal text (#3D3D47 `oklch(0.25 0.01 270)`) - Ratio 12.1:1 ✓

## Font Selection
Typography should convey precision and modernity with excellent readability for long working sessions.

- **Primary**: Space Grotesk - A geometric sans-serif with technical precision and contemporary character, perfect for headers and navigation
- **Secondary**: Inter - The gold standard for UI text, exceptional legibility and extensive weights for hierarchy

- **Typographic Hierarchy**: 
  - H1 (Page Title): Space Grotesk Bold/32px/tight (-0.02em)
  - H2 (Section Headers): Space Grotesk SemiBold/24px/tight
  - H3 (Card Headers): Space Grotesk Medium/18px/normal
  - Body (Task descriptions): Inter Regular/15px/relaxed (1.6)
  - Small (Metadata): Inter Regular/13px/normal with medium gray
  - Labels: Inter Medium/14px/tight with 500 weight

## Animations
Animations reinforce the sense of a responsive, intelligent system. Use purposeful micro-interactions that provide immediate feedback without slowing the user down. Task cards should have subtle lift on hover (2px translate with soft shadow). View transitions should use smooth 300ms crossfades. Modal dialogs slide in from the bottom with a gentle spring (tension: 300, friction: 30). Status changes animate with a quick 150ms scale pulse. Drag-and-drop should provide satisfying physics-based momentum.

## Component Selection
- **Components**: 
  - Dialog for task creation/editing forms
  - Card for task items in all views
  - Tabs for view switching (Board/List/Calendar)
  - Select for filters (status, priority, assignee)
  - Input for search and form fields
  - Button for actions (variants: default for primary, outline for secondary, ghost for tertiary)
  - Badge for status/priority pills with custom color mapping
  - Calendar for date picker in forms and calendar view
  - Avatar for user assignees
  - Dropdown Menu for task actions menu
  - Popover for quick filters
  - Toast (Sonner) for all notifications and confirmations
  - Skeleton for loading states
  
- **Customizations**: 
  - Custom Kanban board component with drag-and-drop using framer-motion
  - Custom calendar view grid with date-fns for date math
  - Custom service layer components (TaskService, AuthService) for clean architecture
  - Custom domain models (/src/domain) for business logic separation
  
- **States**: 
  - Buttons: Bold hover states with 2px lift, active state with slight scale (0.98), disabled with 40% opacity
  - Inputs: Subtle border glow on focus (primary color at 30% opacity), error state with red border and shake animation
  - Cards: Elevated shadow on hover, pressed state during drag, selected state with primary border
  - Badges: Solid backgrounds with high contrast, no hover state (non-interactive)
  
- **Icon Selection**: 
  - Plus (add task)
  - Kanban (board view)
  - List (list view)
  - Calendar (calendar view)
  - MagnifyingGlass (search)
  - Funnel (filters)
  - User (assignee)
  - Check (complete task)
  - Trash (delete)
  - DotsThree (more options)
  - SignOut (logout)
  
- **Spacing**: 
  - Section gaps: `gap-8` (2rem)
  - Card padding: `p-6` (1.5rem)
  - Button padding: `px-4 py-2` (1rem horizontal, 0.5rem vertical)
  - Form field gaps: `gap-4` (1rem)
  - Tight inline elements: `gap-2` (0.5rem)
  - Page margins: `p-6` mobile, `p-8` desktop
  
- **Mobile**: 
  - Stack filters vertically below search
  - Single column for all views (Kanban becomes vertical swimlanes)
  - Bottom sheet for task forms instead of centered dialog
  - Fixed bottom action bar for "New Task"
  - Simplified header with hamburger menu for view switching
  - Touch-optimized drag handles (larger hit areas)
  - List view becomes default on mobile (most practical)
