# 🚀 CryptoMoon
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=render)](https://cryptomoon.onrender.com)


CryptoMoon is a sophisticated Bitcoin price prediction platform that leverages advanced machine learning models and real-time market data to forecast future price movements. This application provides users with actionable insights, historical analysis, and live market data to help them make informed trading decisions.

## Features

- **AI-Powered Predictions**: Utilizes neural networks to analyze market data and predict Bitcoin prices.
- **Real-Time Data**: Integrates with live market feeds to provide up-to-the-minute price information.
- **Historical Analysis**: Offers detailed historical data and trend analysis to understand market patterns.
- **User Dashboard**: A comprehensive dashboard to monitor live market data and predictions.
- **Interactive Charts**: Visualizes price trends and predictions using high-quality charts.

## Tech Stack

### FrontEnd
- **React**: UI library for building the user interface.
- **Vite**: Build tool for fast development and optimized builds.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **React Router**: For client-side routing.
- **Recharts**: For data visualization and charts.
- **React Icons**: For easily incorporating icons.

### BackEnd
- **Python**: Programming language for the backend logic.
- **FastAPI**: Modern, high-performance web framework for the API.
- **Pandas**: Data manipulation and analysis.
- **Scikit-learn**: Machine learning algorithms.
- **XGBoost**: Extreme Gradient Boosting for prediction models.
- **yfinance**: For fetching market data.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd CryptoMoon
    ```

2.  **Install FrontEnd Dependencies**
    ```bash
    cd FrontEnd
    npm install
    ```

3.  **Install BackEnd Dependencies**
    ```bash
    cd ../BackEnd
    pip install -r requirements.txt
    ```

### Running the Application

1.  **Start the BackEnd Server**
    ```bash
    cd BackEnd
    python main.py
    ```
    The server will start on `http://localhost:8000`.

2.  **Start the FrontEnd Server**
    ```bash
    cd ../FrontEnd
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.
### 🚀 Deployment (Render/Local)
To run or deploy both the frontend and backend:
1.  **Local Development**: Use the `start-app.sh` script or run frontend and backend separately.
    ```bash
    ./start-app.sh
    ```
2.  **Live Site**: [https://cryptomoon.onrender.com](https://cryptomoon.onrender.com)

The application is configured for automatic deployment on **Render** via its Dockerfile. The backend FastAPI server handles both the API logic and serves the built React frontend.


- Navigate to the **Predictions** page to view AI-generated price predictions.
- Check the **Dashboard** for live Bitcoin market data and charts.
- Use the **Home** page to get an overview of the platform and its features.
