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

// Register required Chart.js components
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
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl px-4 sm:px-8 pt-8 pb-8 text-center border border-slate-200">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm sm:text-base">Zatím žádná data. Vyplňte formulář a vypočítejte energii.</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        label: 'Vyrobená energie (Wh)',
        data: data.map((d) => d.energy),
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.9)');
          return gradient;
        },
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: '600',
          },
          color: '#334155',
          usePointStyle: true,
          pointStyle: 'rectRounded',
        },
      },
      title: {
        display: true,
        text: '📊 Predikce solární energie na 5 dní',
        font: {
          size: 18,
          weight: 'bold',
        },
        color: '#1e293b',
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          afterLabel: function (context) {
            const dataPoint = data[context.dataIndex];
            return `Sluneční hodiny: ${dataPoint.sunHours}h`;
          },
          label: function (context) {
            return `Energie: ${context.parsed.y.toLocaleString()} Wh (${(context.parsed.y / 1000).toFixed(2)} kWh)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          padding: 8,
        },
        title: {
          display: true,
          text: 'Energie (Wh)',
          color: '#475569',
          font: {
            size: 12,
            weight: '600',
          },
          padding: 10,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          padding: 8,
        },
      },
    },
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl px-4 sm:px-8 pt-6 pb-6 sm:pb-8 border border-slate-200">
      <div style={{ height: '350px' }} className="sm:h-[400px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default SolarChart;
