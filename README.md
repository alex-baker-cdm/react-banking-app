# React Banking App

A modern, mobile-first banking application built with React. Provides a clean, intuitive interface for account management, transaction tracking, and card management.

**Key Features**

- **Responsive Design**: A mobile-first approach ensures a seamless user experience across all devices.
- **Modern UI**: A clean, intuitive interface that makes banking easy and enjoyable.
- **Customizable**: Tailor the template to fit your brand's unique style and needs.
- **Error Monitoring**: Integrated with [Sentry](https://sentry.io) for error tracking and performance monitoring.

## Demo

[https://react-banking-app-template.vercel.app](https://react-banking-app-template.vercel.app)

## Screenshots

![Signin](screenshots/signin.png)

![Home](screenshots/home.png)

![Transactions](screenshots/transactions.png)

![Cards](screenshots/cards.png)

![Add Money](screenshots/addmoney.png)

![Profile](screenshots/profile.png)

![Savings](screenshots/savings.png)

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
   npm install --legacy-peer-deps
   ```

4. Start the application:

   ```bash
   npm start
   ```

## Usage

Once the application is started, navigate to [http://localhost:3000](http://localhost:3000) in your browser to test the application.

## Error Tracking with Sentry

This application includes [Sentry](https://sentry.io) for error monitoring, performance tracing, and session replay.

**Features:**
- Automatic error capture and reporting
- Browser performance tracing
- Session replay for debugging user issues
- ErrorBoundary component wrapping the app to catch React errors

**Configuration:**

The Sentry DSN is configured in `src/sentry.ts`. If you fork this repository, replace the DSN with your own from your Sentry project settings.

**Sample Rates (configurable in `src/sentry.ts`):**
- `tracesSampleRate: 1.0` - Captures 100% of transactions for performance monitoring (reduce in production to manage costs)
- `replaysSessionSampleRate: 0.1` - Captures 10% of all sessions for replay
- `replaysOnErrorSampleRate: 1.0` - Captures 100% of sessions with errors for replay

**Note:** The test error button on the Home page is for verifying Sentry integration and should be removed before production deployment.

## Contributing

If you would like to contribute, please create a new branch and submit a pull request with your changes. Review may be needed before acceptance.

## License

MIT
