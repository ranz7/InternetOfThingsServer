"use client";

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import mqtt from 'mqtt';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components you need
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const MQTT_WS_URI = process.env.NEXT_PUBLIC_MQTT_WS_URI || 'ws://34.55.119.226:8080/mqtt';
const API_URI = process.env.NEXT_PUBLIC_API_URI || 'http://34.55.119.226:3001';

const TemperatureChart = () => {
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [historicalData, setHistoricalData] = useState([]);

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`${API_URI}/api/temperature`);
      const data = await response.json();
      setHistoricalData(data);
      console.log(data, data.slice(-1).temperature)
      setCurrentTemp(Math.round(data[0].temperature * 100) / 100);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
    const interval = setInterval(fetchHistoricalData, 5000);
    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   const mqttClient = mqtt.connect(MQTT_WS_URI);

  //   mqttClient.on("connect", () => {
  //     mqttClient.subscribe("sensors/temperature");
  //   });

  //   mqttClient.on("message", (topic, message) => {
  //     const data = JSON.parse(message.toString());
  //     setCurrentTemp(data.temperature);
  //     setHistoricalData(prev => [...prev, data]);
  //   });

  //   return () => {
  //     mqttClient.end();
  //   };
  // }, []);

  // Create reversed chart data
  const chartData = {
    labels: historicalData
      .slice() // Create a copy of the data array
      .reverse() // Reverse the order of data
      .map(data => new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: 'Temperature',
        data: historicalData
          .slice() // Create a copy of the data array
          .reverse() // Reverse the order of data
          .map(data => data.temperature),
        borderColor: '#8884d8',
        fill: false,
      },
    ],
  };

  const chartOptions = {
    animation: {
      duration: 0, // Disable animations or set it to a specific duration
    },
    elements: {
      line: {
        tension: 0.4, // Adjust line tension for smoother curves
      },
      point: {
        radius: 5, // Adjust point size
      },
    },
  };

  return (
    <div className="p-4">
      <div className="mb-4 text-2xl font-bold">
        Aktualna temperatura: {currentTemp !== null ? `${currentTemp}°C` : "Ładowanie..."}
      </div>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default TemperatureChart;
