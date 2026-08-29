import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="record-session"
        options={{
          title: "Record Session",
        }}
      />

      <Stack.Screen
        name="edit-session"
        options={{
          title: "Edit Session",
        }}
      />

      <Stack.Screen
        name="game-sessions"
        options={{
          title: "Game Sessions",
        }}
      />

      <Stack.Screen
        name="session-details"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}