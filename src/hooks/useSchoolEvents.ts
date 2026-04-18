import { useEffect } from 'react';
import { SchoolService } from '../services/schoolService';
import type { Tables } from '../types/database';

/**
 * Custom hook to handle system-wide real-time events.
 * Listens for Admin broadcasts, diary updates, and student status changes.
 */
export const useSchoolEvents = (onNotification?: (notification: Tables<'notifications'>) => void, onDiaryUpdate?: (diary: Tables<'diary'>) => void) => {
  useEffect(() => {
    // 1. Subscribe to Notifications (OTAs)
    const notificationSub = SchoolService.subscribeToNotifications((payload) => {
      console.log('Real-time Notification:', payload);
      if (onNotification && payload.new) {
        onNotification(payload.new as Tables<'notifications'>);
      }
    });

    // 2. Subscribe to Diary Updates
    const diarySub = SchoolService.subscribeToDiaryUpdates((payload) => {
      console.log('Real-time Diary Update:', payload);
      if (onDiaryUpdate && payload.new) {
        onDiaryUpdate(payload.new as Tables<'diary'>);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      notificationSub.unsubscribe();
      diarySub.unsubscribe();
    };
  }, [onNotification, onDiaryUpdate]);
};

/**
 * Hook to monitor specific student status (e.g., for the Parent "Big Red" Lock).
 */
export const useStudentLockStatus = (studentId: string | undefined, onLockChange: (isLocked: boolean) => void) => {
  useEffect(() => {
    if (!studentId) return;

    const subscription = SchoolService.subscribeToStudentStatus(studentId, (payload) => {
      console.log('Student Status Changed:', payload);
      if (payload.new && typeof payload.new.is_locked === 'boolean') {
        onLockChange(payload.new.is_locked);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [studentId, onLockChange]);
};
