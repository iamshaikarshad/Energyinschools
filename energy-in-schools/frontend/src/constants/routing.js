import {
  ADMIN_ROLE, PUPIL_ROLE,
  SEM_ADMIN_ROLE,
  SLE_ADMIN_ROLE,
  TEACHER_ROLE,
} from './config';

// toDo: make all routes as props of ROUTE_PATH

export const ROUTE_PATH = Object.freeze({
  energyDashboardV0: '/energy-dashboard-v0',
  energyDashboardV1: '/energy-dashboard-v1',
  energyDashboardLegacyV1: '/energy-dashboard-legacy-v1',
  energyDashboardV2: '/energy-dashboard-v2',
  energyDashboardLegacyV2: '/energy-dashboard-legacy-v2',
  energyDashboardV3: '/energy-dashboard-v3',
  energyDashboardLegacyV3: '/energy-dashboard-legacy-v3',
  lessons: '/lessons',
  lessonPlans: '/lesson-plans',
  switches: '/sem-admin/switches',
});

const ROUTES = {
  [SLE_ADMIN_ROLE]: [
    {
      menu: true,
      label: 'Device Management',
      items: [
        { path: '/sle-admin/devices', label: 'Devices & Hubs' },
        { path: '/smartthings-sensors', label: 'Smartthings Sensors' },
      ],
    },
    {
      menu: true,
      label: 'Schools',
      items: [
        { path: '/sle-admin/location', label: 'My School' },
        { path: '/schools', label: 'All Schools' },
      ],
    },
    {
      menu: true,
      label: 'Education',
      items: [
        { path: ROUTE_PATH.lessonPlans, label: 'Lessons' },
        { path: '/editor', label: 'Block Editor' },
      ],
    },
    { path: '/sle-admin/users', label: 'Users' },
    { path: '/variables', label: 'Data' },
    { path: '/manuals', label: 'Manuals' },
    { path: '/webhub', label: 'Webhub' },
    {
      menu: true,
      label: 'Statistics',
      items: [
        { path: '/energy-usage', label: 'Energy Data' },
        { path: '/temperature-statistic', label: 'Temperature Statistics' },
        { path: '/floors-maps', label: 'Floor Maps' },
      ],
    },
  ],
  [SEM_ADMIN_ROLE]: [
    {
      path: '/sem-admin/energy-manager-dashboard',
      label: 'Dashboard',
    },
    {
      path: '/energy-usage', label: 'Energy Data',
    },
    { path: '/sem-admin/alerts', label: 'Alerts Configuration' },
    {
      menu: true,
      label: 'Energy contracts',
      items: [
        { path: '/sem-admin/energy-meters-billing-info', label: 'Fill Energy Meters Info' },
        { path: '/sem-admin/comparison', label: 'Tariff Comparison' },
        { path: '/sem-admin/switches', label: 'Switches' },
      ],
    },
  ],
  [TEACHER_ROLE]: [
    { path: '/devices', label: 'Devices' },
    { path: '/editor', label: 'Block Editor' },
    { path: '/schools', label: 'Schools' },
    { path: ROUTE_PATH.lessonPlans, label: 'Lessons' },
    { path: '/variables', label: 'Variables' },
    { path: '/manuals', label: 'Manuals' },
    { path: '/webhub', label: 'Webhub' },
    {
      menu: true,
      label: 'Statistics',
      items: [
        { path: '/energy-usage', label: 'Energy Data' },
        { path: '/temperature-statistic', label: 'Temperature Statistics' },
        { path: '/floors-maps', label: 'Floor Maps' },
      ],
    },
    { path: '/feedback', label: 'Feedback' },
  ],
  [PUPIL_ROLE]: [
    { path: '/devices', label: 'Devices' },
    { path: '/editor', label: 'Block Editor' },
    { path: '/schools', label: 'Schools' },
    { path: ROUTE_PATH.lessons, label: 'Lessons' },
    { path: '/variables', label: 'Variables' },
    { path: '/manuals', label: 'Manuals' },
    {
      menu: true,
      label: 'Statistics',
      items: [
        { path: '/energy-usage', label: 'Energy Data' },
        { path: '/temperature-statistic', label: 'Temperature Statistics' },
        { path: '/floors-maps', label: 'Floor Maps' },
      ],
    },
  ],
  [ADMIN_ROLE]: [
    { path: '/admin/monitoring-dashboard', label: 'Monitoring dashboard' },
    { path: '/admin/schools', label: 'Locations' },
    { path: '/feedback', label: 'Feedback' },
  ],
};

export const ENERGY_USAGE_LABEL = 'Energy Data';
export const CODING_EDITOR_LABEL = 'Coding editor';
export const LESSON_PLANS_BLOCK = 'lesson-plans';
export const ENERGY_CHAMPIONS_BLOCK = 'energy-champions';
export const ANONYMOUS_USER_ROUTES = [
  {
    menu: true,
    label: 'Learning resources',
    items: [
      {
        label: 'Lesson plans',
        path: `/learning-resources/${LESSON_PLANS_BLOCK}`,
      },
      {
        label: 'Energy champions',
        path: `/learning-resources/${ENERGY_CHAMPIONS_BLOCK}`,
      },
    ],
  },
  {
    menu: true,
    label: 'micro:bit coding',
    items: [
      {
        path: '/editor',
        label: CODING_EDITOR_LABEL,
      },
      {
        path: '/tutorials',
        label: 'Coding tutorials',
      },
      {
        path: '/webhub',
        label: 'Webhub',
      },
      {
        path: '/floors-maps',
        label: 'Floor Maps',
      },
    ],
  },
  {
    menu: true,
    label: ENERGY_USAGE_LABEL,
    items: [],
  },
];

export const CODING_EXAMPLES_LINK_MAP = {
  blocks: '08776-82796-89146-89111',
  'on-off-events': '96983-96142-79407-02986',
  'simple-measurement': '08528-04367-72366-11819',
  measurement: '64574-97411-87007-48022',
  monitoring: '92286-95602-33516-97210',
  'light-sensor': '45370-94322-70966-65814',
  'light-sensor-neopixel': '58743-73677-90722-00740',
  'door-open-closed-sensor': '86881-35915-26717-89690',
  'door-state-logging': '33809-62585-29978-12739',
  'temperature-comparison': '57676-87771-80865-42976',
  'temperature-logging': '74967-68756-52008-68810',
  'fossil-fuel': '99912-46796-74648-60627',
  'neopixel-set-up': '57073-95543-08182-75450',
  'step-counter': '75133-90872-93977-71962',
};

export default ROUTES;
