import { Injectable } from '@angular/core';
export let daily_workout_data = {
  header: {
    token: '98787we98rwoieurwoiuriower',
    debug: true,
    requestType: 'schedule'
  },
  body: {
    interference: [
      { interferenceValue: 'NONE', value: 0, isSelected: false },
      { interferenceValue: 'WEATHER', value: 1, isSelected: false },
      { interferenceValue: 'MECHANICAL', value: 2, isSelected: false },
      { interferenceValue: 'ACCIDENT', value: 3, isSelected: false },
      { interferenceValue: 'NEW INJURY', value: 4, isSelected: false },
      { interferenceValue: 'RECENT INJURY', value: 5, isSelected: false },
      { interferenceValue: 'OLD INJURY', value: 6, isSelected: false },
      { interferenceValue: 'ILLNESS', value: 7, isSelected: false },
      { interferenceValue: 'NUTRITION', value: 8, isSelected: false },
      { interferenceValue: 'OTHER', value: 9, isSelected: false }
    ],
    location: ['HOME', 'CURRENT'],
    bikeUsed: ['PRIMARY BIKE', 'DEFAULT BIKE'],
    wuCompletion: [
      { value: 0, text: 'Select' },
      { value: 1, text: 'Completed as Written' },
      { value: 2, text: 'Completed Modified' },
      { value: 3, text: 'Skipped it' }
    ],
    msCompletion: [
      { value: 0, text: 'Select' },
      { value: 1, text: '120+% of Intensity' },
      { value: 2, text: '110% of Intensity' },
      { value: 3, text: '100% of Intensity' },
      { value: 4, text: '90% of Intensity' },
      { value: 5, text: '80% of Intensity' },
      { value: 6, text: '70% of Intensity' },
      { value: 7, text: '60% of Intensity' },
      { value: 8, text: '50% of Intensity' },
      { value: 9, text: '40% of Intensity' },
      { value: 10, text: '30% of Intensity' },
      { value: 11, text: '20% of Intensity' },
      { value: 12, text: '10% of Intensity' },
      { value: 13, text: '0% of Intensity' },
      { value: 14, text: 'Did Different Session' }
    ]
  }
};
export let permissionsSidebarHeader=[
  {
    name: 'Health-Related Data',
    link: '/user/user-profile/permissions/health-related-data'
  },
  {
    name: 'Daily Metric Tracking',
    link: '/user/user-profile/permissions/daily-metric-tracking'
  },

];
export let athleteProfileSidebarHeader = [
  {
    name: 'Profile',
    link: '/user/user-profile/athlete-profile-settings'
  },
  {
    name: 'Account',
    link: '/user/user-profile/account-settings'
  },
  {
    name: 'Preferences',
    link: '/user/user-profile/preferences'
  },
  {
    name: 'My Bikes',
    link: '/user/user-profile/my-bikes'
  },
  {
    name: 'My Devices',
    link: '/user/devices'
  },
  {
    name: 'Permissions',
    link: '/user/user-profile/permissions/health-related-data'
  }
];

export let validHeaders = [
  'coaches',
  'assessments',
  'training-intensities',
  'season-planner',
  'swimform',
  'racex',
  'daily-workout',
  'devices'
];

export let headers = [
  {
    mainMenu: 'train',
    subMenu: [
      {
        name: 'training schedule',
        icon: '../assets/img/svg/icons/cal-icon.svg',
        link: '/season-planner/training-phase/weekly-summary'
      },
      {
        name: 'training intensities',
        icon: '../assets/img/svg/icons/graph-icon.svg',
        link: '/training-intensities'
      },
      {
        name: 'assessments',
        icon: '../assets/img/svg/icons/assessment-icon.svg',
        link: '/assessments'
      },
      {
        name: 'swim form',
        icon: '../assets/img/svg/icons/swimform-icon.svg',
        link: '/swimform'
      }
    ]
  },
  {
    mainMenu: 'race',
    subMenu: [
      {
        name: 'season planner',
        icon: '../assets/img/svg/icons/planner-icon.svg',
        link: '/season-planner'
      },
      {
        name: 'racex',
        icon: '../assets/img/svg/icons/race-icon.svg',
        link: '/racex'
      }
    ]
  },
  {
    mainMenu: 'connect',
    subMenu: [
      {
        name: 'Support',
        icon: '../assets/img/svg/icons/support-icon.svg',
        link: '/support'
      },
      {
        name: 'My Devices',
        icon: '../assets/img/svg/icons/device-icon.svg',
        link: '/user/devices'
      },
      {
        name: 'Coaches',
        icon: '../assets/img/svg/icons/coach-icon.svg',
        link: '/coaches'
      }
    ]
  }
];

export let RACEX_DIVISION = [
  {
    name: 'Physically Challenged',
    value: 'pc'
  },
  {
    name: 'Age Group',
    value: 'ag'
  },
  {
    name: 'Professional',
    value: 'pro'
  }
];

export let calorie_source = [
  {
    name: 'Simple Sugars',
    value: 0
  },
  {
    name: 'Maltodextrin',
    value: 1
  },
  {
    name: 'Super Starch',
    value: 2
  },
  {
    name: 'Mix',
    value: 3
  }
];

export let calorie_form = [
  {
    name: 'Liquid',
    value: 0
  },
  {
    name: 'Gel',
    value: 1
  },
  {
    name: 'Solid',
    value: 2
  },
  {
    name: 'Liquid & Gel',
    value: 3
  },
  {
    name: 'Mix',
    value: 4
  }
];

export let performance = [
  { id: 'bg', name: 'Beginner' },
  { id: 'int', name: 'Intermediate' },
  { id: 'com', name: 'Competitive' },
  { id: 'hc', name: 'Highly Competitive' },
  { id: 'el', name: 'Elite' }
];

export let swim_course = [
  { id: 'scy', name: 'SC Yards', abbr: 'SCY' },
  { id: 'scm', name: 'SC Meters', abbr: 'SCM' },
  { id: 'lcm', name: 'LC Meters', abbr: 'LCM' }
];
export let bike_ass_type = [
  { id: 'tt_25k', name: '25k' },
  { id: 'tt_15m', name: '15-mile' },
  { id: '8mp', name: '8-minute Power' },
  { id: '20mp', name: '20-minute Power' }
];
export let run_ass_type = [
  { id: 'tt_5k', name: '5k TT' },
  { id: 'tt_10k', name: '10k TT' }
];

@Injectable()
export class ConstantsService {
  constructor() { }
}

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again later. If the problem persists please contact support support@tridot.com';

export const SCHEDULE_ROW_LENGTH = 12;

export const SCHEDULE_ROW_LENGTH_MOBILE = 6;

export const MOBILE_WIDTH_THRESHOLD = 576;
export const TABLET_WIDTH_THRESHOLD = 1240;
export const TABLET_WIDTH_MEDIUM = 768;

export const WAIT_AFTER_LAST_KEY_PRESSED_MS = 1000;

export const BS_DATEPICKER_DEFAULTS = { dateInputFormat: 'MMMM D, YYYY', showWeekNumbers: false };

export const DEFAULT_PROFILE_PICTURE = '../assets/img/svg/icons/profile-icon.svg';

export const START_TIME_MASK_PATTERNS = {
  '0': { pattern: /\d/ },
  'a': { pattern: /[apm]/i },
};

export const TIME_MASK_PATTERN = '^([0-5]([0-9]|$)\\:?){0,3}$'; // https://regex101.com/r/ULhAIC/1

export const DEBOUNCE_INTERVAL_DEFAULT_MS = 750;

export const KM_TO_MI_MULT = 0.62137;
export const SEC_PER_KM_TO_SEC_PER_MI_MULT = 1.60934;
export const SEC_PER_100M_TO_SEC_PER_100YDS_MULT = 0.9144;
export const M_TO_YD_MULT = 1.09361;
export const M_TO_FT_MULT = 3.28084;

export const MIN_TRACKPOINTS_FOR_MAP = 10;

export const ALL_SUBSCRIPTIONS = [{
  priceLevel: 1,
  featuresHeading: 'Feature summary:',
  features: [
    '<strong>1 Scheduled Race at a time</strong>',
    'Weekly Training Optimization',
    'Knowledgebase Support'
  ],
  desc: 'Perfect for the <strong>recreational</strong> Triathlete who wants to <strong>progress</strong> and stay <strong>injury free</strong>.'
}, {
  priceLevel: 2,
  featuresHeading: 'All Lifestyle features PLUS:',
  features: [
    '<strong>3 Scheduled Races</strong>',
    'Swim Drill Optimization',
    'Race Execution',
    '<s>One-time activation fee of $50*</s>'
  ],
  desc: 'Ideal for the <strong>budget-conscious beginner</strong> or <strong>intermediate</strong> triathlete.'
}, {
  priceLevel: 3,
  featuresHeading: 'All Essentials features PLUS:',
  features: [
    '<strong>Unlimited Races</strong>',
    '<strong>Full Training Optimization</strong>',
    '<strong>Advanced Training Preferences</strong>',
    '<strong>Training Advisor Support</strong>',
    '<s>One-time activation fee of $100*</s>'
  ],
  desc: '<strong>Fully optimized</strong> training for the <strong>intermediate</strong> to <strong>highly-competitive</strong> athletes.</p>'
}, {
  priceLevel: 4,
  featuresHeading: 'All Complete features PLUS:',
  features: [
    '<strong>Dedicated Coach with Unlimited Communication</strong>',
    '<s>One-time activation fee of $100*</s>'
  ],
  desc: 'Fully optimized training and <strong>unlimited communication</strong> with your <strong>dedicated coach</strong>.'
}, {
  priceLevel: 5,
  featuresHeading: 'Includes Every TriDot Feature',
  features: [
    'Dedicated Coach with Unlimited Communication'
  ],
  desc: 'Fully optimized training as designed by your dedicated coach.'
}];

export const SIDEBAR_AUTO_COLLAPSE_WIDTH = 1600;
export const EMAIL_PATTERN = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

