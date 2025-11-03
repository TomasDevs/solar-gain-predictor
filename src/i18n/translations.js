export const translations = {
  cs: {
    // Header
    appTitle: 'Prediktor Solární Energie',
    appSubtitle: 'Predikujte výrobu solární energie s pomocí reálných dat o počasí a AI technologie',

    // Form
    formTitle: 'Parametry solárního panelu',
    cityLabel: 'Město nebo obec',
    cityPlaceholder: 'např. Praha, Brno, Ostrava',
    cityHint: 'Začněte psát město, zobrazí se návrhy. Nebo použijte geolokaci.',
    myLocation: 'Moje poloha',
    loading: 'Načítám...',
    panelAreaLabel: 'Plocha panelu (m²)',
    panelAreaPlaceholder: 'např. 10',
    efficiencyLabel: 'Účinnost (0-1)',
    efficiencyPlaceholder: 'např. 0.2',
    efficiencyHint: 'Typická hodnota: 0.15-0.22',
    orientationLabel: 'Orientace střechy',
    orientationHint: 'Jižní orientace poskytuje nejvyšší výkon',
    orientationSouth: 'Jih (optimální - 100%)',
    orientationSoutheast: 'Jihovýchod (90%)',
    orientationSouthwest: 'Jihozápad (90%)',
    orientationEast: 'Východ (75%)',
    orientationWest: 'Západ (75%)',
    orientationNorth: 'Sever (50%)',
    calculateButton: 'Vypočítat energii',
    calculatingButton: 'Načítám data...',
    selected: 'Vybráno',

    // Validation alerts
    alertAreaInvalid: 'Zadejte platnou plochu panelu (větší než 0)',
    alertEfficiencyInvalid: 'Zadejte platnou účinnost (0-1)',
    alertCityRequired: 'Zadejte město nebo použijte geolokaci',
    alertTrainFirst: 'Nejprve vypočítejte predikci energie pomocí formuláře',

    // Location info
    locationTitle: 'Lokace',
    orientation: 'Orientace',
    efficiency: 'efektivity',
    yourLocation: 'Vaše poloha',

    // Chart
    chartTitle: '📊 Predikce solární energie na 5 dní',
    chartEmpty: 'Zatím žádná data. Vyplňte formulář a vypočítejte energii.',
    energyLabel: 'Vyrobená energie (Wh)',
    sunHours: 'Sluneční hodiny',
    energyAxis: 'Energie (Wh)',

    // Statistics
    statsTitle: 'Statistiky výroby',
    totalEnergy: 'Celková energie',
    averagePerDay: 'Průměr/den',
    maximum: 'Maximum',

    // AI Section
    aiTitle: 'AI Predikce slunečních hodin',
    trainButton: 'Natrénovat & Predikovat',
    retrainButton: 'Přetrénovat & Predikovat',
    trainingButton: 'Trénuji model...',
    trainingModel: 'Trénování modelu',
    comparisonTitle: 'Porovnání: Skutečnost vs. AI Predikce',
    actual: 'Skutečnost',
    aiPrediction: 'AI Predikce',
    difference: 'Rozdíl',
    day: 'Den',
    aiInfo: 'AI model natrénovaný na 180 dnech historických dat (6 měsíců) predikuje sluneční hodiny na základě naučených vzorců z minulosti. Porovnává se s aktuální předpovědí z Open-Meteo API pro',
    aiDescription: 'Klikněte na tlačítko výše pro natrénování AI modelu a zobrazení predikce. Model se trénuje na reálných historických datech (180 dní) a porovnává naučené vzorce s aktuální předpovědí. Obojí z Open-Meteo API.',

    // Error/Warning
    warning: 'Upozornění',
    errorFetchingData: 'Nepodařilo se načíst data o počasí. Používám simulovaná data.',
    errorTrainingModel: 'Nepodařilo se natrénovat AI model',

    // Day labels
    today: 'Dnes',
    tomorrow: 'Zítra',

    // Days of week
    dayMon: 'Po',
    dayTue: 'Út',
    dayWed: 'St',
    dayThu: 'Čt',
    dayFri: 'Pá',
    daySat: 'So',
    daySun: 'Ne',

    // Orientation labels
    orientationLabelSouth: 'Jih',
    orientationLabelSoutheast: 'Jihovýchod',
    orientationLabelSouthwest: 'Jihozápad',
    orientationLabelEast: 'Východ',
    orientationLabelWest: 'Západ',
    orientationLabelNorth: 'Sever',

    // AI Training
    loss: 'Ztráta',
    valLoss: 'Val. Ztráta',
  },
  en: {
    // Header
    appTitle: 'Solar Gain Predictor',
    appSubtitle: 'Predict solar energy production using real weather data and AI technology',

    // Form
    formTitle: 'Solar Panel Parameters',
    cityLabel: 'City or Town',
    cityPlaceholder: 'e.g. Prague, Brno, Ostrava',
    cityHint: 'Start typing city name for suggestions or use geolocation.',
    myLocation: 'My Location',
    loading: 'Loading...',
    panelAreaLabel: 'Panel Area (m²)',
    panelAreaPlaceholder: 'e.g. 10',
    efficiencyLabel: 'Efficiency (0-1)',
    efficiencyPlaceholder: 'e.g. 0.2',
    efficiencyHint: 'Typical value: 0.15-0.22',
    orientationLabel: 'Roof Orientation',
    orientationHint: 'South orientation provides highest output',
    orientationSouth: 'South (optimal - 100%)',
    orientationSoutheast: 'Southeast (90%)',
    orientationSouthwest: 'Southwest (90%)',
    orientationEast: 'East (75%)',
    orientationWest: 'West (75%)',
    orientationNorth: 'North (50%)',
    calculateButton: 'Calculate Energy',
    calculatingButton: 'Loading data...',
    selected: 'Selected',

    // Validation alerts
    alertAreaInvalid: 'Enter valid panel area (greater than 0)',
    alertEfficiencyInvalid: 'Enter valid efficiency (0-1)',
    alertCityRequired: 'Enter city or use geolocation',
    alertTrainFirst: 'First calculate energy prediction using the form',

    // Location info
    locationTitle: 'Location',
    orientation: 'Orientation',
    efficiency: 'efficiency',
    yourLocation: 'Your Location',

    // Chart
    chartTitle: '📊 5-Day Solar Energy Forecast',
    chartEmpty: 'No data yet. Fill out the form and calculate energy.',
    energyLabel: 'Generated Energy (Wh)',
    sunHours: 'Sun Hours',
    energyAxis: 'Energy (Wh)',

    // Statistics
    statsTitle: 'Production Statistics',
    totalEnergy: 'Total Energy',
    averagePerDay: 'Average/Day',
    maximum: 'Maximum',

    // AI Section
    aiTitle: 'AI Sun Hours Prediction',
    trainButton: 'Train & Predict',
    retrainButton: 'Retrain & Predict',
    trainingButton: 'Training model...',
    trainingModel: 'Training model',
    comparisonTitle: 'Comparison: Actual vs. AI Prediction',
    actual: 'Actual',
    aiPrediction: 'AI Prediction',
    difference: 'Difference',
    day: 'Day',
    aiInfo: 'AI model trained on 180 days of historical data (6 months) predicts sun hours based on learned patterns from the past. Compared with current forecast from Open-Meteo API for',
    aiDescription: 'Click the button above to train the AI model and display predictions. The model trains on real historical data (180 days) and compares learned patterns with current forecast. Both from Open-Meteo API.',

    // Error/Warning
    warning: 'Warning',
    errorFetchingData: 'Failed to load weather data. Using simulated data.',
    errorTrainingModel: 'Failed to train AI model',

    // Day labels
    today: 'Today',
    tomorrow: 'Tomorrow',

    // Days of week
    dayMon: 'Mon',
    dayTue: 'Tue',
    dayWed: 'Wed',
    dayThu: 'Thu',
    dayFri: 'Fri',
    daySat: 'Sat',
    daySun: 'Sun',

    // Orientation labels
    orientationLabelSouth: 'South',
    orientationLabelSoutheast: 'Southeast',
    orientationLabelSouthwest: 'Southwest',
    orientationLabelEast: 'East',
    orientationLabelWest: 'West',
    orientationLabelNorth: 'North',

    // AI Training
    loss: 'Loss',
    valLoss: 'Val Loss',
  }
};
