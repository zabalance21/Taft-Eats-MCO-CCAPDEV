# Taft Eats - CSS Design System Guide

## Quick Start

The Taft Eats CSS has been completely refactored with a modern design system. All spacing, colors, and typography now use CSS custom properties (variables), making it easy to maintain and extend.

---

## 🎨 Using CSS Variables

### Colors
```css
/* Primary colors */
background-color: var(--color-primary);           /* #F5A623 */
color: var(--color-primary-light);                /* #F7CA64 */
border: 1px solid var(--color-primary-dark);      /* #D87F00 */

/* Neutral grays (50-200 for light, 500+ for dark) */
background-color: var(--color-neutral-100);       /* #F5F5F5 */
color: var(--color-neutral-700);                  /* #333333 */

/* Semantic colors */
background-color: var(--color-success);           /* #4CAF50 */
color: var(--color-danger);                       /* #F44336 */
```

### Spacing
```css
/* Use semantic spacing scale */
padding: var(--space-sm);                         /* 16px */
margin: var(--space-md);                          /* 24px */
gap: var(--space-lg);                             /* 32px */

/* Options: xs, sm, md, lg, xl, xxl */
```

### Typography
```css
/* Use predefined sizes */
font-size: var(--font-size-base);                 /* 16px */
line-height: var(--line-height-normal);           /* 1.5 */

/* Available sizes: sm, base, lg, xl, 2xl, 3xl */
/* Available line heights: tight, normal, loose */
```

### Shadows
```css
/* Elevation system */
box-shadow: var(--shadow-sm);                     /* Subtle */
box-shadow: var(--shadow-md);                     /* Default cardss */
box-shadow: var(--shadow-lg);                     /* Hover state */
box-shadow: var(--shadow-xl);                     /* Expanded modals */
```

### Border Radius
```css
/* Consistent corner rounding */
border-radius: var(--radius-md);                  /* 8px */
border-radius: var(--radius-lg);                  /* 12px */
border-radius: var(--radius-xl);                  /* 16px */
border-radius: var(--radius-full);                /* 50% - circles */
```

### Transitions
```css
/* Smooth animations */
transition: all var(--transition-base);           /* 0.2s (default) */
transition: color var(--transition-fast);         /* 0.15s (fast) */
transition: transform var(--transition-slow);     /* 0.3s (slow) */
```

---

## 📝 Typography Classes & Styles

### Heading Hierarchy
```
h1 → 2.5rem (40px)  - Main page title
h2 → 2rem (32px)    - Section header
h3 → 1.5rem (24px)  - Card title / subsection
h4 → 1.125rem (18px) - Smaller heading
h5 → 1rem (16px)    - Label / emphasis
p  → 1rem (16px)    - Body text (regular weight)
```

### Usage Example
```html
<h1>Taft Eats</h1>                          <!-- 40px bold -->
<h2>Browse Restaurants</h2>                 <!-- 32px bold -->
<h3 class="rest_nam">Restaurant Name</h3>  <!-- 24px -->
<p>Description text appears here</p>        <!-- 16px regular -->
```

---

## 🃏 Cards

All cards now use the modern design:
- White background
- Subtle shadow (var(--shadow-md))
- Rounded corners (var(--radius-xl))
- Smooth hover effects
- Responsive max-widths

### Example Structure
```html
<div class="review">
  <img class="rev_pic" src="..." />
  <h3 class="rest_nam">Restaurant</h3>
  <p class="rest_desc">Description...</p>
  <div class="review .stars">...</div>
</div>
```

### Hover Effect (Built-in)
```css
/* Automatically applied to all cards */
.review:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
```

---

## 🔘 Buttons

All buttons follow a consistent pattern:

### Button States
```css
/* Default */
button {
  background-color: var(--color-neutral-700);
  color: white;
  padding: var(--space-sm) var(--space-md);
}

/* Hover */
button:hover {
  background-color: var(--color-neutral-600);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Active */
button:active {
  transform: scale(0.98);
}

/* Disabled */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Special Button Variants
```css
/* Vote buttons */
.vote-btn.helpful-btn         /* Green for helpful */
.vote-btn.unhelpful-btn       /* Red for unhelpful */

/* Restaurant votes */
.rest-like-btn.active         /* Green when liked */
.rest-dislike-btn.active      /* Red when disliked */

/* Create/respond buttons */
#create-review-btn            /* Primary action button */
.respond-btn                  /* Secondary action */
```

---

## 📋 Forms & Inputs

### Input Styling
```css
input, textarea {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  transition: border-color var(--transition-base);
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1);
}
```

### Form Groups
```html
<div class="form-group">
  <label>Field Label</label>
  <input type="text" />
</div>
```

---

## 🧭 Navigation

The navigation bar is sticky and uses consistent styling:

```css
.Top_navigation, nav {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  border-bottom: 1px solid var(--color-neutral-300);
  padding: var(--space-sm) var(--space-lg);
  position: sticky;
  top: 0;
  z-index: 1000;
}
```

### Search Bars
```html
<input class="search_bar" type="text" placeholder="Search..." />
```
- Responsive (full-width on mobile)
- Min-width: 200px
- Proper focus feedback

---

## 📱 Responsive Breakpoints

### Tablet Breakpoint (max-width: 1024px)
```css
@media (max-width: 1024px) {
  /* 2-column layouts → 1 column */
  /* Large fixed widths → flexible */
  /* Hero sections become narrower */
}
```

### Mobile Breakpoint (max-width: 768px)
```css
@media (max-width: 768px) {
  /* Full-width search bars */
  /* Stacked navigation */
  /* Adjusted font sizes */
  /* Single column layouts */
}
```

### Small Mobile (max-width: 480px)
```css
@media (max-width: 480px) {
  /* Minimal padding */
  /* All full-width */
  /* Further reduced fonts */
  /* Touch-friendly spacing */
}
```

---

## 🎯 Best Practices

### 1. **Use Variables, Not Hardcoded Values**
```css
/* ❌ Don't do this */
padding: 25px;
color: #666666;

/* ✅ Do this */
padding: var(--space-md);
color: var(--color-neutral-600);
```

### 2. **Maintain Spacing Consistency**
```css
/* ✅ Use spacing scale */
gap: var(--space-lg);
margin: var(--space-md);
padding: var(--space-sm);

/* Mix from {xs, sm, md, lg, xl, xxl} */
```

### 3. **Responsive First**
```css
/* ✅ Start mobile, expand for larger screens */
.card {
  width: 100%;
  max-width: 300px;
}

@media (min-width: 1024px) {
  .card {
    /* Larger version if needed */
  }
}
```

### 4. **Use Semantic HTML**
```html
<!-- ✅ Proper semantic structure -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

<!-- Classes handle styling, HTML provides meaning -->
```

### 5. **Accessible Colors**
```css
/* ✅ Always ensure contrast */
color: var(--color-neutral-700);              /* Dark on light */
background-color: white;

/* Avoid low contrast pairs */
```

---

## 🔧 Adding New Styles

### When Adding New Components
1. **Check if a variable exists** for color/spacing
2. **Use flexbox/grid** for layouts (not floats)
3. **Apply shadows** for depth (var(--shadow-md))
4. **Add transitions** for hover states (var(--transition-base))
5. **Include responsive styles** with media queries
6. **Test on mobile** before finalizing

### Example New Card Component
```css
.new-card {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.new-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .new-card {
    padding: var(--space-sm);
  }
}
```

---

## 🐛 Debugging Tips

### Issue: Text too small on mobile
**Solution:** Check media query at 768px, ensure responsive font sizing

### Issue: Cards overflow on mobile
**Solution:** Use `max-width` instead of fixed `width`

### Issue: Colors don't match brand
**Solution:** Use primary color variables instead of hardcoded hex

### Issue: Spacing looks inconsistent
**Solution:** Replace all margin/padding with spacing variable equivalents

### Issue: Button hover doesn't work
**Solution:** Ensure button has transition defined, check active state

---

## 📞 Support Reference

### Color Palette Variables
- `--color-primary` (Primary brand color)
- `--color-neutral-*` (Grays from 50-700)
- `--color-success`, `--color-danger`, `--color-info`

### Spacing Variables
- `--space-xs` through `--space-xxl`

### Typography Variables
- `--font-family`, `--font-size-*`, `--line-height-*`

### Visual Effects
- `--radius-*` (Border radius)
- `--shadow-*` (Drop shadows)
- `--transition-*` (Animation timing)

---

**Remember:** The refactored CSS is designed to be maintainable, scalable, and follow modern web design principles. When in doubt, check the CSS variable at the top of the file or follow the established patterns in the codebase.
