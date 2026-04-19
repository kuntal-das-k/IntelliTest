"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase auth isn't initialized, stop loading immediately
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};

    const setupAuth = async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth");
        const { doc, getDoc, setDoc } = await import("firebase/firestore");

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            setUser(firebaseUser);

            // Default fallback user data
            const fallbackData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              phone: firebaseUser.phoneNumber || "",
              credits: 10,
              plan: "free",
              planExpiry: null,
            };

            if (db) {
              try {
                // Add a timeout to prevent infinite hang when Firestore is offline
                const timeoutPromise = new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Firestore timeout")), 8000)
                );
                const userRef = doc(db, "users", firebaseUser.uid);

                const userSnap = await Promise.race([
                  getDoc(userRef),
                  timeoutPromise,
                ]);

                if (userSnap.exists()) {
                  setUserData(userSnap.data());
                } else {
                  const newUserData = {
                    ...fallbackData,
                    createdAt: new Date().toISOString(),
                  };
                  // Try to save, but don't block on it
                  try {
                    await Promise.race([
                      setDoc(userRef, newUserData),
                      new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Write timeout")), 8000)
                      ),
                    ]);
                  } catch (writeErr) {
                    console.warn("Firestore write failed:", writeErr.message);
                  }
                  setUserData(newUserData);
                }
              } catch (dbErr) {
                console.warn("Firestore error:", dbErr.message);
                setUserData(fallbackData);
              }
            } else {
              setUserData(fallbackData);
            }
          } else {
            setUser(null);
            setUserData(null);
          }
          setLoading(false);
        });
      } catch (err) {
        console.warn("Auth setup error:", err.message);
        setLoading(false);
      }
    };

    setupAuth();

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (user && db) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const userRef = doc(db, "users", user.uid);
        const userSnap = await Promise.race([
          getDoc(userRef),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Refresh timeout")), 5000)
          ),
        ]);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } catch (err) {
        console.warn("Refresh user data error:", err.message);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
