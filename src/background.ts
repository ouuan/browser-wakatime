import browser from 'webextension-polyfill';
import WakaTimeCore from './core/WakaTimeCore';

// Add a listener to resolve alarms
browser.alarms.onAlarm.addListener(async (alarm) => {
  // |alarm| can be undefined because onAlarm also gets called from
  // window.setTimeout on old chrome versions.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (alarm?.name == 'heartbeatAlarm') {
    console.log('recording a heartbeat - alarm triggered');

    await WakaTimeCore.recordHeartbeat();
  }
});

/**
 * Whenever a active tab is changed it records a heartbeat with that tab url.
 */
browser.tabs.onActivated.addListener(async () => {
  console.log('recording a heartbeat - active tab changed');
  await WakaTimeCore.recordHeartbeat();
});

/**
 * Whenever a active window is changed it records a heartbeat with the active tab url.
 */
browser.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId != browser.windows.WINDOW_ID_NONE) {
    console.log('recording a heartbeat - active window changed');
    await WakaTimeCore.recordHeartbeat();
  } else {
    console.log('lost focus');
  }
});

/**
 * Whenever any tab is updated it checks if the updated tab is the tab that is
 * currently active and if it is, then it records a heartbeat.
 */
browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    // Get current tab URL.
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    // If tab updated is the same as active tab
    if (tabId == tab.id) {
      await WakaTimeCore.recordHeartbeat();
    }
  }
});
