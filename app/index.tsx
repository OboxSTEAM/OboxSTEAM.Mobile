import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OboxSTEAM Parent</Text>
      <Text style={styles.subtitle}>
        Expo Go is stable with Router (worklets stubbed for SDK 57 Android).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAF5",
    paddingHorizontal: 24,
  },
  title: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: "700",
    color: "#E94B3C",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B6B6B",
    textAlign: "center",
  },
});
