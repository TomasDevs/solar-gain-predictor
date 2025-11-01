# 🌞 Solar Gain Predictor

[🇬🇧 English](#english) | [🇨🇿 Čeština](#čeština)

---

<a name="english"></a>
## 🇬🇧 English

A web application that predicts the amount of solar energy (in Wh/kWh) based on user-defined parameters such as panel area, efficiency, and roof orientation. The app integrates real-time weather data from OpenWeatherMap API, visualizes results using Chart.js, and utilizes TensorFlow.js for AI-powered energy production predictions based on historical weather patterns.

### 🚀 Features
- Input panel area, efficiency, and roof orientation
- Real-time weather data integration via OpenWeatherMap API
- Calculate daily energy production based on solar hours
- Visualize results with interactive Chart.js bar charts
- AI-powered predictions using TensorFlow.js trained on historical weather data
- Compare actual vs. predicted energy production
- Weekly energy production overview with statistics

### 🧰 Technologies Used
- **React** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **react-chartjs-2** - React wrapper for Chart.js
- **TensorFlow.js** - Machine learning in the browser
- **OpenWeatherMap API** - Real-time weather data

### 🧱 Project Structure
```
src/
 ├─ App.jsx
 ├─ components/
 │   ├─ SolarForm.jsx
 │   └─ SolarChart.jsx
 └─ data/
     └─ simulateSolarData.js
```

### ⚙️ Installation and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/TomasDevs/solar-gain-predictor.git
   cd solar-gain-predictor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the project**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

### 🧮 Calculation Principle
```
energy = panel_area * efficiency * sun_hours * 1000
```
Sun hours are obtained from OpenWeatherMap API or simulated using a fixed array `[5, 6, 7, 6, 5, 4, 3]` representing a weekly pattern.

### 🤖 AI Prediction (TensorFlow.js)
The application uses TensorFlow.js to train a neural network model that:
- Analyzes historical weather and energy production data
- Learns patterns between weather conditions and solar energy output
- Predicts energy production for upcoming days
- Visualizes comparison between actual and predicted production
- Trains locally in the browser for privacy and performance

Users can trigger model training with the "Train & Predict" button, which processes historical data and generates predictions based on learned patterns.

### 🌤️ Weather Integration (OpenWeatherMap API)
The app integrates with OpenWeatherMap API to:
- Fetch real-time weather conditions
- Retrieve solar radiation data
- Get cloud coverage and sunshine hours
- Provide accurate location-based predictions

### 📸 Screenshot
*(Coming soon - dashboard preview)*

### 📄 License
MIT License

---

<a name="čeština"></a>
## 🇨🇿 Čeština

Webová aplikace, která predikuje množství solární energie (v Wh/kWh) na základě zadaných parametrů uživatelem (plocha panelu, účinnost, orientace střechy). Aplikace integruje reálná data o počasí z OpenWeatherMap API, vizualizuje výsledky pomocí Chart.js a využívá TensorFlow.js pro AI predikci výroby energie založenou na historických datech o počasí.

### 🚀 Funkce
- Zadání plochy panelu, účinnosti a orientace střechy
- Integrace reálných dat o počasí přes OpenWeatherMap API
- Výpočet denní produkce energie na základě slunečních hodin
- Vizualizace výsledků pomocí interaktivního sloupcového grafu (Chart.js)
- AI predikce pomocí TensorFlow.js trénované na historických datech o počasí
- Srovnání skutečné vs. predikované výroby energie
- Týdenní přehled produkce energie se statistikami

### 🧰 Použité technologie
- **React** - UI knihovna
- **Vite** - Rychlý build nástroj
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Vizualizace dat
- **react-chartjs-2** - React wrapper pro Chart.js
- **TensorFlow.js** - Strojové učení v prohlížeči
- **OpenWeatherMap API** - Reálná data o počasí

### 🧱 Struktura projektu
```
src/
 ├─ App.jsx
 ├─ components/
 │   ├─ SolarForm.jsx
 │   └─ SolarChart.jsx
 └─ data/
     └─ simulateSolarData.js
```

### ⚙️ Instalace a spuštění

1. **Klonuj repozitář**
   ```bash
   git clone https://github.com/TomasDevs/solar-gain-predictor.git
   cd solar-gain-predictor
   ```

2. **Instaluj závislosti**
   ```bash
   npm install
   ```

3. **Spusť projekt**
   ```bash
   npm run dev
   ```

Aplikace bude dostupná na `http://localhost:5173` (nebo na jiném portu, pokud je 5173 obsazený).

### 🧮 Princip výpočtu
```
energie = plocha_panelu * účinnost * sluneční_hodiny * 1000
```
Hodnota slunečních hodin je získána z OpenWeatherMap API nebo simulovaná přes pole `[5, 6, 7, 6, 5, 4, 3]` reprezentující týdenní vzor.

### 🤖 AI Predikce (TensorFlow.js)
Aplikace využívá TensorFlow.js k trénování neuronové sítě, která:
- Analyzuje historická data o počasí a výrobě energie
- Učí se vzory mezi povětrnostními podmínkami a solární produkcí
- Predikuje výrobu energie pro nadcházející dny
- Vizualizuje srovnání mezi skutečnou a predikovanou produkcí
- Trénuje lokálně v prohlížeči pro zajištění soukromí a výkonu

Uživatelé mohou spustit trénování modelu tlačítkem "Train & Predict", které zpracuje historická data a vygeneruje predikce založené na naučených vzorech.

### 🌤️ Integrace počasí (OpenWeatherMap API)
Aplikace se integruje s OpenWeatherMap API pro:
- Načítání aktuálních povětrnostních podmínek
- Získávání dat o slunečním záření
- Zjištění oblačnosti a slunečních hodin
- Poskytování přesných predikcí podle lokace

### 📸 Screenshot
*(Připravujeme - náhled dashboardu)*

### 📄 Licence
MIT License
