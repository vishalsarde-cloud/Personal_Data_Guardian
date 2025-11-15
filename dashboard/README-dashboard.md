# Personal Data Guardian Dashboard

React dashboard for viewing privacy decisions logged by the Personal Data Guardian system.

## Features

- **Real-time Updates**: Auto-refreshes every 30 seconds
- **Decision Statistics**: Shows approval/rejection counts and user metrics
- **Sortable Table**: Click column headers to sort by any field
- **Filter Options**: Filter by approval status
- **Blockchain Status**: Shows whether blockchain logging is enabled
- **Responsive Design**: Works on desktop, tablet, and mobile

## Setup Instructions

### 1. Install Dependencies
```bash
cd dashboard
npm install
```

### 2. Start Development Server
```bash
npm start
```

The dashboard will open at `http://localhost:3000`

### 3. Verify Backend Connection
Make sure the Flask backend is running on `http://localhost:5000` before starting the dashboard.

## Dashboard Components

### Header
- Project title and description
- Key statistics (total decisions, approvals, rejections, unique users)

### Controls
- Manual refresh button
- Last update timestamp
- Blockchain connection status indicator

### Log Table
- Sortable columns for all data fields
- Filtered view options
- Hash truncation for readability
- Timestamp formatting
- Transaction hash links (when blockchain is enabled)

### Empty State
- Helpful instructions when no data is available
- Testing guidance for new users

## API Integration

The dashboard connects to these backend endpoints:
- `GET /logs` - Retrieve all privacy decisions
- `GET /stats` - Get decision statistics
- `GET /health` - Check backend health

## Building for Production

```bash
npm run build
```

This creates a `build/` folder with optimized static files ready for deployment.

## Troubleshooting

- **Backend Connection Error**: Ensure Flask server is running on port 5000
- **CORS Issues**: Backend has CORS enabled for dashboard requests
- **Data Not Loading**: Check browser console for API errors
- **Styling Issues**: Clear browser cache and refresh

## Development

To modify the dashboard:
1. Edit components in `src/components/`
2. Update styles in corresponding `.css` files
3. Add new features to `src/App.js`
4. Test with `npm start`

The dashboard uses React hooks for state management and CSS for styling (no external UI libraries to keep it lightweight).