import * as tf from '@tensorflow/tfjs';
import { getHistoricalWeather } from './openMeteoService';

/**
 * Creates and trains a neural network for sun hours prediction
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Function} onProgress - Callback function for training progress tracking
 * @returns {Promise<tf.Sequential>} Trained model
 */
export async function createAndTrainModel(lat, lon, onProgress = null) {
  // Get REAL historical data from Open-Meteo API (180 days = 6 months)
  const historicalData = await getHistoricalWeather(lat, lon, 180);

  // Prepare training data
  // Inputs: [month (0-11), day of year (0-365), cloudiness (0-100), temperature (-20 to 40)]
  // Output: [sun hours (0-24h from real data)]
  const inputs = historicalData.map(d => [
    d.month / 11,           // Normalize month to 0-1
    d.dayOfYear / 365,      // Normalize day of year to 0-1
    d.cloudiness / 100,     // Normalize cloudiness to 0-1
    (d.temperature + 20) / 60, // Normalize temperature to 0-1 (range -20 to 40°C)
  ]);

  const outputs = historicalData.map(d => [d.sunHours / 24]); // Normalize to 0-1 (0-24h)

  // Convert to tensors
  const inputTensor = tf.tensor2d(inputs);
  const outputTensor = tf.tensor2d(outputs);

  // Create neural network
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [4], units: 16, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 8, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' }), // sigmoid for 0-1 output
    ],
  });

  // Compile model
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'meanSquaredError',
    metrics: ['mse'],
  });

  // Train model
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

  // Dispose tensors
  inputTensor.dispose();
  outputTensor.dispose();

  return model;
}

/**
 * Predicts sun hours based on weather using AI model
 * @param {tf.Sequential} model - Trained model
 * @param {Object} weatherData - Weather data {cloudiness, temperature, date}
 * @returns {number} Predicted sun hours
 */
export function predictSunHours(model, weatherData) {
  const { cloudiness, temperature, date } = weatherData;

  const month = date.getMonth();
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);

  // Normalize inputs (same as during training)
  const input = tf.tensor2d([[
    month / 11,
    dayOfYear / 365,
    cloudiness / 100,
    (temperature + 20) / 60,
  ]]);

  // Prediction
  const prediction = model.predict(input);
  const normalizedValue = prediction.dataSync()[0];

  // Denormalize output (from 0-1 to 0-24h, but limit to 0-12h for display)
  const sunHours = normalizedValue * 24;

  // Dispose tensors
  input.dispose();
  prediction.dispose();

  return Math.max(0, Math.min(12, sunHours));
}

/**
 * Creates AI prediction for 5-day forecast
 * @param {tf.Sequential} model - Trained model
 * @param {Array} forecastData - Weather forecast from API
 * @returns {Array} Array of objects with AI prediction {dayLabel, sunHours, aiSunHours}
 */
export function createAIPrediction(model, forecastData) {
  return forecastData.map(dayData => {
    // Create weather object for prediction
    const weatherData = {
      cloudiness: dayData.cloudiness || 50, // Fallback if missing
      temperature: dayData.temperature || 10, // Fallback if missing
      date: dayData.date || new Date(),
    };

    const aiSunHours = predictSunHours(model, weatherData);

    return {
      day: dayData.dayLabel,
      sunHours: dayData.sunHours, // Original calculation
      aiSunHours: Math.round(aiSunHours * 10) / 10, // AI prediction
    };
  });
}
