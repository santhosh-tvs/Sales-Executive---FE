# Loading Spinner Component - Tire Animation

## Overview
A reusable loading spinner component with a rolling tire/wheel animation using the project's theme colors.

## Component Location
- **Component**: `FE/src/components/LoadingSpinner/LoadingSpinner.jsx`
- **Styles**: `FE/src/components/LoadingSpinner/LoadingSpinner.css`

## Design
- **Animation**: Rolling tire with spokes
- **Colors**: 
  - Primary Blue: #20409A (outer ring and inner tire)
  - Orange: #F36F21 (middle ring and spokes)
- **Size**: 150px (desktop), 120px (tablet), 100px (mobile)
- **Animation Speed**: 2 seconds per rotation

## Features
1. Full-screen overlay with blur effect
2. Smooth rolling animation
3. Customizable loading message
4. Responsive design
5. Theme-consistent colors
6. High z-index (9999) to appear above all content

## Usage

### Basic Usage
```javascript
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

function MyComponent() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading && <LoadingSpinner />}
      {/* Your component content */}
    </>
  );
}
```

### With Custom Message
```javascript
{loading && <LoadingSpinner message="Loading Dashboard..." />}
{loading && <LoadingSpinner message="Processing Payment..." />}
{loading && <LoadingSpinner message="Fetching Data..." />}
```

### Without Message
```javascript
{loading && <LoadingSpinner message="" />}
// or
{loading && <LoadingSpinner message={null} />}
```

## Implementation Examples

### 1. Login Page (Already Implemented)
```javascript
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

function NewLogin() {
  const [navigating, setNavigating] = useState(false);

  const handleLogin = async () => {
    // ... login logic
    if (success) {
      setNavigating(true);
      setTimeout(() => {
        navigate("/sales-home");
      }, 1000);
    }
  };

  return (
    <>
      {navigating && <LoadingSpinner message="Loading Dashboard..." />}
      {/* Login form */}
    </>
  );
}
```

### 2. Data Fetching
```javascript
function DataPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/endpoint');
      // Process data
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner message="Loading Data..." />}
      {/* Page content */}
    </>
  );
}
```

### 3. Form Submission
```javascript
function FormPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService.post('/endpoint', formData);
      // Success handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {submitting && <LoadingSpinner message="Submitting..." />}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </>
  );
}
```

### 4. Page Navigation
```javascript
function NavigationComponent() {
  const [navigating, setNavigating] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    setNavigating(true);
    setTimeout(() => {
      navigate(path);
    }, 800);
  };

  return (
    <>
      {navigating && <LoadingSpinner message="Loading..." />}
      <button onClick={() => handleNavigate('/dashboard')}>
        Go to Dashboard
      </button>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| message | string | "Loading..." | Text to display below the spinner |

## Styling Customization

### Change Animation Speed
```css
/* In LoadingSpinner.css */
@keyframes tire-roll {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tire-loader {
  animation: tire-roll 1.5s linear infinite; /* Change from 2s to 1.5s */
}
```

### Change Size
```css
.tire-loader {
  width: 200px;  /* Change from 150px */
  height: 200px; /* Change from 150px */
}
```

### Change Colors
```css
.tire-outer-ring {
  border-color: #YOUR_COLOR; /* Change from #20409A */
}

.tire-middle-ring {
  border-color: #YOUR_COLOR; /* Change from #F36F21 */
}
```

### Change Background Opacity
```css
.loading-spinner-overlay {
  background: rgba(255, 255, 255, 0.98); /* Change from 0.95 */
}
```

## Animation Details

### Tire Structure
1. **Outer Ring**: Blue (#20409A) - 18px border
2. **Middle Ring**: Orange (#F36F21) - 12px border
3. **Inner Tire**: Blue (#20409A) - Solid background
4. **Spokes**: Orange (#F36F21) - 5 spokes at 72° intervals
5. **Center Hub**: Orange (#F36F21) - White border

### Animation
- **Type**: Continuous rotation
- **Direction**: Clockwise
- **Speed**: 360° in 2 seconds
- **Easing**: Linear (constant speed)

## Best Practices

1. **Show for minimum time**: Display for at least 500ms to avoid flashing
2. **Use meaningful messages**: Provide context about what's loading
3. **Don't overuse**: Only show for operations that take >500ms
4. **Clean up**: Always set loading to false in finally block
5. **Prevent interaction**: Spinner overlay blocks all clicks automatically

## Common Use Cases

1. ✅ Login/Authentication
2. ✅ Page navigation
3. ✅ Data fetching
4. ✅ Form submission
5. ✅ File upload
6. ✅ API calls
7. ✅ Report generation
8. ✅ Export operations

## Accessibility

- High contrast colors for visibility
- Centered positioning for easy spotting
- Text message for screen readers
- Blur effect indicates loading state

## Browser Support

- Chrome: ✅
- Firefox: ✅
- Safari: ✅
- Edge: ✅
- Mobile browsers: ✅

## Performance

- Lightweight: ~2KB (CSS + JSX)
- No external dependencies
- Pure CSS animations (GPU accelerated)
- No JavaScript animation loops

## Troubleshooting

### Spinner not showing
```javascript
// Make sure state is properly set
const [loading, setLoading] = useState(false);
setLoading(true); // This should show the spinner
```

### Spinner shows but doesn't animate
```css
/* Check if animation is defined in CSS */
@keyframes tire-roll { /* ... */ }
```

### Spinner appears behind content
```css
/* Increase z-index if needed */
.loading-spinner-overlay {
  z-index: 99999; /* Increase from 9999 */
}
```

### Message not showing
```javascript
// Make sure message prop is passed
<LoadingSpinner message="Loading..." />
```

## Future Enhancements

1. Add progress percentage option
2. Add different animation styles
3. Add color theme variants
4. Add size variants (small, medium, large)
5. Add cancel button option
6. Add timeout handling
