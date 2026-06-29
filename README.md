# Angular Banking App

A modern, mobile-first banking application built with Angular 19. Originally a React application, this has been refactored to use Angular with standalone components, Angular Router, and reactive forms.

**Key Features**

- **Responsive Design**: A mobile-first approach ensures a seamless user experience across all devices.
- **Modern UI**: A clean, intuitive interface with glassmorphism styling that makes banking easy and enjoyable.
- **Standalone Components**: Uses Angular 19 standalone components for a modular architecture.
- **Angular Router**: Client-side routing for all pages (Signin, Home, Cards, Send Money, Savings, Profile, Add Money, Transactions).
- **Error Tracking**: Integrated Sentry for error monitoring, performance tracing, and session replay.

## Screenshots

![Signin](https://raw.githubusercontent.com/cenksari/react-banking-app-template/master/screenshots/signin.png)

![Home](https://raw.githubusercontent.com/cenksari/react-banking-app-template/master/screenshots/home.png)

![Transactions](https://raw.githubusercontent.com/cenksari/react-banking-app-template/master/screenshots/transactions.png)

![Cards](https://raw.githubusercontent.com/cenksari/react-banking-app-template/master/screenshots/cards.png)

![Add](https://raw.githubusercontent.com/cenksari/react-banking-app-template/master/screenshots/addmoney.png)

![Profile](https://raw.githubusercontent.com/cenksari/react-banking-app-template/master/screenshots/profile.png)

![Savings](https://raw.githubusercontent.com/cenksari/react-banking-app-template/master/screenshots/savings.png)

## Installation

1. Clone the project:

   ```bash
   git clone https://github.com/alex-baker-cdm/react-banking-app.git
   ```

2. Navigate to the project directory:

   ```bash
   cd react-banking-app
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm start
   ```

## Usage

Once the application is started, navigate to [http://localhost:4200](http://localhost:4200) in your browser to test the application.

## Scripts

- `npm start` - Start the Angular dev server
- `npm run build` - Build for production
- `npm test` - Run unit tests with Karma
- `npm run lint` - Run ESLint with angular-eslint

## Project Structure

```
src/
  app/
    components/    # Reusable UI components
      actions/     # Action circles (Add, Send, Details, More)
      add/         # Add money sub-components (Saved, Destination)
      arrow/       # Transfer arrow indicator
      balance/     # Account balance display
      card/        # Credit card with flip animation
      circle/      # Icon circle component
      currency/    # Currency selection item
      divider/     # Section divider
      form/        # Form controls (Button, Input)
      header/      # App header with search and navigation
      history/     # Transaction history list
      layout/      # Page layout wrapper
      send/        # Send money sub-components
      widgets/     # Dashboard widget links
    pages/         # Route-level page components
      signin/      # Sign-in page
      home/        # Dashboard home
      cards/       # Card management
      send-money/  # Send money flow
      savings/     # Savings/currency selection
      profile/     # User profile
      add/         # Add money page
      transactions/# Transaction history
    services/      # Angular services
      sentry.service.ts          # Sentry initialization and error handler
      screen-load-monitor.service.ts  # Performance monitoring
  styles.css       # Global styles (glassmorphism UI)
  index.html       # Application shell
  main.ts          # Bootstrap entry point
```

## Error Tracking with Sentry

This application includes [Sentry](https://sentry.io) for error monitoring, performance tracing, and session replay.

**Configuration:**

The Sentry DSN is configured in `src/app/services/sentry.service.ts`. Replace the DSN with your own from your Sentry project settings.

**Sample Rates:**
- `tracesSampleRate: 1.0` - Captures 100% of transactions for performance monitoring
- `replaysSessionSampleRate: 0.1` - Captures 10% of all sessions for replay
- `replaysOnErrorSampleRate: 1.0` - Captures 100% of sessions with errors for replay

## Contributing

If you would like to contribute, please create a new branch and submit a pull request with your changes.

## License

MIT
