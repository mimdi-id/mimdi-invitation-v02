'use client';

import { useState, useEffect } from 'react';

// Tipe data untuk props komponen
type CountdownTimerProps = {
  targetDate: string;
};

// Fungsi untuk menghitung sisa waktu
const calculateTimeLeft = (targetDate: string) => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    // Set interval untuk memperbarui hitungan setiap 1 detik
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    // Bersihkan interval saat komponen dilepas untuk mencegah kebocoran memori
    return () => clearInterval(timer);
  }, [targetDate]);

  const timerComponents: React.ReactNode[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof typeof timeLeft]) {
      return;
    }

    timerComponents.push(
      <div key={interval} className="flex flex-col items-center">
        <span className="text-4xl font-bold text-slate-800">
          {timeLeft[interval as keyof typeof timeLeft]}
        </span>
        <span className="text-sm uppercase text-slate-500">{interval}</span>
      </div>
    );
  });
  
  // Jika waktu sudah habis, tampilkan pesan
  if (!timerComponents.length) {
    return <p className="text-xl font-semibold text-orange-700">Acara telah berlangsung!</p>;
  }

  return (
    <div className="flex justify-center gap-8">
      {timerComponents}
    </div>
  );
}
