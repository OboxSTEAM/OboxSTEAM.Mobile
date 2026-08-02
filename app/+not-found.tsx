import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Screen not found</Text>
        <Link href="/" style={styles.link}>
          Go home
        </Link>
      </View>
    </>
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
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#2D2D2D",
  },
  link: {
    fontSize: 16,
    color: "#E94B3C",
  },
});
