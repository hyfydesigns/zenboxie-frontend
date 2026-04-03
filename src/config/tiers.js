/**
 * Tier limits — client-side copy for UI gating.
 * Keep in sync with the backend at zenboxie-api/src/config/tiers.js.
 */

export const TIER_LIMITS = {
  FREE: {
    maxConnectedAccounts: 1,
    maxScanEmails: 500,
    maxDailyDeletions: 3,
    permanentDelete: false,
    bulkDelete: false,
    gmailOAuth: true,
    csvExport: true,
    emailPreview: false,
    prioritySorting: false,
    scheduledAutoClean: false,
    sizeAnalytics: false,
    unsubscribe: false,
    smartFilters: false,
    folderSupport: false,
    retentionRules: false,
    teamSeats: 0,
  },
  PRO: {
    maxConnectedAccounts: 3,
    maxScanEmails: Infinity,
    maxDailyDeletions: Infinity,
    permanentDelete: true,
    bulkDelete: true,
    gmailOAuth: true,
    csvExport: true,
    emailPreview: true,
    prioritySorting: true,
    scheduledAutoClean: true,
    sizeAnalytics: true,
    unsubscribe: false,
    smartFilters: false,
    folderSupport: false,
    retentionRules: false,
    teamSeats: 0,
  },
  PREMIUM: {
    maxConnectedAccounts: Infinity,
    maxScanEmails: Infinity,
    maxDailyDeletions: Infinity,
    permanentDelete: true,
    bulkDelete: true,
    gmailOAuth: true,
    csvExport: true,
    emailPreview: true,
    prioritySorting: true,
    scheduledAutoClean: true,
    sizeAnalytics: true,
    unsubscribe: true,
    smartFilters: true,
    folderSupport: true,
    retentionRules: true,
    teamSeats: 3,
  },
};

export const getTier = (user) => user?.tier ?? user?.subscription?.tier ?? "FREE";
export const getLimits = (user) => TIER_LIMITS[getTier(user)];
