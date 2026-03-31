import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

// 🧠 estado inicial (facilita debug)
const initialUser = null;
// ou podes usar:
// const initialUser = {
//   name: "",
//   interests: [],
//   xp: 0,
//   level: 1,
//   savedEvents: [],
//   checkedInEvents: [],
// };

export function UserProvider({ children }) {
  const [user, setUser] = useState(initialUser);

  // 🟢 ONBOARDING
  const completeOnboarding = (data) => {
    setUser({
      name: data.name || "User",
      interests: data.interests || [],
      xp: 50,
      level: 1,
      savedEvents: [],
      checkedInEvents: [],
      createdAt: new Date(),
    });
  };

  // 🟢 XP SYSTEM (simples mas escalável)
  const addXP = (amount) => {
    setUser((prev) => {
      if (!prev) return prev;

      const newXP = prev.xp + amount;

      // lógica simples de level up
      const newLevel = Math.floor(newXP / 100) + 1;

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  };

  // 🟢 CHECK-IN (CORE DO MVP)
  const checkInToEvent = (eventId) => {
    setUser((prev) => {
      if (!prev) return prev;

      // evitar duplicados
      if (prev.checkedInEvents.includes(eventId)) {
        return prev;
      }

      const updatedUser = {
        ...prev,
        checkedInEvents: [...prev.checkedInEvents, eventId],
      };

      return updatedUser;
    });

    // dar XP fora do setUser principal (mais limpo)
    addXP(10);
  };

  // 🟢 GUARDAR EVENTO
  const saveEvent = (eventId) => {
    setUser((prev) => {
      if (!prev) return prev;

      if (prev.savedEvents.includes(eventId)) {
        return prev;
      }

      return {
        ...prev,
        savedEvents: [...prev.savedEvents, eventId],
      };
    });
  };

  // 🟢 REMOVER EVENTO GUARDADO
  const unsaveEvent = (eventId) => {
    setUser((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        savedEvents: prev.savedEvents.filter((id) => id !== eventId),
      };
    });
  };

  // 🟢 RESET (logout futuro)
  const resetUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,

        // actions
        setUser,
        completeOnboarding,
        addXP,
        checkInToEvent,
        saveEvent,
        unsaveEvent,
        resetUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// 🪝 Hook (uso simples em toda a app)
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
};