import React, { useState, useEffect } from 'react';

const NextReminderTimer = ({ schedule }) => {
    const calculateTimeLeft = () => {
        const now = new Date();
        const [minutePattern, hourPattern] = schedule.split(' ');

        let nextExecutionTime = new Date(now);

        // Gère "0 8 * * *" (à une heure précise tous les jours)
        if (hourPattern !== '*' && minutePattern !== '*') {
            const targetHour = parseInt(hourPattern, 10);
            const targetMinute = parseInt(minutePattern, 10);

            nextExecutionTime.setHours(targetHour, targetMinute, 0, 0);

            if (nextExecutionTime <= now) {
                // Si l'heure est déjà passée aujourd'hui, on programme pour demain
                nextExecutionTime.setDate(now.getDate() + 1);
            }
        } 
        // Gère "*/X * * * *" (toutes les X minutes)
        else if (minutePattern.includes('*/')) {
            const interval = parseInt(minutePattern.split('*/')[1], 10);
            const currentMinutes = now.getMinutes();
            const minutesToAdd = interval - (currentMinutes % interval);
            
            nextExecutionTime.setSeconds(0, 0);
            nextExecutionTime.setMinutes(now.getMinutes() + minutesToAdd);
        } else {
            // Fallback pour les formats non gérés
            return {}; 
        }

        const difference = nextExecutionTime - now;
        
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    if (timeLeft.hours > 0) {
        timerComponents.push(`${timeLeft.hours}h`);
    }
    if (timeLeft.minutes > 0) {
        timerComponents.push(`${timeLeft.minutes}min`);
    }
    // On affiche les secondes seulement s'il reste moins d'une heure
    if (timeLeft.hours === 0 && timeLeft.seconds > 0) {
        timerComponents.push(`${timeLeft.seconds}s`);
    }

    if (timerComponents.length === 0) {
        return (
             <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                Vérification imminente...
            </span>
        )
    }

    return (
        <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
            Prochaine vérification dans : {timerComponents.join(' ')}
        </span>
    );
};

export default NextReminderTimer;
