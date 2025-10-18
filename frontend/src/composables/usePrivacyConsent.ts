import { computed, ref } from 'vue';
import { enableAnalyticsCollection, disableAnalyticsCollection } from '@/plugins/firebase';
import { logger } from '@/utils/logger';

export type ConsentStatus = 'accepted' | 'rejected' | 'unknown';

const STORAGE_KEY = 'tt-analytics-consent';
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID || 'qw2qze9js7';

const consentStatus = ref<ConsentStatus>('unknown');
const bannerVisible = ref(false);
const hasInitialized = ref(false);
let clarityBootstrapped = false;

const getStorage = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    return window.localStorage;
  } catch (error) {
    logger.warn('Unable to access localStorage for consent management:', error);
    return undefined;
  }
};

const bootstrapClarity = () => {
  if (clarityBootstrapped || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  clarityBootstrapped = true;

  const queueingClarity = ((...args: unknown[]) => {
    (queueingClarity.q = queueingClarity.q || []).push(args);
  }) as typeof window.clarity & { q?: unknown[] };

  if (typeof window.clarity !== 'function') {
    window.clarity = queueingClarity;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;

  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
};

const enableClarity = () => {
  if (typeof window === 'undefined') {
    return;
  }
  bootstrapClarity();
  if (typeof window.clarity === 'function') {
    window.clarity('consent', true);
  }
};

const disableClarity = () => {
  if (typeof window === 'undefined') {
    return;
  }
  if (typeof window.clarity === 'function') {
    window.clarity('consent', false);
  }
};

const syncAnalyticsWithConsent = (status: ConsentStatus) => {
  if (status === 'accepted') {
    enableAnalyticsCollection().catch((error) => {
      logger.error('Unable to enable analytics collection:', error);
    });
    enableClarity();
  } else if (status === 'rejected') {
    disableAnalyticsCollection();
    disableClarity();
  }
};

const readStoredConsent = (storage: Storage | undefined) => {
  if (!storage) {
    return undefined;
  }
  try {
    return storage.getItem(STORAGE_KEY) ?? undefined;
  } catch (error) {
    logger.warn('Unable to read stored analytics consent:', error);
    return undefined;
  }
};

const persistConsent = (storage: Storage | undefined, status: 'accepted' | 'rejected') => {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_KEY, status);
  } catch (error) {
    logger.warn('Unable to persist analytics consent:', error);
  }
};

const clearStoredConsent = (storage: Storage | undefined) => {
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    logger.warn('Unable to clear analytics consent:', error);
  }
};

const initializeConsent = () => {
  if (hasInitialized.value) {
    return;
  }
  hasInitialized.value = true;
  const storage = getStorage();
  const stored = readStoredConsent(storage);
  if (stored === 'accepted' || stored === 'rejected') {
    consentStatus.value = stored;
    syncAnalyticsWithConsent(consentStatus.value);
    bannerVisible.value = false;
  } else {
    consentStatus.value = 'unknown';
    bannerVisible.value = true;
  }
};

const setConsent = (status: 'accepted' | 'rejected') => {
  consentStatus.value = status;
  const storage = getStorage();
  persistConsent(storage, status);
  bannerVisible.value = false;
  syncAnalyticsWithConsent(status);
};

const openPreferences = () => {
  bannerVisible.value = true;
};

const resetConsent = () => {
  consentStatus.value = 'unknown';
  const storage = getStorage();
  clearStoredConsent(storage);
  bannerVisible.value = true;
  disableAnalyticsCollection();
  disableClarity();
};

const consentGiven = computed(() => consentStatus.value === 'accepted');
const choiceRecorded = computed(() => consentStatus.value !== 'unknown');

export const usePrivacyConsent = () => {
  return {
    consentStatus,
    bannerVisible,
    consentGiven,
    choiceRecorded,
    initializeConsent,
    accept: () => setConsent('accepted'),
    reject: () => setConsent('rejected'),
    openPreferences,
    resetConsent,
  };
};

export const __privacyConsentInternals = {
  enableClarity,
  disableClarity,
};

declare global {
  interface Window {
    clarity?: ((
      command: string,
      ...args: Array<string | number | boolean | Record<string, unknown>>
    ) => void) & { q?: unknown[] };
  }
}
