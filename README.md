# DynaHCare_V2

DynaHCare_V2 is a multi-platform application designed to provide dynamic healthcare solutions. This project includes a backend, frontend, and mobile application.

## Project Structure
- **Backend**: Handles API requests, database management, and business logic. Built using Django.
- **Frontend**: A web-based interface for users to interact with the system. Developed using Vite React.
- **Mobile Application**: A cross-platform mobile app for on-the-go access. Built using React Native with Expo.

## Features
- Real-time health monitoring and analytics.
- User-friendly interfaces for web and mobile platforms.
- Secure data storage and management.
- Integration with third-party healthcare APIs.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/DynaHCare_V2.git
   ```
2. Navigate to the project directory:
   ```bash
   cd DynaHCare_V2
   ```
3. Follow the setup instructions for each component (backend, frontend, mobile).

## Usage
- Start the backend server:
  ```bash
  cd backend
  python manage.py runserver <your-ip-address>:8000
  ```
  Replace `<your-ip-address>` with your local IP address (e.g., `192.168.1.100`) to allow the mobile app to connect.

- Update the frontend configuration:
  Open `frontend/src/config.tsx` and set the backend API URL to match the IP address:
  ```typescript
  // filepath: frontend/src/config.tsx
  export const API_URL = "http://<your-ip-address>:8000";
  ```

- Run the frontend application:
  ```bash
  cd frontend
  npm run dev
  ```

- Launch the mobile application:
  ```bash
  cd mobile
  npx expo start
  ```
  Use the Expo Go app on your mobile device to scan the QR code and run the application.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

