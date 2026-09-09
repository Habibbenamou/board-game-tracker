import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";

import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext";

import { getMyGroups } from "../services/groupService";

function AppNavigator() {
  const {
    session,
    loading: authLoading,
  } = useAuth();

  const [checkingGroup, setCheckingGroup] =
    useState(true);

  const [hasGroup, setHasGroup] =
    useState(false);

  useEffect(() => {
    if (!session) {
      setHasGroup(false);
      setCheckingGroup(false);
      return;
    }

    checkGroupMembership();
  }, [session]);

  async function checkGroupMembership() {
    try {
      setCheckingGroup(true);

      const groups =
        await getMyGroups();

      setHasGroup(
        groups.length > 0
      );
    } catch (error) {
      console.error(
        "Error checking group membership:",
        error
      );

      /*
       * If we cannot determine the user's
       * groups, don't automatically send
       * them into the main application.
       */
      setHasGroup(false);
    } finally {
      setCheckingGroup(false);
    }
  }

  if (
    authLoading ||
    checkingGroup
  ) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="group-setup"
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

      {!session ? (
        <Redirect href="/login" />
      ) : !hasGroup ? (
        <Redirect href="/group-setup" />
      ) : (
        <Redirect href="/(tabs)" />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}