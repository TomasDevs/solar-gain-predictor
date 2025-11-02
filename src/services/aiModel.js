import * as tf from '@tensorflow/tfjs';
import { getHistoricalWeather } from './openMeteoService';

/**
 * Vytvoří a natrénuje neuronovou síť pro predikci slunečních hodin
 * @param {number} lat - Zeměpisná šířka
 * @param {number} lon - Zeměpisná délka
 * @param {Function} onProgress - Callback funkce pro sledování průběhu tréninku
 * @returns {Promise<tf.Sequential>} Natrénovaný model
 */
export async function createAndTrainModel(lat, lon, onProgress = null) {
  // Získáme REÁLNÁ historická data z Open-Meteo API (180 dní = 6 měsíců)
  const historicalData = await getHistoricalWeather(lat, lon, 180);

  // Připravíme trénovací data
  // Vstupy: [měsíc (0-11), den v roce (0-365), oblačnost (0-100), teplota (-20 až 40)]
  // Výstup: [sluneční hodiny (0-24h z reálných dat)]
  const inputs = historicalData.map(d => [
    d.month / 11,           // Normalizace měsíce na 0-1
    d.dayOfYear / 365,      // Normalizace dne v roce na 0-1
    d.cloudiness / 100,     // Normalizace oblačnosti na 0-1
    (d.temperature + 20) / 60, // Normalizace teploty na 0-1 (rozsah -20 až 40°C)
  ]);

  const outputs = historicalData.map(d => [d.sunHours / 24]); // Normalizace na 0-1 (0-24h)

  // Převedeme na tensory
  const inputTensor = tf.tensor2d(inputs);
  const outputTensor = tf.tensor2d(outputs);

  // Vytvoříme neuronovou síť
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [4], units: 16, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 8, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' }), // sigmoid pro výstup 0-1
    ],
  });

  // Kompilace modelu
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'meanSquaredError',
    metrics: ['mse'],
  });

  // Trénování modelu
  const epochs = 100;
  await model.fit(inputTensor, outputTensor, {
    epochs,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (onProgress) {
          onProgress({
            epoch: epoch + 1,
            totalEpochs: epochs,
            loss: logs.loss,
            valLoss: logs.val_loss,
          });
        }
      },
    },
  });

  // Uvolníme tensory
  inputTensor.dispose();
  outputTensor.dispose();

  return model;
}

/**
 * Predikce slunečních hodin na základě počasí pomocí AI modelu
 * @param {tf.Sequential} model - Natrénovaný model
 * @param {Object} weatherData - Data o počasí {cloudiness, temperature, date}
 * @returns {number} Predikované sluneční hodiny
 */
export function predictSunHours(model, weatherData) {
  const { cloudiness, temperature, date } = weatherData;

  const month = date.getMonth();
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);

  // Normalizace vstupů (stejně jako při tréninku)
  const input = tf.tensor2d([[
    month / 11,
    dayOfYear / 365,
    cloudiness / 100,
    (temperature + 20) / 60,
  ]]);

  // Predikce
  const prediction = model.predict(input);
  const normalizedValue = prediction.dataSync()[0];

  // Denormalizace výstupu (z 0-1 na 0-24h, ale omezíme na 0-12h pro zobrazení)
  const sunHours = normalizedValue * 24;

  // Uvolníme tensory
  input.dispose();
  prediction.dispose();

  return Math.max(0, Math.min(12, sunHours));
}

/**
 * Vytvoří AI predikci pro 5denní předpověď
 * @param {tf.Sequential} model - Natrénovaný model
 * @param {Array} forecastData - Předpověď počasí z API
 * @returns {Array} Pole objektů s AI predikcí {dayLabel, sunHours, aiSunHours}
 */
export function createAIPrediction(model, forecastData) {
  return forecastData.map(dayData => {
    // Vytvoříme objekt počasí pro predikci
    const weatherData = {
      cloudiness: dayData.cloudiness || 50, // Fallback pokud chybí
      temperature: dayData.temperature || 10, // Fallback pokud chybí
      date: dayData.date || new Date(),
    };

    const aiSunHours = predictSunHours(model, weatherData);

    return {
      day: dayData.dayLabel,
      sunHours: dayData.sunHours, // Původní výpočet
      aiSunHours: Math.round(aiSunHours * 10) / 10, // AI predikce
    };
  });
}
