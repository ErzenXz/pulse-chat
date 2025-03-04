"use client";

import { useState, useEffect } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [supported, setSupported] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setSupported(true);
      setPermission(Notification.permission);
      
      // Register service worker
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setServiceWorkerRegistration(registration);
      
      // Initialize notification service if permission is granted
      if (Notification.permission === 'granted') {
        initNotificationService(registration);
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!supported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted' && serviceWorkerRegistration) {
        initNotificationService(serviceWorkerRegistration);
        return true;
      }
      
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const initNotificationService = (registration: ServiceWorkerRegistration) => {
    if (registration.active) {
      registration.active.postMessage({
        type: 'INIT_NOTIFICATION_SERVICE',
      });
    }
  };

  return {
    supported,
    permission,
    requestPermission,
  };
}