import { defineStore } from 'pinia';
import { watch } from 'vue';
import { fireuser, firestore } from '@/plugins/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  getters,
  actions,
  defaultState,
  migrateToGameModeStructure,
  type UserState,
  type UserActions,
  type GameMode,
} from '@/shared_state';
import { wasDataMigrated } from '@/plugins/store-initializer';
import type { StoreWithFireswapExt } from '@/plugins/pinia-firestore';

// Define the Fireswap configuration type
interface FireswapConfig {
  path: string;
  document: string;
  debouncems: number;
  localKey: string;
}
// Define the store, letting Pinia infer the type
// Cast getters/actions to any for now due to JS import
export const useTarkovStore = defineStore('swapTarkov', {
  state: () => {
    // Start with default state, migration will happen during Firestore binding
    return JSON.parse(JSON.stringify(defaultState)) as UserState;
  },
  getters: {
    ...getters,
    // Override getters to trigger migration before data access
    isTaskComplete: function (state) {
      return (taskId: string) => {
        (this as unknown as { migrateDataIfNeeded: () => void }).migrateDataIfNeeded();
        return getters.isTaskComplete(state)(taskId);
      };
    },
    isTaskFailed: function (state) {
      return (taskId: string) => {
        (this as unknown as { migrateDataIfNeeded: () => void }).migrateDataIfNeeded();
        return getters.isTaskFailed(state)(taskId);
      };
    },
    getCurrentGameMode: function (state) {
      return () => {
        (this as unknown as { migrateDataIfNeeded: () => void }).migrateDataIfNeeded();
        return getters.getCurrentGameMode(state)();
      };
    },
  },
  actions: {
    ...(actions as UserActions),
    async switchGameMode(mode: GameMode) {
      // Switch the current game mode using the base action
      actions.switchGameMode.call(this, mode);

      // If user is logged in, sync the gamemode change to backend
      if (fireuser.uid) {
        try {
          const userProgressRef = doc(firestore, 'progress', fireuser.uid);
          // Send complete state to satisfy Firestore security rules validation
          const completeState = {
            currentGameMode: mode,
            gameEdition: this.gameEdition,
            pvp: this.pvp,
            pve: this.pve,
          };
          await setDoc(userProgressRef, completeState, { merge: true });
        } catch (error) {
          console.error('Error syncing gamemode to backend:', error);
          // TODO: Show error notification to user
        }
      }
    },
    migrateDataIfNeeded() {
      // Check if we need to migrate data - more comprehensive check
      const needsMigration =
        !this.currentGameMode ||
        !this.pvp ||
        !this.pve ||
        ((this as unknown as Record<string, unknown>).level !== undefined && !this.pvp?.level); // Has legacy level but no pvp.level

      if (needsMigration) {
        console.log('Migrating legacy data structure to gamemode-aware structure');
        const currentState = JSON.parse(JSON.stringify(this.$state));
        const migratedData = migrateToGameModeStructure(currentState);
        this.$patch(migratedData);

        // If user is logged in, save the migrated structure to Firestore
        if (fireuser.uid) {
          try {
            const userProgressRef = doc(firestore, 'progress', fireuser.uid);
            setDoc(userProgressRef, migratedData);
          } catch (error) {
            console.error('Error saving migrated data to Firestore:', error);
          }
        }
      }
    },
    async resetOnlineProfile() {
      if (!fireuser.uid) {
        console.error('User not logged in. Cannot reset online profile.');
        return;
      }
      const userProgressRef = doc(firestore, 'progress', fireuser.uid);
      try {
        // Set the Firestore document to a fresh defaultState
        const freshDefaultState = JSON.parse(JSON.stringify(defaultState));
        await setDoc(userProgressRef, freshDefaultState);

        // Clear ALL localStorage data for full account reset
        localStorage.clear();

        // Reset the local Pinia store state to default using $patch
        // This ensures the in-memory state reflects the reset immediately.
        this.$patch(JSON.parse(JSON.stringify(defaultState)));
      } catch (error) {
        console.error('Error resetting online profile:', error);
      }
    },
    async resetCurrentGameModeData() {
      if (!fireuser.uid) {
        console.error('User not logged in. Cannot reset game mode data.');
        return;
      }

      const currentMode = this.getCurrentGameMode();
      const userProgressRef = doc(firestore, 'progress', fireuser.uid);

      try {
        // Create fresh default progress data for the current game mode
        const freshProgressData = JSON.parse(JSON.stringify(defaultState[currentMode]));

        // Update only the current game mode data in Firestore
        const updateData = { [currentMode]: freshProgressData };
        await setDoc(userProgressRef, updateData, { merge: true });

        // Clear ALL localStorage data for gamemode reset
        localStorage.clear();

        // Reset only the current game mode data in the local store
        this.$patch({ [currentMode]: freshProgressData });
      } catch (error) {
        console.error(`Error resetting ${currentMode} game mode data:`, error);
      }
    },
  },
  fireswap: [
    {
      path: '.',
      document: 'progress/{uid}',
      debouncems: 250,
      localKey: 'progress',
    },
  ] as FireswapConfig[],
});
// Type the store instance based on Pinia's inferred type
type TarkovStoreType = ReturnType<typeof useTarkovStore>;
// Type the store instance potentially returned by initializeStore
type StoreInstance = TarkovStoreType | null;
const getSafeStoreInstance = (): StoreInstance => {
  try {
    const store = useTarkovStore();
    return store && typeof store.$id === 'string' ? store : null;
  } catch (error) {
    console.error('Could not initialize tarkov store:', error);
    return null;
  }
};
let watchHandlerRunning = false;
watch(
  () => fireuser.loggedIn,
  async (newValue: boolean) => {
    if (watchHandlerRunning) {
      return;
    }
    watchHandlerRunning = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const tarkovStore = getSafeStoreInstance();
      if (!tarkovStore) {
        console.warn('Cannot bind/unbind store - store instance is null');
        watchHandlerRunning = false;
        return;
      }
      const extendedStore = tarkovStore as StoreWithFireswapExt<TarkovStoreType>;
      if (newValue) {
        const wasMigrated =
          wasDataMigrated() || sessionStorage.getItem('tarkovDataMigrated') === 'true';
        if (wasMigrated) {
          if (typeof extendedStore.firebindAll === 'function') {
            extendedStore.firebindAll();
          }
        } else {
          if (typeof extendedStore.firebindAll === 'function') {
            extendedStore.firebindAll();
          }
        }

        // Call migration after binding is complete
        setTimeout(() => {
          if (typeof tarkovStore.migrateDataIfNeeded === 'function') {
            tarkovStore.migrateDataIfNeeded();
          }
        }, 1000);
      } else {
        if (typeof extendedStore.fireunbindAll === 'function') {
          extendedStore.fireunbindAll();
        }
      }
    } catch (error) {
      console.error('Error in fireuser watch handler:', error);
    } finally {
      watchHandlerRunning = false;
    }
  },
  { immediate: false }
);
setTimeout(async () => {
  try {
    const tarkovStore = getSafeStoreInstance();
    if (!tarkovStore) {
      throw new Error('Failed to get tarkovStore in delayed initialization');
    }
    const extendedStore = tarkovStore as StoreWithFireswapExt<TarkovStoreType>;
    const wasMigrated =
      wasDataMigrated() || sessionStorage.getItem('tarkovDataMigrated') === 'true';
    if (wasMigrated) {
      if (typeof extendedStore.firebindAll === 'function') {
        extendedStore.firebindAll();
      }
    } else if (fireuser.loggedIn && typeof extendedStore.firebindAll === 'function') {
      extendedStore.firebindAll();
    }

    // Call migration after binding is complete
    setTimeout(() => {
      if (typeof tarkovStore.migrateDataIfNeeded === 'function') {
        tarkovStore.migrateDataIfNeeded();
      }
    }, 1000);
  } catch (error) {
    console.error('Error in delayed store initialization:', error);
  }
}, 500);
