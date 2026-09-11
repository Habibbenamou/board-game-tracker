import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    getMyGroups,
    type Group,
} from "../services/groupService";

import { useAuth } from "./AuthContext";

type GroupContextValue = {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;

  setCurrentGroup: (
    group: Group
  ) => void;

  refreshGroups: () => Promise<void>;
};

const GroupContext =
  createContext<GroupContextValue | undefined>(
    undefined
  );

type GroupProviderProps = {
  children: ReactNode;
};

export function GroupProvider({
  children,
}: GroupProviderProps) {
  const {
    session,
    loading: authLoading,
  } = useAuth();

  const [groups, setGroups] =
    useState<Group[]>([]);

  const [currentGroup, setCurrentGroupState] =
    useState<Group | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refreshGroups =
    useCallback(async () => {
      if (!session) {
        setGroups([]);
        setCurrentGroupState(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const fetchedGroups =
          await getMyGroups();

        setGroups(fetchedGroups);

        /*
         * Keep the currently selected group
         * if it still exists.
         *
         * Otherwise, default to the first
         * group the player belongs to.
         */
        setCurrentGroupState(
          (previousGroup) => {
            if (previousGroup) {
              const stillExists =
                fetchedGroups.some(
                  (group) =>
                    group.id ===
                    previousGroup.id
                );

              if (stillExists) {
                return previousGroup;
              }
            }

            return (
              fetchedGroups[0] ?? null
            );
          }
        );
      } catch (error) {
        console.error(
          "Error loading groups:",
          error
        );

        setGroups([]);
        setCurrentGroupState(null);
      } finally {
        setLoading(false);
      }
    }, [session]);

  const setCurrentGroup =
    useCallback((group: Group) => {
      setCurrentGroupState(group);
    }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    refreshGroups();
  }, [
    authLoading,
    refreshGroups,
  ]);

  const value = useMemo(
    () => ({
      groups,
      currentGroup,
      loading,
      setCurrentGroup,
      refreshGroups,
    }),
    [
      groups,
      currentGroup,
      loading,
      setCurrentGroup,
      refreshGroups,
    ]
  );

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context =
    useContext(GroupContext);

  if (!context) {
    throw new Error(
      "useGroup must be used inside a GroupProvider."
    );
  }

  return context;
}