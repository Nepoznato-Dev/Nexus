import React, { useState, useEffect } from 'react';
import { Clock, Bell } from 'lucide-react';

export default function ScheduleTracker() {
  const [currentClass, setCurrentClass] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [lastNotificationMinute, setLastNotificationMinute] = useState(null);

  useEffect(() => {
    const updateSchedule = () => {
      try {
        const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
        const schedule = settings.schedule || {};
        
        // Check if schedule is enabled
        if (!schedule.enabled) {
          setCurrentClass(null);
          setNextClass(null);
          return;
        }
        
        const periods = schedule.periods || [];
        
        if (periods.length === 0) {
          setCurrentClass(null);
          return;
        }

        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

        // Skip weekends
        if (currentDay === 0 || currentDay === 6) {
          setCurrentClass(null);
          return;
        }

        // Find current class
        let current = null;
        let next = null;

        for (let i = 0; i < periods.length; i++) {
          const period = periods[i];
          if (!period.enabled) continue;

          // Validate time format before parsing
          if (!period.startTime || !period.endTime) {
            console.warn(`Invalid period at index ${i}: missing time`);
            continue;
          }

          const timeParts = period.startTime.split(':');
          const endTimeParts = period.endTime.split(':');
          
          if (timeParts.length !== 2 || endTimeParts.length !== 2) {
            console.warn(`Invalid period at index ${i}: malformed time format`);
            continue;
          }

          const [startHour, startMin] = timeParts.map(Number);
          const [endHour, endMin] = endTimeParts.map(Number);
          
          // Validate parsed values are valid numbers
          if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
            console.warn(`Invalid period at index ${i}: invalid time values`);
            continue;
          }
          
          // Validate time ranges (0-23 for hours, 0-59 for minutes)
          if (startHour < 0 || startHour > 23 || startMin < 0 || startMin > 59 ||
              endHour < 0 || endHour > 23 || endMin < 0 || endMin > 59) {
            console.warn(`Invalid period at index ${i}: time out of range`);
            continue;
          }

          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          if (currentTime >= startMinutes && currentTime < endMinutes) {
            current = {
              ...period,
              endMinutes,
              minutesLeft: endMinutes - currentTime
            };
          } else if (currentTime < startMinutes && !next) {
            next = {
              ...period,
              startMinutes,
              minutesUntil: startMinutes - currentTime
            };
          }
        }

        setCurrentClass(current);
        setNextClass(next);
        setTimeRemaining(current?.minutesLeft || null);

        // Send notification X minutes before class ends (configurable)
        // Only send once per minute to avoid spam
        const notifyMinutes = schedule.notifyBeforeEnd || 5;
        const currentMinute = Math.floor(current?.minutesLeft);
        
        if (current && currentMinute === notifyMinutes && lastNotificationMinute !== currentMinute) {
          setLastNotificationMinute(currentMinute);
          if (window.nexusNotifications) {
            window.nexusNotifications.show({
              type: 'info',
              title: '🔔 Class Ending Soon',
              body: `${current.name} ends in ${notifyMinutes} minutes - start packing up!`
            });
          }
        }

      } catch (err) {
        console.error('Schedule update failed:', err);
        setLastNotificationMinute(null);
      }
    };

    updateSchedule();
    const interval = setInterval(updateSchedule, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastNotificationMinute]);

  if (!currentClass && !nextClass) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
      {currentClass ? (
        <>
          <Clock className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium">{currentClass.name}</span>
            <span className="text-white/60 text-xs">
              {timeRemaining} min left • Ends {currentClass.endTime}
            </span>
          </div>
        </>
      ) : nextClass ? (
        <>
          <Bell className="w-4 h-4 text-yellow-400" />
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium">Next: {nextClass.name}</span>
            <span className="text-white/60 text-xs">
              Starts in {nextClass.minutesUntil} min ({nextClass.startTime})
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
