import AsyncStorage from "@react-native-async-storage/async-storage";

const SELECTED_CHILD_KEY = "obox.schedule.selectedStudentId";

export async function loadSelectedScheduleStudentId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SELECTED_CHILD_KEY);
  } catch {
    return null;
  }
}

export async function saveSelectedScheduleStudentId(
  studentId: string,
): Promise<void> {
  try {
    await AsyncStorage.setItem(SELECTED_CHILD_KEY, studentId);
  } catch {
    // Best-effort preference — ignore storage failures.
  }
}
