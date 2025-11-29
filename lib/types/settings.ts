export interface UserSettings {
    leftEyeColor: string;  // e.g., "#FF0000"
    rightEyeColor: string; // e.g., "#00FFFF"
    eyeDominance: 'left-active' | 'right-active'; // Which eye tracks movement
}

export const DEFAULT_SETTINGS: UserSettings = {
    leftEyeColor: '#FF0000',
    rightEyeColor: '#00FFFF',
    eyeDominance: 'left-active',
};
