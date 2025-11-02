import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrace potřebných komponent Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function SolarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 text-center">
        <p className="text-gray-500">Zatím žádná data. Vyplňte formulář a vypočítejte energii.</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        label: 'Vyrobená energie (Wh)',
        data: data.map((d) => d.energy),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // modrá barva
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Predikce solární energie na 5 dní',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: function (context) {
            const dataPoint = data[context.dataIndex];
            return `Sluneční hodiny: ${dataPoint.sunHours}h`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Energie (Wh)',
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
      <div style={{ height: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default SolarChart;
