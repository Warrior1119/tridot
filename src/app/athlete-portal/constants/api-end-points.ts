/**
 * Constant File to maintain end points.
 * Any change in End point details should not affect the business functionality.
 */
export const BASE_URI = '/athletesvcs/athlete/';

// Coach
export const COACH_PHOTOS_API = BASE_URI + 'coach/photos';
export const COACH_ATHLETES = BASE_URI + 'coach/athletes';

// Swim Form
export const SWIM_FORM_API = BASE_URI + 'swimform/get';
export const SWIM_FORM_SAVE_API = BASE_URI + 'swimform/save';

// Athlete Profile
export const SAVE_ATHLETE_PROFILE_API = BASE_URI + 'user/saveprofile';

// Workout Export URI
export const ATHLETE_SESSIONS_API = BASE_URI + 'sessions/';
